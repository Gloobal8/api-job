const { paymentModel, validatePayment, PAYMENT_STATUS, PAYMENT_METHOD } = require('../models/Payment');
const { packageModel } = require('../models/package');
const { invoiceModel } = require('../models/Invoice');

// Payment controller
const paymentController = {
  // Get all payments
  getAllPayments: (req, res) => {
    try {
      const payments = paymentModel.getAll();
      res.status(200).json({ success: true, data: payments });
    } catch (error) {
      console.error('Error fetching payments:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch payments' });
    }
  },

  // Get payment by ID
  getPaymentById: (req, res) => {
    try {
      const { id } = req.params;
      const payment = paymentModel.getById(id);
      
      if (!payment) {
        return res.status(404).json({ success: false, message: 'Payment not found' });
      }
      
      res.status(200).json({ success: true, data: payment });
    } catch (error) {
      console.error('Error fetching payment:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch payment' });
    }
  },

  // Get payments by user ID
  getPaymentsByUser: (req, res) => {
    try {
      const { userId } = req.params;
      const payments = paymentModel.getByUserId(userId);
      res.status(200).json({ success: true, data: payments });
    } catch (error) {
      console.error('Error fetching user payments:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch user payments' });
    }
  },

  // Create payment
  createPayment: (req, res) => {
    try {
      const validation = validatePayment(req.body);
      
      if (!validation.isValid) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid payment data', 
          errors: validation.errors 
        });
      }
      
      const newPayment = paymentModel.create(req.body);
      res.status(201).json({ success: true, data: newPayment });
    } catch (error) {
      console.error('Error creating payment:', error);
      res.status(500).json({ success: false, message: 'Failed to create payment' });
    }
  },

  // Update payment
  updatePayment: (req, res) => {
    try {
      const { id } = req.params;
      const validation = validatePayment(req.body);
      
      if (!validation.isValid) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid payment data', 
          errors: validation.errors 
        });
      }
      
      const updatedPayment = paymentModel.update(id, req.body);
      
      if (!updatedPayment) {
        return res.status(404).json({ success: false, message: 'Payment not found' });
      }
      
      res.status(200).json({ success: true, data: updatedPayment });
    } catch (error) {
      console.error('Error updating payment:', error);
      res.status(500).json({ success: false, message: 'Failed to update payment' });
    }
  },

  // Update payment status
  updatePaymentStatus: (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!Object.values(PAYMENT_STATUS).includes(status)) {
        return res.status(400).json({ 
          success: false, 
          message: `Invalid status. Must be one of: ${Object.values(PAYMENT_STATUS).join(', ')}` 
        });
      }
      
      const updatedPayment = paymentModel.updateStatus(id, status);
      
      if (!updatedPayment) {
        return res.status(404).json({ success: false, message: 'Payment not found' });
      }
      
      // If payment is completed, generate invoice
      if (status === PAYMENT_STATUS.COMPLETED) {
        try {
          // Get necessary data for invoice generation
          const user = { id: updatedPayment.userId }; // Simplified, you'd fetch the actual user
          const pkg = packageModel.getById(updatedPayment.packageId);
          
          if (pkg) {
            invoiceModel.generateFromPayment(updatedPayment.id, user, pkg);
          }
        } catch (invoiceError) {
          console.error('Error generating invoice:', invoiceError);
          // Continue with the response even if invoice generation fails
        }
      }
      
      res.status(200).json({ success: true, data: updatedPayment });
    } catch (error) {
      console.error('Error updating payment status:', error);
      res.status(500).json({ success: false, message: 'Failed to update payment status' });
    }
  },

  // Process payment
  processPayment: async (req, res) => {
    try {
      const validation = validatePayment(req.body);
      
      if (!validation.isValid) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid payment data', 
          errors: validation.errors 
        });
      }
      
      // Verify package exists
      const pkg = packageModel.getById(req.body.packageId);
      if (!pkg) {
        return res.status(404).json({ success: false, message: 'Package not found' });
      }
      
      // Process the payment
      const payment = await paymentModel.processPayment(req.body);
      
      // Generate invoice if payment is successful
      if (payment.status === PAYMENT_STATUS.COMPLETED) {
        try {
          const user = { id: payment.userId }; // Simplified, you'd fetch the actual user
          invoiceModel.generateFromPayment(payment.id, user, pkg);
        } catch (invoiceError) {
          console.error('Error generating invoice:', invoiceError);
          // Continue with the response even if invoice generation fails
        }
      }
      
      res.status(200).json({ success: true, data: payment });
    } catch (error) {
      console.error('Error processing payment:', error);
      res.status(500).json({ success: false, message: 'Failed to process payment' });
    }
  },

  // Refund payment
  refundPayment: async (req, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      
      if (!reason) {
        return res.status(400).json({ success: false, message: 'Refund reason is required' });
      }
      
      try {
        const refundedPayment = await paymentModel.refundPayment(id, reason);
        res.status(200).json({ success: true, data: refundedPayment });
      } catch (refundError) {
        return res.status(400).json({ success: false, message: refundError.message });
      }
    } catch (error) {
      console.error('Error refunding payment:', error);
      res.status(500).json({ success: false, message: 'Failed to refund payment' });
    }
  },

  // Get payment statistics
  getPaymentStatistics: (req, res) => {
    try {
      const { userId } = req.query;
      const statistics = paymentModel.getStatistics(userId || null);
      res.status(200).json({ success: true, data: statistics });
    } catch (error) {
      console.error('Error fetching payment statistics:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch payment statistics' });
    }
  },

  // Get payments by status
  getPaymentsByStatus: (req, res) => {
    try {
      const { status } = req.params;
      
      if (!Object.values(PAYMENT_STATUS).includes(status)) {
        return res.status(400).json({ 
          success: false, 
          message: `Invalid status. Must be one of: ${Object.values(PAYMENT_STATUS).join(', ')}` 
        });
      }
      
      const payments = paymentModel.getByStatus(status);
      res.status(200).json({ success: true, data: payments });
    } catch (error) {
      console.error('Error fetching payments by status:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch payments' });
    }
  },

  // Payment webhook handler (for external payment providers)
  handlePaymentWebhook: (req, res) => {
    try {
      const { type, data } = req.body;
      
      // Handle different webhook event types
      switch (type) {
        case 'payment.succeeded':
          // Update payment status to completed
          if (data && data.paymentId) {
            const payment = paymentModel.getById(data.paymentId);
            
            if (payment) {
              paymentModel.updateStatus(payment.id, PAYMENT_STATUS.COMPLETED);
              
              // Generate invoice
              try {
                const user = { id: payment.userId }; // Simplified, you'd fetch the actual user
                const pkg = packageModel.getById(payment.packageId);
                
                if (pkg) {
                  invoiceModel.generateFromPayment(payment.id, user, pkg);
                }
              } catch (invoiceError) {
                console.error('Error generating invoice from webhook:', invoiceError);
              }
            }
          }
          break;
          
        case 'payment.failed':
          // Update payment status to failed
          if (data && data.paymentId) {
            paymentModel.updateStatus(data.paymentId, PAYMENT_STATUS.FAILED);
          }
          break;
          
        case 'payment.refunded':
          // Update payment status to refunded
          if (data && data.paymentId) {
            paymentModel.updateStatus(data.paymentId, PAYMENT_STATUS.REFUNDED);
          }
          break;
          
        default:
          // Unhandled event type
          console.log(`Unhandled webhook event type: ${type}`);
      }
      
      // Always return 200 to acknowledge receipt
      res.status(200).json({ success: true, message: 'Webhook received' });
    } catch (error) {
      console.error('Error handling payment webhook:', error);
      // Still return 200 to prevent retries
      res.status(200).json({ success: false, message: 'Error processing webhook' });
    }
  }
};

module.exports = paymentController;