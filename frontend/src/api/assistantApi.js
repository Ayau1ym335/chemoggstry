const BASE = '/api';

/**
 * Ask the AI assistant a question about a specific run.
 * @param {string} runId 
 * @param {string} question 
 * @returns {Promise<{ answer: string, templateId: string, context: object }>}
 */
export async function askAssistant(runId, question) {
  const res = await fetch(`${BASE}/assistant/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ runId, question })
  });
  
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message ?? `HTTP ${res.status}`);
  }
  
  return data;
}
