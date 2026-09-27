import { apiGet, apiPost } from './apiClient';

/**
 * Create a new optimization run.
 * @param {{ reactionId: string, goal: 'maxYield'|'minTime' }} params
 * @returns {Promise<{ id, reactionId, goal, status, history, maxIterations }>}
 */
export async function createRun({ reactionId, goal }) {
  const data = await apiPost('/runs', { reactionId, goal });
  return data.run;
}

/**
 * Get the next suggested conditions (read-only — does NOT advance history).
 * @param {string} runId
 * @returns {Promise<{ temperature, concentration, catalyst, time }>}
 */
export async function getNextConditions(runId) {
  const data = await apiPost(`/runs/${runId}/next`);
  return data.suggestedConditions;
}

/**
 * Submit a predicted yield for the next iteration.
 * @param {string} runId
 * @param {{ temperature, concentration, catalyst, time }} conditions
 * @returns {Promise<{ predictedYield: number }>}
 */
export async function predictYield(runId, conditions) {
  return apiPost(`/runs/${runId}/predict`, { conditions });
}

/**
 * Register the actual yield after the student runs the experiment.
 * @param {string} runId
 * @param {number} actualYield
 * @returns {Promise<{ iteration, runStatus }>}
 */
export async function registerResult(runId, actualYield) {
  return apiPost(`/runs/${runId}/result`, { actualYield });
}

/**
 * Get the optimal conditions found for a completed (or in-progress) run.
 * @param {string} runId
 * @returns {Promise<{ optimal, isFinal }>}
 */
export async function getOptimal(runId) {
  return apiGet(`/runs/${runId}/optimal`);
}
