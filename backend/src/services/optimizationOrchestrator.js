'use strict';

/**
 * optimizationOrchestrator.js
 *
 * Internal integration harness — chains all core service layers in sequence:
 *   createRun → [suggestNextConditions → runExperiment] × maxIterations → selectBestResult
 *
 * NOT a public HTTP endpoint. Called directly as a function for:
 *   a) Integration testing (TASK 20) — verify the full loop before the UI exists.
 *   b) Future: batch optimization runs if ever needed.
 *
 * The HTTP endpoints (POST /runs, POST /runs/:id/next, POST /runs/:id/experiment,
 * GET /runs/:id/optimal) remain unchanged and are the path the frontend uses,
 * one step at a time, driven by user clicks.
 */

const { createRun }              = require('./runService');
const { runExperiment }          = require('./experimentService');
const { suggestNextConditions }  = require('./suggestNextConditions');
const { selectBestResult }       = require('./bestResultSelector');
const { findNearest }            = require('./findNearest');
const runsStore                  = require('../repositories/runsStore');
const dataRepository             = require('../repositories/dataRepository');

/**
 * Run a complete optimization cycle for a given reaction and goal.
 *
 * @param {string} reactionId  - Must exist in the data repository.
 * @param {string} goal        - 'maxYield' | 'minTime'
 * @returns {{ run: Object, optimal: Object }}
 * @throws If reactionId does not exist or the data layer is unavailable.
 */
function runFullOptimization(reactionId, goal) {
  // ── 1. Validate reaction exists ─────────────────────────────────────────────
  const reaction = dataRepository.getReactionById(reactionId);
  if (!reaction) {
    const err = new Error(`Reaction '${reactionId}' not found.`);
    err.status = 404;
    err.code   = 'REACTION_NOT_FOUND';
    throw err;
  }

  const experiments    = dataRepository.getExperimentsByReactionId(reactionId);
  const parametersRange = reaction.parametersRange;

  // ── 2. Create a fresh run ────────────────────────────────────────────────────
  const run = createRun(reactionId, goal);

  // ── 3. Iterate: suggest → experiment, exactly maxIterations times ────────────
  for (let step = 0; step < run.maxIterations; step++) {
    // Get suggestion based on current history
    let suggested = suggestNextConditions(
      reactionId,
      run.history,
      goal,
      parametersRange,
      experiments
    );

    // Safety net (AC3): if suggestNextConditions returns null/undefined for any
    // reason, fall back to the last known conditions (or the starting point).
    // This guarantees the loop always completes maxIterations steps.
    if (!suggested || typeof suggested !== 'object') {
      console.warn(
        `[orchestrator] suggestNextConditions returned invalid result on step ${step + 1} ` +
        `for ${reactionId}. Falling back to last conditions.`
      );
      suggested = run.history.length > 0
        ? { ...run.history[run.history.length - 1].conditions }
        : { temperature: parametersRange.temperature.min, concentration: parametersRange.concentration.min,
            catalyst: 'None', time: parametersRange.time.min };
    }

    // Run the experiment — this mutates run.history and updates run.status
    // (runExperiment fetches the run from the store internally via runId)
    runExperiment(run.id, suggested);

    // Reflect the latest store state (runExperiment saves back to store)
    const updatedRun = runsStore.getRunById(run.id);
    if (!updatedRun) {
      throw new Error(`[orchestrator] Run '${run.id}' disappeared from store during iteration.`);
    }

    // Sync local reference so suggestNextConditions sees up-to-date history
    Object.assign(run, updatedRun);
  }

  // ── 4. Select the optimal result ─────────────────────────────────────────────
  const optimal = selectBestResult(run.history, goal);

  return { run, optimal };
}

module.exports = { runFullOptimization };
