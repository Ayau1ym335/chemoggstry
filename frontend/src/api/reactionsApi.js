import { apiGet } from './apiClient';

/**
 * Fetches all available reactions from the backend.
 * @returns {Promise<Array>} Array of reaction objects
 */
export async function fetchReactions() {
  const data = await apiGet('/reactions');
  return data.reactions;
}
