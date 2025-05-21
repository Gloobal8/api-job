const express = require("express");
const router = express.Router();
const roleController = require("../controllers/roleController");

// Role routes
router.get("/", roleController.getAllRoles); // Get all rols
router.post("/create", roleController.addRole); // Create a new role
// router.put("/rols/:id", roleController.editRole); // Update an existing role
// router.delete("/rols/:id", roleController.deleteRole); // Delete a role

module.exports = router;