const mongoose = require('mongoose');
const dbClient = require('../config/db');
const { ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true,
    minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
    maxlength: [50, 'El nombre no puede exceder los 50 caracteres']
  },
  apellido: {
    type: String,
    required: [true, 'El apellido es requerido'],
    trim: true,
    minlength: [2, 'El apellido debe tener al menos 2 caracteres'],
    maxlength: [50, 'El apellido no puede exceder los 50 caracteres']
  },
  correo: {
    type: String,
    required: [true, 'El correo es requerido'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Por favor ingrese un correo válido']
  },
  rolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    required: [true, 'El rol es requerido']
  },
  password: {
    type: String,
    required: false // Solo requerido al crear
  },
  activo: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware para actualizar updatedAt antes de cada actualización
adminSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

class Admin {
  static async getAll() {
    try {
      const adminsCollection = dbClient.db.collection('admins');
      console.log({
        archive: 'backend/models/Admin.js',
        data: await adminsCollection.find({
          activo: true
        }).toArray()
      })
      const admins = await adminsCollection.find({
        activo: true
      }).toArray()

      if (!admins) {
        return {
          status: false,
          message: 'No se encontraron administradores'
        };
      }

      return {
        status: true,
        data: admins
      };
    } catch (error) {
      console.error('Error getting admin:', error);
      throw `Error/Admin.js: ${error}`;
    }
  }

  static async create(adminData) {
    try {
      const adminsCollection = dbClient.db.collection('admins');
      
      // Verificar si ya existe un admin con el mismo correo
      const existingAdmin = await adminsCollection.findOne({ 
        correo: adminData.correo.toLowerCase(),
        activo: true 
      });

      if (existingAdmin) {
        return {
          status: false,
          message: 'Ya existe un administrador con este correo'
        };
      }

      // Hash de la contraseña si viene en adminData
      let hashedPassword = undefined;
      if (adminData.password) {
        hashedPassword = await bcrypt.hash(adminData.password, 10);
      }
      // Preparar el documento a insertar
      const newAdmin = {
        ...adminData,
        password: hashedPassword,
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      // No guardar el campo password si no se provee
      if (!adminData.password) {
        delete newAdmin.password;
      }

      const result = await adminsCollection.insertOne(newAdmin);

      if (result.insertedId) {
        return {
          status: true,
          message: 'Administrador creado exitosamente',
          data: {
            ...newAdmin,
            _id: result.insertedId
          }
        };
      }

      return {
        status: false,
        message: 'Error al crear el administrador'
      };
    } catch (error) {
      console.error('Error creating admin:', error);
      throw `Error/Admin.js: ${error}`;
    }
  }

  static async update(id, adminData) {
    try {
      const adminsCollection = dbClient.db.collection('admins');

      // Verificar si existe el admin
      const existingAdmin = await adminsCollection.findOne({ 
        _id: new ObjectId(id),
        activo: true 
      });
      console.log({
        archive: 'backend/models/Admin.js',
        data: existingAdmin
      })

      if (!existingAdmin) {
        return {
          status: false,
          message: 'Administrador no encontrado'
        };
      }

      // Verificar si el correo ya existe (si se está actualizando)
      if (adminData.correo) {
        const duplicateEmail = await adminsCollection.findOne({
          _id: { $ne: new ObjectId(id) },
          correo: adminData.correo.toLowerCase(),
          activo: true
        });

        if (duplicateEmail) {
          return {
            status: false,
            message: 'Ya existe un administrador con este correo'
          };
        }
      }

      // Convertir el rolId a ObjectId si está presente
      // if (adminData.rolId) {
      //   adminData.rolId = new ObjectId(adminData.rolId);
      // }

      const updateData = {
        ...adminData,
        updatedAt: new Date()
      };

      const result = await adminsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );

      if (result.modifiedCount === 1) {
        return {
          status: true,
          message: 'Administrador actualizado exitosamente',
          data: {
            _id: id,
            ...updateData
          }
        };
      }

      return {
        status: false,
        message: 'Error al actualizar el administrador'
      };
    } catch (error) {
      console.error('Error updating admin:', error);
      throw `Error/Admin.js: ${error}`;
    }
  }

  static async delete(id) {
    try {
      const adminsCollection = dbClient.db.collection('admins');

      // Verificar si existe el admin
      const existingAdmin = await adminsCollection.findOne({ 
        _id: new ObjectId(id),
        activo: true 
      });

      if (!existingAdmin) {
        return {
          status: false,
          message: 'Administrador no encontrado'
        };
      }

      // Soft delete
      const result = await adminsCollection.updateOne(
        { _id: new ObjectId(id) },
        { 
          $set: { 
            activo: false,
            updatedAt: new Date()
          }
        }
      );

      if (result.modifiedCount === 1) {
        return {
          status: true,
          message: 'Administrador eliminado exitosamente'
        };
      }

      return {
        status: false,
        message: 'Error al eliminar el administrador'
      };
    } catch (error) {
      console.error('Error deleting admin:', error);
      throw `Error/Admin.js: ${error}`;
    }
  }

  static async verifyEmail(email) {
    try {
      const adminsCollection = dbClient.db.collection('admins');
      const admin = await adminsCollection.findOne({ correo: email.toLowerCase(), activo: true });
      if (!admin) {
        return { status: false, message: 'Administrador no encontrado' };
      }
      if (admin.verified) {
        return { status: true, message: 'El correo ya ha sido verificado', data: admin };
      }
      await adminsCollection.updateOne({ correo: email.toLowerCase() }, { $set: { verified: true, updatedAt: new Date() } });
      return { status: true, message: 'Correo de administrador verificado exitosamente', data: { ...admin, verified: true } };
    } catch (error) {
      return { status: false, message: 'Error al verificar el correo de administrador', error };
    }
  }

  static async resendVerification(email) {
    try {
      const adminsCollection = dbClient.db.collection('admins');
      const admin = await adminsCollection.findOne({ correo: email.toLowerCase(), activo: true });
      if (!admin) {
        return { status: false, message: 'Administrador no encontrado' };
      }
      if (admin.verified) {
        return { status: true, message: 'El correo ya ha sido verificado', data: admin };
      }
      // Generar token de verificación
      const jwt = require('jsonwebtoken');
      const token = jwt.sign({ to: email }, process.env.JWT_SECRET, { expiresIn: '1d' });
      // Enviar email
      const sendMail = require('../utils/sendMail');
      const templateEmail = require('../utils/templateEmail');
      const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:8080'}/admins/verify-email?token=${token}&to=${encodeURIComponent(email)}`;
      const html = templateEmail.getVerificationEmail({ name: admin.nombre, url: verificationUrl });
      await sendMail(email, 'Verifica tu correo de administrador', html);
      return { status: true, message: 'Correo de verificación enviado', previewUrl: verificationUrl };
    } catch (error) {
      return { status: false, message: 'Error al reenviar el correo de verificación', error };
    }
  }
}

module.exports = mongoose.model('Admin', adminSchema);
module.exports = Admin; 