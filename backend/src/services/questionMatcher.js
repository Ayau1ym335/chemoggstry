'use strict';

/**
 * questionMatcher.js
 *
 * Scores a free-text question against every template in the library and returns
 * the best-matching template id. Falls back to 'fallback' if nothing scores.
 *
 * SCORING ALGORITHM
 * ─────────────────
 * 1. Normalize: lower-case the question, strip punctuation, split into tokens.
 * 2. For each template, count how many of its keyword GROUPS have at least one
 *    keyword present in the token set. Score = count of matching groups.
 *    Tie-break: templates are ordered from most-specific to least-specific;
 *    first (highest-score) wins. When equal scores, first-defined template wins.
 * 3. If every non-fallback template scores 0 → return 'fallback'.
 *
 * TOKEN MATCHING RULES
 * ─────────────────────
 * Single-word keywords: must match a token in the set EXACTLY.
 *   - This avoids "the" matching "these", "weather" matching "whether", etc.
 * Multi-word keyword phrases (space-separated): substring-matched against the
 *   full normalized text so that "last time" is found correctly.
 * Chemical names (e.g. "mno2", "h2so4"): always matched exactly against tokens.
 *
 * WHY EXACT TOKEN MATCHING:
 *   Substring matching like kw.includes(w) is too loose and causes "the" → "these",
 *   "at" → "catalyst", "lower" → "flower", etc. The richer keyword library in
 *   questionTemplates.js provides paraphrase coverage without needing fuzzy matching.
 */

const { TEMPLATES } = require('./questionTemplates');

/**
 * Normalize a free-text question: lower-case, strip punctuation, collapse whitespace.
 * Returns both the full string (for multi-word phrase matching) and a token Set.
 */
function normalize(text) {
  const full = text
    .toLowerCase()
    // Preserve Unicode letters and digits; strip only punctuation/symbols
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const tokens = new Set(full.split(' ').filter(Boolean));
  return { full, tokens };
}

/**
 * Check if any keyword from a group appears in the question.
 * - Single words: exact token membership.
 * - Multi-word phrases: substring of the full normalized text.
 */
function groupMatches(group, full, tokens) {
  return group.some(keyword => {
    const kw = keyword.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim();
    if (kw.includes(' ')) {
      // Multi-word phrase: substring match
      return full.includes(kw);
    }
    // Single word: exact token match only
    return tokens.has(kw);
  });
}

/**
 * Score a normalized question against a single template.
 */
function scoreTemplate(template, full, tokens) {
  if (template.patterns.length === 0) return 0;
  return template.patterns.filter(group => groupMatches(group, full, tokens)).length;
}

/**
 * Match a free-text question to the best template id.
 *
 * @param {string} question - Raw user question
 * @returns {{ templateId: string, score: number, normalized: string }}
 */
function matchQuestion(question) {
  if (!question || typeof question !== 'string') {
    return { templateId: 'fallback', score: 0, normalized: '' };
  }

  const { full, tokens } = normalize(question);

  let bestScore = 0;
  let bestTemplate = TEMPLATES.find(t => t.id === 'fallback');

  for (const template of TEMPLATES) {
    if (template.id === 'fallback') continue;
    const score = scoreTemplate(template, full, tokens);
    // Require at least 2 matching groups to avoid single-word false positives
    // (e.g. "what is the weather today" contains "what" — score 1 — should still be fallback)
    if (score > bestScore && score >= 2) {
      bestScore = score;
      bestTemplate = template;
    }
  }

  return {
    templateId: bestTemplate.id,
    score: bestScore,
    normalized: full
  };
}

module.exports = { matchQuestion, normalize };
