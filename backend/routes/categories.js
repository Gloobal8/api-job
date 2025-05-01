// Category routes
const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);

// Protected routes (admin only)
router.post('/', authMiddleware.verifyToken, categoryController.createCategory);
router.put('/:id', authMiddleware.verifyToken, categoryController.updateCategory);
router.delete('/:id', authMiddleware.verifyToken, categoryController.deleteCategory);

module.exports = router;