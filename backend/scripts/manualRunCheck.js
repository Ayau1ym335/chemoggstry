'use strict';

const fs = require('fs');
const path = require('path');
const dataRepository = require('../src/repositories/dataRepository');
const { runFullOptimization } = require('../src/services/optimizationOrchestrator');

function runChecks() {
  dataRepository.loadReactions();
  dataRepository.loadExperiments();
  const reactions = dataRepository.getAllReactions();

  let report = `# E2E Full Cycle Check Report\n\nGenerated on: ${new Date().toISOString()}\n\n`;
  let allPass = true;

  for (const rxn of reactions) {
    for (const goal of ['maxYield', 'minTime']) {
      try {
        const { run, optimal } = runFullOptimization(rxn.id, goal);
        
        const firstIter = run.history[0];
        const finalIter = optimal;
        
        const yieldDiff = finalIter.yield - firstIter.yield;
        const timeDiff = finalIter.conditions.time - firstIter.conditions.time;
        
        let passed = false;
        if (goal === 'maxYield') {
          // Expect yield to improve
          passed = yieldDiff > 0;
        } else {
          // Expect time to decrease, or stay the same with better/acceptable yield
          passed = timeDiff < 0 || (timeDiff === 0 && yieldDiff >= -5);
        }
        
        if (!passed) allPass = false;

        const statusStr = passed ? '✅ PASS' : '❌ FAIL';
        
        const section = `## Reaction: ${rxn.id} - ${rxn.name} | Goal: ${goal}\n` +
                        `**Status:** ${statusStr}\n\n` +
                        `### History\n` +
                        run.history.map((h, i) => 
                          `${i+1}. T=${h.conditions.temperature}°C, C=${h.conditions.concentration}M, Cat=${h.conditions.catalyst}, t=${h.conditions.time}m → Yield: ${h.yield}%`
                        ).join('\n') + `\n\n` +
                        `### Optimal Result\n` +
                        `Iter #${optimal.iterationNumber}, Yield: ${optimal.yield}%, Time: ${optimal.conditions.time}m\n\n` +
                        `### Deltas (Optimal vs First)\n` +
                        `Yield Delta: ${yieldDiff > 0 ? '+' : ''}${yieldDiff.toFixed(1)} pp\n` +
                        `Time Delta: ${timeDiff > 0 ? '+' : ''}${timeDiff} min\n\n---\n\n`;
                        
        report += section;
        console.log(`Checked ${rxn.id} (${goal}) -> ${statusStr}`);
      } catch (err) {
        allPass = false;
        console.error(`Error processing ${rxn.id} (${goal}):`, err);
        report += `## Reaction: ${rxn.id} - ${rxn.name} | Goal: ${goal}\n**Status:** ❌ ERROR\n\n${err.message}\n\n---\n\n`;
      }
    }
  }

  const docsDir = path.join(__dirname, '../../docs');
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }
  
  const reportPath = path.join(docsDir, 'e2e-check-report.md');
  fs.writeFileSync(reportPath, report, 'utf8');

  console.log(`\nReport generated at: ${reportPath}`);
  console.log(`Overall Status: ${allPass ? '✅ ALL PASSED' : '❌ SOME FAILED'}`);

  if (!allPass) {
    process.exit(1);
  }
}

runChecks();
