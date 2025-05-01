const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(verifyToken);

// Get all users (admin only)
router.get('/', isAdmin, userController.getAllUsers);

// Get user by ID
router.get('/:id', userController.getUserById);

// Update user
router.put('/:id', userController.updateUser);

// Change password
router.put('/:id/change-password', userController.changePassword);

// Education routes
router.get('/:id/education', userController.getUserById);
router.put('/:id/education', userController.updateEducation);

// Experience routes
router.get('/:id/experience', userController.getUserById);
router.put('/:id/experience', userController.updateExperience);

// Transaction routes
router.get('/:id/transactions', userController.getTransactions);

// Credits routes
router.post('/:id/credits', isAdmin, userController.updateCredits);

// Delete user
router.delete('/:id', userController.deleteUser);

module.exports = router;