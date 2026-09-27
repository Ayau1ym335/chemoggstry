'use strict';

const runsStore        = require('../repositories/runsStore');
const dataRepository   = require('../repositories/dataRepository');
const { suggestNextConditions } = require('../services/suggestNextConditions');

const nextController = {
  /**
   * POST /runs/:id/next
   *
   * Returns the next suggested experimental conditions for a run.
   * Does NOT advance the run history — calling this endpoint is side-effect-free.
   * The frontend calls this to pre-populate form fields; the actual experiment
   * is submitted separately via POST /runs/:id/experiment (TASK 12).
   */
  getNext: (req, res, next) => {
    try {
      const { id: runId } = req.params;

      const run = runsStore.getRunById(runId);
      if (!run) {
        return res.status(404).json({
          error: { code: 'RUN_NOT_FOUND', message: `Run '${runId}' not found.` }
        });
      }

      if (run.status === 'completed') {
        return res.status(409).json({
          error: { code: 'RUN_ALREADY_COMPLETED', message: `Run '${runId}' is already completed.` }
        });
      }

      const reaction = dataRepository.getReactionById(run.reactionId);
      if (!reaction) {
        return res.status(500).json({
          error: { code: 'INTERNAL_DATA_INCONSISTENCY', message: 'Reaction data not found.' }
        });
      }

      const experiments = dataRepository.getExperimentsByReactionId(run.reactionId);
      const suggested = suggestNextConditions(
        run.reactionId,
        run.history,
        run.goal,
        reaction.parametersRange,
        experiments
      );

      return res.status(200).json({ suggestedConditions: suggested });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = nextController;
