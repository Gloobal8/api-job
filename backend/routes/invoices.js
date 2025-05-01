const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const { authenticateJWT, isAdmin } = require('../middleware/authMiddleware');

// Protected routes (user)
router.get('/user/:userId', authenticateJWT, invoiceController.getInvoicesByUser);
router.get('/:id', authenticateJWT, invoiceController.getInvoiceById);
router.get('/:id/pdf', authenticateJWT, invoiceController.generateInvoicePDF);
router.post('/:id/email', authenticateJWT, invoiceController.sendInvoiceEmail);

// Protected routes (admin only)
router.get('/', authenticateJWT, isAdmin, invoiceController.getAllInvoices);
router.get('/status/:status', authenticateJWT, isAdmin, invoiceController.getInvoicesByStatus);
router.get('/overdue', authenticateJWT, isAdmin, invoiceController.getOverdueInvoices);
router.post('/mark-overdue', authenticateJWT, isAdmin, invoiceController.markOverdueInvoices);
router.post('/', authenticateJWT, isAdmin, invoiceController.createInvoice);
router.put('/:id', authenticateJWT, isAdmin, invoiceController.updateInvoice);
router.patch('/:id/status', authenticateJWT, isAdmin, invoiceController.updateInvoiceStatus);
router.delete('/:id', authenticateJWT, isAdmin, invoiceController.deleteInvoice);
router.post('/:id/items', authenticateJWT, isAdmin, invoiceController.addInvoiceItem);
router.delete('/:id/items/:itemId', authenticateJWT, isAdmin, invoiceController.removeInvoiceItem);

module.exports = router;