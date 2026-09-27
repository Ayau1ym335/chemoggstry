'use strict';

/**
 * suggestNextConditions.js — Greedy hill-climbing algorithm for experiment suggestion.
 *
 * ALGORITHM OVERVIEW
 * ==================
 * Goal: deterministic, explainable greedy search on the experiment dataset.
 *
 * Iteration 1 (empty history):
 *   Return a fixed "mid-range" starting point — NOT random:
 *     - temperature: middle of range, snapped to nearest grid step
 *     - concentration: minimum of range (start conservative)
 *     - catalyst: 'None' (start without catalyst)
 *     - time: middle of range, snapped to nearest grid step
 *   This makes the demo fully reproducible and allows TASK 17 (AI explanations)
 *   to say "we started from a conservative baseline".
 *
 * Iterations 2-4 (steepest-ascent hill-climbing):
 *   1. Take the last iteration as the current position.
 *   2. Generate all ONE-STEP neighbors by changing exactly one parameter at a time.
 *      Neighbors are restricted to actual grid values in parametersRange, so that
 *      findNearest always returns a meaningful (not "snapped-back") result.
 *   3. Filter out already-tried conditions (no repeats guaranteed).
 *   4. Score each fresh neighbor via findNearest (pure lookup, no side effects).
 *   5. Pick the highest-scoring neighbor (maxYield) or lowest-time neighbor
 *      above yield threshold (minTime).
 *   6. Tie-break: parameter priority order — temperature > catalyst > concentration > time.
 *
 * WHY ONE PARAMETER AT A TIME:
 *   Changing a single parameter per step makes TASK 17/18 AI explanations trivial:
 *   "yield increased because temperature was raised from 50°C to 60°C".
 *   Multi-parameter jumps make causal attribution impossible.
 *
 * WHY STEEPEST-ASCENT (not momentum/gradient):
 *   On the smooth unimodal Gaussian surface of our dataset, steepest-ascent
 *   reliably converges to the global optimum in 3-4 steps. Momentum tracking
 *   adds complexity for no benefit on this dataset.
 *
 * DETERMINISM:
 *   - generateCandidates() iterates parameters in a fixed order.
 *   - findNearest() is deterministic (first-match tie-break, fixed dataset order).
 *   - Sort comparators use stable fallbacks (parameter priority index).
 *   Same history → same next suggestion, always.
 */

const { findNearest } = require('./findNearest');

// ── helpers ──────────────────────────────────────────────────────────────────

/**
 * Build the explicit list of valid grid values for a numeric parameter.
 * Uses the same rounding as the dataset generator (4 decimal places) to avoid
 * floating-point drift (e.g. 0.1+0.1+0.1 = 0.30000000000000004).
 */
function buildGrid(min, max, step) {
  const grid = [];
  const decimals = (step.toString().split('.')[1] || '').length;
  for (let v = min; v <= max + 1e-9; v += step) {
    grid.push(Number(v.toFixed(decimals)));
  }
  return grid;
}

/**
 * Snap a value to the nearest valid grid value.
 */
function snapToGrid(value, grid) {
  return grid.reduce((best, g) => Math.abs(g - value) < Math.abs(best - value) ? g : best);
}

/**
 * Unique string key for a conditions object (used to detect duplicates).
 * Rounds numbers to 6 decimal places to absorb any residual float noise.
 */
function conditionKey(c) {
  return `${c.temperature}|${Number(c.concentration.toFixed(6))}|${c.catalyst}|${c.time}`;
}

// ── starting point ────────────────────────────────────────────────────────────

/**
 * Fixed "iteration 1" starting conditions.
 * Mid-range temperature and time, minimum concentration, no catalyst.
 */
function startingConditions(parametersRange) {
  const { temperature, concentration, time, catalystOptions } = parametersRange;
  const tGrid  = buildGrid(temperature.min,   temperature.max,   temperature.step);
  const tiGrid = buildGrid(time.min,          time.max,          time.step);

  const midTemp = snapToGrid((temperature.min + temperature.max) / 2, tGrid);
  const midTime = snapToGrid((time.min        + time.max)        / 2, tiGrid);

  return {
    temperature:   midTemp,
    concentration: concentration.min,
    catalyst:      'None',
    time:          midTime
  };
}

// ── neighbor generation ───────────────────────────────────────────────────────

/**
 * Generate all one-step neighbors of `conditions` by changing exactly one
 * parameter at a time. Candidates are tagged with a `_priority` index for
 * deterministic tie-breaking: 0=temperature, 1=catalyst, 2=concentration, 3=time.
 *
 * Grid values are pre-computed so that every neighbor maps to a real dataset
 * entry — no halfway points that findNearest would "snap back" to the origin.
 */
function generateNeighbors(conditions, parametersRange) {
  const { temperature, concentration, time, catalystOptions } = parametersRange;
  const tGrid  = buildGrid(temperature.min,   temperature.max,   temperature.step);
  const cGrid  = buildGrid(concentration.min, concentration.max, concentration.step);
  const tiGrid = buildGrid(time.min,          time.max,          time.step);

  const tIdx  = tGrid.findIndex(v => Math.abs(v - conditions.temperature)   < 1e-9);
  const cIdx  = cGrid.findIndex(v => Math.abs(v - conditions.concentration) < 1e-9);
  const tiIdx = tiGrid.findIndex(v => Math.abs(v - conditions.time)         < 1e-9);

  const candidates = [];

  // 1. Temperature (priority 0)
  if (tIdx + 1 < tGrid.length)  candidates.push({ ...conditions, temperature: tGrid[tIdx + 1], _priority: 0 });
  if (tIdx - 1 >= 0)            candidates.push({ ...conditions, temperature: tGrid[tIdx - 1], _priority: 0 });

  // 2. Catalyst (priority 1)
  for (const cat of catalystOptions) {
    if (cat !== conditions.catalyst) {
      candidates.push({ ...conditions, catalyst: cat, _priority: 1 });
    }
  }

  // 3. Concentration (priority 2)
  if (cIdx + 1 < cGrid.length)  candidates.push({ ...conditions, concentration: cGrid[cIdx + 1], _priority: 2 });
  if (cIdx - 1 >= 0)            candidates.push({ ...conditions, concentration: cGrid[cIdx - 1], _priority: 2 });

  // 4. Time (priority 3)
  if (tiIdx + 1 < tiGrid.length) candidates.push({ ...conditions, time: tiGrid[tiIdx + 1], _priority: 3 });
  if (tiIdx - 1 >= 0)            candidates.push({ ...conditions, time: tiGrid[tiIdx - 1], _priority: 3 });

  return candidates;
}

// ── scoring & selection ───────────────────────────────────────────────────────

/**
 * Score a list of candidate conditions via findNearest and select the best
 * according to the goal.
 *
 * @param {Object[]} candidates    - From generateNeighbors, already filtered for freshness.
 * @param {string}   reactionId
 * @param {string}   goal          - 'maxYield' | 'minTime'
 * @param {Object[]} experiments   - Pre-filtered experiment dataset for this reaction.
 * @param {Object}   parametersRange
 * @param {number}   bestYieldSeen - Highest yield recorded in history so far.
 * @returns {Object} The best candidate conditions (without internal _priority tag).
 */
function selectBest(candidates, reactionId, goal, experiments, parametersRange, bestYieldSeen) {
  const scored = candidates.map(candidate => {
    const match = findNearest(reactionId, candidate, experiments, parametersRange);
    return {
      conditions:     candidate,
      estimatedYield: match ? match.yield : 0,
      priority:       candidate._priority !== undefined ? candidate._priority : 99
    };
  });

  let best;

  if (goal === 'maxYield') {
    // Sort: highest estimated yield first; tie-break by parameter priority (lower = preferred)
    scored.sort((a, b) => {
      if (Math.abs(b.estimatedYield - a.estimatedYield) > 0.001) {
        return b.estimatedYield - a.estimatedYield;
      }
      return a.priority - b.priority;
    });
    best = scored[0];

  } else {
    // minTime: prefer lower time when yield stays within 5pp of the best seen so far.
    // If nothing satisfies the yield threshold, fall back to maximising yield first.
    const YIELD_TOLERANCE = 5;
    const threshold = bestYieldSeen - YIELD_TOLERANCE;

    const acceptable = scored.filter(s => s.estimatedYield >= threshold);

    if (acceptable.length > 0) {
      // Among acceptable: lowest time first, then highest yield, then priority
      acceptable.sort((a, b) => {
        const tDiff = a.conditions.time - b.conditions.time;
        if (Math.abs(tDiff) > 0.001) return tDiff;
        if (Math.abs(b.estimatedYield - a.estimatedYield) > 0.001) {
          return b.estimatedYield - a.estimatedYield;
        }
        return a.priority - b.priority;
      });
      best = acceptable[0];
    } else {
      // Not yet at a good yield — maximise yield first, get time reduction later
      scored.sort((a, b) => {
        if (Math.abs(b.estimatedYield - a.estimatedYield) > 0.001) {
          return b.estimatedYield - a.estimatedYield;
        }
        return a.priority - b.priority;
      });
      best = scored[0];
    }
  }

  // Strip the internal _priority tag before returning
  const { _priority, ...cleanConditions } = best.conditions;
  return cleanConditions;
}

// ── main exported function ────────────────────────────────────────────────────

/**
 * Suggest the next experimental conditions for an optimization run.
 * Pure function — deterministic for the same inputs.
 *
 * @param {string}   reactionId
 * @param {Object[]} history        - Past iterations [{ conditions, yield }]
 * @param {string}   goal           - 'maxYield' | 'minTime'
 * @param {Object}   parametersRange - From reactions.json
 * @param {Object[]} experiments    - Pre-filtered experiment dataset
 * @returns {{ temperature, concentration, catalyst, time }}
 */
function suggestNextConditions(reactionId, history, goal, parametersRange, experiments) {
  // ── Iteration 1: fixed starting point ────────────────────────────────────
  if (!history || history.length === 0) {
    return startingConditions(parametersRange);
  }

  const usedKeys = new Set(history.map(iter => conditionKey(iter.conditions)));
  const bestYieldSeen = Math.max(...history.map(i => i.yield));

  // ── Primary: neighbors of the last position ───────────────────────────────
  const lastConditions = history[history.length - 1].conditions;
  let candidates = generateNeighbors(lastConditions, parametersRange)
    .filter(c => !usedKeys.has(conditionKey(c)));

  // ── Fallback 1: neighbors of the best yield point ever seen ──────────────
  // (handles case where last point was a local descent from a previous peak)
  if (candidates.length === 0) {
    const bestIter = [...history].sort((a, b) => b.yield - a.yield)[0];
    candidates = generateNeighbors(bestIter.conditions, parametersRange)
      .filter(c => !usedKeys.has(conditionKey(c)));
  }

  // ── Fallback 2: collect ALL unseen neighbors from ALL history points ──────
  if (candidates.length === 0) {
    const seenNeighborKeys = new Set();
    for (const iter of history) {
      for (const nb of generateNeighbors(iter.conditions, parametersRange)) {
        const k = conditionKey(nb);
        if (!usedKeys.has(k) && !seenNeighborKeys.has(k)) {
          seenNeighborKeys.add(k);
          candidates.push(nb);
        }
      }
    }
  }

  // ── Final safety: return last conditions (should be unreachable in 4-step MVP) ─
  if (candidates.length === 0) {
    console.warn('[suggestNextConditions] No fresh candidates found — returning last conditions.');
    return { ...lastConditions };
  }

  return selectBest(candidates, reactionId, goal, experiments, parametersRange, bestYieldSeen);
}

module.exports = { suggestNextConditions };
