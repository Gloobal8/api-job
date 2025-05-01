const express = require("express");
const router = express.Router();
const customFieldController = require("../controllers/customFieldController");
const authMiddleware = require("../middleware/authMiddleware");

// Rutas públicas
router.get("/", customFieldController.getAllCustomFields);
router.get("/:id", customFieldController.getCustomFieldById);
router.get("/entity/:entity", customFieldController.getCustomFieldsByEntity);

// Rutas protegidas (solo admin)
router.post("/", authMiddleware.verifyToken, authMiddleware.isAdmin, customFieldController.createCustomField);
router.put("/:id", authMiddleware.verifyToken, authMiddleware.isAdmin, customFieldController.updateCustomField);
router.delete("/:id", authMiddleware.verifyToken, authMiddleware.isAdmin, customFieldController.deleteCustomField);

module.exports = router;