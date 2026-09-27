'use strict';

/**
 * suggestNextConditions.js — Algorithmic experiment suggestion v2
 *
 * ALGORITHM OVERVIEW (v2)
 * =======================
 * Goal: Suggest next conditions based on actual human data and efficiency trends,
 * replacing the pure dataset-greedy search.
 *
 * 1. Empty history: Return fixed "mid-range" starting point.
 * 2. first_experiment: Heuristic default - raise temperature by one step.
 * 3. improving: Continue moving the parameter that was changed in the LAST step, 
 *    in the SAME direction, for one grid step.
 * 4. declining / flat: Rollback from the last change, and try the NEXT parameter
 *    in priority order (temperature -> catalyst -> concentration -> time).
 * 5. Prediction accuracy heuristic: If predictionWasOptimistic === true for the
 *    last 2 iterations, halve the grid step size.
 * 6. Validation: Run the generated conditions through findNearest to snap them
 *    to a valid dataset point so the prediction step makes sense.
 * 7. Anti-loop: Ensure we don't suggest a condition already in history.
 */

const { findNearest } = require('./findNearest');
const { analyzeEfficiency } = require('./efficiencyService');

const PARAMS_PRIORITY = ['temperature', 'catalyst', 'concentration', 'time'];

function conditionKey(c) {
  return `${c.temperature}|${Number(c.concentration.toFixed(6))}|${c.catalyst}|${c.time}`;
}

/**
 * Snap a value to the nearest valid grid value using min/max/step.
 */
function snapToGrid(value, min, max, step) {
  // Build grid
  const grid = [];
  const decimals = (step.toString().split('.')[1] || '').length;
  for (let v = min; v <= max + 1e-9; v += step) {
    grid.push(Number(v.toFixed(decimals)));
  }
  return grid.reduce((best, g) => Math.abs(g - value) < Math.abs(best - value) ? g : best);
}

/**
 * Calculate the step size, reducing it by half if the last 2 predictions were optimistic.
 */
function getStepSize(param, parametersRange, history) {
  let step = parametersRange[param].step;
  if (history.length >= 2) {
    // Check last 2 iterations for optimism
    const eff1 = analyzeEfficiency(history);
    const eff2 = analyzeEfficiency(history.slice(0, history.length - 1));
    if (eff1 && eff1.predictionWasOptimistic && eff2 && eff2.predictionWasOptimistic) {
      step = step / 2;
    }
  }
  return step;
}

function getChangedParameter(prevCond, currCond) {
  for (const p of PARAMS_PRIORITY) {
    if (prevCond[p] !== currCond[p]) {
      return p;
    }
  }
  return 'temperature';
}

function getNextCatalyst(currentCat, options) {
  const idx = options.indexOf(currentCat);
  if (idx >= 0 && idx < options.length - 1) {
    return options[idx + 1];
  }
  return null;
}

/**
 * Main suggestion function
 */
function suggestNextConditions(reactionId, history, goal, parametersRange, experiments) {
  // 1. Empty history -> Fixed starting point
  if (!history || history.length === 0) {
    const { temperature, concentration, time } = parametersRange;
    const midTemp = snapToGrid((temperature.min + temperature.max) / 2, temperature.min, temperature.max, temperature.step);
    const midTime = snapToGrid((time.min + time.max) / 2, time.min, time.max, time.step);
    
    return {
      temperature: midTemp,
      concentration: concentration.min,
      catalyst: 'None',
      time: midTime
    };
  }

  const usedKeys = new Set(history.map(iter => conditionKey(iter.conditions)));
  const eff = analyzeEfficiency(history);
  const baseConditions = history[history.length - 1].conditions;
  
  let changedParam = null;
  let paramChangeDirection = 1;

  if (history.length >= 2) {
    const prevConditions = history[history.length - 2].conditions;
    changedParam = getChangedParameter(prevConditions, baseConditions);
    if (changedParam !== 'catalyst') {
      paramChangeDirection = Math.sign(baseConditions[changedParam] - prevConditions[changedParam]) || 1;
    }
  } else {
    changedParam = 'temperature';
    paramChangeDirection = 1;
  }

  let candidates = [];

  const tryAddCandidate = (conds) => {
    const match = findNearest(reactionId, conds, experiments, parametersRange);
    if (match) {
      // We extract exactly what findNearest matched to ensure it's a real dataset point
      const matchedConds = {
        temperature: match.matchedPoint.temperature,
        concentration: match.matchedPoint.concentration,
        catalyst: match.matchedPoint.catalyst,
        time: match.matchedPoint.time
      };
      if (!usedKeys.has(conditionKey(matchedConds))) {
        candidates.push(matchedConds);
      }
    }
  };

  if (eff.direction === 'first_experiment') {
    // Default heuristic: raise temperature
    let step = getStepSize('temperature', parametersRange, history);
    let newCond = { ...baseConditions };
    newCond.temperature += step;
    tryAddCandidate(newCond);
  } 
  else if (eff.direction === 'improving') {
    let newCond = { ...baseConditions };
    if (changedParam === 'catalyst') {
      // Catalyst improved things. We keep it, and move to the next parameter
      const nextIdx = PARAMS_PRIORITY.indexOf(changedParam) + 1;
      if (nextIdx < PARAMS_PRIORITY.length) {
        const nextParam = PARAMS_PRIORITY[nextIdx];
        if (nextParam !== 'catalyst') {
          newCond[nextParam] += getStepSize(nextParam, parametersRange, history);
        }
      }
    } else {
      // Continue moving same numeric parameter
      let step = getStepSize(changedParam, parametersRange, history);
      newCond[changedParam] += paramChangeDirection * step;
    }
    tryAddCandidate(newCond);
  } 
  else if (eff.direction === 'declining' || eff.direction === 'flat') {
    // Rollback to previous
    const rollbackCond = { ...history[history.length - 2].conditions };
    const pIdx = PARAMS_PRIORITY.indexOf(changedParam);
    
    // Try NEXT parameter(s)
    for (let i = pIdx + 1; i < PARAMS_PRIORITY.length; i++) {
      const nextParam = PARAMS_PRIORITY[i];
      let testCond = { ...rollbackCond };
      
      if (nextParam === 'catalyst') {
        const nextCat = getNextCatalyst(testCond.catalyst, parametersRange.catalystOptions);
        if (nextCat) {
          testCond.catalyst = nextCat;
          tryAddCandidate(testCond);
        }
      } else {
        let step = getStepSize(nextParam, parametersRange, history);
        testCond[nextParam] += step;
        tryAddCandidate(testCond);
      }
    }
  }

  if (candidates.length > 0) {
    return candidates[0];
  }

  // Fallback: Generate ALL neighbors around the best seen point
  const bestIter = [...history].sort((a, b) => b.actualYield - a.actualYield)[0];
  const bestCond = bestIter.conditions;
  for (const p of PARAMS_PRIORITY) {
    if (p === 'catalyst') {
      for (const cat of parametersRange.catalystOptions) {
        if (cat !== bestCond.catalyst) {
          tryAddCandidate({ ...bestCond, catalyst: cat });
        }
      }
    } else {
      let step = getStepSize(p, parametersRange, history);
      tryAddCandidate({ ...bestCond, [p]: bestCond[p] + step });
      tryAddCandidate({ ...bestCond, [p]: bestCond[p] - step });
    }
  }

  if (candidates.length > 0) {
    return candidates[0];
  }

  console.warn('[suggestNextConditions] No fresh candidates found — returning last conditions.');
  return { ...baseConditions };
}

module.exports = { suggestNextConditions };
