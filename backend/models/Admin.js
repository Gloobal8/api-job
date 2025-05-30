const mongoose = require('mongoose');
const dbClient = require('../config/db');
const { ObjectId } = require('mongodb');

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

      // Preparar el documento a insertar
      const newAdmin = {
        ...adminData,
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

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
}

module.exports = mongoose.model('Admin', adminSchema);
module.exports = Admin; 