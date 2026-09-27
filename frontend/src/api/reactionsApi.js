const BASE = '/api';

/**
 * Fetches all available reactions from the backend.
 * Backend returns { reactions: [...] } — unwrapped here so components see a plain array.
 * @returns {Promise<Array>} Array of reaction objects
 */
export async function fetchReactions() {
  const res = await fetch(`${BASE}/reactions`);
  if (!res.ok) {
    throw new Error(`Failed to load reactions (HTTP ${res.status})`);
  }
  const data = await res.json();
  return data.reactions;
}
