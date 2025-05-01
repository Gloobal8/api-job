const Transaction = require('../models/Transaction');
const fs = require('fs');
const path = require('path');

// Define path to JSON storage
const dbPath = path.join(__dirname, '../data');
const usersFile = path.join(dbPath, 'users.json');

// Get all transactions
exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = Transaction.getAllTransactions();
    res.status(200).json({ transactions });
  } catch (error) {
    console.error('Error getting transactions:', error);
    res.status(500).json({ message: 'Failed to retrieve transactions' });
  }
};

// Get transactions by user ID
exports.getTransactionsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if user is requesting their own transactions or is an admin
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to view these transactions' });
    }
    
    const transactions = Transaction.getTransactionsByUserId(userId);
    res.status(200).json({ transactions });
  } catch (error) {
    console.error('Error getting user transactions:', error);
    res.status(500).json({ message: 'Failed to retrieve user transactions' });
  }
};

// Create a new transaction
exports.createTransaction = async (req, res) => {
  try {
    const { userId, type, amount, description, reference } = req.body;
    
    // Validate required fields
    if (!userId || !type || !amount || !description) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Only admin can create transactions
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to create transactions' });
    }
    
    // Create transaction
    const transaction = Transaction.createTransaction({
      userId,
      type,
      amount,
      description,
      reference
    });
    
    if (!transaction) {
      return res.status(500).json({ message: 'Failed to create transaction' });
    }
    
    // Update user credits
    const result = Transaction.updateUserCredits(
      userId,
      amount,
      type,
      description,
      reference
    );
    
    if (!result.success) {
      return res.status(400).json({ message: result.error });
    }
    
    res.status(201).json({
      message: 'Transaction created successfully',
      transaction,
      newBalance: result.newBalance
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ message: 'Failed to create transaction' });
  }
};

// Get user credit balance
exports.getUserCreditBalance = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if user is requesting their own balance or is an admin
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to view this balance' });
    }
    
    const result = Transaction.getUserCreditBalance(userId);
    
    if (!result.success) {
      return res.status(400).json({ message: result.error });
    }
    
    res.status(200).json({
      balance: result.balance,
      history: result.history
    });
  } catch (error) {
    console.error('Error getting user credit balance:', error);
    res.status(500).json({ message: 'Failed to retrieve credit balance' });
  }
};

// Process a credit purchase
exports.processCreditPurchase = async (req, res) => {
  try {
    const { userId } = req.params;
    const { packageId, paymentMethod, amount } = req.body;
    
    // Check if user is purchasing for themselves or is an admin
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to purchase credits for this user' });
    }
    
    // Validate required fields
    if (!packageId || !paymentMethod || !amount) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Credit packages (this could be moved to a separate model)
    const creditPackages = {
      1: { credits: 50, price: 5 },
      2: { credits: 100, price: 9 },
      3: { credits: 200, price: 16 },
      4: { credits: 500, price: 35 }
    };
    
    const selectedPackage = creditPackages[packageId];
    
    if (!selectedPackage) {
      return res.status(400).json({ message: 'Invalid package selected' });
    }
    
    // Simulate payment processing
    // In a real application, this would integrate with a payment gateway
    
    // Create transaction
    const description = `Purchased ${selectedPackage.credits} credits for $${selectedPackage.price}`;
    const result = Transaction.updateUserCredits(
      userId,
      selectedPackage.credits,
      'credit',
      description,
      `payment_${Date.now()}`
    );
    
    if (!result.success) {
      return res.status(400).json({ message: result.error });
    }
    
    res.status(200).json({
      message: 'Credits purchased successfully',
      transaction: result.transaction,
      newBalance: result.newBalance
    });
  } catch (error) {
    console.error('Error processing credit purchase:', error);
    res.status(500).json({ message: 'Failed to process credit purchase' });
  }
};