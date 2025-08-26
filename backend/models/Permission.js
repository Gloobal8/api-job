const mongoose = require('mongoose');
const dbClient = require('../config/db');
const { ObjectId } = require('mongodb');

const permissionSchema = new mongoose.Schema({
  roleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    required: [true, 'El ID del rol es requerido']
  },
  menuId: {
    type: Number,
    required: [true, 'El ID del menú es requerido']
  },
  menuName: {
    type: String,
    required: [true, 'El nombre del menú es requerido']
  },
  level: {
    type: Number,
    required: [true, 'El nivel del menú es requerido']
  },
  permissions: {
    view: {
      type: Boolean,
      default: false
    },
    add: {
      type: Boolean,
      default: false
    },
    edit: {
      type: Boolean,
      default: false
    },
    delete: {
      type: Boolean,
      default: false
    },
    all: {
      type: Boolean,
      default: false
    }
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
permissionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Índice compuesto para roleId y menuId
permissionSchema.index({ roleId: 1, menuId: 1 }, { unique: true });

class Permission {
  static async getByRoleId(roleId) {
    try {
      const permissionsCollection = dbClient.db.collection('permissions');
      const permissions = await permissionsCollection.find({ 
        roleId: new ObjectId(roleId), 
        activo: true 
      }).toArray();
      
      return {
        status: true,
        data: permissions
      };
    } catch (error) {
      console.error('Error getting permissions by role ID:', error);
      throw `Error/Permission.js: ${error}`;
    }
  }

  static async getByRoleIdAndMenuId(roleId, menuId) {
    try {
      const permissionsCollection = dbClient.db.collection('permissions');
      const permission = await permissionsCollection.findOne({ 
        roleId: new ObjectId(roleId), 
        menuId: menuId,
        activo: true 
      });
      
      return {
        status: true,
        data: permission
      };
    } catch (error) {
      console.error('Error getting permission by role ID and menu ID:', error);
      throw `Error/Permission.js: ${error}`;
    }
  }

  static async create(permissionData) {
    try {
      const permissionsCollection = dbClient.db.collection('permissions');
      
      // Verificar si ya existe un permiso para este rol y menú
      const existingPermission = await permissionsCollection.findOne({ 
        roleId: new ObjectId(permissionData.roleId), 
        menuId: permissionData.menuId,
        activo: true 
      });

      if (existingPermission) {
        // Actualizar el permiso existente
        const result = await permissionsCollection.updateOne(
          { _id: existingPermission._id },
          { 
            $set: { 
              ...permissionData,
              updatedAt: new Date()
            }
          }
        );

        if (result.modifiedCount === 1) {
          return {
            status: true,
            message: 'Permiso actualizado exitosamente'
          };
        }
      } else {
        // Crear nuevo permiso
        const newPermission = {
          ...permissionData,
          roleId: new ObjectId(permissionData.roleId),
          activo: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        const result = await permissionsCollection.insertOne(newPermission);

        if (result.insertedId) {
          return {
            status: true,
            message: 'Permiso creado exitosamente',
            data: {
              ...newPermission,
              _id: result.insertedId
            }
          };
        }
      }

      return {
        status: false,
        message: 'Error al crear/actualizar el permiso'
      };
    } catch (error) {
      console.error('Error creating/updating permission:', error);
      throw `Error/Permission.js: ${error}`;
    }
  }

  static async update(roleId, menuId, permissionData) {
    try {
      const permissionsCollection = dbClient.db.collection('permissions');
      
      const result = await permissionsCollection.updateOne(
        { 
          roleId: new ObjectId(roleId), 
          menuId: menuId,
          activo: true 
        },
        { 
          $set: { 
            ...permissionData,
            updatedAt: new Date()
          }
        }
      );

      if (result.modifiedCount === 1) {
        return {
          status: true,
          message: 'Permiso actualizado exitosamente'
        };
      }

      return {
        status: false,
        message: 'Permiso no encontrado'
      };
    } catch (error) {
      console.error('Error updating permission:', error);
      throw `Error/Permission.js: ${error}`;
    }
  }

  static async delete(roleId, menuId) {
    try {
      const permissionsCollection = dbClient.db.collection('permissions');
      
      const result = await permissionsCollection.updateOne(
        { 
          roleId: new ObjectId(roleId), 
          menuId: menuId,
          activo: true 
        },
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
          message: 'Permiso eliminado exitosamente'
        };
      }

      return {
        status: false,
        message: 'Permiso no encontrado'
      };
    } catch (error) {
      console.error('Error deleting permission:', error);
      throw `Error/Permission.js: ${error}`;
    }
  }

  static async deleteByRoleId(roleId) {
    try {
      const permissionsCollection = dbClient.db.collection('permissions');
      
      const result = await permissionsCollection.updateMany(
        { 
          roleId: new ObjectId(roleId), 
          activo: true 
        },
        { 
          $set: { 
            activo: false,
            updatedAt: new Date()
          }
        }
      );

      return {
        status: true,
        message: `${result.modifiedCount} permisos eliminados exitosamente`
      };
    } catch (error) {
      console.error('Error deleting permissions by role ID:', error);
      throw `Error/Permission.js: ${error}`;
    }
  }

  static async bulkCreate(permissionsData) {
    try {
      const permissionsCollection = dbClient.db.collection('permissions');
      
      // Preparar los permisos para inserción/actualización
      const operations = permissionsData.map(permission => ({
        updateOne: {
          filter: { 
            roleId: new ObjectId(permission.roleId), 
            menuId: permission.menuId 
          },
          update: {
            $set: {
              ...permission,
              roleId: new ObjectId(permission.roleId),
              activo: true,
              updatedAt: new Date()
            }
          },
          upsert: true
        }
      }));

      const result = await permissionsCollection.bulkWrite(operations);

      return {
        status: true,
        message: `${result.upsertedCount} permisos creados, ${result.modifiedCount} permisos actualizados`,
        data: result
      };
    } catch (error) {
      console.error('Error bulk creating permissions:', error);
      throw `Error/Permission.js: ${error}`;
    }
  }
}

const PermissionModel = mongoose.model('Permission', permissionSchema);
module.exports = Permission;
