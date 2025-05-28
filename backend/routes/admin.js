const express = require("express");
const router = express.Router();
const roleController = require("../controllers/roleController");
const adminController = require("../controllers/adminController");

// Role routes
router.get("/rols", roleController.getAllRoles); // Get all roles
router.get("/rols/:id", roleController.getRoleById); // Get a single role
router.post("/rols/create", roleController.addRole); // Create a new role
router.put("/rols/:id", roleController.editRole); // Update an existing role
router.delete("/rols/:id", roleController.deleteRole); // Delete a role

// Admin routes
router.get("/admins", adminController.getAllAdmins);
router.get("/admins/:id", adminController.getAdminById);
router.post("/admins/create", adminController.addAdmin);
router.put("/admins/:id", adminController.editAdmin);
router.delete("/admins/:id", adminController.deleteAdmin);

module.exports = router;