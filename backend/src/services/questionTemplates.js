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
    contextFields: ['changedParameter', 'actualYieldDelta', 'previousIteration']
  },
  {
    id: 'why_catalyst_chosen',
    label: 'Why this catalyst was chosen',
    patterns: [
      ['catalyst', 'mno2', 'h2so4', 'fecl3', 'accelerator'],
      ['why', 'reason', 'choose', 'chosen', 'select', 'selected', 'add', 'added',
       'use', 'used', 'pick', 'picked', 'switch', 'switched', 'introduce', 'introduced']
    ],
    contextFields: ['currentIteration', 'actualYieldDelta']
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
    contextFields: ['actualYieldDelta', 'currentIteration', 'previousIteration']
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
    id: 'why_actual_differs_from_predicted',
    label: 'Why actual yield differs from predicted',
    //
    // THREE groups → max score = 3, which beats why_yield_decreased (max = 2)
    // when a question contains both prediction-specific words and generic yield words.
    //
    // Group 0 (prediction concept): fires whenever the question mentions any prediction/expectation word.
    // Group 1 (comparison concept): fires on comparison/accuracy language.
    // Group 2 (prediction concept duplicate): deliberately re-checks prediction words to ensure
    //   that questions containing "predict" ALWAYS score ≥ 2, and ideally 3, so they
    //   beat why_yield_decreased (score 2) even if the question ALSO contains "yield"/"lower".
    //
    // DISAMBIGUATION vs why_yield_decreased:
    //   "Why did the yield decrease?" → predict=0, compare=0, dup=0 → score 0 → stays in why_yield_decreased ✓
    //   "Why is my result lower than predicted AND lower than before?" → score 3 > 2 → new template wins ✓
    patterns: [
      // Group 0: prediction / expectation vocabulary (EN + RU full forms)
      ['predict', 'predicted', 'prediction', 'expect', 'expected', 'expectation',
       'forecast', 'forecasted', 'accurate', 'accuracy',
       '\u043f\u0440\u0435\u0434\u0441\u043a\u0430\u0437\u0430\u043d\u0438\u0435',  // предсказание
       '\u043f\u0440\u0435\u0434\u0441\u043a\u0430\u0437\u0430\u043d\u043e',       // предсказано
       '\u043f\u0440\u043e\u0433\u043d\u043e\u0437',                              // прогноз
       '\u043e\u0436\u0438\u0434\u0430\u043b\u043e\u0441\u044c',                  // ожидалось
       '\u043e\u0436\u0438\u0434\u0430\u043b'],                                   // ожидал
      // Group 1: comparison / discrepancy language (EN + RU)
      ['different', 'differs', 'differ', 'difference', 'why', 'result',
       '\u0440\u0430\u0437\u043d\u0438\u0446\u0430',                              // разница
       '\u043e\u0442\u043b\u0438\u0447\u0430\u0435\u0442\u0441\u044f',           // отличается
       '\u043e\u0442\u043b\u0438\u0447\u0438\u0435',                             // отличие
       '\u0442\u043e\u0447\u043d\u043e\u0441\u0442\u044c',                       // точность
       '\u0442\u043e\u0447\u043d\u044b\u043c'],                                  // точным
      // Group 2: prediction concept (duplicate) — gives an extra +1 when prediction words
      // are present, making this template score 3 and decisively outrank why_yield_decreased
      ['predict', 'predicted', 'prediction', 'expect', 'expected', 'forecast', 'forecasted',
       '\u043f\u0440\u0435\u0434\u0441\u043a\u0430\u0437\u0430\u043d\u0438\u0435',
       '\u043f\u0440\u043e\u0433\u043d\u043e\u0437']
    ],
    requiredContextFields: ['predictedYield', 'actualYield', 'predictionAccuracy'],
    contextFields: ['actualYield', 'predictedYield', 'predictionAccuracy', 'effectivenessTrend']
  },
  {
    id: 'fallback',
    label: 'Fallback — generic run summary',
    patterns: [], // always matches last with score 0
    contextFields: ['currentIteration', 'optimalSoFar', 'goal']
  }
];

module.exports = { TEMPLATES };
