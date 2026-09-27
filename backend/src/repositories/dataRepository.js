const fs = require('fs');
const path = require('path');

let reactionsCache = [];
let experimentsCache = [];
let elementsCache = [];
let substanceReactionMapCache = [];

/**
 * Loads reactions from JSON file into memory cache.
 * Throws an error if the file cannot be read or parsed (fail-fast).
 */
function loadReactions() {
  const filePath = path.join(__dirname, '../../data/reactions.json');
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    reactionsCache = JSON.parse(data);
    console.log(`Loaded ${reactionsCache.length} reactions into cache.`);
  } catch (error) {
    console.error('Failed to load reactions.json:', error.message);
    throw error; // Propagate error to prevent server startup
  }
}

/**
 * Loads experiments dataset from JSON file into memory cache.
 * Throws an error if the file cannot be read or parsed (fail-fast).
 */
function loadExperiments() {
  const filePath = path.join(__dirname, '../../data/experiments_dataset.json');
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    experimentsCache = JSON.parse(data);
    console.log(`Loaded ${experimentsCache.length} experiments into cache.`);
  } catch (error) {
    console.error('Failed to load experiments_dataset.json:', error.message);
    throw error; // Propagate error to prevent server startup
  }
}

/**
 * Loads elements from JSON file into memory cache.
 */
function loadElements() {
  const filePath = path.join(__dirname, '../../data/elements.json');
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    elementsCache = JSON.parse(data);
    console.log(`Loaded ${elementsCache.length} elements into cache.`);
  } catch (error) {
    console.error('Failed to load elements.json:', error.message);
    throw error;
  }
}

/**
 * Loads substance to reaction map from JSON file into memory cache.
 */
function loadSubstanceReactionMap() {
  const filePath = path.join(__dirname, '../../data/substanceReactionMap.json');
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    substanceReactionMapCache = JSON.parse(data);
    console.log(`Loaded ${substanceReactionMapCache.length} substance-reaction mappings into cache.`);
  } catch (error) {
    console.error('Failed to load substanceReactionMap.json:', error.message);
    throw error;
  }
}

/**
 * Returns all cached reactions.
 * @returns {Array} Array of reaction objects
 */
function getAllReactions() {
  return reactionsCache;
}

/**
 * Finds and returns a reaction by its ID.
 * @param {string} id - The reaction ID
 * @returns {Object|null} The reaction object, or null if not found
 */
function getReactionById(id) {
  const reaction = reactionsCache.find(r => r.id === id);
  return reaction || null;
}

/**
 * Returns all experiments for a given reaction ID.
 * @param {string} reactionId - The reaction ID
 * @returns {Array} Filtered array of experiments (empty array if none found)
 */
function getExperimentsByReactionId(reactionId) {
  return experimentsCache.filter(e => e.reactionId === reactionId);
}

/**
 * Returns all cached elements.
 */
function getAllElements() {
  return elementsCache;
}

/**
 * Finds and returns an element by its symbol (case-insensitive).
 */
function getElementBySymbol(symbol) {
  const element = elementsCache.find(e => e.symbol.toLowerCase() === symbol.toLowerCase());
  return element || null;
}

/**
 * Returns the substance reaction map.
 */
function getSubstanceReactionMap() {
  return substanceReactionMapCache;
}

module.exports = {
  loadReactions,
  loadExperiments,
  loadElements,
  loadSubstanceReactionMap,
  getAllReactions,
  getReactionById,
  getExperimentsByReactionId,
  getAllElements,
  getElementBySymbol,
  getSubstanceReactionMap
};
