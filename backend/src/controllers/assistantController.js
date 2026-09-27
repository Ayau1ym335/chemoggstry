'use strict';

const { buildAiContext }    = require('../services/aiContextBuilder');
const { matchQuestion }     = require('../services/questionMatcher');
const { generateResponse }  = require('../services/assistantResponder');

const assistantController = {
  /**
   * POST /assistant/ask
   * Body: { runId, question }
   *
   * Returns a human-readable answer derived from the run state and the
   * recognized question template.
   */
  ask: (req, res, next) => {
    try {
      const { runId, question } = req.body;

      if (!runId || typeof runId !== 'string' || runId.trim() === '') {
        return res.status(400).json({
          error: { code: 'MISSING_RUN_ID', message: '"runId" is required.' }
        });
      }

      if (!question || typeof question !== 'string' || question.trim() === '') {
        return res.status(400).json({
          error: { code: 'MISSING_QUESTION', message: '"question" is required and must be a non-empty string.' }
        });
      }

      // Build context — throws 404 if runId not found
      const context = buildAiContext(runId.trim());

      // Match question to template
      const { templateId, score } = matchQuestion(question.trim());

      // Generate response
      const answer = generateResponse(templateId, context);

      return res.status(200).json({
        answer,
        matchedTemplate: templateId,
        matchScore: score
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = assistantController;
