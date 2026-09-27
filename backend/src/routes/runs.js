'use strict';

const express = require('express');
const runsController        = require('../controllers/runsController');
const experimentsController = require('../controllers/experimentsController');
const nextController        = require('../controllers/nextController');

const router = express.Router();

// POST /runs  — create a new optimization run
router.post('/', runsController.create);

// POST /runs/:id/next        — get next suggested conditions (read-only, no history change)
router.post('/:id/next', nextController.getNext);

// POST /runs/:id/experiment  — submit one experiment iteration
router.post('/:id/experiment', experimentsController.runExperiment);

module.exports = router;
