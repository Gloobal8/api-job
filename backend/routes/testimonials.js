const express = require("express");
const router = express.Router();
const testimonialController = require("../controllers/testimonialController");
const authMiddleware = require("../middleware/authMiddleware");

// Rutas públicas
router.get("/", testimonialController.getAllTestimonials);
router.get("/featured", testimonialController.getFeaturedTestimonials);
router.get("/:id", testimonialController.getTestimonialById);

// Rutas protegidas
router.post("/", authMiddleware.verifyToken, testimonialController.createTestimonial);
router.put("/:id", authMiddleware.verifyToken, testimonialController.updateTestimonial);
router.delete("/:id", authMiddleware.verifyToken, testimonialController.deleteTestimonial);

// Rutas solo para admin
router.patch(
  "/:id/approve",
  authMiddleware.verifyToken,
  authMiddleware.isAdmin,
  testimonialController.approveTestimonial
);
router.patch(
  "/:id/feature",
  authMiddleware.verifyToken,
  authMiddleware.isAdmin,
  testimonialController.featureTestimonial
);
router.patch(
  "/:id/unfeature",
  authMiddleware.verifyToken,
  authMiddleware.isAdmin,
  testimonialController.unfeatureTestimonial
);

module.exports = router;
