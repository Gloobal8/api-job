const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

// Define path to JSON storage
const dbPath = path.join(__dirname, '../data');
const transactionsFile = path.join(dbPath, 'transactions.json');

// Ensure directory exists
if (!fs.existsSync(dbPath)) {
  fs.mkdirSync(dbPath, { recursive: true });
}

// Ensure transactions file exists
if (!fs.existsSync(transactionsFile)) {
  fs.writeFileSync(transactionsFile, JSON.stringify([]));
}

const transactionModel = {
  id: String,
  userId: String,
  type: String, // 'credit' or 'debit'
  amount: Number,
  description: String,
  reference: String, // Optional reference ID (e.g., payment ID, job application ID)
  createdAt: String,
  metadata: Object // Optional additional data
};

// Read all transactions
const getAllTransactions = () => {
  try {
    const data = fs.readFileSync(transactionsFile);
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading transactions file:', error);
    return [];
  }
};

// Get transactions by user ID
const getTransactionsByUserId = (userId) => {
  const transactions = getAllTransactions();
  return transactions.filter(transaction => transaction.userId === userId);
};

// Create a new transaction
const createTransaction = (transactionData) => {
  try {
    const transactions = getAllTransactions();
    
    const newTransaction = {
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      ...transactionData
    };
    
    transactions.push(newTransaction);
    fs.writeFileSync(transactionsFile, JSON.stringify(transactions, null, 2));
    
    return newTransaction;
  } catch (error) {
    console.error('Error creating transaction:', error);
    return null;
  }
};

// Update user credits
const updateUserCredits = (userId, amount, type, description, reference = null) => {
  try {
    // Create the transaction record
    const transaction = createTransaction({
      userId,
      type,
      amount,
      description,
      reference,
      metadata: {}
    });
    
    if (!transaction) {
      throw new Error('Failed to create transaction record');
    }
    
    // Read user file to update credits
    const usersFile = path.join(dbPath, 'users.json');
    if (!fs.existsSync(usersFile)) {
      throw new Error('Users file does not exist');
    }
    
    const users = JSON.parse(fs.readFileSync(usersFile));
    const userIndex = users.findIndex(user => user.id === userId);
    
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    // Initialize credits if not exists
    if (!users[userIndex].credits) {
      users[userIndex].credits = {
        balance: 0,
        history: []
      };
    }
    
    // Update balance
    if (type === 'credit') {
      users[userIndex].credits.balance += amount;
    } else if (type === 'debit') {
      if (users[userIndex].credits.balance < amount) {
        throw new Error('Insufficient credits');
      }
      users[userIndex].credits.balance -= amount;
    }
    
    // Add to history
    users[userIndex].credits.history.push({
      amount,
      type,
      description,
      date: new Date().toISOString()
    });
    
    // Save updated user data
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
    
    return {
      success: true,
      transaction,
      newBalance: users[userIndex].credits.balance
    };
  } catch (error) {
    console.error('Error updating user credits:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Get user credit balance
const getUserCreditBalance = (userId) => {
  try {
    const usersFile = path.join(dbPath, 'users.json');
    if (!fs.existsSync(usersFile)) {
      throw new Error('Users file does not exist');
    }
    
    const users = JSON.parse(fs.readFileSync(usersFile));
    const user = users.find(user => user.id === userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    return {
      success: true,
      balance: user.credits?.balance || 0,
      history: user.credits?.history || []
    };
  } catch (error) {
    console.error('Error getting user credit balance:', error);
    return {
      success: false,
      error: error.message,
      balance: 0,
      history: []
    };
  }
};

module.exports = {
  transactionModel,
  getAllTransactions,
  getTransactionsByUserId,
  createTransaction,
  updateUserCredits,
  getUserCreditBalance
};