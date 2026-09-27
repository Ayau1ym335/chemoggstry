'use strict';

/**
 * checkReactionService.js
 *
 * Pure business logic for matching a set of element symbols to a preset reaction.
 * Extracted from checkReactionController so the controller stays thin
 * (validate input → call service → send response).
 */

const dataRepository = require('../repositories/dataRepository');

/**
 * Normalise an array of substance symbols: trim, deduplicate, sort alphabetically.
 * Sorting makes order-independent comparison an O(n) string equality check.
 *
 * @param {string[]} symbols
 * @returns {string} Canonical comma-joined key, e.g. "Cl,H,Na,O"
 */
function normaliseSymbols(symbols) {
  return [...new Set(symbols.map(s => s.trim()))]
    .sort()
    .join(',');
}

/**
 * Find the preset reaction that corresponds to the given substance symbols.
 *
 * @param {string[]} substanceSymbols - Raw array from the request body
 * @returns {{ reactionPossible: false }
 *         | { reactionPossible: true, reaction: { id, name, equation, bondingType } }}
 */
function findReactionBySubstances(substanceSymbols) {
  const inputKey = normaliseSymbols(substanceSymbols);

  const mapping = dataRepository.getSubstanceReactionMap();
  const match = mapping.find(m => normaliseSymbols(m.substanceSymbols) === inputKey);

  if (!match) return { reactionPossible: false };

  const reaction = dataRepository.getReactionById(match.reactionId);
  if (!reaction) return { reactionPossible: false };

  return {
    reactionPossible: true,
    reaction: {
      id:          reaction.id,
      name:        reaction.name,
      equation:    reaction.equation,
      bondingType: reaction.bondingType,
    },
  };
}

module.exports = { findReactionBySubstances };
