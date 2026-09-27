'use strict';

/**
 * aiContextBuilder.js
 * 
 * Assembles a unified "snapshot" of a run's state for the AI Assistant.
 * Provides necessary context like yieldDelta and changedParameter so that
 * the templating engine (TASK 17/18) can generate meaningful explanations.
 */

const runsStore = require('../repositories/runsStore');
const dataRepository = require('../repositories/dataRepository');
const { selectBestResult } = require('./bestResultSelector');

const { analyzeEfficiency } = require('./efficiencyService');

/**
 * Computes the parameter(s) that changed between two condition objects.
 * Returns a string if exactly one changed, an array if multiple changed.
 */
function getChangedParameters(prevConditions, currConditions) {
  if (!prevConditions || !currConditions) return null;
  
  const changed = [];
  const keys = Object.keys(currConditions);
  
  for (const key of keys) {
    if (prevConditions[key] !== currConditions[key]) {
      changed.push(key);
    }
  }
  
  if (changed.length === 0) return null;
  if (changed.length === 1) return changed[0]; // Exactly one changed (standard case)
  return changed; // Edge case: multiple changed
}

/**
 * Builds the AI context object for a specific run.
 * 
 * @param {string} runId
 * @returns {Object} context
 */
function buildAiContext(runId) {
  const run = runsStore.getRunById(runId);
  if (!run) {
    const err = new Error(`Run '${runId}' not found`);
    err.status = 404;
    throw err;
  }
  
  const reaction = dataRepository.getReactionById(run.reactionId);
  if (!reaction) {
    const err = new Error(`Reaction '${run.reactionId}' not found`);
    err.status = 500;
    throw err;
  }

  const historyLength = run.history.length;
  const currentIteration = historyLength > 0 ? run.history[historyLength - 1] : null;
  const previousIteration = historyLength > 1 ? run.history[historyLength - 2] : null;
  
  let actualYieldDelta = null;
  let changedParameter = null;
  
  if (currentIteration && previousIteration) {
    // Round to avoid float precision issues, e.g., 64.2 - 64.0 = 0.20000000000000284
    actualYieldDelta = Number((currentIteration.actualYield - previousIteration.actualYield).toFixed(2));
    changedParameter = getChangedParameters(previousIteration.conditions, currentIteration.conditions);
  }

  const eff = analyzeEfficiency(run.history) || {};

  return {
    reactionName: reaction.name,
    goal: run.goal,
    currentIteration,
    previousIteration,
    actualYieldDelta,
    changedParameter,
    predictedYield: currentIteration ? currentIteration.predictedYield : null,
    actualYield: currentIteration ? currentIteration.actualYield : null,
    predictionAccuracy: eff.predictionAccuracy,
    effectivenessTrend: eff.direction,
    optimalSoFar: selectBestResult(run.history, run.goal),
    isFinalIteration: run.status === 'completed'
  };
}

module.exports = { buildAiContext };
