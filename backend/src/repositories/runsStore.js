'use strict';

/**
 * runsStore.js — In-memory store for optimization run sessions.
 *
 * DESIGN DECISION (MVP):
 *   Data is kept in a plain Map in process memory. There is NO persistence to
 *   disk or a database. This is an explicit, conscious choice for the hackathon
 *   MVP: it eliminates infrastructure complexity (no DB setup, no migrations)
 *   at the cost of losing all active runs when the server restarts.
 *
 * KNOWN LIMITATION:
 *   Restarting the backend process will wipe all in-flight runs.
 *   Users will lose any optimization session that has not been completed.
 *   This is acceptable for a demo/hackathon context where sessions are short
 *   (4 iterations) and a page refresh is a reasonable recovery.
 *
 *   If persistence becomes a requirement, replace this module with a proper
 *   repository backed by a database (SQLite, Postgres, etc.) without touching
 *   the service or controller layers — they consume this module through the
 *   functions exported below, not through direct Map access.
 */

/** @type {Map<string, Object>} */
const store = new Map();

/**
 * Persist a run object (insert or full-replace).
 * @param {Object} run - A fully-formed run object.
 */
function saveRun(run) {
  store.set(run.id, run);
}

/**
 * Retrieve a run by its ID.
 * @param {string} id
 * @returns {Object|null} The run object, or null if not found.
 */
function getRunById(id) {
  return store.get(id) || null;
}

/**
 * Returns all runs (useful for debugging / admin views).
 * @returns {Object[]}
 */
function getAllRuns() {
  return Array.from(store.values());
}

/**
 * Delete a run (used when creation rolls back due to validation failure,
 * guaranteeing no orphan records remain in the store).
 * @param {string} id
 */
function deleteRun(id) {
  store.delete(id);
}

module.exports = { saveRun, getRunById, getAllRuns, deleteRun };
