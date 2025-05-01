const { couponModel, validateCoupon, COUPON_TYPE } = require('../models/Coupon');

// Coupon controller
const couponController = {
  // Get all coupons
  getAllCoupons: (req, res) => {
    try {
      const coupons = couponModel.getAll();
      res.status(200).json({ success: true, data: coupons });
    } catch (error) {
      console.error('Error fetching coupons:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch coupons' });
    }
  },

  // Get active coupons
  getActiveCoupons: (req, res) => {
    try {
      const coupons = couponModel.getActive();
      res.status(200).json({ success: true, data: coupons });
    } catch (error) {
      console.error('Error fetching active coupons:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch active coupons' });
    }
  },

  // Get coupon by ID
  getCouponById: (req, res) => {
    try {
      const { id } = req.params;
      const coupon = couponModel.getById(id);
      
      if (!coupon) {
        return res.status(404).json({ success: false, message: 'Coupon not found' });
      }
      
      res.status(200).json({ success: true, data: coupon });
    } catch (error) {
      console.error('Error fetching coupon:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch coupon' });
    }
  },

  // Get coupon by code
  getCouponByCode: (req, res) => {
    try {
      const { code } = req.params;
      const coupon = couponModel.getByCode(code);
      
      if (!coupon) {
        return res.status(404).json({ success: false, message: 'Coupon not found' });
      }
      
      res.status(200).json({ success: true, data: coupon });
    } catch (error) {
      console.error('Error fetching coupon by code:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch coupon' });
    }
  },

  // Create coupon
  createCoupon: (req, res) => {
    try {
      const validation = validateCoupon(req.body);
      
      if (!validation.isValid) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid coupon data', 
          errors: validation.errors 
        });
      }
      
      try {
        const newCoupon = couponModel.create(req.body);
        res.status(201).json({ success: true, data: newCoupon });
      } catch (createError) {
        return res.status(400).json({ success: false, message: createError.message });
      }
    } catch (error) {
      console.error('Error creating coupon:', error);
      res.status(500).json({ success: false, message: 'Failed to create coupon' });
    }
  },

  // Update coupon
  updateCoupon: (req, res) => {
    try {
      const { id } = req.params;
      const validation = validateCoupon(req.body);
      
      if (!validation.isValid) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid coupon data', 
          errors: validation.errors 
        });
      }
      
      try {
        const updatedCoupon = couponModel.update(id, req.body);
        
        if (!updatedCoupon) {
          return res.status(404).json({ success: false, message: 'Coupon not found' });
        }
        
        res.status(200).json({ success: true, data: updatedCoupon });
      } catch (updateError) {
        return res.status(400).json({ success: false, message: updateError.message });
      }
    } catch (error) {
      console.error('Error updating coupon:', error);
      res.status(500).json({ success: false, message: 'Failed to update coupon' });
    }
  },

  // Delete coupon
  deleteCoupon: (req, res) => {
    try {
      const { id } = req.params;
      const result = couponModel.delete(id);
      
      if (!result) {
        return res.status(404).json({ success: false, message: 'Coupon not found' });
      }
      
      res.status(200).json({ success: true, message: 'Coupon deleted successfully' });
    } catch (error) {
      console.error('Error deleting coupon:', error);
      res.status(500).json({ success: false, message: 'Failed to delete coupon' });
    }
  },

  // Validate coupon
  validateCouponForUse: (req, res) => {
    try {
      const { code } = req.params;
      const { amount, packageId } = req.query;
      
      if (!amount) {
        return res.status(400).json({ success: false, message: 'Purchase amount is required' });
      }
      
      const validation = couponModel.validate(code, parseFloat(amount), packageId || null);
      
      if (!validation.valid) {
        return res.status(400).json({ 
          success: false, 
          message: validation.message 
        });
      }
      
      res.status(200).json({ 
        success: true, 
        message: 'Coupon is valid',
        data: validation.coupon
      });
    } catch (error) {
      console.error('Error validating coupon:', error);
      res.status(500).json({ success: false, message: 'Failed to validate coupon' });
    }
  },

  // Apply coupon
  applyCoupon: (req, res) => {
    try {
      const { code } = req.params;
      const { amount, packageId } = req.query;
      
      if (!amount) {
        return res.status(400).json({ success: false, message: 'Purchase amount is required' });
      }
      
      const result = couponModel.calculateDiscount(code, parseFloat(amount), packageId || null);
      
      if (!result.valid) {
        return res.status(400).json({ 
          success: false, 
          message: result.message 
        });
      }
      
      res.status(200).json({ 
        success: true, 
        data: {
          originalAmount: parseFloat(amount),
          discountAmount: result.discount,
          finalAmount: parseFloat(amount) - result.discount,
          coupon: result.coupon
        }
      });
    } catch (error) {
      console.error('Error applying coupon:', error);
      res.status(500).json({ success: false, message: 'Failed to apply coupon' });
    }
  },

  // Record coupon usage
  recordCouponUsage: (req, res) => {
    try {
      const { code } = req.params;
      
      const result = couponModel.recordUsage(code);
      
      if (!result) {
        return res.status(404).json({ success: false, message: 'Coupon not found' });
      }
      
      res.status(200).json({ 
        success: true, 
        message: 'Coupon usage recorded',
        data: result
      });
    } catch (error) {
      console.error('Error recording coupon usage:', error);
      res.status(500).json({ success: false, message: 'Failed to record coupon usage' });
    }
  },

  // Generate random coupon code
  generateCouponCode: (req, res) => {
    try {
      // Generate a random alphanumeric code
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let code = '';
      
      for (let i = 0; i < 8; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      
      // Check if code already exists
      const existingCoupon = couponModel.getByCode(code);
      
      if (existingCoupon) {
        // If code exists, generate a new one recursively
        return couponController.generateCouponCode(req, res);
      }
      
      res.status(200).json({ 
        success: true, 
        data: { code }
      });
    } catch (error) {
      console.error('Error generating coupon code:', error);
      res.status(500).json({ success: false, message: 'Failed to generate coupon code' });
    }
  }
};

module.exports = couponController;