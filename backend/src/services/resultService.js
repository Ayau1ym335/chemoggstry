'use strict';

const runsStore = require('../repositories/runsStore');

/**
 * Register the actual experiment result based on the pending prediction.
 *
 * @param {string} runId
 * @param {number} actualYield
 * @returns {{ iteration: Object, runStatus: string }}
 */
function registerResult(runId, actualYield) {
  // 1. Resolve run
  const run = runsStore.getRunById(runId);
  if (!run) {
    const err = new Error(`Run '${runId}' not found.`);
    err.status = 404;
    err.code = 'RUN_NOT_FOUND';
    throw err;
  }

  // 2. Guard: already completed
  if (run.status === 'completed') {
    const err = new Error(
      `Run '${runId}' is already completed. No further results can be added.`
    );
    err.status = 409;
    err.code = 'RUN_ALREADY_COMPLETED';
    throw err;
  }

  // 3. Guard: pending prediction exists
  if (!run.pendingPrediction) {
    const err = new Error('No pending prediction found. Please request a prediction before registering the result.');
    err.status = 400;
    err.code = 'MISSING_PENDING_PREDICTION';
    throw err;
  }

  // 4. Create iteration
  const { conditions, predictedYield } = run.pendingPrediction;
  
  const iteration = {
    iterationNumber: run.history.length + 1,
    conditions: { ...conditions },
    predictedYield,
    actualYield,
    timestamp: new Date().toISOString()
  };

  // Flag suspicious inputs if deviation > 40
  if (Math.abs(actualYield - predictedYield) > 40) {
    iteration.suspiciousInput = true;
  }

  // 5. Add to history
  run.history.push(iteration);

  // 6. Clear pending prediction (can only register once)
  run.pendingPrediction = null;

  // 7. Transition to completed when iteration cap is reached
  if (run.history.length >= run.maxIterations) {
    run.status = 'completed';
  }

  runsStore.saveRun(run);

  return {
    iteration,
    runStatus: run.status
  };
}

module.exports = { registerResult };
