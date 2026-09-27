const { matchQuestion } = require('../src/services/questionMatcher');

const tests = [
  // Canonical new template phrases
  ['Why is my result different from expected?',           'why_actual_differs_from_predicted'],
  ['How accurate was the prediction?',                   'why_actual_differs_from_predicted'],
  ['Why did I not get the predicted yield?',             'why_actual_differs_from_predicted'],
  // Paraphrases (not verbatim)
  ['My result is different from what was forecasted',    'why_actual_differs_from_predicted'],
  ['The expected and actual results do not match',       'why_actual_differs_from_predicted'],
  // Russian
  ['\u041d\u0430\u0441\u043a\u043e\u043b\u044c\u043a\u043e \u0442\u043e\u0447\u043d\u044b\u043c \u0431\u044b\u043b\u043e \u043f\u0440\u0435\u0434\u0441\u043a\u0430\u0437\u0430\u043d\u0438\u0435?', 'why_actual_differs_from_predicted'],
  // Regression: old template must NOT be displaced
  ['Why did the yield decrease?',                        'why_yield_decreased'],
  ['The output dropped this round',                      'why_yield_decreased'],
  // Ambiguous: prediction-specific words present -> new template wins
  ['Why is my yield lower than predicted and lower than before?', 'why_actual_differs_from_predicted'],
  // Other templates regression
  ['Why did the temperature change?',                    'why_temperature_changed'],
  ['Why was this catalyst chosen?',                      'why_catalyst_chosen'],
  ['What if I increase the concentration?',              'what_if_concentration_increased'],
  ['Why are these the optimal conditions?',              'why_optimal'],
  ['What did the previous experiment show?',             'what_did_previous_show'],
];

let passed = 0;
let failed = 0;
tests.forEach(function(pair) {
  const q = pair[0];
  const expected = pair[1];
  const result = matchQuestion(q);
  const ok = result.templateId === expected;
  const line = (ok ? 'PASS' : 'FAIL') + ' [' + expected + '] "' + q.slice(0,55) + '"' + (ok ? '' : ' -> got: ' + result.templateId + ' score=' + result.score);
  console.log(line);
  if (ok) passed++; else failed++;
});
console.log('\n' + passed + '/' + tests.length + ' passed');
