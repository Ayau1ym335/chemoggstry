'use strict';

const { randomUUID } = require('crypto');
const runsStore = require('../repositories/runsStore');
const { MAX_ITERATIONS } = require('./constants');

/** Valid goal values — enforced here so controllers stay thin. */
const VALID_GOALS = ['maxYield', 'minTime'];

// MAX_ITERATIONS is imported from ./constants — single source of truth.

/**
 * Create a brand-new optimization run and persist it to the store.
 *
 * @param {string} reactionId - ID of the target reaction (caller must verify it exists).
 * @param {string} goal       - 'maxYield' | 'minTime'
 * @returns {Object} The newly created run object.
 * @throws {Error} If goal is not one of the two allowed values.
 */
function createRun(reactionId, goal) {
  if (!VALID_GOALS.includes(goal)) {
    const err = new Error(`Invalid goal '${goal}'. Must be one of: ${VALID_GOALS.join(', ')}.`);
    err.status = 400;
    err.code = 'INVALID_GOAL';
    throw err;
  }

  const run = {
    id:            randomUUID(),
    reactionId,
    goal,
    status:        'in_progress',
    history:       [],
    maxIterations: MAX_ITERATIONS,
    createdAt:     new Date().toISOString()
  };

  runsStore.saveRun(run);
  return run;
}

module.exports = { createRun, VALID_GOALS };
