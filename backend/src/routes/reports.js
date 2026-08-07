const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const reportController = require('../controllers/reportController');

router.get('/dashboard-metrics', authenticateToken, reportController.dashboardMetrics);
router.get('/usage', authenticateToken, reportController.usageReport);
router.get('/budget', authenticateToken, reportController.budgetReport);
router.get('/mis-logs', authenticateToken, reportController.listMISLogs);
router.post('/mis-logs', authenticateToken, reportController.createMISLog);

module.exports = router;
