const express = require("express");
const router = express.Router();
const roleController = require("../controllers/roleController");

// Role routes
router.get("/rols", roleController.getAllRoles); // Get all roles
router.get("/rols/:id", roleController.getRoleById); // Get a single role
router.post("/rols/create", roleController.addRole); // Create a new role
router.put("/rols/:id", roleController.editRole); // Update an existing role
router.delete("/rols/:id", roleController.deleteRole); // Delete a role

module.exports = router;