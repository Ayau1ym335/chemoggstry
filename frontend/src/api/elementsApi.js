const BASE = '/api';

export async function fetchElements() {
  const res = await fetch(`${BASE}/elements`);
  if (!res.ok) throw new Error('Failed to fetch elements');
  const data = await res.json();
  return data.elements;
}

export async function checkReaction(substanceSymbols) {
  const res = await fetch(`${BASE}/check-reaction`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ substanceSymbols })
  });
  if (!res.ok) throw new Error('Failed to check reaction');
  return await res.json();
}
