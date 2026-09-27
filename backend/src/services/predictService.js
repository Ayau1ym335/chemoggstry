'use strict';

const runsStore = require('../repositories/runsStore');
const dataRepository = require('../repositories/dataRepository');
const { findNearest } = require('./findNearest');

function predictYield(runId, conditions) {
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
      `Run '${runId}' is already completed. No further predictions can be made.`
    );
    err.status = 409;
    err.code = 'RUN_ALREADY_COMPLETED';
    throw err;
  }

  // 3. Resolve reaction data
  const reaction = dataRepository.getReactionById(run.reactionId);
  if (!reaction) {
    const err = new Error(`Reaction '${run.reactionId}' referenced by run '${runId}' no longer exists.`);
    err.status = 500;
    err.code = 'INTERNAL_DATA_INCONSISTENCY';
    throw err;
  }

  const experiments = dataRepository.getExperimentsByReactionId(run.reactionId);

  // 4. Nearest-match lookup (clamping happens inside findNearest)
  const match = findNearest(run.reactionId, conditions, experiments, reaction.parametersRange);
  if (!match) {
    const err = new Error(`No experiment data found for reaction '${run.reactionId}'.`);
    err.status = 500;
    err.code = 'NO_EXPERIMENT_DATA';
    throw err;
  }

  // 5. Save pending prediction
  const pendingPrediction = {
    conditions: {
      temperature: conditions.temperature,
      concentration: conditions.concentration,
      catalyst: conditions.catalyst,
      time: conditions.time
    },
    predictedYield: match.yield,
    predictedAt: new Date().toISOString()
  };

  run.pendingPrediction = pendingPrediction;
  runsStore.saveRun(run);

  return pendingPrediction;
}

module.exports = { predictYield };
