const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Define path to JSON file for invoices
const dataPath = path.join(__dirname, '../data/invoices.json');

// Ensure the data directory exists
const dataDir = path.dirname(dataPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize invoices file if it doesn't exist
if (!fs.existsSync(dataPath)) {
  fs.writeFileSync(dataPath, JSON.stringify([], 'utf8'));
}

// Invoice statuses
const INVOICE_STATUS = {
  DRAFT: 'draft',
  ISSUED: 'issued',
  PAID: 'paid',
  OVERDUE: 'overdue',
  CANCELLED: 'cancelled'
};

// Invoice model
const invoiceModel = {
  // Get all invoices
  getAll: () => {
    try {
      const data = fs.readFileSync(dataPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading invoices:', error);
      return [];
    }
  },

  // Get invoice by ID
  getById: (id) => {
    try {
      const invoices = invoiceModel.getAll();
      return invoices.find(invoice => invoice.id === id) || null;
    } catch (error) {
      console.error('Error getting invoice by ID:', error);
      return null;
    }
  },

  // Get invoices by user ID
  getByUserId: (userId) => {
    try {
      const invoices = invoiceModel.getAll();
      return invoices.filter(invoice => invoice.userId === userId);
    } catch (error) {
      console.error('Error getting invoices by user ID:', error);
      return [];
    }
  },

  // Get invoice by payment ID
  getByPaymentId: (paymentId) => {
    try {
      const invoices = invoiceModel.getAll();
      return invoices.find(invoice => invoice.paymentId === paymentId) || null;
    } catch (error) {
      console.error('Error getting invoice by payment ID:', error);
      return null;
    }
  },

  // Generate invoice number
  generateInvoiceNumber: () => {
    const invoices = invoiceModel.getAll();
    const year = new Date().getFullYear();
    const count = invoices.length + 1;
    return `INV-${year}-${count.toString().padStart(5, '0')}`;
  },

  // Create new invoice
  create: (invoiceData) => {
    try {
      const invoices = invoiceModel.getAll();
      const newInvoice = {
        id: uuidv4(),
        invoiceNumber: invoiceData.invoiceNumber || invoiceModel.generateInvoiceNumber(),
        userId: invoiceData.userId,
        paymentId: invoiceData.paymentId,
        packageId: invoiceData.packageId,
        companyId: invoiceData.companyId || null,
        companyName: invoiceData.companyName || null,
        companyLogo: invoiceData.companyLogo || null,
        companyAddress: invoiceData.companyAddress || null,
        items: invoiceData.items || [],
        subtotal: invoiceData.subtotal || 0,
        taxRate: invoiceData.taxRate || 0,
        taxAmount: invoiceData.taxAmount || 0,
        discountAmount: invoiceData.discountAmount || 0,
        totalAmount: invoiceData.totalAmount || 0,
        notes: invoiceData.notes || '',
        status: invoiceData.status || INVOICE_STATUS.DRAFT,
        dueDate: invoiceData.dueDate || null,
        paidDate: invoiceData.paidDate || null,
        couponCode: invoiceData.couponCode || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Calculate totals if not provided
      if (!invoiceData.totalAmount) {
        newInvoice.subtotal = newInvoice.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
        newInvoice.taxAmount = newInvoice.subtotal * (newInvoice.taxRate / 100);
        newInvoice.totalAmount = newInvoice.subtotal + newInvoice.taxAmount - newInvoice.discountAmount;
      }

      invoices.push(newInvoice);
      fs.writeFileSync(dataPath, JSON.stringify(invoices, null, 2), 'utf8');
      return newInvoice;
    } catch (error) {
      console.error('Error creating invoice:', error);
      return null;
    }
  },

  // Update invoice
  update: (id, invoiceData) => {
    try {
      const invoices = invoiceModel.getAll();
      const index = invoices.findIndex(invoice => invoice.id === id);
      
      if (index === -1) return null;
      
      const updatedInvoice = {
        ...invoices[index],
        ...invoiceData,
        updatedAt: new Date().toISOString()
      };
      
      // Recalculate totals if items or rates changed
      if (invoiceData.items || invoiceData.taxRate !== undefined || invoiceData.discountAmount !== undefined) {
        updatedInvoice.subtotal = updatedInvoice.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
        updatedInvoice.taxAmount = updatedInvoice.subtotal * (updatedInvoice.taxRate / 100);
        updatedInvoice.totalAmount = updatedInvoice.subtotal + updatedInvoice.taxAmount - updatedInvoice.discountAmount;
      }
      
      invoices[index] = updatedInvoice;
      fs.writeFileSync(dataPath, JSON.stringify(invoices, null, 2), 'utf8');
      return updatedInvoice;
    } catch (error) {
      console.error('Error updating invoice:', error);
      return null;
    }
  },

  // Update invoice status
  updateStatus: (id, status) => {
    const updates = { status };
    
    // Add paid date if status is changing to PAID
    if (status === INVOICE_STATUS.PAID) {
      updates.paidDate = new Date().toISOString();
    }
    
    return invoiceModel.update(id, updates);
  },

  // Delete invoice (soft delete by updating status to CANCELLED)
  delete: (id) => {
    return invoiceModel.updateStatus(id, INVOICE_STATUS.CANCELLED);
  },

  // Add item to invoice
  addItem: (id, item) => {
    try {
      const invoice = invoiceModel.getById(id);
      
      if (!invoice) return null;
      
      const newItem = {
        id: uuidv4(),
        description: item.description,
        quantity: item.quantity || 1,
        unitPrice: item.unitPrice,
        totalPrice: (item.quantity || 1) * item.unitPrice
      };
      
      const updatedItems = [...invoice.items, newItem];
      
      return invoiceModel.update(id, { items: updatedItems });
    } catch (error) {
      console.error('Error adding item to invoice:', error);
      return null;
    }
  },

  // Remove item from invoice
  removeItem: (invoiceId, itemId) => {
    try {
      const invoice = invoiceModel.getById(invoiceId);
      
      if (!invoice) return null;
      
      const updatedItems = invoice.items.filter(item => item.id !== itemId);
      
      return invoiceModel.update(invoiceId, { items: updatedItems });
    } catch (error) {
      console.error('Error removing item from invoice:', error);
      return null;
    }
  },

  // Get invoices by status
  getByStatus: (status) => {
    try {
      const invoices = invoiceModel.getAll();
      return invoices.filter(invoice => invoice.status === status);
    } catch (error) {
      console.error(`Error getting invoices with status ${status}:`, error);
      return [];
    }
  },

  // Get overdue invoices
  getOverdue: () => {
    try {
      const invoices = invoiceModel.getAll();
      const now = new Date();
      
      return invoices.filter(invoice => {
        if (!invoice.dueDate || invoice.status === INVOICE_STATUS.PAID || invoice.status === INVOICE_STATUS.CANCELLED) {
          return false;
        }
        
        const dueDate = new Date(invoice.dueDate);
        return dueDate < now && invoice.status !== INVOICE_STATUS.OVERDUE;
      });
    } catch (error) {
      console.error('Error getting overdue invoices:', error);
      return [];
    }
  },

  // Mark overdue invoices
  markOverdueInvoices: () => {
    try {
      const overdueInvoices = invoiceModel.getOverdue();
      
      const updated = overdueInvoices.map(invoice => {
        return invoiceModel.updateStatus(invoice.id, INVOICE_STATUS.OVERDUE);
      });
      
      return updated.filter(Boolean);
    } catch (error) {
      console.error('Error marking overdue invoices:', error);
      return [];
    }
  },

  // Generate invoice from payment
  generateFromPayment: (paymentId, userData, packageData, companyData = null) => {
    try {
      const existingInvoice = invoiceModel.getByPaymentId(paymentId);
      
      if (existingInvoice) {
        return existingInvoice;
      }
      
      // Create invoice items
      const items = [{
        id: uuidv4(),
        description: `${packageData.name} - Subscription for ${packageData.duration} days`,
        quantity: 1,
        unitPrice: packageData.price,
        totalPrice: packageData.price
      }];
      
      // Calculate tax (assuming 0% for now)
      const taxRate = 0;
      const subtotal = packageData.price;
      const taxAmount = subtotal * (taxRate / 100);
      const totalAmount = subtotal + taxAmount;
      
      // Set due date to 14 days from now
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14);
      
      // Create the invoice
      const invoiceData = {
        userId: userData.id,
        paymentId,
        packageId: packageData.id,
        items,
        subtotal,
        taxRate,
        taxAmount,
        totalAmount,
        status: INVOICE_STATUS.ISSUED,
        dueDate: dueDate.toISOString()
      };
      
      // Add company data if provided
      if (companyData) {
        invoiceData.companyId = companyData.id;
        invoiceData.companyName = companyData.name;
        invoiceData.companyLogo = companyData.logo;
        invoiceData.companyAddress = companyData.address;
      }
      
      return invoiceModel.create(invoiceData);
    } catch (error) {
      console.error('Error generating invoice from payment:', error);
      return null;
    }
  }
};

// Validate invoice data
const validateInvoice = (invoiceData) => {
  const errors = [];
  
  if (!invoiceData.userId) {
    errors.push('User ID is required');
  }
  
  if (invoiceData.status && !Object.values(INVOICE_STATUS).includes(invoiceData.status)) {
    errors.push(`Invoice status must be one of: ${Object.values(INVOICE_STATUS).join(', ')}`);
  }
  
  if (invoiceData.items) {
    for (const item of invoiceData.items) {
      if (!item.description) {
        errors.push('Item description is required');
      }
      
      if (item.quantity === undefined || item.quantity === null || isNaN(item.quantity) || item.quantity <= 0) {
        errors.push('Item quantity must be a positive number');
      }
      
      if (item.unitPrice === undefined || item.unitPrice === null || isNaN(item.unitPrice) || item.unitPrice < 0) {
        errors.push('Item unit price must be a non-negative number');
      }
    }
  }
  
  if (invoiceData.taxRate !== undefined && (isNaN(invoiceData.taxRate) || invoiceData.taxRate < 0)) {
    errors.push('Tax rate must be a non-negative number');
  }
  
  if (invoiceData.discountAmount !== undefined && (isNaN(invoiceData.discountAmount) || invoiceData.discountAmount < 0)) {
    errors.push('Discount amount must be a non-negative number');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  invoiceModel,
  validateInvoice,
  INVOICE_STATUS
};