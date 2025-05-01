const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(verifyToken);

// Get all transactions (admin only)
router.get('/', isAdmin, transactionController.getAllTransactions);

// Get transactions by user ID
router.get('/user/:userId', transactionController.getTransactionsByUserId);

// Create a new transaction (admin only)
router.post('/', isAdmin, transactionController.createTransaction);

// Get user credit balance
router.get('/user/:userId/balance', transactionController.getUserCreditBalance);

// Process a credit purchase
router.post('/user/:userId/purchase', transactionController.processCreditPurchase);

module.exports = router;