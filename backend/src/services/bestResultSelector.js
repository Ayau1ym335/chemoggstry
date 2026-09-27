'use strict';

/**
 * bestResultSelector.js - Finds the optimal experiment iteration based on the goal.
 */

function selectBestResult(history, goal) {
  if (!history || history.length === 0) {
    return null;
  }

  if (goal === 'maxYield') {
    return history.reduce((best, current) => {
      // If yields are basically equal, prefer the one that came first (lower iteration number)
      if (Math.abs(current.yield - best.yield) < 0.001) {
        return current.iterationNumber < best.iterationNumber ? current : best;
      }
      return current.yield > best.yield ? current : best;
    }, history[0]);
  } else if (goal === 'minTime') {
    const bestYieldSeen = Math.max(...history.map(i => i.yield));
    const YIELD_TOLERANCE = 5;
    const threshold = bestYieldSeen - YIELD_TOLERANCE;

    // Filter acceptable iterations based on yield
    const acceptable = history.filter(h => h.yield >= threshold);

    if (acceptable.length === 0) {
       // Should theoretically never happen as the point with bestYieldSeen is in history
       // and will always pass this threshold, but fallback just in case
       return history[0];
    }

    return acceptable.reduce((best, current) => {
       const tDiff = current.conditions.time - best.conditions.time;
       // If time is the same, prefer the one with better yield
       if (Math.abs(tDiff) < 0.001) {
          if (Math.abs(current.yield - best.yield) < 0.001) {
             return current.iterationNumber < best.iterationNumber ? current : best;
          }
          return current.yield > best.yield ? current : best;
       }
       return tDiff < 0 ? current : best;
    }, acceptable[0]);
  }
  
  return history[0];
}

module.exports = { selectBestResult };
