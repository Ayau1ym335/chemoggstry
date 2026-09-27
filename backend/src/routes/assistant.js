'use strict';

const express = require('express');
const assistantController = require('../controllers/assistantController');

const router = express.Router();

// POST /assistant/ask — answer a question about a specific run
router.post('/ask', assistantController.ask);

module.exports = router;
