const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Define path to JSON file for payments
const dataPath = path.join(__dirname, '../data/payments.json');

// Ensure the data directory exists
const dataDir = path.dirname(dataPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize payments file if it doesn't exist
if (!fs.existsSync(dataPath)) {
  fs.writeFileSync(dataPath, JSON.stringify([], 'utf8'));
}

// Payment statuses
const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  CANCELLED: 'cancelled'
};

// Payment methods
const PAYMENT_METHOD = {
  CREDIT_CARD: 'credit_card',
  PAYPAL: 'paypal',
  BANK_TRANSFER: 'bank_transfer',
  STRIPE: 'stripe'
};

// Payment model
const paymentModel = {
  // Get all payments
  getAll: () => {
    try {
      const data = fs.readFileSync(dataPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading payments:', error);
      return [];
    }
  },

  // Get payment by ID
  getById: (id) => {
    try {
      const payments = paymentModel.getAll();
      return payments.find(payment => payment.id === id) || null;
    } catch (error) {
      console.error('Error getting payment by ID:', error);
      return null;
    }
  },

  // Get payments by user ID
  getByUserId: (userId) => {
    try {
      const payments = paymentModel.getAll();
      return payments.filter(payment => payment.userId === userId);
    } catch (error) {
      console.error('Error getting payments by user ID:', error);
      return [];
    }
  },

  // Create new payment
  create: (paymentData) => {
    try {
      const payments = paymentModel.getAll();
      const newPayment = {
        id: uuidv4(),
        userId: paymentData.userId,
        packageId: paymentData.packageId,
        amount: paymentData.amount,
        status: paymentData.status || PAYMENT_STATUS.PENDING,
        paymentMethod: paymentData.paymentMethod,
        transactionId: paymentData.transactionId || null,
        metadata: paymentData.metadata || {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      payments.push(newPayment);
      fs.writeFileSync(dataPath, JSON.stringify(payments, null, 2), 'utf8');
      return newPayment;
    } catch (error) {
      console.error('Error creating payment:', error);
      return null;
    }
  },

  // Update payment
  update: (id, paymentData) => {
    try {
      const payments = paymentModel.getAll();
      const index = payments.findIndex(payment => payment.id === id);
      
      if (index === -1) return null;
      
      const updatedPayment = {
        ...payments[index],
        ...paymentData,
        updatedAt: new Date().toISOString()
      };
      
      payments[index] = updatedPayment;
      fs.writeFileSync(dataPath, JSON.stringify(payments, null, 2), 'utf8');
      return updatedPayment;
    } catch (error) {
      console.error('Error updating payment:', error);
      return null;
    }
  },

  // Update payment status
  updateStatus: (id, status) => {
    return paymentModel.update(id, { status });
  },

  // Process payment (simulated)
  processPayment: async (paymentData) => {
    try {
      // Create initial payment record
      const payment = paymentModel.create({
        userId: paymentData.userId,
        packageId: paymentData.packageId,
        amount: paymentData.amount,
        paymentMethod: paymentData.paymentMethod,
        status: PAYMENT_STATUS.PENDING
      });
      
      // Simulate payment processing
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          // Simulate success (90% of the time)
          if (Math.random() < 0.9) {
            const updatedPayment = paymentModel.update(payment.id, {
              status: PAYMENT_STATUS.COMPLETED,
              transactionId: `tr_${Date.now()}`
            });
            resolve(updatedPayment);
          } else {
            const updatedPayment = paymentModel.update(payment.id, {
              status: PAYMENT_STATUS.FAILED,
              metadata: { error: 'Payment processing failed' }
            });
            reject(new Error('Payment processing failed'));
          }
        }, 1000); // Simulate 1 second processing time
      });
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  },

  // Refund payment (simulated)
  refundPayment: async (paymentId, reason) => {
    try {
      const payment = paymentModel.getById(paymentId);
      
      if (!payment) {
        throw new Error('Payment not found');
      }
      
      if (payment.status !== PAYMENT_STATUS.COMPLETED) {
        throw new Error(`Cannot refund payment with status: ${payment.status}`);
      }
      
      // Simulate refund processing
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          // Simulate success (95% of the time)
          if (Math.random() < 0.95) {
            const updatedPayment = paymentModel.update(paymentId, {
              status: PAYMENT_STATUS.REFUNDED,
              metadata: {
                ...payment.metadata,
                refundReason: reason,
                refundDate: new Date().toISOString()
              }
            });
            resolve(updatedPayment);
          } else {
            reject(new Error('Refund processing failed'));
          }
        }, 1000); // Simulate 1 second processing time
      });
    } catch (error) {
      console.error('Error refunding payment:', error);
      throw error;
    }
  },

  // Get payments by status
  getByStatus: (status) => {
    try {
      const payments = paymentModel.getAll();
      return payments.filter(payment => payment.status === status);
    } catch (error) {
      console.error(`Error getting payments with status ${status}:`, error);
      return [];
    }
  },

  // Get payment statistics
  getStatistics: (userId = null) => {
    try {
      let payments = paymentModel.getAll();
      
      // Filter by user if userId is provided
      if (userId) {
        payments = payments.filter(payment => payment.userId === userId);
      }
      
      // Calculate statistics
      const total = payments.length;
      const totalAmount = payments.reduce((sum, payment) => {
        return payment.status === PAYMENT_STATUS.COMPLETED ? sum + payment.amount : sum;
      }, 0);
      
      const byStatus = {};
      Object.values(PAYMENT_STATUS).forEach(status => {
        byStatus[status] = payments.filter(payment => payment.status === status).length;
      });
      
      const byMethod = {};
      Object.values(PAYMENT_METHOD).forEach(method => {
        byMethod[method] = payments.filter(payment => payment.paymentMethod === method).length;
      });
      
      return {
        total,
        totalAmount,
        byStatus,
        byMethod
      };
    } catch (error) {
      console.error('Error calculating payment statistics:', error);
      return {
        total: 0,
        totalAmount: 0,
        byStatus: {},
        byMethod: {}
      };
    }
  }
};

// Validate payment data
const validatePayment = (paymentData) => {
  const errors = [];
  
  if (!paymentData.userId) {
    errors.push('User ID is required');
  }
  
  if (!paymentData.packageId) {
    errors.push('Package ID is required');
  }
  
  if (paymentData.amount === undefined || paymentData.amount === null || isNaN(paymentData.amount) || paymentData.amount <= 0) {
    errors.push('Valid payment amount is required');
  }
  
  if (paymentData.paymentMethod && !Object.values(PAYMENT_METHOD).includes(paymentData.paymentMethod)) {
    errors.push(`Payment method must be one of: ${Object.values(PAYMENT_METHOD).join(', ')}`);
  }
  
  if (paymentData.status && !Object.values(PAYMENT_STATUS).includes(paymentData.status)) {
    errors.push(`Payment status must be one of: ${Object.values(PAYMENT_STATUS).join(', ')}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  paymentModel,
  validatePayment,
  PAYMENT_STATUS,
  PAYMENT_METHOD
};