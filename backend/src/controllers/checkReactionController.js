'use strict';

const { findReactionBySubstances } = require('../services/checkReactionService');

function checkReaction(req, res) {
  const { substanceSymbols } = req.body;

  if (!substanceSymbols || !Array.isArray(substanceSymbols)) {
    return res.status(400).json({
      error: { code: 'BAD_REQUEST', message: 'substanceSymbols must be an array' }
    });
  }

  const result = findReactionBySubstances(substanceSymbols);
  return res.status(200).json(result);
}

module.exports = { checkReaction };
