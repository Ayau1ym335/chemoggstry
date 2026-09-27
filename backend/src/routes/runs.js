'use strict';

const express = require('express');
const runsController        = require('../controllers/runsController');
const experimentsController = require('../controllers/experimentsController');
const nextController        = require('../controllers/nextController');
const optimalController     = require('../controllers/optimalController');
const predictController     = require('../controllers/predictController');
const resultController      = require('../controllers/resultController');

const router = express.Router();

// POST /runs  — create a new optimization run
router.post('/', runsController.create);

// POST /runs/:id/predict     — get a hypothesis (prediction) before the actual experiment
router.post('/:id/predict', predictController.predict);

// POST /runs/:id/result      — register actual experiment result based on pending prediction
router.post('/:id/result', resultController.registerResult);

// POST /runs/:id/next        — get next suggested conditions (read-only, no history change)
router.post('/:id/next', nextController.getNext);

// POST /runs/:id/experiment  — submit one experiment iteration (legacy/deprecated if result flow replaces it, keeping for compatibility if needed)
router.post('/:id/experiment', experimentsController.runExperiment);

// GET  /runs/:id/optimal     — get the optimal conditions found in this run
router.get('/:id/optimal', optimalController.getOptimal);

module.exports = router;
