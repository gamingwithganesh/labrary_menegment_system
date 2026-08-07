const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const acquisitionController = require('../controllers/acquisitionController');

router.get('/', authenticateToken, acquisitionController.listAcquisitions);
router.post('/', authenticateToken, acquisitionController.createAcquisition);
router.get('/book-titles', authenticateToken, acquisitionController.listBookTitles);
router.post('/book-titles', authenticateToken, acquisitionController.createBookTitle);
router.get('/book-copies', authenticateToken, acquisitionController.listBookCopies);
router.post('/book-copies', authenticateToken, acquisitionController.createBookCopy);
router.get('/vendors', authenticateToken, acquisitionController.listVendors);
router.post('/vendors', authenticateToken, acquisitionController.createVendor);
router.get('/purchase-orders', authenticateToken, acquisitionController.listPurchaseOrders);
router.post('/purchase-orders', authenticateToken, acquisitionController.createPurchaseOrder);
router.get('/invoices', authenticateToken, acquisitionController.listInvoices);
router.post('/invoices', authenticateToken, acquisitionController.createInvoice);

module.exports = router;
