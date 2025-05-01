const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Define path to JSON file for coupons
const dataPath = path.join(__dirname, '../data/coupons.json');

// Ensure the data directory exists
const dataDir = path.dirname(dataPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize coupons file if it doesn't exist
if (!fs.existsSync(dataPath)) {
  fs.writeFileSync(dataPath, JSON.stringify([], 'utf8'));
}

// Coupon types
const COUPON_TYPE = {
  PERCENTAGE: 'percentage',
  FIXED_AMOUNT: 'fixed_amount'
};

// Coupon model
const couponModel = {
  // Get all coupons
  getAll: () => {
    try {
      const data = fs.readFileSync(dataPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading coupons:', error);
      return [];
    }
  },

  // Get coupon by ID
  getById: (id) => {
    try {
      const coupons = couponModel.getAll();
      return coupons.find(coupon => coupon.id === id) || null;
    } catch (error) {
      console.error('Error getting coupon by ID:', error);
      return null;
    }
  },

  // Get coupon by code
  getByCode: (code) => {
    try {
      const coupons = couponModel.getAll();
      return coupons.find(coupon => coupon.code.toLowerCase() === code.toLowerCase()) || null;
    } catch (error) {
      console.error('Error getting coupon by code:', error);
      return null;
    }
  },

  // Create new coupon
  create: (couponData) => {
    try {
      // Check if coupon code already exists
      const existingCoupon = couponModel.getByCode(couponData.code);
      if (existingCoupon) {
        throw new Error('Coupon code already exists');
      }
      
      const coupons = couponModel.getAll();
      const newCoupon = {
        id: uuidv4(),
        code: couponData.code,
        type: couponData.type || COUPON_TYPE.PERCENTAGE,
        value: couponData.value,
        minPurchase: couponData.minPurchase || 0,
        maxUses: couponData.maxUses || null,
        usedCount: 0,
        startDate: couponData.startDate || new Date().toISOString(),
        endDate: couponData.endDate || null,
        packageIds: couponData.packageIds || [], // Specific packages this coupon applies to (empty = all)
        isActive: couponData.isActive !== undefined ? couponData.isActive : true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      coupons.push(newCoupon);
      fs.writeFileSync(dataPath, JSON.stringify(coupons, null, 2), 'utf8');
      return newCoupon;
    } catch (error) {
      console.error('Error creating coupon:', error);
      throw error;
    }
  },

  // Update coupon
  update: (id, couponData) => {
    try {
      const coupons = couponModel.getAll();
      const index = coupons.findIndex(coupon => coupon.id === id);
      
      if (index === -1) return null;
      
      // Check if code is being changed and if the new code already exists
      if (couponData.code && couponData.code !== coupons[index].code) {
        const existingCoupon = couponModel.getByCode(couponData.code);
        if (existingCoupon && existingCoupon.id !== id) {
          throw new Error('Coupon code already exists');
        }
      }
      
      const updatedCoupon = {
        ...coupons[index],
        ...couponData,
        updatedAt: new Date().toISOString()
      };
      
      coupons[index] = updatedCoupon;
      fs.writeFileSync(dataPath, JSON.stringify(coupons, null, 2), 'utf8');
      return updatedCoupon;
    } catch (error) {
      console.error('Error updating coupon:', error);
      throw error;
    }
  },

  // Delete coupon
  delete: (id) => {
    try {
      const coupons = couponModel.getAll();
      const filteredCoupons = coupons.filter(coupon => coupon.id !== id);
      
      if (filteredCoupons.length === coupons.length) return false;
      
      fs.writeFileSync(dataPath, JSON.stringify(filteredCoupons, null, 2), 'utf8');
      return true;
    } catch (error) {
      console.error('Error deleting coupon:', error);
      return false;
    }
  },

  // Validate coupon for use
  validate: (code, amount, packageId = null) => {
    try {
      const coupon = couponModel.getByCode(code);
      
      if (!coupon) {
        return {
          valid: false,
          message: 'Coupon not found'
        };
      }
      
      if (!coupon.isActive) {
        return {
          valid: false,
          message: 'Coupon is inactive'
        };
      }
      
      // Check start date
      if (coupon.startDate && new Date(coupon.startDate) > new Date()) {
        return {
          valid: false,
          message: 'Coupon is not yet active'
        };
      }
      
      // Check end date
      if (coupon.endDate && new Date(coupon.endDate) < new Date()) {
        return {
          valid: false,
          message: 'Coupon has expired'
        };
      }
      
      // Check max uses
      if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
        return {
          valid: false,
          message: 'Coupon usage limit reached'
        };
      }
      
      // Check minimum purchase amount
      if (amount < coupon.minPurchase) {
        return {
          valid: false,
          message: `Minimum purchase amount of ${coupon.minPurchase} required`
        };
      }
      
      // Check if coupon applies to the package
      if (packageId && coupon.packageIds.length > 0 && !coupon.packageIds.includes(packageId)) {
        return {
          valid: false,
          message: 'Coupon does not apply to this package'
        };
      }
      
      return {
        valid: true,
        coupon
      };
    } catch (error) {
      console.error('Error validating coupon:', error);
      return {
        valid: false,
        message: 'Error validating coupon'
      };
    }
  },

  // Apply coupon to calculate discount
  calculateDiscount: (code, amount, packageId = null) => {
    try {
      const validation = couponModel.validate(code, amount, packageId);
      
      if (!validation.valid) {
        return {
          valid: false,
          message: validation.message,
          discount: 0
        };
      }
      
      const coupon = validation.coupon;
      let discount = 0;
      
      if (coupon.type === COUPON_TYPE.PERCENTAGE) {
        discount = (amount * coupon.value) / 100;
      } else {
        discount = coupon.value;
      }
      
      // Ensure discount doesn't exceed the amount
      discount = Math.min(discount, amount);
      
      return {
        valid: true,
        discount,
        coupon
      };
    } catch (error) {
      console.error('Error calculating discount:', error);
      return {
        valid: false,
        message: 'Error calculating discount',
        discount: 0
      };
    }
  },

  // Record coupon usage
  recordUsage: (code) => {
    try {
      const coupon = couponModel.getByCode(code);
      
      if (!coupon) return false;
      
      return couponModel.update(coupon.id, {
        usedCount: coupon.usedCount + 1
      });
    } catch (error) {
      console.error('Error recording coupon usage:', error);
      return false;
    }
  },

  // Get active coupons
  getActive: () => {
    try {
      const coupons = couponModel.getAll();
      const now = new Date();
      
      return coupons.filter(coupon => {
        return coupon.isActive && 
               (!coupon.startDate || new Date(coupon.startDate) <= now) &&
               (!coupon.endDate || new Date(coupon.endDate) >= now) &&
               (coupon.maxUses === null || coupon.usedCount < coupon.maxUses);
      });
    } catch (error) {
      console.error('Error getting active coupons:', error);
      return [];
    }
  }
};

// Validate coupon data
const validateCoupon = (couponData) => {
  const errors = [];
  
  if (!couponData.code) {
    errors.push('Coupon code is required');
  }
  
  if (couponData.type && !Object.values(COUPON_TYPE).includes(couponData.type)) {
    errors.push(`Coupon type must be one of: ${Object.values(COUPON_TYPE).join(', ')}`);
  }
  
  if (couponData.value === undefined || couponData.value === null || isNaN(couponData.value) || couponData.value <= 0) {
    errors.push('Coupon value must be a positive number');
  }
  
  // For percentage coupons, value should be between 0 and 100
  if (couponData.type === COUPON_TYPE.PERCENTAGE && (couponData.value < 0 || couponData.value > 100)) {
    errors.push('Percentage discount must be between 0 and 100');
  }
  
  if (couponData.minPurchase !== undefined && (isNaN(couponData.minPurchase) || couponData.minPurchase < 0)) {
    errors.push('Minimum purchase amount must be a non-negative number');
  }
  
  if (couponData.maxUses !== undefined && couponData.maxUses !== null && (isNaN(couponData.maxUses) || couponData.maxUses < 1)) {
    errors.push('Maximum uses must be a positive number');
  }
  
  // Validate dates
  if (couponData.startDate && isNaN(Date.parse(couponData.startDate))) {
    errors.push('Start date is invalid');
  }
  
  if (couponData.endDate && isNaN(Date.parse(couponData.endDate))) {
    errors.push('End date is invalid');
  }
  
  if (couponData.startDate && couponData.endDate && 
      new Date(couponData.startDate) > new Date(couponData.endDate)) {
    errors.push('End date must be after start date');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  couponModel,
  validateCoupon,
  COUPON_TYPE
};