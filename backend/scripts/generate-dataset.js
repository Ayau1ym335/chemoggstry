/**
 * generate-dataset.js
 * Generates experiments_dataset.json with realistic unimodal yield surfaces
 * for all 5 reactions defined in reactions.json.
 *
 * Yield model:
 *   yield = base + peak * gaussian(T, C, t; optimum, sigma) + catalystBonus + noise
 *
 * The gaussian ensures unimodal behaviour (rises toward optimum, falls away).
 * Deterministic noise is small (noiseAmp ~0.8 pp) so neighbour differences stay < 15 pp.
 *
 * Usage: node scripts/generate-dataset.js
 */
'use strict';

const fs   = require('fs');
const path = require('path');

// ── helpers ──────────────────────────────────────────────────────────────────

const round = (v, d = 2) => Math.round(v * 10 ** d) / 10 ** d;
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

function gaussian(point, optimum, sigma) {
  let exponent = 0;
  for (const key of Object.keys(optimum)) {
    const diff = (point[key] - optimum[key]) / sigma[key];
    exponent += diff * diff;
  }
  return Math.exp(-0.5 * exponent);
}

/** Deterministic pseudo-noise in [-1, 1] based on point coordinates. */
function deterministicNoise(point, seed) {
  const x = point.temperature * 31 + point.concentration * 137 + point.time * 17 + seed * 7;
  return (Math.sin(x) * 43758.5453) % 1;
}

function range(min, max, step) {
  const values = [];
  for (let v = min; v <= max + 1e-9; v = round(v + step, 6)) {
    values.push(round(v, 6));
  }
  return values;
}

// ── reaction definitions ─────────────────────────────────────────────────────

const reactions = [
  // R1: Neutralisation HCl + NaOH
  // Optimum: T=50°C, C=0.6M, t=20min. No catalyst. Peak yield ~88.6%
  {
    id: 'r1',
    catalysts: ['None'],
    catalystBonus: { None: 0 },
    paramRanges: {
      temperature:   range(20, 80, 10),
      concentration: [0.1, 0.3, 0.5, 0.6, 0.8, 1.0],
      time:          [5, 10, 20, 30],
    },
    optimum:  { temperature: 50,  concentration: 0.6, time: 20 },
    sigma:    { temperature: 22,  concentration: 0.48, time: 18 },
    base: 40, peak: 48, noiseAmp: 0.8, noiseSeed: 11,
  },

  // R2: Precipitation of Silver Chloride
  // Optimum: T=25°C, C=0.3M, t=30min. No catalyst. Peak yield ~81.2%
  {
    id: 'r2',
    catalysts: ['None'],
    catalystBonus: { None: 0 },
    paramRanges: {
      temperature:   [10, 20, 25, 35, 50],
      concentration: [0.1, 0.2, 0.3, 0.4, 0.5],
      time:          [10, 20, 30, 45, 60],
    },
    optimum:  { temperature: 25,  concentration: 0.3, time: 30 },
    sigma:    { temperature: 16,  concentration: 0.20, time: 32 },
    base: 38, peak: 44, noiseAmp: 0.8, noiseSeed: 22,
  },

  // R3: Decomposition of H2O2
  // Optimum: T=45°C, C=18%, t=30min. MnO2+15pp, KI+9pp. Peak yield ~87.1% (MnO2)
  {
    id: 'r3',
    catalysts: ['None', 'MnO2', 'KI'],
    catalystBonus: { None: 0, MnO2: 15, KI: 9 },
    paramRanges: {
      temperature:   [20, 30, 40, 45, 55, 60],
      concentration: [3, 9, 18, 24, 30],
      time:          [5, 20, 35, 50],
    },
    optimum:  { temperature: 45,  concentration: 18, time: 30 },
    sigma:    { temperature: 16,  concentration: 12, time: 30 },
    base: 30, peak: 43, noiseAmp: 0.8, noiseSeed: 33,
  },

  // R4: Synthesis of Ethyl Acetate (esterification)
  // Optimum: T=80°C, C=3M, t=90min. H2SO4+22pp. Peak yield ~87.8%
  {
    id: 'r4',
    catalysts: ['None', 'H2SO4'],
    catalystBonus: { None: 0, H2SO4: 22 },
    paramRanges: {
      temperature:   [50, 60, 70, 80, 90],
      concentration: [1, 2, 3, 4, 5],
      time:          [30, 60, 90, 120, 150],
    },
    optimum:  { temperature: 80,  concentration: 3, time: 90 },
    sigma:    { temperature: 20,  concentration: 2.0, time: 55 },
    base: 22, peak: 44, noiseAmp: 0.8, noiseSeed: 44,
  },

  // R5: Combustion of Methane
  // Optimum: T=800°C, C=6%, t=6s. No catalyst. Peak yield ~85.6%
  {
    id: 'r5',
    catalysts: ['None'],
    catalystBonus: { None: 0 },
    paramRanges: {
      temperature:   [600, 700, 800, 900, 1000],
      concentration: [1, 3, 6, 8, 10],
      time:          [1, 3, 6, 8, 10],
    },
    optimum:  { temperature: 800, concentration: 6, time: 6 },
    sigma:    { temperature: 180, concentration: 4.0, time: 8.0 },
    base: 35, peak: 50, noiseAmp: 0.8, noiseSeed: 55,
  },
];

// ── dataset generation ───────────────────────────────────────────────────────

const dataset = [];

for (const rxn of reactions) {
  const { id, catalysts, catalystBonus, paramRanges, optimum, sigma, base, peak, noiseAmp, noiseSeed } = rxn;

  for (const catalyst of catalysts) {
    const bonus = catalystBonus[catalyst];
    for (const temperature of paramRanges.temperature) {
      for (const concentration of paramRanges.concentration) {
        for (const time of paramRanges.time) {
          const g     = gaussian({ temperature, concentration, time }, optimum, sigma);
          const noise = deterministicNoise({ temperature, concentration, time }, noiseSeed) * noiseAmp;
          const yieldVal = clamp(round(base + peak * g + bonus + noise, 1), 0, 100);
          dataset.push({
            reactionId:    id,
            temperature,
            concentration: round(concentration, 4),
            catalyst,
            time,
            yield:         yieldVal,
          });
        }
      }
    }
  }
}

// ── uniqueness check ──────────────────────────────────────────────────────────

const seen = new Set();
for (const pt of dataset) {
  const key = `${pt.reactionId}|${pt.temperature}|${pt.concentration}|${pt.catalyst}|${pt.time}`;
  if (seen.has(key)) {
    console.error('DUPLICATE KEY FOUND:', key);
    process.exit(1);
  }
  seen.add(key);
}

// ── neighbour smoothness check ────────────────────────────────────────────────

const groups = {};
for (const pt of dataset) {
  const gKey = `${pt.reactionId}|${pt.catalyst}`;
  if (!groups[gKey]) groups[gKey] = [];
  groups[gKey].push(pt);
}

let maxDiff = 0;
let worstPair = null;
for (const [, pts] of Object.entries(groups)) {
  pts.sort((a, b) => a.temperature - b.temperature || a.concentration - b.concentration || a.time - b.time);
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1], curr = pts[i];
    const adj = (prev.temperature   === curr.temperature   ? 1 : 0)
              + (prev.concentration === curr.concentration ? 1 : 0)
              + (prev.time          === curr.time          ? 1 : 0);
    if (adj === 2) {
      const diff = Math.abs(curr.yield - prev.yield);
      if (diff > maxDiff) { maxDiff = diff; worstPair = { prev, curr, diff }; }
    }
  }
}

// ── summary ───────────────────────────────────────────────────────────────────

const countByRxn = {};
for (const pt of dataset) countByRxn[pt.reactionId] = (countByRxn[pt.reactionId] || 0) + 1;
console.log('Points per reaction:', countByRxn);
console.log('Total points:', dataset.length);
console.log(`Max neighbour diff: ${round(maxDiff, 2)} pp`);
if (worstPair) console.log('Worst pair:', JSON.stringify(worstPair));
if (maxDiff > 15) console.warn('WARNING: some neighbours differ by more than 15 pp!');

// ── write output ───────────────────────────────────────────────────────────────

const outPath = path.join(__dirname, '../data/experiments_dataset.json');
fs.writeFileSync(outPath, JSON.stringify(dataset, null, 2), 'utf-8');
console.log(`\nWritten ${dataset.length} points to ${outPath}`);
