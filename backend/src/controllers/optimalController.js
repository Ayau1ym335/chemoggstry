'use strict';

const runsStore = require('../repositories/runsStore');
const { selectBestResult } = require('../services/bestResultSelector');

const optimalController = {
  /**
   * GET /runs/:id/optimal
   *
   * Returns the best result achieved so far in the run's history.
   * isFinal indicates if the run is completed (no more experiments will be added).
   */
  getOptimal: (req, res, next) => {
    try {
      const { id: runId } = req.params;
      const run = runsStore.getRunById(runId);
      
      if (!run) {
        return res.status(404).json({
          error: { code: 'RUN_NOT_FOUND', message: `Run '${runId}' not found.` }
        });
      }

      if (run.history.length === 0) {
        return res.status(404).json({
          error: { code: 'NO_HISTORY', message: `Run '${runId}' has no iterations yet.` }
        });
      }

      const optimal = selectBestResult(run.history, run.goal);

      return res.status(200).json({
        optimal,
        isFinal: run.status === 'completed'
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = optimalController;
