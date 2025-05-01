const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const authMiddleware = require("../middleware/authMiddleware");

// Rutas públicas
router.get("/", reviewController.getAllReviews);
router.get("/:id", reviewController.getReviewById);
router.get(
  "/entity/:entityType/:entityId",
  reviewController.getReviewsByEntity
);
router.get("/rating/:entityType/:entityId", reviewController.getAverageRating);
router.get(
  "/distribution/:entityType/:entityId",
  reviewController.getRatingDistribution
);

// Rutas protegidas
router.post("/", authMiddleware.verifyToken, reviewController.createReview);
router.put("/:id", authMiddleware.verifyToken, reviewController.updateReview);
router.delete("/:id", authMiddleware.verifyToken, reviewController.deleteReview);
router.post("/:id/helpful", authMiddleware.verifyToken, reviewController.markAsHelpful);
router.post("/:id/report", authMiddleware.verifyToken, reviewController.reportReview);

// Rutas solo para admin
router.patch("/:id/approve", authMiddleware.verifyToken, authMiddleware.isAdmin, reviewController.approveReview);

module.exports = router;
