const express = require('express');
const router = express.Router();
const elementsController = require('../controllers/elementsController');

router.get('/', elementsController.getAllElements);
router.get('/:symbol', elementsController.getElementBySymbol);

module.exports = router;
