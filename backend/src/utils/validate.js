'use strict';

/**
 * validate.js — Shared request-validation helpers.
 *
 * Extracted from controllers to avoid repeating the same guard inline.
 * Each helper is a pure predicate — no side effects, easy to unit-test.
 */

/**
 * Returns true when the value is a non-empty string (after trim).
 * Matches the inline check previously repeated in every controller:
 *   !value || typeof value !== 'string' || value.trim() === ''
 *
 * @param {*} value
 * @returns {boolean}
 */
function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

module.exports = { isNonEmptyString };
