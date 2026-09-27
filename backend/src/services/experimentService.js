'use strict';

/**
 * experimentService.js
 *
 * Orchestrates a single "virtual experiment" step within an optimization run:
 *   1. Resolves the run from the store.
 *   2. Validates run state (in_progress, not at iteration limit).
 *   3. Delegates yield lookup to findNearest (pure function, no side-effects).
 *   4. Appends the new iteration to run.history (the ONE place where history is written).
 *   5. Marks the run as "completed" when maxIterations is reached.
 *
 * This module is the only place that writes to run.history.
 * findNearest (TASK 9) remains a pure function and can be tested in isolation.
 */

const runsStore      = require('../repositories/runsStore');
const dataRepository = require('../repositories/dataRepository');
const { findNearest } = require('./findNearest');

/**
 * Run a virtual experiment iteration.
 *
 * @param {string} runId
 * @param {{ temperature: number, concentration: number, catalyst: string, time: number }} conditions
 * @returns {{ iteration: Object, runStatus: string }}
 * @throws Structured errors with .status and .code for the controller to forward.
 */
function runExperiment(runId, conditions) {
  // ── 1. Resolve run ──────────────────────────────────────────────────────────
  const run = runsStore.getRunById(runId);
  if (!run) {
    const err = new Error(`Run '${runId}' not found.`);
    err.status = 404;
    err.code   = 'RUN_NOT_FOUND';
    throw err;
  }

  // ── 2. Guard: already completed ────────────────────────────────────────────
  if (run.status === 'completed') {
    const err = new Error(
      `Run '${runId}' is already completed. No further experiments can be added.`
    );
    err.status = 409;
    err.code   = 'RUN_ALREADY_COMPLETED';
    throw err;
  }

  // ── 3. Guard: iteration cap (secondary safety, in case status desyncs) ─────
  if (run.history.length >= run.maxIterations) {
    const err = new Error(
      `Run '${runId}' has reached its maximum of ${run.maxIterations} iterations.`
    );
    err.status = 409;
    err.code   = 'MAX_ITERATIONS_REACHED';
    throw err;
  }

  // ── 4. Resolve reaction data for findNearest ────────────────────────────────
  const reaction = dataRepository.getReactionById(run.reactionId);
  if (!reaction) {
    // Should never happen if run creation was validated correctly (TASK 11)
    const err = new Error(`Reaction '${run.reactionId}' referenced by run '${runId}' no longer exists.`);
    err.status = 500;
    err.code   = 'INTERNAL_DATA_INCONSISTENCY';
    throw err;
  }

  const experiments = dataRepository.getExperimentsByReactionId(run.reactionId);

  // ── 5. Nearest-match lookup (clamping happens inside findNearest) ───────────
  const match = findNearest(run.reactionId, conditions, experiments, reaction.parametersRange);
  if (!match) {
    const err = new Error(`No experiment data found for reaction '${run.reactionId}'.`);
    err.status = 500;
    err.code   = 'NO_EXPERIMENT_DATA';
    throw err;
  }

  // ── 6. Build the new iteration record ──────────────────────────────────────
  //    Store the conditions that were actually used (after clamping inside findNearest,
  //    the matchedPoint reflects the closest real values).
  //    We store what the *caller* sent so the UI can display what was requested,
  //    plus the resolved yield.
  const iteration = {
    iterationNumber: run.history.length + 1,
    conditions: {
      temperature:   conditions.temperature,
      concentration: conditions.concentration,
      catalyst:      conditions.catalyst,
      time:          conditions.time
    },
    yield:     match.yield,
    timestamp: new Date().toISOString()
  };

  // ── 7. Mutate run (the only place history grows) ───────────────────────────
  run.history.push(iteration);

  // ── 8. Transition to completed when iteration cap is reached ───────────────
  if (run.history.length >= run.maxIterations) {
    run.status = 'completed';
  }

  // Persist updated run back to the store
  runsStore.saveRun(run);

  return {
    iteration,
    runStatus: run.status
  };
}

module.exports = { runExperiment };
