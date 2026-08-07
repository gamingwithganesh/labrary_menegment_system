const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const serialController = require('../controllers/serialController');

router.get('/', authenticateToken, serialController.listSubscriptions);
router.post('/', authenticateToken, serialController.createSubscription);
router.delete('/:id', authenticateToken, serialController.deleteSubscription);
router.get('/issues', authenticateToken, serialController.listIssues);
router.post('/issues', authenticateToken, serialController.createIssue);
router.get('/newspaper-logs', authenticateToken, serialController.listNewspaperLogs);
router.post('/newspaper-logs', authenticateToken, serialController.createNewspaperLog);

module.exports = router;
