'use strict';

const dataRepository = require('../repositories/dataRepository');
const runService = require('../services/runService');
const { isNonEmptyString } = require('../utils/validate');

const runsController = {
  /**
   * POST /runs
   * Body: { reactionId, goal }
   *
   * Validates both fields before delegating to runService.
   * No run is created if validation fails — no orphan records in the store.
   */
  create: (req, res, next) => {
    try {
      const { reactionId, goal } = req.body;

      // 1. reactionId: presence check
      if (!isNonEmptyString(reactionId)) {
        return res.status(400).json({
          error: {
            code: 'MISSING_REACTION_ID',
            message: 'Field "reactionId" is required and must be a non-empty string.'
          }
        });
      }

      // 2. reactionId: existence check against the data layer
      const reaction = dataRepository.getReactionById(reactionId.trim());
      if (!reaction) {
        return res.status(404).json({
          error: {
            code: 'REACTION_NOT_FOUND',
            message: `Reaction with id '${reactionId}' not found.`
          }
        });
      }

      // 3. goal: presence check (type + enum validated inside runService)
      if (!isNonEmptyString(goal)) {
        return res.status(400).json({
          error: {
            code: 'MISSING_GOAL',
            message: 'Field "goal" is required and must be a non-empty string.'
          }
        });
      }

      // 4. Delegate creation (throws 400 if goal enum invalid)
      const run = runService.createRun(reactionId.trim(), goal.trim());

      // Return only the fields the frontend needs at creation time
      return res.status(201).json({
        run: {
          id:            run.id,
          reactionId:    run.reactionId,
          goal:          run.goal,
          status:        run.status,
          history:       run.history,
          maxIterations: run.maxIterations
        }
      });
    } catch (err) {
      // Pass structured errors (e.g. INVALID_GOAL from runService) to global handler
      next(err);
    }
  }
};

module.exports = runsController;
