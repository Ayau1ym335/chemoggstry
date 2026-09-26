const Ajv = require('ajv');
const fs = require('fs');
const path = require('path');

const ajv = new Ajv();
const reactionSchema = require('../src/models/reaction.schema.json');
const experimentSchema = require('../src/models/experiment.schema.json');

// Валидация reactions.json
const reactionArraySchema = {
  type: 'array',
  items: reactionSchema
};
const validateReactions = ajv.compile(reactionArraySchema);

const reactionsPath = path.join(__dirname, '../data/reactions.json');
const reactionsData = JSON.parse(fs.readFileSync(reactionsPath, 'utf-8'));

if (validateReactions(reactionsData)) {
  console.log('Validation successful: reactions.json matches reaction.schema.json');
} else {
  console.error('Validation failed for reactions.json:');
  console.error(validateReactions.errors);
  process.exit(1);
}

// Валидация experiments_dataset.json
const experimentArraySchema = {
  type: 'array',
  items: experimentSchema
};
const validateExperiments = ajv.compile(experimentArraySchema);

const experimentsPath = path.join(__dirname, '../data/experiments_dataset.json');
const experimentsData = JSON.parse(fs.readFileSync(experimentsPath, 'utf-8'));

if (validateExperiments(experimentsData)) {
  console.log('Validation successful: experiments_dataset.json matches experiment.schema.json');
} else {
  console.error('Validation failed for experiments_dataset.json:');
  console.error(validateExperiments.errors);
  process.exit(1);
}
