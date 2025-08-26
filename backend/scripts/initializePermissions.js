const dbClient = require('../config/db');
const { ObjectId } = require('mongodb');

// Estructura del menú de permisos
const menuPermissions = [
  // Work Platform - Nivel 1
  { id: 1, name: 'Work Platform', level: 1 },
  
  // Elementos del Work Platform - Nivel 2
  { id: 2, name: 'Home', level: 2 },
  { id: 3, name: 'Dashboard', level: 2 },
  { id: 4, name: 'Jobs', level: 2 },
  { id: 5, name: 'Companies', level: 2 },
  { id: 6, name: 'My Profile', level: 2 },
  { id: 7, name: 'Messages', level: 2 },
  
  // Blog - Nivel 2 (dentro de Work Platform)
  { id: 8, name: 'Blog', level: 2 },
  
  // Subelementos del Blog - Nivel 3
  { id: 9, name: 'All Articles', level: 3 },
  { id: 10, name: 'Categories', level: 3 },
  { id: 11, name: 'Write Article', level: 3 },
  { id: 12, name: 'My Posts', level: 3 },
  
  // Sell Platform - Nivel 1
  { id: 13, name: 'Sell Platform', level: 1 },
  
  // Elementos del Sell Platform - Nivel 2
  { id: 14, name: 'Orders', level: 2 },
  { id: 15, name: 'Order Detail', level: 2 },
  
  // Otros elementos - Nivel 1
  { id: 16, name: 'Sitemap', level: 1 },
  { id: 17, name: 'Admin Panel', level: 1 }
];

async function initializePermissions() {
  try {
    console.log('Inicializando permisos por defecto...');
    
    // Conectar a la base de datos
    await dbClient.connect();
    
    const db = dbClient.db;
    const rolesCollection = db.collection('roles');
    const permissionsCollection = db.collection('permissions');
    
    // Obtener todos los roles activos
    const roles = await rolesCollection.find({ activo: true }).toArray();
    console.log(`Encontrados ${roles.length} roles activos`);
    
    for (const role of roles) {
      console.log(`Procesando rol: ${role.nombreRol}`);
      
      // Verificar si ya existen permisos para este rol
      const existingPermissions = await permissionsCollection.find({ 
        roleId: role._id, 
        activo: true 
      }).toArray();
      
      if (existingPermissions.length === 0) {
        // Crear permisos por defecto para este rol
        const defaultPermissions = menuPermissions.map(menuItem => ({
          roleId: role._id,
          menuId: menuItem.id,
          menuName: menuItem.name,
          level: menuItem.level,
          permissions: {
            view: role.nombreRol.toLowerCase() === 'administrador',
            add: role.nombreRol.toLowerCase() === 'administrador',
            edit: role.nombreRol.toLowerCase() === 'administrador',
            delete: role.nombreRol.toLowerCase() === 'administrador',
            all: role.nombreRol.toLowerCase() === 'administrador'
          },
          activo: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }));
        
        // Insertar permisos por defecto
        const result = await permissionsCollection.insertMany(defaultPermissions);
        console.log(`Creados ${result.insertedCount} permisos para el rol ${role.nombreRol}`);
      } else {
        console.log(`El rol ${role.nombreRol} ya tiene permisos configurados`);
      }
    }
    
    console.log('Inicialización de permisos completada exitosamente');
    
  } catch (error) {
    console.error('Error durante la inicialización de permisos:', error);
  } finally {
    // Cerrar conexión
    await dbClient.close();
  }
}

// Ejecutar el script si se llama directamente
if (require.main === module) {
  initializePermissions()
    .then(() => {
      console.log('Script completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error en el script:', error);
      process.exit(1);
    });
}

module.exports = { initializePermissions };
