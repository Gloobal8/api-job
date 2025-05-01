const { invoiceModel, validateInvoice, INVOICE_STATUS } = require('../models/Invoice');

// Invoice controller
const invoiceController = {
  // Get all invoices
  getAllInvoices: (req, res) => {
    try {
      const invoices = invoiceModel.getAll();
      res.status(200).json({ success: true, data: invoices });
    } catch (error) {
      console.error('Error fetching invoices:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch invoices' });
    }
  },

  // Get invoice by ID
  getInvoiceById: (req, res) => {
    try {
      const { id } = req.params;
      const invoice = invoiceModel.getById(id);
      
      if (!invoice) {
        return res.status(404).json({ success: false, message: 'Invoice not found' });
      }
      
      res.status(200).json({ success: true, data: invoice });
    } catch (error) {
      console.error('Error fetching invoice:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch invoice' });
    }
  },

  // Get invoices by user ID
  getInvoicesByUser: (req, res) => {
    try {
      const { userId } = req.params;
      const invoices = invoiceModel.getByUserId(userId);
      res.status(200).json({ success: true, data: invoices });
    } catch (error) {
      console.error('Error fetching user invoices:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch user invoices' });
    }
  },

  // Create invoice
  createInvoice: (req, res) => {
    try {
      const validation = validateInvoice(req.body);
      
      if (!validation.isValid) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid invoice data', 
          errors: validation.errors 
        });
      }
      
      const newInvoice = invoiceModel.create(req.body);
      res.status(201).json({ success: true, data: newInvoice });
    } catch (error) {
      console.error('Error creating invoice:', error);
      res.status(500).json({ success: false, message: 'Failed to create invoice' });
    }
  },

  // Update invoice
  updateInvoice: (req, res) => {
    try {
      const { id } = req.params;
      const validation = validateInvoice(req.body);
      
      if (!validation.isValid) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid invoice data', 
          errors: validation.errors 
        });
      }
      
      const updatedInvoice = invoiceModel.update(id, req.body);
      
      if (!updatedInvoice) {
        return res.status(404).json({ success: false, message: 'Invoice not found' });
      }
      
      res.status(200).json({ success: true, data: updatedInvoice });
    } catch (error) {
      console.error('Error updating invoice:', error);
      res.status(500).json({ success: false, message: 'Failed to update invoice' });
    }
  },

  // Update invoice status
  updateInvoiceStatus: (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!Object.values(INVOICE_STATUS).includes(status)) {
        return res.status(400).json({ 
          success: false, 
          message: `Invalid status. Must be one of: ${Object.values(INVOICE_STATUS).join(', ')}` 
        });
      }
      
      const updatedInvoice = invoiceModel.updateStatus(id, status);
      
      if (!updatedInvoice) {
        return res.status(404).json({ success: false, message: 'Invoice not found' });
      }
      
      res.status(200).json({ success: true, data: updatedInvoice });
    } catch (error) {
      console.error('Error updating invoice status:', error);
      res.status(500).json({ success: false, message: 'Failed to update invoice status' });
    }
  },

  // Delete invoice (soft delete by updating status to CANCELLED)
  deleteInvoice: (req, res) => {
    try {
      const { id } = req.params;
      const result = invoiceModel.delete(id);
      
      if (!result) {
        return res.status(404).json({ success: false, message: 'Invoice not found' });
      }
      
      res.status(200).json({ success: true, message: 'Invoice deleted successfully' });
    } catch (error) {
      console.error('Error deleting invoice:', error);
      res.status(500).json({ success: false, message: 'Failed to delete invoice' });
    }
  },

  // Add item to invoice
  addInvoiceItem: (req, res) => {
    try {
      const { id } = req.params;
      const { description, quantity, unitPrice } = req.body;
      
      if (!description || !unitPrice) {
        return res.status(400).json({ 
          success: false, 
          message: 'Item description and unit price are required' 
        });
      }
      
      const updatedInvoice = invoiceModel.addItem(id, {
        description,
        quantity: quantity || 1,
        unitPrice
      });
      
      if (!updatedInvoice) {
        return res.status(404).json({ success: false, message: 'Invoice not found' });
      }
      
      res.status(200).json({ success: true, data: updatedInvoice });
    } catch (error) {
      console.error('Error adding invoice item:', error);
      res.status(500).json({ success: false, message: 'Failed to add invoice item' });
    }
  },

  // Remove item from invoice
  removeInvoiceItem: (req, res) => {
    try {
      const { id, itemId } = req.params;
      
      const updatedInvoice = invoiceModel.removeItem(id, itemId);
      
      if (!updatedInvoice) {
        return res.status(404).json({ success: false, message: 'Invoice or item not found' });
      }
      
      res.status(200).json({ success: true, data: updatedInvoice });
    } catch (error) {
      console.error('Error removing invoice item:', error);
      res.status(500).json({ success: false, message: 'Failed to remove invoice item' });
    }
  },

  // Get invoices by status
  getInvoicesByStatus: (req, res) => {
    try {
      const { status } = req.params;
      
      if (!Object.values(INVOICE_STATUS).includes(status)) {
        return res.status(400).json({ 
          success: false, 
          message: `Invalid status. Must be one of: ${Object.values(INVOICE_STATUS).join(', ')}` 
        });
      }
      
      const invoices = invoiceModel.getByStatus(status);
      res.status(200).json({ success: true, data: invoices });
    } catch (error) {
      console.error('Error fetching invoices by status:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch invoices' });
    }
  },

  // Get overdue invoices
  getOverdueInvoices: (req, res) => {
    try {
      const overdueInvoices = invoiceModel.getOverdue();
      res.status(200).json({ success: true, data: overdueInvoices });
    } catch (error) {
      console.error('Error fetching overdue invoices:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch overdue invoices' });
    }
  },

  // Mark overdue invoices
  markOverdueInvoices: (req, res) => {
    try {
      const updatedInvoices = invoiceModel.markOverdueInvoices();
      res.status(200).json({ 
        success: true, 
        message: `${updatedInvoices.length} invoices marked as overdue`,
        data: updatedInvoices
      });
    } catch (error) {
      console.error('Error marking overdue invoices:', error);
      res.status(500).json({ success: false, message: 'Failed to mark overdue invoices' });
    }
  },

  // Generate PDF invoice (simplified version)
  generateInvoicePDF: (req, res) => {
    try {
      const { id } = req.params;
      const invoice = invoiceModel.getById(id);
      
      if (!invoice) {
        return res.status(404).json({ success: false, message: 'Invoice not found' });
      }
      
      // In a real implementation, you would generate a PDF here
      // For this example, we'll just return a success message
      
      res.status(200).json({ 
        success: true, 
        message: 'PDF generation would happen here', 
        data: {
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          pdfUrl: `/api/invoices/${invoice.id}/pdf` // This would be a real URL in production
        }
      });
    } catch (error) {
      console.error('Error generating invoice PDF:', error);
      res.status(500).json({ success: false, message: 'Failed to generate invoice PDF' });
    }
  },

  // Send invoice by email (simplified version)
  sendInvoiceEmail: (req, res) => {
    try {
      const { id } = req.params;
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ success: false, message: 'Email address is required' });
      }
      
      const invoice = invoiceModel.getById(id);
      
      if (!invoice) {
        return res.status(404).json({ success: false, message: 'Invoice not found' });
      }
      
      // In a real implementation, you would send an email here
      // For this example, we'll just return a success message
      
      res.status(200).json({ 
        success: true, 
        message: `Invoice ${invoice.invoiceNumber} would be sent to ${email}` 
      });
    } catch (error) {
      console.error('Error sending invoice email:', error);
      res.status(500).json({ success: false, message: 'Failed to send invoice email' });
    }
  }
};

module.exports = invoiceController;