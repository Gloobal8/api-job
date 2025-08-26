const Permission = require("../models/Permission");

// Get permissions by role ID
exports.getPermissionsByRoleId = async (req, res) => {
  try {
    const { roleId } = req.params;
    // return res.status(200).json({
    //   success: true,
    //   data: {
    //     roleId: roleId
    //   }
    // });
    if (!roleId) {
      return res.status(400).json({
        success: false,
        message: "El ID del rol es requerido"
      });
    }

    const result = await Permission.getByRoleId(roleId);
    
    if (result.status) {
      res.json({
        success: true,
        data: result.data
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.message || "Error al obtener los permisos"
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener los permisos",
      error: error.message
    });
  }
};

// Get permission by role ID and menu ID
exports.getPermissionByRoleIdAndMenuId = async (req, res) => {
  try {
    const { roleId, menuId } = req.params;
    
    if (!roleId || !menuId) {
      return res.status(400).json({
        success: false,
        message: "El ID del rol y del menú son requeridos"
      });
    }

    const result = await Permission.getByRoleIdAndMenuId(roleId, menuId);
    
    if (result.status) {
      res.json({
        success: true,
        data: result.data
      });
    } else {
      res.status(404).json({
        success: false,
        message: result.message || "Permiso no encontrado"
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener el permiso",
      error: error.message
    });
  }
};

// Create or update a permission
exports.createOrUpdatePermission = async (req, res) => {
  try {
    const { roleId, menuId, menuName, level, permissions } = req.body;
    
    if (!roleId || !menuId || !menuName || !level || !permissions) {
      return res.status(400).json({
        success: false,
        message: "Todos los campos son requeridos"
      });
    }

    const permissionData = {
      roleId,
      menuId,
      menuName,
      level,
      permissions
    };

    const result = await Permission.create(permissionData);
    
    if (result.status) {
      res.status(201).json({
        success: true,
        message: result.message,
        data: result.data
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al crear/actualizar el permiso",
      error: error.message
    });
  }
};

// Update a permission
exports.updatePermission = async (req, res) => {
  try {
    const { roleId, menuId } = req.params;
    const { permissions } = req.body;
    
    if (!permissions) {
      return res.status(400).json({
        success: false,
        message: "Los permisos son requeridos"
      });
    }

    const result = await Permission.update(roleId, menuId, { permissions });
    
    if (result.status) {
      res.json({
        success: true,
        message: result.message
      });
    } else {
      res.status(404).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al actualizar el permiso",
      error: error.message
    });
  }
};

// Delete a permission
exports.deletePermission = async (req, res) => {
  try {
    const { roleId, menuId } = req.params;
    
    const result = await Permission.delete(roleId, menuId);
    
    if (result.status) {
      res.json({
        success: true,
        message: result.message
      });
    } else {
      res.status(404).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al eliminar el permiso",
      error: error.message
    });
  }
};

// Bulk create/update permissions for a role
exports.bulkCreatePermissions = async (req, res) => {
  try {
    const { roleId, permissions } = req.body;
    
    if (!roleId || !permissions || !Array.isArray(permissions)) {
      return res.status(400).json({
        success: false,
        message: "El ID del rol y un array de permisos son requeridos"
      });
    }

    // Agregar roleId a cada permiso
    const permissionsWithRoleId = permissions.map(permission => ({
      ...permission,
      roleId
    }));

    const result = await Permission.bulkCreate(permissionsWithRoleId);
    
    if (result.status) {
      res.status(201).json({
        success: true,
        message: result.message,
        data: result.data
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al crear/actualizar los permisos",
      error: error.message
    });
  }
};

// Delete all permissions for a role
exports.deletePermissionsByRoleId = async (req, res) => {
  try {
    const { roleId } = req.params;
    
    const result = await Permission.deleteByRoleId(roleId);
    
    if (result.status) {
      res.json({
        success: true,
        message: result.message
      });
    } else {
      res.status(404).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al eliminar los permisos del rol",
      error: error.message
    });
  }
};
