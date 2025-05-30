const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { verifyToken } = require("../middleware/authMiddleware");

// Register a new user
router.post("/register", authController.register);

// User login
router.post("/login", authController.login);

// Confirm your email
router.post("/verify-email", authController.verifyEmail);
router.post("/resend-verification", authController.resendVerification);
router.get("/getAllUsers", authController.getAllUsers);

// Get current user info (protected route)
router.get("/me", verifyToken, authController.getCurrentUser);

module.exports = router;