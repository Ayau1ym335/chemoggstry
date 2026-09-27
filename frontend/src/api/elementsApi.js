import { apiGet, apiPost } from './apiClient';

/**
 * Fetches all available elements from the backend.
 * @returns {Promise<Array>} Array of element objects (including shortDescription)
 */
export async function fetchElements() {
  const data = await apiGet('/elements');
  return data.elements;
}

/**
 * Check whether the selected element symbols correspond to a preset reaction.
 * @param {string[]} substanceSymbols
 * @returns {Promise<{ reactionPossible: boolean, reaction?: object }>}
 */
export async function checkReaction(substanceSymbols) {
  return apiPost('/check-reaction', { substanceSymbols });
}
