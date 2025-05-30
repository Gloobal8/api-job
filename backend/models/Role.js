const mongoose = require('mongoose');
const dbClient = require('../config/db');
const { ObjectId } = require('mongodb');

const roleSchema = new mongoose.Schema({
  nombreRol: {
    type: String,
    required: [true, 'El nombre del rol es requerido'],
    unique: true,
    trim: true,
    minlength: [3, 'El nombre del rol debe tener al menos 3 caracteres'],
    maxlength: [50, 'El nombre del rol no puede exceder los 50 caracteres']
  },
  descripcion: {
    type: String,
    trim: true,
    maxlength: [200, 'La descripción no puede exceder los 200 caracteres']
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
roleSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

class Role {
    static async getAll() {
        try {
            const rolesCollection = dbClient.db.collection('roles');
            const roles = await rolesCollection.find({ activo: true }).toArray();
            return {
                status: true,
                data: roles
            };
        } catch (error) {
            console.error('Error getting roles:', error);
            throw `Error/Role.js: ${error}`;
        }
    }

    static async getById(id) {
        try {
            const rolesCollection = dbClient.db.collection('roles');
            const role = await rolesCollection.findOne({ _id: id, activo: true });
            
            if (!role) {
                return {
                    status: false,
                    message: 'Rol no encontrado'
                };
            }

            return {
                status: true,
                data: role
            };
        } catch (error) {
            console.error('Error getting role:', error);
            throw `Error/Role.js: ${error}`;
        }
    }

    static async create(roleData) {
        try {
            const rolesCollection = dbClient.db.collection('roles');
            
            // Verificar si ya existe un rol con el mismo nombre
            const existingRole = await rolesCollection.findOne({ 
                nombreRol: roleData.nombreRol,
                activo: true 
            });

            if (existingRole) {
                return {
                    status: false,
                    message: 'Ya existe un rol con este nombre'
                };
            }

            // Preparar el documento a insertar
            const newRole = {
                ...roleData,
                activo: true,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            const result = await rolesCollection.insertOne(newRole);

            if (result.insertedId) {
                return {
                    status: true,
                    message: 'Rol creado exitosamente',
                    data: {
                        ...newRole,
                        _id: result.insertedId
                    }
                };
            }

            return {
                status: false,
                message: 'Error al crear el rol'
            };
        } catch (error) {
            console.error('Error creating role:', error);
            throw `Error/Role.js: ${error}`;
        }
    }

    static async update(id, roleData) {
        try {
            const rolesCollection = dbClient.db.collection('roles');
            console.log('Ejecutando update Role')

            // Verificar si existe el rol
            const existingRole = await rolesCollection.find({ "_id": new ObjectId(id), "activo": true})
           
            if (!existingRole) {
                return {
                    status: false,
                    message: 'Rol no encontrado'
                };
            }

            // Verificar si el nuevo nombre ya existe (si se está cambiando el nombre)
            if (roleData.nombreRol && roleData.nombreRol !== existingRole.nombreRol) {
                const duplicateRole = await rolesCollection.findOne({
                    nombreRol: roleData.nombreRol,
                    activo: true,
                    _id: { $ne: id }
                });

                if (duplicateRole) {
                    if (duplicateRole.descripcion === roleData.descripcion) {
                        return {
                            status: false,
                            message: 'Ya existe un rol con este nombre'
                        };
                    }
                }
            }

            // Actualizar el rol
            const updateData = {
                ...roleData,
                updatedAt: new Date()
            };

            const result = await rolesCollection.updateOne(
                { _id: new ObjectId(id), activo: true },
                { $set: updateData }
            );

            if (result.modifiedCount === 1) {
                return {
                    status: true,
                    message: 'Rol actualizado exitosamente',
                    data: {
                        _id: id,
                        ...updateData
                    }
                };
            }

            return {
                status: false,
                message: 'Error al actualizar el rol'
            };
        } catch (error) {
            console.error('Error updating role:', error);
            throw `Error/Role.js: ${error}`;
        }
    }

    static async delete(id) {
        try {
            const rolesCollection = dbClient.db.collection('roles');

            // Verificar si existe el rol
            const existingRole = await rolesCollection.findOne({ _id: new ObjectId(id), activo: true });
            if (!existingRole) {
                return {
                    status: false,
                    message: 'Rol no encontrado'
                };
            }

            // Soft delete
            const result = await rolesCollection.updateOne(
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
                    message: 'Rol eliminado exitosamente'
                };
            }

            return {
                status: false,
                message: 'Error al eliminar el rol'
            };
        } catch (error) {
            console.error('Error deleting role:', error);
            throw `Error/Role.js: ${error}`;
        }
    }
}

module.exports = mongoose.model('Role', roleSchema);
module.exports = Role; 