const BASE = '/api';

/**
 * Create a new optimization run.
 * @param {{ reactionId: string, goal: 'maxYield'|'minTime' }} params
 * @returns {Promise<{ id, reactionId, goal, status, history, maxIterations }>}
 */
export async function createRun({ reactionId, goal }) {
  const res = await fetch(`${BASE}/runs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reactionId, goal })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message ?? `HTTP ${res.status}`);
  return data.run; // Unwrap envelope
}

/**
 * Get the next suggested conditions (read-only — does NOT advance history).
 * @param {string} runId
 * @returns {Promise<{ temperature, concentration, catalyst, time }>}
 */
export async function getNextConditions(runId) {
  const res = await fetch(`${BASE}/runs/${runId}/next`, { method: 'POST' });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message ?? `HTTP ${res.status}`);
  return data.suggestedConditions;
}

/**
 * Submit an experiment iteration and get the yield.
 * @param {string} runId
 * @param {{ temperature, concentration, catalyst, time }} conditions
 * @returns {Promise<{ iteration: { iterationNumber, conditions, yield, timestamp }, runStatus: string }>}
 */
export async function runExperiment(runId, conditions) {
  const res = await fetch(`${BASE}/runs/${runId}/experiment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ conditions })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message ?? `HTTP ${res.status}`);
  return data; // { iteration, runStatus }
}

/**
 * Get the optimal conditions found for a completed (or in-progress) run.
 * @param {string} runId
 * @returns {Promise<{ optimal: { iterationNumber, conditions, yield }, isFinal: boolean }>}
 */
export async function getOptimal(runId) {
  const res = await fetch(`${BASE}/runs/${runId}/optimal`);
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message ?? `HTTP ${res.status}`);
  return data; // { optimal, isFinal }
}
