'use strict';

const { getNextSuggestion } = require('../services/nextService');

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
      const suggested = getNextSuggestion(runId);
      return res.status(200).json({ suggestedConditions: suggested });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = nextController;
