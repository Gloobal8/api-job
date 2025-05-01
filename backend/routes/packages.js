const express = require("express");
const router = express.Router();
const packageController = require("../controllers/packageController");
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");

// Public routes
router.get("/", packageController.getActivePackages);
router.get("/popular", packageController.getPopularPackages);
router.get("/by-price", packageController.getPackagesByPrice);
router.get("/:id", packageController.getPackageById);
router.get("/:id/value", packageController.getPackageValue);

// Protected routes (admin only)
router.get(
  "/admin/all",
  verifyToken,
  isAdmin,
  packageController.getAllPackages
);
router.post("/", verifyToken, isAdmin, packageController.createPackage);
router.put("/:id", verifyToken, isAdmin, packageController.updatePackage);
router.delete("/:id", verifyToken, isAdmin, packageController.deletePackage);
router.patch(
  "/:id/toggle-status",
  verifyToken,
  isAdmin,
  packageController.togglePackageStatus
);

module.exports = router;
