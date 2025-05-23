const Role = require("../models/Role");

// Get all roles
exports.getAllRoles = async (req, res) => {
  try {
    const result = await Role.getAll();
    if (result.status) {
      res.json(result.data);
    } else {
      res.status(500).json({ 
        success: false,
        message: result.message || "Error al obtener los roles"
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Error al obtener los roles",
      error: error.message 
    });
  }
};

// Get a single role by ID
exports.getRoleById = async (req, res) => {
  try {
    const result = await Role.getById(req.params.id);
    if (result.status) {
      res.json(result.data);
    } else {
      res.status(404).json({ 
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Error al obtener el rol",
      error: error.message 
    });
  }
};

// Create a new role
exports.addRole = async (req, res) => {
  try {
    const { nombreRol, descripcion } = req.body;
    if (!nombreRol) {
      return res.status(400).json({
        success: false,
        message: "El nombre del rol es requerido"
      });
    }

    const result = await Role.create({ nombreRol, descripcion });
    
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
      message: "Error al crear el rol",
      error: error.message 
    });
  }
};

// Update a role
exports.editRole = async (req, res) => {
  try {
    const { nombreRol, descripcion } = req.body;
    const result = await Role.update(req.params.id, { nombreRol, descripcion });
    
    if (result.status) {
      res.json({
        success: true,
        message: result.message,
        data: result.data
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
      message: "Error al actualizar el rol",
      error: error.message 
    });
  }
};

// Delete a role (soft delete)
exports.deleteRole = async (req, res) => {
  try {
    const result = await Role.delete(req.params.id);
    
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
      message: "Error al eliminar el rol",
      error: error.message 
    });
  }
};