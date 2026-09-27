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

/**
 * Minimum absolute yield change (pp) to be considered a meaningful shift.
 * Below this threshold "yield changed" comparisons are treated as flat.
 * Used in assistantResponder for why_temperature_changed, why_yield_decreased, etc.
 */
const YIELD_CHANGE_THRESHOLD = 0.05;

/**
 * Prediction accuracy within ±N pp is considered "accurate" for the
 * why_actual_differs_from_predicted template (rounded integer comparison).
 */
const PREDICTION_ACCURACY_THRESHOLD = 3;

module.exports = { YIELD_TOLERANCE, MAX_ITERATIONS, YIELD_CHANGE_THRESHOLD, PREDICTION_ACCURACY_THRESHOLD };
