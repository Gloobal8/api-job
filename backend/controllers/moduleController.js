const Module = require('../models/Module');

// Obtener todos los módulos con estructura jerárquica
const getAllModules = async (req, res) => {
  try {
    const result = await Module.getAll();
    if (result.status) {
      res.json(result.data);
    } else {
      res.status(500).json({ 
        success: false,
        message: result.message || "Error al obtener los módulos"
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Error al obtener los módulos",
      error: error.message 
    });
  }
};

// Crear un nuevo módulo
const createModule = async (req, res) => {
  try {
    const { nombre, descripcion, parentId } = req.body;
    
    if (!nombre) {
      return res.status(400).json({
        success: false,
        message: "El nombre del módulo es requerido"
      });
    }

    const result = await Module.create({ nombre, descripcion, parentId });
    
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
      message: "Error al crear el módulo",
      error: error.message 
    });
  }
};

// Actualizar un módulo
const updateModule = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    const result = await Module.update(req.params.id, { nombre, descripcion });
    
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
      message: "Error al actualizar el módulo",
      error: error.message 
    });
  }
};

// Eliminar un módulo (soft delete)
const deleteModule = async (req, res) => {
  try {
    const result = await Module.delete(req.params.id);
    
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
      message: "Error al eliminar el módulo",
      error: error.message 
    });
  }
};

module.exports = {
  getAllModules,
  createModule,
  updateModule,
  deleteModule
}; 