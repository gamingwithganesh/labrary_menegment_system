const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const opacController = require('../controllers/opacController');

router.get('/search', authenticateToken, opacController.search);
router.get('/title/:id', authenticateToken, opacController.getTitle);

module.exports = router;
