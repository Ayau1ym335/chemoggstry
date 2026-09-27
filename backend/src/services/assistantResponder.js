'use strict';

/**
 * assistantResponder.js
 *
 * Converts a (templateId, context) pair into a human-readable response string.
 * Every template has 2–3 explicit text branches covering distinct context states.
 * No undefined/NaN can appear in output: every field access has a safe fallback.
 *
 * TEXT BRANCH MATRIX (templateId × state):
 * ─────────────────────────────────────────
 * why_temperature_changed
 *   • no previousIteration  → first-experiment baseline explanation
 *   • temp IS the changed param, yield↑ → temperature raised the yield
 *   • temp IS the changed param, yield↓ → temperature hurt the yield
 *   • temp NOT the changed param → temperature was deliberately held constant
 *
 * why_catalyst_chosen
 *   • no previousIteration  → started without catalyst as baseline
 *   • catalyst switched from None → acceleration explanation
 *   • catalyst changed between two non-None values → better match explanation
 *   • catalyst is still None → natural-rate reference explanation
 *
 * why_yield_decreased
 *   • no previousIteration  → first experiment, nothing to compare
 *   • yieldDelta < 0 → real decrease with changedParam attribution
 *   • yieldDelta ≥ 0 → yield did NOT decrease, user may be confused
 *
 * what_if_concentration_increased
 *   • (stateless heuristic + current conditions) — always the same structure,
 *     but inserts real current values
 *
 * why_optimal
 *   • isFinalIteration true  → definitive best-conditions statement
 *   • isFinalIteration false → interim best-so-far, more runs pending
 *
 * what_did_previous_show
 *   • no previousIteration → nothing to compare, first experiment
 *   • has previousIteration → concrete numbers + delta
 *
 * fallback
 *   • no history   → starting-up description
 *   • has history  → current progress + best so far
 */

// ── helpers ──────────────────────────────────────────────────────────────────

const GOAL_LABEL = {
  maxYield: 'maximise yield',
  minTime:  'minimise reaction time'
};

/** Human-readable parameter name. */
const PARAM_NAME = {
  temperature:   'temperature',
  concentration: 'concentration',
  catalyst:      'catalyst',
  time:          'reaction time'
};

function goalLabel(goal) {
  return GOAL_LABEL[goal] || goal;
}

/** Format a changedParameter (string or array) for prose. */
function fmtParam(changedParameter) {
  if (!changedParameter) return 'a parameter';
  if (Array.isArray(changedParameter)) {
    return changedParameter.map(p => PARAM_NAME[p] || p).join(' and ');
  }
  return PARAM_NAME[changedParameter] || changedParameter;
}

/** Format conditions as a compact readable string. */
function fmtConditions(c) {
  if (!c) return '—';
  return `T=${c.temperature}°C, C=${c.concentration} M, catalyst: ${c.catalyst}, time: ${c.time} min`;
}

/** Sign-aware delta string: "+3.5 pp" or "−3.5 pp". */
function fmtDelta(delta) {
  if (delta === null || delta === undefined) return '';
  const abs = Math.abs(delta).toFixed(1);
  return delta >= 0 ? `+${abs} pp` : `−${abs} pp`;
}

// ── template render functions ─────────────────────────────────────────────────

const TEMPLATES = {

  why_temperature_changed(ctx) {
    const { currentIteration: cur, previousIteration: prev, actualYieldDelta, changedParameter } = ctx;

    if (!prev) {
      const cond = cur ? cur.conditions : null;
      return `This is the first experiment for ${ctx.reactionName}, so there is nothing to compare against yet. ` +
        `The system started from a conservative baseline: ${fmtConditions(cond)}. ` +
        `Subsequent experiments will adjust one parameter at a time to find the optimum.`;
    }

    const tempChanged = changedParameter === 'temperature' ||
      (Array.isArray(changedParameter) && changedParameter.includes('temperature'));

    if (!tempChanged) {
      return `The temperature was held constant at ${cur.conditions.temperature}°C this step. ` +
        `Instead, the algorithm changed ${fmtParam(changedParameter)} to isolate its effect on yield. ` +
        `By changing only one variable at a time the system can attribute yield changes to a specific factor.`;
    }

    const direction = cur.conditions.temperature > prev.conditions.temperature ? 'raised' : 'lowered';
    if (actualYieldDelta > 0.05) {
      return `In the previous step, ${direction} the temperature to ${cur.conditions.temperature}°C ` +
        `increased the yield from ${prev.actualYield}% to ${cur.actualYield}% (${fmtDelta(actualYieldDelta)}). ` +
        `This suggests the reaction benefits from higher thermal energy at this stage. ` +
        `The algorithm continues exploring in this direction.`;
    } else if (actualYieldDelta < -0.05) {
      return `${direction.charAt(0).toUpperCase() + direction.slice(1)} the temperature to ${cur.conditions.temperature}°C ` +
        `caused the yield to fall from ${prev.actualYield}% to ${cur.actualYield}% (${fmtDelta(actualYieldDelta)}). ` +
        `This indicates the reaction is sensitive to temperature in this range. ` +
        `The algorithm will now explore other parameters to recover the yield.`;
    } else {
      return `The temperature was ${direction} to ${cur.conditions.temperature}°C, ` +
        `but the yield remained essentially unchanged at ${cur.actualYield}%. ` +
        `This suggests the reaction is relatively insensitive to temperature in this range. ` +
        `The algorithm will investigate other parameters next.`;
    }
  },

  why_catalyst_chosen(ctx) {
    const { currentIteration: cur, previousIteration: prev, actualYieldDelta } = ctx;

    if (!prev) {
      const cat = cur ? cur.conditions.catalyst : 'None';
      if (cat === 'None') {
        return `The first experiment runs without a catalyst as a reference baseline. ` +
          `This establishes the natural reaction yield for ${ctx.reactionName} before any acceleration is introduced, ` +
          `giving the algorithm a meaningful comparison point for subsequent catalysed experiments.`;
      }
      return `The algorithm started with ${cat} as the catalyst for ${ctx.reactionName}. ` +
        `This is the initial baseline condition for this run.`;
    }

    const prevCat = prev.conditions.catalyst;
    const curCat  = cur.conditions.catalyst;

    if (prevCat === 'None' && curCat !== 'None') {
      return `Adding ${curCat} as a catalyst boosted the yield from ${prev.actualYield}% to ${cur.actualYield}% (${fmtDelta(actualYieldDelta)}). ` +
        `Catalysts lower the activation energy of the reaction, allowing more product to form ` +
        `under the same temperature and concentration conditions. ` +
        `This confirms that ${curCat} is effective for ${ctx.reactionName}.`;
    }

    if (prevCat !== 'None' && curCat !== 'None' && prevCat !== curCat) {
      return `The catalyst was switched from ${prevCat} to ${curCat}. ` +
        (actualYieldDelta > 0
          ? `This improved the yield by ${fmtDelta(actualYieldDelta)}, reaching ${cur.actualYield}%. ${curCat} appears to be a better match for the conditions of ${ctx.reactionName}.`
          : `The yield changed by ${fmtDelta(actualYieldDelta)} to ${cur.actualYield}%. The algorithm is evaluating which catalyst is optimal for these conditions.`);
    }

    if (curCat === 'None') {
      return `This experiment runs without a catalyst. ` +
        `The current yield of ${cur.actualYield}% provides a benchmark showing how well ${ctx.reactionName} ` +
        `proceeds under its own kinetics. If a catalyst is added later, this value serves as the baseline for comparison.`;
    }

    return `The catalyst remains ${curCat} for this step. ` +
      `The algorithm is currently optimising other parameters while keeping the catalyst fixed. ` +
      `The current yield is ${cur.actualYield}%.`;
  },

  why_yield_decreased(ctx) {
    const { currentIteration: cur, previousIteration: prev, actualYieldDelta, changedParameter } = ctx;

    if (!prev) {
      return `This is the first experiment for ${ctx.reactionName} — there is no previous result to compare against. ` +
        `The current yield is ${cur ? cur.actualYield + '%' : '—'}. ` +
        `Future experiments will build a trajectory to determine whether the yield is improving or declining.`;
    }

    if (actualYieldDelta !== null && actualYieldDelta < -0.05) {
      return `The yield fell from ${prev.actualYield}% to ${cur.actualYield}% (${fmtDelta(actualYieldDelta)}) ` +
        `when ${fmtParam(changedParameter)} was changed. ` +
        `This means moving ${fmtParam(changedParameter)} in that direction pushed conditions away from the optimum. ` +
        `The algorithm will now reverse course or try a different parameter to recover the yield.`;
    }

    return `The yield did not actually decrease this step — it moved from ${prev.actualYield}% to ${cur.actualYield}% (${fmtDelta(actualYieldDelta)}). ` +
      `If you are seeing a lower number elsewhere, please check the full history table. ` +
      `The algorithm is actively working to ${goalLabel(ctx.goal)} for ${ctx.reactionName}.`;
  },

  what_if_concentration_increased(ctx) {
    const { currentIteration: cur, optimalSoFar } = ctx;
    const curConc = cur ? cur.conditions.concentration : null;
    const optConc = optimalSoFar ? optimalSoFar.conditions.concentration : null;

    let base = `Increasing concentration generally raises the reaction rate by bringing more reactant molecules into contact. ` +
      `However, yield improvements plateau once the limiting reagent or active sites are saturated — ` +
      `beyond that point additional concentration provides diminishing returns or may cause side reactions.`;

    if (curConc !== null) {
      base += ` The current concentration is ${curConc} M.`;
    }
    if (optConc !== null && curConc !== null && optConc !== curConc) {
      base += ` The best result so far was achieved at ${optConc} M (${optimalSoFar.actualYield}% yield), ` +
        `suggesting that concentration around that value is more favourable for ${ctx.reactionName}.`;
    } else if (optConc !== null) {
      base += ` The best result found so far (${optimalSoFar.actualYield}%) was at ${optConc} M — ` +
        `the algorithm will continue exploring whether higher concentrations improve this further.`;
    }

    return base;
  },

  why_optimal(ctx) {
    const { optimalSoFar: opt, isFinalIteration, reactionName, goal } = ctx;

    if (!opt) {
      return `No experiments have been recorded yet for this run. ` +
        `Run at least one experiment to see optimal conditions.`;
    }

    const condStr = fmtConditions(opt.conditions);

    if (isFinalIteration) {
      return `After all experiments, the best conditions found for ${reactionName} are: ${condStr}. ` +
        `This configuration achieved a yield of ${opt.actualYield}%, the highest recorded across all ${ctx.currentIteration ? ctx.currentIteration.iterationNumber : '?'} iterations. ` +
        `The goal was to ${goalLabel(goal)}, and this result represents the optimum within the explored parameter space.`;
    }

    return `So far, the best conditions found for ${reactionName} are: ${condStr}, ` +
      `achieving a yield of ${opt.actualYield}% (experiment #${opt.iterationNumber}). ` +
      `The run is still in progress — further experiments may find even better conditions. ` +
      `The algorithm continues to explore the parameter space with the goal to ${goalLabel(goal)}.`;
  },

  what_did_previous_show(ctx) {
    const { currentIteration: cur, previousIteration: prev, actualYieldDelta } = ctx;

    if (!prev) {
      return `There is no previous experiment to reference — this is the first iteration. ` +
        `The current experiment is running at ${fmtConditions(cur ? cur.conditions : null)}. ` +
        `Once the second experiment is complete, you will be able to compare results here.`;
    }

    const trend = actualYieldDelta > 0.05 ? `increased by ${fmtDelta(actualYieldDelta)}`
      : actualYieldDelta < -0.05          ? `decreased by ${fmtDelta(actualYieldDelta)}`
      : `remained approximately the same`;

    return `Experiment #${prev.iterationNumber} tested ${fmtConditions(prev.conditions)} ` +
      `and achieved a yield of ${prev.actualYield}%. ` +
      `Compared to the following experiment (#${cur.iterationNumber}), the yield ${trend}, ` +
      `reaching ${cur.actualYield}%. ` +
      `This progression informs the algorithm about which parameter changes are productive.`;
  },

  fallback(ctx) {
    const { reactionName, goal, currentIteration: cur, optimalSoFar: opt } = ctx;

    if (!cur) {
      return `The optimization run for ${reactionName} is just starting. ` +
        `Goal: ${goalLabel(goal)}. ` +
        `The first experiment will establish a baseline yield to optimize from. ` +
        `Try asking about temperature, catalyst, or concentration for more specific guidance.`;
    }

    const iterN = cur.iterationNumber;
    const optStr = opt ? `The best result so far is ${opt.actualYield}% yield at ${fmtConditions(opt.conditions)}.`
                       : '';

    return `The optimization for ${reactionName} is in progress — ${iterN} experiment${iterN > 1 ? 's' : ''} completed. ` +
      `${optStr} Goal: ${goalLabel(goal)}. ` +
      `You can ask about why a specific parameter was changed, what the previous experiment showed, ` +
      `or why certain conditions are considered optimal.`;
  },

  why_actual_differs_from_predicted(ctx) {
    const { predictedYield, actualYield, predictionAccuracy } = ctx;

    // requiredContextFields guard — == null catches both null and undefined
    // (realistic when asked before the first registered iteration)
    if (predictedYield == null || actualYield == null || predictionAccuracy == null) {
      return `Ещё нет данных для сравнения предсказания и фактического результата — ` +
        `сначала завершите хотя бы один эксперимент.`;
    }

    // Round to whole integer to prevent float noise (e.g. 3.4999999)
    const accuracyRounded = Math.round(predictionAccuracy);
    const absAccuracy     = Math.abs(accuracyRounded);

    // Threshold: ±3 pp is considered "accurate"
    if (absAccuracy <= 3) {
      return `Предсказание оказалось точным — прогнозировался результат ${predictedYield}%, вы получили ${actualYield}%.`;
    }

    if (accuracyRounded < 0) {
      return `Ваш результат (${actualYield}%) оказался ниже, чем предсказывала модель (${predictedYield}%), на ${absAccuracy} п.п. ` +
        `Это может означать, что реальные условия эксперимента немного отличались от тех, что заложены в базе данных.`;
    }

    return `Ваш результат (${actualYield}%) превысил предсказание (${predictedYield}%) на ${absAccuracy} п.п. — ` +
      `выбранные условия сработали даже лучше ожидаемого.`;
  }
};

/**
 * Generate a response string for the given template and context.
 *
 * @param {string} templateId
 * @param {Object} context - Output of buildAiContext()
 * @returns {string}
 */
function generateResponse(templateId, context) {
  const fn = TEMPLATES[templateId] || TEMPLATES.fallback;
  try {
    return fn(context);
  } catch (err) {
    // Safety net: never let a template crash the endpoint
    console.error('[assistantResponder] Template error for', templateId, err.message);
    return TEMPLATES.fallback(context);
  }
}

module.exports = { generateResponse };
