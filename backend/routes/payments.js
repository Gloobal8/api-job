const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticateJWT, isAdmin } = require('../middleware/authMiddleware');

// Public routes
router.post('/webhook', paymentController.handlePaymentWebhook);

// Protected routes (user)
router.post('/process', authenticateJWT, paymentController.processPayment);
router.get('/user/:userId', authenticateJWT, paymentController.getPaymentsByUser);

// Protected routes (admin only)
router.get('/', authenticateJWT, isAdmin, paymentController.getAllPayments);
router.get('/statistics', authenticateJWT, isAdmin, paymentController.getPaymentStatistics);
router.get('/status/:status', authenticateJWT, isAdmin, paymentController.getPaymentsByStatus);
router.get('/:id', authenticateJWT, paymentController.getPaymentById);
router.post('/', authenticateJWT, isAdmin, paymentController.createPayment);
router.put('/:id', authenticateJWT, isAdmin, paymentController.updatePayment);
router.patch('/:id/status', authenticateJWT, isAdmin, paymentController.updatePaymentStatus);
router.post('/:id/refund', authenticateJWT, isAdmin, paymentController.refundPayment);

module.exports = router;