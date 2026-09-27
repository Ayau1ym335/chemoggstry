const fs = require('fs');
const path = require('path');

let reactionsCache = [];
let experimentsCache = [];

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

module.exports = {
  loadReactions,
  loadExperiments,
  getAllReactions,
  getReactionById,
  getExperimentsByReactionId
};
