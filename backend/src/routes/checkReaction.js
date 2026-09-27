const express = require('express');
const router = express.Router();
const checkReactionController = require('../controllers/checkReactionController');

router.post('/', checkReactionController.checkReaction);

module.exports = router;
