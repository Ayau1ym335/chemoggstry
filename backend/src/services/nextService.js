'use strict';

/**
 * nextService.js
 *
 * Thin service that assembles the data needed by suggestNextConditions and
 * returns the result. Extracted from nextController so the controller
 * stays a pure HTTP adapter (receives request → returns response) without
 * touching the data layer itself.
 *
 * Mirrors the pattern already used by experimentService (TASK 12).
 */

const runsStore      = require('../repositories/runsStore');
const dataRepository = require('../repositories/dataRepository');
const { suggestNextConditions } = require('./suggestNextConditions');

/**
 * Get the next suggested experimental conditions for a run.
 * Read-only — does NOT write to run.history.
 *
 * @param {string} runId
 * @returns {{ temperature, concentration, catalyst, time }}
 * @throws Structured errors with .status and .code.
 */
function getNextSuggestion(runId) {
  const run = runsStore.getRunById(runId);
  if (!run) {
    const err = new Error(`Run '${runId}' not found.`);
    err.status = 404;
    err.code   = 'RUN_NOT_FOUND';
    throw err;
  }

  if (run.status === 'completed') {
    const err = new Error(`Run '${runId}' is already completed.`);
    err.status = 409;
    err.code   = 'RUN_ALREADY_COMPLETED';
    throw err;
  }

  const reaction = dataRepository.getReactionById(run.reactionId);
  if (!reaction) {
    const err = new Error('Reaction data not found.');
    err.status = 500;
    err.code   = 'INTERNAL_DATA_INCONSISTENCY';
    throw err;
  }

  const experiments = dataRepository.getExperimentsByReactionId(run.reactionId);

  return suggestNextConditions(
    run.reactionId,
    run.history,
    run.goal,
    reaction.parametersRange,
    experiments
  );
}

module.exports = { getNextSuggestion };
