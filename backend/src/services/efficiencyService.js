'use strict';

/**
 * efficiencyService.js
 * 
 * Single source of truth for analyzing experiment progress.
 * Both the optimization algorithm (TASK 13) and AI Assistant (TASK 16/18) 
 * rely on this pure function to ensure consistent metrics across the system.
 */

/**
 * Analyzes the efficiency of the latest experiment iteration compared to its prediction 
 * and the previous iteration (if any).
 * 
 * @param {Array} history - Array of experiment records from run.history (must not be mutated)
 * @returns {Object|null} - Analysis metrics for the latest iteration, or null if history is empty
 */
function analyzeEfficiency(history) {
  if (!history || !Array.isArray(history) || history.length === 0) {
    return null;
  }

  // Pure function: read-only access to history
  const latestIndex = history.length - 1;
  const latest = history[latestIndex];
  
  const { actualYield, predictedYield } = latest;

  // predictionAccuracy = actualYield - predictedYield
  const predictionAccuracy = actualYield - predictedYield;
  
  // predictionWasOptimistic = true if reality is worse than prediction
  const predictionWasOptimistic = predictionAccuracy < 0;

  let trendVsPrevious = null;
  let direction = 'first_experiment';

  if (latestIndex > 0) {
    const previous = history[latestIndex - 1];
    trendVsPrevious = actualYield - previous.actualYield;

    if (trendVsPrevious > 0) {
      direction = 'improving';
    } else if (trendVsPrevious < 0) {
      direction = 'declining';
    } else {
      direction = 'flat';
    }
  }

  return {
    predictionAccuracy,
    trendVsPrevious,
    direction,
    predictionWasOptimistic
  };
}

module.exports = { analyzeEfficiency };
