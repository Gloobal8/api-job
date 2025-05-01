const { packageModel, validatePackage } = require('../models/package');

// Package controller
const packageController = {
  // Get all packages
  getAllPackages: (req, res) => {
    try {
      const packages = packageModel.getAll();
      res.status(200).json({ success: true, data: packages });
    } catch (error) {
      console.error('Error fetching packages:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch packages' });
    }
  },

  // Get active packages
  getActivePackages: (req, res) => {
    try {
      const packages = packageModel.getActive();
      res.status(200).json({ success: true, data: packages });
    } catch (error) {
      console.error('Error fetching active packages:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch active packages' });
    }
  },

  // Get package by ID
  getPackageById: (req, res) => {
    try {
      const { id } = req.params;
      const pkg = packageModel.getById(id);
      
      if (!pkg) {
        return res.status(404).json({ success: false, message: 'Package not found' });
      }
      
      res.status(200).json({ success: true, data: pkg });
    } catch (error) {
      console.error('Error fetching package:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch package' });
    }
  },

  // Create package
  createPackage: (req, res) => {
    try {
      const validation = validatePackage(req.body);
      
      if (!validation.isValid) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid package data', 
          errors: validation.errors 
        });
      }
      
      const newPackage = packageModel.create(req.body);
      res.status(201).json({ success: true, data: newPackage });
    } catch (error) {
      console.error('Error creating package:', error);
      res.status(500).json({ success: false, message: 'Failed to create package' });
    }
  },

  // Update package
  updatePackage: (req, res) => {
    try {
      const { id } = req.params;
      const validation = validatePackage(req.body);
      
      if (!validation.isValid) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid package data', 
          errors: validation.errors 
        });
      }
      
      const updatedPackage = packageModel.update(id, req.body);
      
      if (!updatedPackage) {
        return res.status(404).json({ success: false, message: 'Package not found' });
      }
      
      res.status(200).json({ success: true, data: updatedPackage });
    } catch (error) {
      console.error('Error updating package:', error);
      res.status(500).json({ success: false, message: 'Failed to update package' });
    }
  },

  // Delete package
  deletePackage: (req, res) => {
    try {
      const { id } = req.params;
      const result = packageModel.delete(id);
      
      if (!result) {
        return res.status(404).json({ success: false, message: 'Package not found' });
      }
      
      res.status(200).json({ success: true, message: 'Package deleted successfully' });
    } catch (error) {
      console.error('Error deleting package:', error);
      res.status(500).json({ success: false, message: 'Failed to delete package' });
    }
  },

  // Get packages sorted by price
  getPackagesByPrice: (req, res) => {
    try {
      const { order } = req.query;
      const ascending = order !== 'desc';
      
      const packages = packageModel.getSortedByPrice(ascending);
      res.status(200).json({ success: true, data: packages });
    } catch (error) {
      console.error('Error fetching packages by price:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch packages' });
    }
  },

  // Get popular packages
  getPopularPackages: (req, res) => {
    try {
      const packages = packageModel.getPopular();
      res.status(200).json({ success: true, data: packages });
    } catch (error) {
      console.error('Error fetching popular packages:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch popular packages' });
    }
  },

  // Toggle package active status
  togglePackageStatus: (req, res) => {
    try {
      const { id } = req.params;
      const pkg = packageModel.getById(id);
      
      if (!pkg) {
        return res.status(404).json({ success: false, message: 'Package not found' });
      }
      
      const updatedPackage = packageModel.update(id, { isActive: !pkg.isActive });
      res.status(200).json({ success: true, data: updatedPackage });
    } catch (error) {
      console.error('Error toggling package status:', error);
      res.status(500).json({ success: false, message: 'Failed to toggle package status' });
    }
  },

  // Calculate package value
  getPackageValue: (req, res) => {
    try {
      const { id } = req.params;
      const value = packageModel.calculateValue(id);
      
      if (value === 0) {
        return res.status(404).json({ success: false, message: 'Package not found' });
      }
      
      res.status(200).json({ success: true, data: { value } });
    } catch (error) {
      console.error('Error calculating package value:', error);
      res.status(500).json({ success: false, message: 'Failed to calculate package value' });
    }
  }
};

module.exports = packageController;