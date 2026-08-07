const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const circulationController = require('../controllers/circulationController');

router.get('/', authenticateToken, circulationController.listCirculations);
router.get('/members', authenticateToken, circulationController.listMembers);
router.get('/loans', authenticateToken, circulationController.listLoans);
router.post('/loans', authenticateToken, circulationController.issueLoan);
router.post('/issue', authenticateToken, circulationController.issueLoan);
router.post('/renew', authenticateToken, circulationController.renewLoan);
router.post('/return', authenticateToken, circulationController.returnLoan);
router.get('/reservations', authenticateToken, circulationController.listReservations);
router.post('/reservations', authenticateToken, circulationController.createReservation);

module.exports = router;
