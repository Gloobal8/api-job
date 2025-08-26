const express = require("express");
const router = express.Router();
const permissionController = require("../controllers/permissionController");

// Get permissions by role ID
router.get("/role/:roleId", permissionController.getPermissionsByRoleId);

// Get permission by role ID and menu ID
router.get("/role/:roleId/menu/:menuId", permissionController.getPermissionByRoleIdAndMenuId);

// Create or update a permission
router.post("/create", permissionController.createOrUpdatePermission);

// Update a permission
router.put("/role/:roleId/menu/:menuId", permissionController.updatePermission);

// Delete a permission
router.delete("/role/:roleId/menu/:menuId", permissionController.deletePermission);

// Bulk create/update permissions for a role
router.post("/bulk-create", permissionController.bulkCreatePermissions);

// Delete all permissions for a role
router.delete("/role/:roleId", permissionController.deletePermissionsByRoleId);

module.exports = router;
