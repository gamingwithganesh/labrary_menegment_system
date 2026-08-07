const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

router.get('/audit', authenticateToken, adminController.listAuditLogs);
router.post('/audit', authenticateToken, adminController.createAuditLog);

module.exports = router;
