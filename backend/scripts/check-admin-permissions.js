const dbClient = require('../config/db');
const { ObjectId } = require('mongodb');

async function checkAdminPermissions() {
  try {
    console.log('🔍 Verificando permisos del administrador...');
    
    // Esperar a que la conexión se establezca
    let attempts = 0;
    while (!dbClient.db && attempts < 10) {
      console.log(`⏳ Esperando conexión a la base de datos... (intento ${attempts + 1})`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
    }
    
    if (!dbClient.db) {
      throw new Error('No se pudo establecer conexión con la base de datos');
    }
    
    const db = dbClient.db;
    const rolesCollection = db.collection('roles');
    const permissionsCollection = db.collection('permissions');
    
    // Buscar el rol de administrador
    const adminRole = await rolesCollection.findOne({ 
      nombreRol: { $regex: /administrador/i } 
    });
    
    if (!adminRole) {
      console.log('❌ No se encontró el rol de administrador');
      return;
    }
    
    console.log('👑 Rol de administrador encontrado:', {
      id: adminRole._id,
      nombre: adminRole.nombreRol,
      activo: adminRole.activo
    });
    
    // Buscar permisos del administrador
    const adminPermissions = await permissionsCollection.find({ 
      roleId: adminRole._id,
      activo: true 
    }).toArray();
    
    console.log(`📋 Permisos encontrados: ${adminPermissions.length}`);
    
    if (adminPermissions.length === 0) {
      console.log('⚠️ No hay permisos configurados para el administrador');
      console.log('💡 Ejecuta el script initializePermissions.js para crear los permisos');
    } else {
      console.log('✅ Permisos del administrador:');
      adminPermissions.forEach(perm => {
        console.log(`  - ${perm.menuName} (ID: ${perm.menuId}, Nivel: ${perm.level}):`, perm.permissions);
      });
      
      // Verificar permisos específicos
      const workPlatformPerm = adminPermissions.find(p => p.menuName === 'Work Platform');
      const homePerm = adminPermissions.find(p => p.menuName === 'Home');
      const adminPanelPerm = adminPermissions.find(p => p.menuName === 'Admin Panel');
      
      console.log('\n🔍 Verificación de permisos específicos:');
      console.log('  - Work Platform:', workPlatformPerm ? workPlatformPerm.permissions.view : 'NO ENCONTRADO');
      console.log('  - Home:', homePerm ? homePerm.permissions.view : 'NO ENCONTRADO');
      console.log('  - Admin Panel:', adminPanelPerm ? adminPanelPerm.permissions.view : 'NO ENCONTRADO');
    }
    
  } catch (error) {
    console.error('❌ Error al verificar permisos:', error);
  }
}

// Ejecutar el script si se llama directamente
if (require.main === module) {
  checkAdminPermissions()
    .then(() => {
      console.log('✅ Verificación completada');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en el script:', error);
      process.exit(1);
    });
}

module.exports = { checkAdminPermissions };
