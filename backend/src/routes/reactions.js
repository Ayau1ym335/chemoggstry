const express = require('express');
const reactionsController = require('../controllers/reactionsController');

const router = express.Router();

router.get('/', reactionsController.list);
router.get('/:id', reactionsController.getById);

module.exports = router;
