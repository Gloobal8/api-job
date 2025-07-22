const Admin = require("../models/Admin");
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const SendMail = require('../utils/sendMail');
const templateEmail = require('../utils/templateEmail');

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
    const { nombre, apellido, correo, rolId, password, confirmPassword } = req.body;
    
    // Validar campos requeridos
    if (!nombre || !apellido || !correo || !rolId) {
      return res.status(400).json({
        success: false,
        message: "Todos los campos son requeridos (nombre, apellido, correo, rolId)"
      });
    }
    // Validar contraseña solo al crear
    if (!password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "La contraseña y la verificación son requeridas"
      });
    }
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "La contraseña debe tener al menos 6 caracteres"
      });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Las contraseñas no coinciden"
      });
    }

    const result = await Admin.create({ nombre, apellido, correo, rolId, password });
    
    if (result.status) {
      // Enviar email de verificación automáticamente
      let emailWarning = '';
      try {
        await SendMail.sendMail(correo, 'Verifica tu correo de administrador', nombre, '/admins/verify-email');
      } catch (mailError) {
        console.error('Error enviando el correo de verificación:', mailError);
        emailWarning = ' (Administrador creado, pero no se pudo enviar el correo de verificación. Contacte al soporte.)';
      }
      res.status(201).json({
        success: true,
        message: result.message + '. Se ha enviado un correo de verificación.' + emailWarning,
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

// Verificar email de administrador
exports.verifyAdminEmail = (req, res) => {
  const token = req.body.token;
  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(201).send({
        type: 'expired',
        message: 'Token de verificación inválido o expirado.',
        status: false
      });
    }
    const email = decoded.to;
    const adminModel = await Admin.verifyEmail(email);
    res.status(201).json(adminModel);
  });
};

// Reenviar verificación de email de administrador
exports.resendAdminVerification = async (req, res) => {
  const email = req.body.email;
  const data = await Admin.resendVerification(email);
  res.status(201).json(data);
}; 