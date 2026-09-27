/**
 * apiClient.js
 *
 * Centralised fetch wrapper. All API modules go through this instead of
 * repeating the same fetch + json + error-throw pattern.
 *
 * Usage:
 *   GET  → apiGet('/reactions')
 *   POST → apiPost('/runs', { reactionId, goal })
 */

export const BASE = import.meta.env.VITE_API_URL || '/api';


/**
 * Core helper. Performs a fetch, parses JSON, and throws a normalized Error
 * on non-2xx responses so callers never have to check `res.ok` themselves.
 *
 * @param {string} path - Path relative to BASE (must start with '/')
 * @param {RequestInit} [init] - Fetch options (method, body, etc.)
 * @returns {Promise<any>} Parsed JSON body
 */
async function apiFetch(path, init = {}) {
  const res = await fetch(`${BASE}${path}`, init);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message ?? `HTTP ${res.status}`);
  }
  return data;
}

/**
 * GET request.
 * @param {string} path
 */
export function apiGet(path) {
  return apiFetch(path);
}

/**
 * POST request with JSON body.
 * @param {string} path
 * @param {object} [body]
 */
export function apiPost(path, body) {
  return apiFetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}
