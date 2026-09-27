export const mockReactions = [
  {
    id: 'r1',
    name: 'Neutralization: HCl + NaOH',
    equation: 'HCl + NaOH → NaCl + H2O',
    bondingType: 'ionic'
  },
  {
    id: 'r2',
    name: 'Precipitation of Silver Chloride',
    equation: 'AgNO3 + NaCl → AgCl↓ + NaNO3',
    bondingType: 'ionic'
  },
  {
    id: 'r3',
    name: 'Decomposition of Hydrogen Peroxide',
    equation: '2H2O2 → 2H2O + O2↑',
    bondingType: 'covalent'
  },
  {
    id: 'r4',
    name: 'Synthesis of Ethyl Acetate',
    equation: 'CH3COOH + C2H5OH ⇌ CH3COOC2H5 + H2O',
    bondingType: 'covalent'
  },
  {
    id: 'r5',
    name: 'Combustion of Methane',
    equation: 'CH4 + 2O2 → CO2 + 2H2O',
    bondingType: 'covalent'
  }
];

export const mockHistory = [
  {
    iterationNumber: 1,
    conditions: { temperature: 60, concentration: 0.5, catalyst: 'None', time: 30 },
    yield: 72.0
  },
  {
    iterationNumber: 2,
    conditions: { temperature: 70, concentration: 0.5, catalyst: 'None', time: 30 },
    yield: 81.0
  },
  {
    iterationNumber: 3,
    conditions: { temperature: 75, concentration: 0.5, catalyst: 'None', time: 30 },
    yield: 89.0
  },
  {
    iterationNumber: 4,
    conditions: { temperature: 75, concentration: 0.7, catalyst: 'None', time: 30 },
    yield: 91.0
  }
];
