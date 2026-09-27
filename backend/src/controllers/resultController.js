'use strict';

const resultService = require('../services/resultService');

const resultController = {
  /**
   * POST /runs/:id/result
   * Body: { actualYield: 68 }
   */
  registerResult: (req, res, next) => {
    try {
      const { id: runId } = req.params;
      const { actualYield } = req.body;

      if (actualYield === undefined || actualYield === null || typeof actualYield !== 'number' || isNaN(actualYield)) {
        return res.status(400).json({
          error: { code: 'INVALID_ACTUAL_YIELD', message: '"actualYield" must be a number.' }
        });
      }

      if (actualYield < 0 || actualYield > 100) {
        return res.status(400).json({
          error: { code: 'INVALID_ACTUAL_YIELD_RANGE', message: '"actualYield" must be between 0 and 100.' }
        });
      }

      const result = resultService.registerResult(runId, actualYield);

      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
};

module.exports = resultController;
