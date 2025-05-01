const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');
const { authenticateJWT, isAdmin } = require('../middleware/authMiddleware');

// Public routes
router.get('/validate/:code', couponController.validateCouponForUse);
router.get('/apply/:code', couponController.applyCoupon);

// Protected routes (admin only)
router.get('/', authenticateJWT, isAdmin, couponController.getAllCoupons);
router.get('/active', authenticateJWT, isAdmin, couponController.getActiveCoupons);
router.get('/generate-code', authenticateJWT, isAdmin, couponController.generateCouponCode);
router.get('/:id', authenticateJWT, isAdmin, couponController.getCouponById);
router.get('/code/:code', authenticateJWT, isAdmin, couponController.getCouponByCode);
router.post('/', authenticateJWT, isAdmin, couponController.createCoupon);
router.put('/:id', authenticateJWT, isAdmin, couponController.updateCoupon);
router.delete('/:id', authenticateJWT, isAdmin, couponController.deleteCoupon);
router.post('/:code/record-usage', authenticateJWT, couponController.recordCouponUsage);

module.exports = router;