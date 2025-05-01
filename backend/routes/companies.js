// Company routes
const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes
router.get('/', companyController.getAllCompanies);
router.get('/:id', companyController.getCompanyById);
router.get('/:id/stats', companyController.getCompanyStats);

// Protected routes
router.post('/', authMiddleware.verifyToken, companyController.createCompany);
router.put('/:id', authMiddleware.verifyToken, companyController.updateCompany);
router.delete('/:id', authMiddleware.verifyToken, companyController.deleteCompany);

// Analytics and data management routes
router.get('/:id/analytics', authMiddleware.verifyToken, companyController.getCompanyAnalytics);
router.get('/:id/export', authMiddleware.verifyToken, companyController.exportCompanyData);
router.post('/:id/import', authMiddleware.verifyToken, companyController.importCompanyData);
router.put('/:id/profile', authMiddleware.verifyToken, companyController.updateCompanyProfile);

// Predictive analytics route
router.get('/:id/predictions', authMiddleware.verifyToken, companyController.getPredictiveAnalytics);

// Export all routes
module.exports = router;