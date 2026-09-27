import { apiPost } from './apiClient';

/**
 * Ask the AI assistant a question about a specific run.
 * @param {string} runId
 * @param {string} question
 * @returns {Promise<{ answer: string, matchedTemplate: string, matchScore: number }>}
 */
export async function askAssistant(runId, question) {
  return apiPost('/assistant/ask', { runId, question });
}
