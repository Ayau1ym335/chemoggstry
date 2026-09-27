'use strict';

const experimentService = require('../services/experimentService');

const experimentsController = {
  /**
   * POST /runs/:id/experiment
   * Body: { conditions: { temperature, concentration, catalyst, time } }
   *
   * Validates conditions shape, then delegates to experimentService.
   * All run-state logic (completed, max iterations, etc.) lives in the service.
   */
  runExperiment: (req, res, next) => {
    try {
      const { id: runId } = req.params;
      const { conditions } = req.body;

      // ── Validate conditions object presence ─────────────────────────────────
      if (!conditions || typeof conditions !== 'object' || Array.isArray(conditions)) {
        return res.status(400).json({
          error: {
            code:    'MISSING_CONDITIONS',
            message: 'Request body must include a "conditions" object.'
          }
        });
      }

      const { temperature, concentration, catalyst, time } = conditions;

      // ── Validate numeric fields ─────────────────────────────────────────────
      if (temperature === undefined || temperature === null || typeof temperature !== 'number' || isNaN(temperature)) {
        return res.status(400).json({
          error: { code: 'INVALID_TEMPERATURE', message: '"conditions.temperature" must be a number.' }
        });
      }
      if (concentration === undefined || concentration === null || typeof concentration !== 'number' || isNaN(concentration)) {
        return res.status(400).json({
          error: { code: 'INVALID_CONCENTRATION', message: '"conditions.concentration" must be a number.' }
        });
      }
      if (time === undefined || time === null || typeof time !== 'number' || isNaN(time)) {
        return res.status(400).json({
          error: { code: 'INVALID_TIME', message: '"conditions.time" must be a number.' }
        });
      }

      // ── Validate catalyst ───────────────────────────────────────────────────
      if (!catalyst || typeof catalyst !== 'string' || catalyst.trim() === '') {
        return res.status(400).json({
          error: { code: 'INVALID_CATALYST', message: '"conditions.catalyst" must be a non-empty string (use "None" if no catalyst).' }
        });
      }

      // ── Delegate to service ─────────────────────────────────────────────────
      const result = experimentService.runExperiment(runId, {
        temperature,
        concentration,
        catalyst: catalyst.trim(),
        time
      });

      return res.status(200).json({
        iteration: result.iteration,
        runStatus: result.runStatus
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = experimentsController;
