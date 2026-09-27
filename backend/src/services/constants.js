'use strict';

/**
 * constants.js — Shared domain constants for the optimization engine.
 *
 * Centralising these values prevents silent divergence when the same
 * number is referenced from multiple services (e.g. YIELD_TOLERANCE is
 * used both in suggestNextConditions and bestResultSelector — they MUST
 * agree or the "optimal" the UI shows will differ from where the algorithm
 * actually searched).
 */

/**
 * How many percentage points below the best yield seen so far is still
 * considered "acceptable" for the minTime goal.
 * Used identically in suggestNextConditions and bestResultSelector.
 */
const YIELD_TOLERANCE = 5;

/**
 * Hard cap on the number of experiment iterations per run.
 * Returned to the client in POST /runs as run.maxIterations.
 */
const MAX_ITERATIONS = 4;

module.exports = { YIELD_TOLERANCE, MAX_ITERATIONS };
