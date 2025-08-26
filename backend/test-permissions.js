const Permission = require('./models/Permission');
const dbClient = require('./config/db');

async function testPermissions() {
  try {
    console.log('Conectando a la base de datos...');
    await dbClient.connect();
    
    console.log('Conexión exitosa');
    
    // Crear un permiso de prueba
    const testPermission = {
      roleId: '507f1f77bcf86cd799439011', // ObjectId de prueba
      menuId: 1,
      menuName: 'Test Menu',
      level: 1,
      permissions: {
        view: true,
        add: false,
        edit: false,
        delete: false,
        all: false
      }
    };
    
    console.log('Creando permiso de prueba...');
    const result = await Permission.create(testPermission);
    
    if (result.status) {
      console.log('Permiso creado exitosamente:', result.message);
    } else {
      console.log('Error al crear permiso:', result.message);
    }
    
  } catch (error) {
    console.error('Error durante la prueba:', error);
  } finally {
    await dbClient.close();
    console.log('Conexión cerrada');
  }
}

// Ejecutar la prueba
testPermissions();
