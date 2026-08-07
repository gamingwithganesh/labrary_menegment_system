const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const bookController = require('../controllers/bookController');

router.get('/', authenticateToken, bookController.getBooks);
router.post('/', authenticateToken, bookController.createBook);
router.put('/:id', authenticateToken, bookController.updateBook);
router.delete('/:id', authenticateToken, bookController.deleteBook);

module.exports = router;
