const Admin = require("../models/Admin");

// Get all admins
exports.getAllAdmins = async (req, res) => {
  try {
    const result = await Admin.getAll();
    if (result.status) {
      res.json(result.data);
    } else {
      res.status(500).json({ 
        success: false,
        message: result.message || "Error al obtener los administradores"
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Error al obtener los administradores",
      error: error.message 
    });
  }
};

// Get a single admin by ID
exports.getAdminById = async (req, res) => {
  try {
    const result = await Admin.getById(req.params.id);
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
      message: "Error al obtener el administrador",
      error: error.message 
    });
  }
};

// Create a new admin
exports.addAdmin = async (req, res) => {
  try {
    const { nombre, apellido, correo, rolId } = req.body;
    
    // Validar campos requeridos
    if (!nombre || !apellido || !correo || !rolId) {
      return res.status(400).json({
        success: false,
        message: "Todos los campos son requeridos (nombre, apellido, correo, rolId)"
      });
    }

    const result = await Admin.create({ nombre, apellido, correo, rolId });
    
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
      message: "Error al crear el administrador",
      error: error.message 
    });
  }
};

// Update an admin
exports.editAdmin = async (req, res) => {
  try {
    const { nombre, apellido, correo, rolId } = req.body;
    const result = await Admin.update(req.params.id, { nombre, apellido, correo, rolId });
    
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
      message: "Error al actualizar el administrador",
      error: error.message 
    });
  }
};

// Delete an admin (soft delete)
exports.deleteAdmin = async (req, res) => {
  try {
    const result = await Admin.delete(req.params.id);
    
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
      message: "Error al eliminar el administrador",
      error: error.message 
    });
  }
}; 