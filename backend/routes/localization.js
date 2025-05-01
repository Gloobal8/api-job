const express = require("express");
const router = express.Router();
const localizationController = require("../controllers/localizationController");
const authMiddleware = require("../middleware/authMiddleware");

// Rutas públicas
router.get("/languages", localizationController.getAllLanguages);
router.get("/languages/default", localizationController.getDefaultLanguage);
router.get("/languages/:id", localizationController.getLanguageById);
router.get("/translations/:lang", localizationController.getTranslations);

// Rutas protegidas (solo admin)
router.post(
  "/languages",
  authMiddleware.verifyToken,
  authMiddleware.isAdmin,
  localizationController.createLanguage
);
router.put(
  "/languages/:id",
  authMiddleware.verifyToken,
  authMiddleware.isAdmin,
  localizationController.updateLanguage
);
router.delete(
  "/languages/:id",
  authMiddleware.verifyToken,
  authMiddleware.isAdmin,
  localizationController.deleteLanguage
);
router.put(
  "/translations/:lang",
  authMiddleware.verifyToken,
  authMiddleware.isAdmin,
  localizationController.updateTranslations
);

module.exports = router;
