const BASE = '/api';

/**
 * Fetches all available reactions from the backend.
 * @returns {Promise<Array>} Array of reaction objects
 */
export async function fetchReactions() {
  const res = await fetch(`${BASE}/reactions`);
  if (!res.ok) {
    throw new Error(`Failed to load reactions (HTTP ${res.status})`);
  }
  const data = await res.json();
  // Backend returns { reactions: [...] } envelope — unwrap here so components see a plain array
  return Array.isArray(data) ? data : (data.reactions ?? data);
}

/**
 * Fetches a single reaction by ID from the backend.
 * NOTE: For MVP we recommend calling fetchReactions() and filtering client-side
 * instead of using this endpoint — avoids a second network round-trip.
 * @param {string} id
 * @returns {Promise<Object>} Reaction object
 */
export async function fetchReactionById(id) {
  const res = await fetch(`${BASE}/reactions/${id}`);
  if (!res.ok) {
    throw new Error(`Reaction not found (HTTP ${res.status})`);
  }
  return res.json();
}
