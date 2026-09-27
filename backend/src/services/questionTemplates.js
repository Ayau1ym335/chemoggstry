'use strict';

/**
 * questionTemplates.js
 *
 * Static library of canonical AI Assistant template definitions.
 * Each template has:
 *   - id         : unique identifier used in the response generator (TASK 18)
 *   - label      : human-readable description for debugging/logging
 *   - patterns   : array of keyword GROUPS — a template scores +1 for each group
 *                  that has at least one keyword present in the normalized question.
 *                  The template with the highest score wins.
 *   - contextFields : which fields of the AI context (TASK 16) this template uses —
 *                     informational only, drives the template renderer in TASK 18.
 *
 * PATTERN DESIGN PHILOSOPHY
 * ─────────────────────────
 * Patterns are arrays of arrays ("keyword groups"). A group matches if ANY of its
 * words appears in the question. A template scores one point per matching group.
 * This lets us require multiple *concepts* simultaneously without demanding exact
 * phrasing, which is the minimum viable paraphrase-tolerance for a demo AI.
 *
 * Example:
 *   patterns: [['temperature','temp'], ['why','reason','change','increase','decrease']]
 *   "why higher temp?" → ['temp'] matches group 0, ['why'] matches group 1 → score 2
 *   "temperature data?" → ['temperature'] matches group 0 → score 1 (likely loses)
 */

const TEMPLATES = [
  {
    id: 'why_temperature_changed',
    label: 'Why temperature was changed',
    patterns: [
      ['temperature', 'temp'],
      ['why', 'reason', 'explain', 'change', 'changed', 'increase', 'increased',
       'decrease', 'decreased', 'raise', 'raised', 'lower', 'lowered',
       'adjust', 'adjusted', 'higher', 'hotter', 'cooler', 'colder', 'modify']
    ],
    contextFields: ['changedParameter', 'yieldDelta', 'previousIteration']
  },
  {
    id: 'why_catalyst_chosen',
    label: 'Why this catalyst was chosen',
    patterns: [
      ['catalyst', 'mno2', 'h2so4', 'fecl3', 'accelerator'],
      ['why', 'reason', 'choose', 'chosen', 'select', 'selected', 'add', 'added',
       'use', 'used', 'pick', 'picked', 'switch', 'switched', 'introduce', 'introduced']
    ],
    contextFields: ['currentIteration', 'yieldDelta']
  },
  {
    id: 'why_yield_decreased',
    label: 'Why yield decreased',
    patterns: [
      ['yield', 'result', 'output', 'efficiency', 'conversion', 'product', 'rate'],
      ['decrease', 'decreased', 'drop', 'dropped', 'fell', 'fall', 'lower',
       'lowered', 'worse', 'worsened', 'down', 'less', 'reduced', 'reduce',
       'deteriorate', 'smaller', 'lower', 'went down', 'got worse']
    ],
    contextFields: ['yieldDelta', 'currentIteration', 'previousIteration']
  },
  {
    id: 'what_if_concentration_increased',
    label: 'What if concentration is increased',
    patterns: [
      ['concentration', 'molarity', 'amount', 'quantity', 'molar', 'conc'],
      ['what', 'if', 'increase', 'increased', 'more', 'higher',
       'add', 'boost', 'raise', 'raised', 'double', 'would', 'happen', 'happens',
       'effect', 'impact', 'result', 'should']
    ],
    contextFields: []
  },
  {
    id: 'why_optimal',
    label: 'Why these are optimal conditions',
    patterns: [
      ['optimal', 'optimum', 'best', 'ideal', 'final', 'recommend', 'recommended',
       'perfect', 'top', 'ultimate', 'conclusion'],
      ['why', 'reason', 'explain', 'conditions', 'these', 'result', 'choose', 'chosen',
       'selected', 'considered', 'suggest', 'suggested']
    ],
    contextFields: ['optimalSoFar', 'isFinalIteration']
  },
  {
    id: 'what_did_previous_show',
    label: 'What did the previous experiment show',
    patterns: [
      ['previous', 'last', 'before', 'prior', 'earlier', 'preceding', 'last time',
       'previous experiment', 'prior experiment'],
      ['show', 'showed', 'result', 'results', 'reveal', 'reveal', 'tell', 'happen',
       'happened', 'experiment', 'indicate', 'indicated', 'find', 'found', 'demonstrate']
    ],
    contextFields: ['previousIteration']
  },
  {
    id: 'fallback',
    label: 'Fallback — generic run summary',
    patterns: [], // always matches last with score 0
    contextFields: ['currentIteration', 'optimalSoFar', 'goal']
  }
];

module.exports = { TEMPLATES };
