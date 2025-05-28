const mongoose = require('mongoose');
const dbClient = require('../config/db');
const { ObjectId } = require('mongodb');

const moduleSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre del módulo es requerido'],
    trim: true,
    minlength: [3, 'El nombre del módulo debe tener al menos 3 caracteres'],
    maxlength: [50, 'El nombre del módulo no puede exceder los 50 caracteres']
  },
  descripcion: {
    type: String,
    trim: true,
    maxlength: [200, 'La descripción no puede exceder los 200 caracteres']
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  nivel: {
    type: Number,
    default: 0
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

class Module {
  static async getAll() {
    try {
      const modulesCollection = dbClient.db.collection('modules');
      const rootModules = await modulesCollection.find({ parentId: null, activo: true }).toArray();
      
      const getNestedModules = async (modules) => {
        const nestedModules = [];
        
        for (const module of modules) {
          const submodules = await modulesCollection.find({ parentId: module._id, activo: true }).toArray();
          const moduleData = { ...module };
          
          if (submodules.length > 0) {
            moduleData.submodules = await getNestedModules(submodules);
          }
          
          nestedModules.push(moduleData);
        }
        
        return nestedModules;
      };

      const modulesWithNesting = await getNestedModules(rootModules);
      return {
        status: true,
        data: modulesWithNesting
      };
    } catch (error) {
      console.error('Error getting modules:', error);
      throw `Error/Module.js: ${error}`;
    }
  }

  static async create(moduleData) {
    try {
      const modulesCollection = dbClient.db.collection('modules');
      
      // Calcular el nivel basado en el padre
      let nivel = 0;
      if (moduleData.parentId) {
        const parentModule = await modulesCollection.findOne({ 
          _id: new ObjectId(moduleData.parentId),
          activo: true 
        });
        
        if (!parentModule) {
          return {
            status: false,
            message: 'Módulo padre no encontrado'
          };
        }
        nivel = parentModule.nivel + 1;
      }

      // Preparar el documento a insertar
      const newModule = {
        ...moduleData,
        nivel,
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      if (moduleData.parentId) {
        newModule.parentId = new ObjectId(moduleData.parentId);
      }

      const result = await modulesCollection.insertOne(newModule);

      if (result.insertedId) {
        return {
          status: true,
          message: 'Módulo creado exitosamente',
          data: {
            ...newModule,
            _id: result.insertedId
          }
        };
      }

      return {
        status: false,
        message: 'Error al crear el módulo'
      };
    } catch (error) {
      console.error('Error creating module:', error);
      throw `Error/Module.js: ${error}`;
    }
  }

  static async update(id, moduleData) {
    try {
      const modulesCollection = dbClient.db.collection('modules');
      
      // Verificar si existe el módulo
      const existingModule = await modulesCollection.findOne({ 
        _id: new ObjectId(id), 
        activo: true 
      });

      if (!existingModule) {
        return {
          status: false,
          message: 'Módulo no encontrado'
        };
      }

      // Actualizar el módulo
      const updateData = {
        ...moduleData,
        updatedAt: new Date()
      };

      const result = await modulesCollection.updateOne(
        { _id: new ObjectId(id), activo: true },
        { $set: updateData }
      );

      if (result.modifiedCount === 1) {
        return {
          status: true,
          message: 'Módulo actualizado exitosamente',
          data: {
            _id: id,
            ...updateData
          }
        };
      }

      return {
        status: false,
        message: 'Error al actualizar el módulo'
      };
    } catch (error) {
      console.error('Error updating module:', error);
      throw `Error/Module.js: ${error}`;
    }
  }

  static async delete(id) {
    try {
      const modulesCollection = dbClient.db.collection('modules');
      
      // Función recursiva para desactivar submódulos
      const deactivateSubmodules = async (parentId) => {
        const submodules = await modulesCollection.find({ 
          parentId: new ObjectId(parentId),
          activo: true 
        }).toArray();
        
        for (const submodule of submodules) {
          await modulesCollection.updateOne(
            { _id: submodule._id },
            { $set: { activo: false, updatedAt: new Date() } }
          );
          await deactivateSubmodules(submodule._id);
        }
      };

      // Verificar si existe el módulo
      const existingModule = await modulesCollection.findOne({ 
        _id: new ObjectId(id), 
        activo: true 
      });

      if (!existingModule) {
        return {
          status: false,
          message: 'Módulo no encontrado'
        };
      }

      // Desactivar el módulo y sus submódulos
      await modulesCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { activo: false, updatedAt: new Date() } }
      );
      
      await deactivateSubmodules(id);

      return {
        status: true,
        message: 'Módulo y submódulos eliminados correctamente'
      };
    } catch (error) {
      console.error('Error deleting module:', error);
      throw `Error/Module.js: ${error}`;
    }
  }
}

module.exports = Module; 