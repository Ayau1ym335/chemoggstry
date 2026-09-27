'use strict';

/**
 * findNearest.js — Pure nearest-match lookup in an experiment dataset.
 *
 * Design decisions:
 *
 * 1. NORMALISATION
 *    Numeric dimensions (temperature, concentration, time) are each normalised
 *    by dividing the raw difference by the parameter's full range (max - min).
 *    This puts every dimension in [0, 1] so a large-scale axis (e.g. temperature
 *    600-1000 C) does not swamp a small-scale one (e.g. concentration 0.1-1.0 M).
 *
 * 2. CATALYST PENALTY
 *    Catalyst is categorical. A mismatch incurs a fixed penalty of 1.0 — the
 *    maximum possible value on any single normalised numeric axis — so a wrong
 *    catalyst is treated as "maximally distant" on that dimension without being
 *    so large that it completely overwhelms all numeric proximity.
 *
 * 3. DISTANCE METRIC
 *    Squared Euclidean distance in the 4-dimensional normalised space:
 *      distSq = dT^2 + dC^2 + dCat^2 + dt^2
 *    (sqrt is monotone so omitting it does not change which point wins; skipping
 *    it avoids one floating-point operation per candidate point.)
 *
 * 4. CLAMPING (out-of-range inputs)
 *    If the caller passes a value outside parametersRange we silently clamp it
 *    to [min, max] before searching. This prevents demo crashes on edge-case
 *    inputs coming from UI sliders. The clamp is logged at debug level.
 *
 * 5. TIE-BREAK
 *    When two points have identical squared distance the first one encountered
 *    in the dataset array wins. Because experiments_dataset.json has a fixed,
 *    deterministic order this guarantees: same input => same output, always.
 *
 * 6. PURE FUNCTION / NO SIDE EFFECTS
 *    findNearest() does NOT write to any run history or shared mutable state.
 *    Recording the result is the responsibility of experimentService (TASK 12).
 */

/**
 * Clamp a numeric value to [min, max].
 */
function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

/**
 * Find the nearest experiment point in the dataset for the given conditions.
 *
 * @param {string} reactionId
 *   ID of the reaction (e.g. 'r1'). Informational only — filtering must be
 *   done by the caller via dataRepository.getExperimentsByReactionId().
 *
 * @param {{ temperature: number, concentration: number, catalyst: string, time: number }} conditions
 *   Experimental conditions to match. Out-of-range values are clamped silently.
 *
 * @param {Object[]} experiments
 *   Pre-filtered array of experiment points for this reaction.
 *   Obtain via dataRepository.getExperimentsByReactionId(reactionId).
 *
 * @param {{ temperature: {min,max}, concentration: {min,max}, time: {min,max}, catalystOptions: string[] }} parametersRange
 *   Parameter bounds from reactions.json, used for normalisation and clamping.
 *
 * @returns {{ yield: number, matchedPoint: Object, exact: boolean } | null}
 *   - yield        — the yield value of the nearest point (0-100)
 *   - matchedPoint — the full experiment record that was selected
 *   - exact        — true when all four parameters matched exactly
 *   Returns null if the experiments array is empty (no data for this reaction).
 */
function findNearest(reactionId, conditions, experiments, parametersRange) {
  if (!experiments || experiments.length === 0) {
    return null;
  }

  // Pre-compute each dimension's full range for normalisation.
  // Guard against degenerate ranges to avoid division-by-zero.
  const tRange  = parametersRange.temperature.max   - parametersRange.temperature.min   || 1;
  const cRange  = parametersRange.concentration.max  - parametersRange.concentration.min || 1;
  const tiRange = parametersRange.time.max           - parametersRange.time.min          || 1;

  // Clamp caller's values into the valid range before searching.
  const T   = clamp(conditions.temperature,   parametersRange.temperature.min,   parametersRange.temperature.max);
  const C   = clamp(conditions.concentration, parametersRange.concentration.min,  parametersRange.concentration.max);
  const ti  = clamp(conditions.time,          parametersRange.time.min,           parametersRange.time.max);
  const cat = conditions.catalyst;

  if (T !== conditions.temperature || C !== conditions.concentration || ti !== conditions.time) {
    console.debug('[findNearest] Out-of-range input clamped for reaction', reactionId, {
      original: { temperature: conditions.temperature, concentration: conditions.concentration, time: conditions.time },
      clamped:  { temperature: T, concentration: C, time: ti }
    });
  }

  // A catalyst mismatch contributes a penalty equal to the full span of one
  // normalised numeric dimension (1.0), making it strongly — but not
  // infinitely — unfavourable to pick a point with the wrong catalyst.
  const CATALYST_PENALTY = 1.0;

  let bestPoint  = null;
  let bestDistSq = Infinity;

  for (const point of experiments) {
    // Fast-path: exact match on all four dimensions — return immediately.
    if (
      point.temperature   === T   &&
      point.concentration === C   &&
      point.catalyst      === cat &&
      point.time          === ti
    ) {
      return { yield: point.yield, matchedPoint: point, exact: true };
    }

    // Normalised numeric deltas (each in [0, 1] when inputs are in range).
    const dT   = (point.temperature   - T)  / tRange;
    const dC   = (point.concentration - C)  / cRange;
    const dTi  = (point.time          - ti) / tiRange;
    const dCat = point.catalyst === cat ? 0 : CATALYST_PENALTY;

    // Squared Euclidean distance — cheaper than sqrt and monotone (same winner).
    const distSq = dT * dT + dC * dC + dTi * dTi + dCat * dCat;

    // Strict < ensures first-found wins on tie-break (deterministic).
    if (distSq < bestDistSq) {
      bestDistSq = distSq;
      bestPoint  = point;
    }
  }

  if (!bestPoint) return null;

  return {
    yield:        bestPoint.yield,
    matchedPoint: bestPoint,
    exact:        false
  };
}

module.exports = { findNearest };
