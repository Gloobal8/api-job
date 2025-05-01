const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Define path to JSON file for packages
const dataPath = path.join(__dirname, '../data/packages.json');

// Ensure the data directory exists
const dataDir = path.dirname(dataPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize packages file if it doesn't exist
if (!fs.existsSync(dataPath)) {
  fs.writeFileSync(dataPath, JSON.stringify([], 'utf8'));
}

// Package model definition
const packageModel = {
  // Required fields
  id: String,
  name: String,
  price: Number,
  duration: Number, // In days
  createdAt: String,
  updatedAt: String,
  
  // Features and limits
  features: [String],
  jobLimit: Number, // Number of jobs allowed to post
  featuredJobs: Number, // Number of featured job posts
  highlightedJobs: Number, // Number of highlighted job posts
  cvAccess: Boolean, // Access to CV database
  
  // Optional fields
  description: String,
  isPopular: Boolean,
  discountPercentage: Number,
  
  // Meta fields
  isActive: Boolean,
  order: Number,
  
  // CRUD Operations
  getAll: () => {
    try {
      const data = fs.readFileSync(dataPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading packages:', error);
      return [];
    }
  },

  // Get package by ID
  getById: (id) => {
    try {
      const packages = packageModel.getAll();
      return packages.find(pkg => pkg.id === id) || null;
    } catch (error) {
      console.error('Error getting package by ID:', error);
      return null;
    }
  },

  // Create new package
  create: (packageData) => {
    try {
      const packages = packageModel.getAll();
      const newPackage = {
        id: uuidv4(),
        name: packageData.name,
        description: packageData.description || '',
        price: packageData.price,
        features: packageData.features || [],
        duration: packageData.duration || 30, // Default 30 days
        jobLimit: packageData.jobLimit || 1,
        featuredJobs: packageData.featuredJobs || 0,
        highlightedJobs: packageData.highlightedJobs || 0,
        cvAccess: packageData.cvAccess || false,
        isPopular: packageData.isPopular || false,
        discountPercentage: packageData.discountPercentage || 0,
        isActive: packageData.isActive !== undefined ? packageData.isActive : true,
        order: packageData.order || packages.length + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      packages.push(newPackage);
      fs.writeFileSync(dataPath, JSON.stringify(packages, null, 2), 'utf8');
      return newPackage;
    } catch (error) {
      console.error('Error creating package:', error);
      return null;
    }
  },

  // Update package
  update: (id, packageData) => {
    try {
      const packages = packageModel.getAll();
      const index = packages.findIndex(pkg => pkg.id === id);
      
      if (index === -1) return null;
      
      const updatedPackage = {
        ...packages[index],
        ...packageData,
        updatedAt: new Date().toISOString()
      };
      
      packages[index] = updatedPackage;
      fs.writeFileSync(dataPath, JSON.stringify(packages, null, 2), 'utf8');
      return updatedPackage;
    } catch (error) {
      console.error('Error updating package:', error);
      return null;
    }
  },

  // Delete package
  delete: (id) => {
    try {
      const packages = packageModel.getAll();
      const filteredPackages = packages.filter(pkg => pkg.id !== id);
      
      if (filteredPackages.length === packages.length) return false;
      
      fs.writeFileSync(dataPath, JSON.stringify(filteredPackages, null, 2), 'utf8');
      return true;
    } catch (error) {
      console.error('Error deleting package:', error);
      return false;
    }
  },

  // Get active packages
  getActive: () => {
    try {
      const packages = packageModel.getAll();
      return packages.filter(pkg => pkg.isActive);
    } catch (error) {
      console.error('Error getting active packages:', error);
      return [];
    }
  },

  // Check if package has specific feature
  hasFeature: (packageId, featureName) => {
    try {
      const pkg = packageModel.getById(packageId);
      return pkg && pkg.features.includes(featureName);
    } catch (error) {
      console.error('Error checking package feature:', error);
      return false;
    }
  },

  // Calculate value (price per job)
  calculateValue: (packageId) => {
    try {
      const pkg = packageModel.getById(packageId);
      if (!pkg) return 0;
      
      const totalJobs = pkg.jobLimit;
      return totalJobs > 0 ? pkg.price / totalJobs : pkg.price;
    } catch (error) {
      console.error('Error calculating package value:', error);
      return 0;
    }
  },
  
  // Get packages sorted by price
  getSortedByPrice: (ascending = true) => {
    try {
      const packages = packageModel.getAll();
      return packages.sort((a, b) => {
        return ascending ? a.price - b.price : b.price - a.price;
      });
    } catch (error) {
      console.error('Error sorting packages by price:', error);
      return [];
    }
  },
  
  // Get packages sorted by popularity
  getPopular: () => {
    try {
      const packages = packageModel.getActive();
      return packages.filter(pkg => pkg.isPopular).sort((a, b) => a.order - b.order);
    } catch (error) {
      console.error('Error getting popular packages:', error);
      return [];
    }
  }
};

// Validate package data
const validatePackage = (packageData) => {
  const errors = [];
  
  if (!packageData.name) {
    errors.push('Package name is required');
  }
  
  if (packageData.price === undefined || packageData.price === null || isNaN(packageData.price)) {
    errors.push('Valid package price is required');
  }
  
  if (packageData.duration === undefined || isNaN(packageData.duration) || packageData.duration < 1) {
    errors.push('Duration must be at least 1 day');
  }
  
  if (packageData.jobLimit !== undefined && (isNaN(packageData.jobLimit) || packageData.jobLimit < 0)) {
    errors.push('Job limit must be a positive number');
  }
  
  if (packageData.featuredJobs !== undefined && (isNaN(packageData.featuredJobs) || packageData.featuredJobs < 0)) {
    errors.push('Featured jobs must be a positive number');
  }
  
  if (packageData.highlightedJobs !== undefined && (isNaN(packageData.highlightedJobs) || packageData.highlightedJobs < 0)) {
    errors.push('Highlighted jobs must be a positive number');
  }
  
  if (packageData.discountPercentage !== undefined && 
      (isNaN(packageData.discountPercentage) || 
       packageData.discountPercentage < 0 || 
       packageData.discountPercentage > 100)) {
    errors.push('Discount percentage must be between 0 and 100');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  packageModel,
  validatePackage
};