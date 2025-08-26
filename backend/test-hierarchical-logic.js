// Script de prueba para la lógica jerárquica de permisos
// Este script simula la lógica implementada en el frontend

// Estructura del menú de permisos (simulada)
const menuPermissions = [
  // Work Platform - Nivel 1
  { id: 1, name: 'Work Platform', level: 1, permissions: { view: false, add: false, edit: false, delete: false, all: false } },
  
  // Elementos del Work Platform - Nivel 2
  { id: 2, name: 'Home', level: 2, permissions: { view: false, add: false, edit: false, delete: false, all: false } },
  { id: 3, name: 'Dashboard', level: 2, permissions: { view: false, add: false, edit: false, delete: false, all: false } },
  { id: 4, name: 'Jobs', level: 2, permissions: { view: false, add: false, edit: false, delete: false, all: false } },
  { id: 5, name: 'Companies', level: 2, permissions: { view: false, add: false, edit: false, delete: false, all: false } },
  { id: 6, name: 'My Profile', level: 2, permissions: { view: false, add: false, edit: false, delete: false, all: false } },
  { id: 7, name: 'Messages', level: 2, permissions: { view: false, add: false, edit: false, delete: false, all: false } },
  
  // Blog - Nivel 2 (dentro de Work Platform)
  { id: 8, name: 'Blog', level: 2, permissions: { view: false, add: false, edit: false, delete: false, all: false } },
  
  // Subelementos del Blog - Nivel 3
  { id: 9, name: 'All Articles', level: 3, permissions: { view: false, add: false, edit: false, delete: false, all: false } },
  { id: 10, name: 'Categories', level: 3, permissions: { view: false, add: false, edit: false, delete: false, all: false } },
  { id: 11, name: 'Write Article', level: 3, permissions: { view: false, add: false, edit: false, delete: false, all: false } },
  { id: 12, name: 'My Posts', level: 3, permissions: { view: false, add: false, edit: false, delete: false, all: false } },
  
  // Sell Platform - Nivel 1
  { id: 13, name: 'Sell Platform', level: 1, permissions: { view: false, add: false, edit: false, delete: false, all: false } },
  
  // Elementos del Sell Platform - Nivel 2
  { id: 14, name: 'Orders', level: 2, permissions: { view: false, add: false, edit: false, delete: false, all: false } },
  { id: 15, name: 'Order Detail', level: 2, permissions: { view: false, add: false, edit: false, delete: false, all: false } },
  
  // Otros elementos - Nivel 1
  { id: 16, name: 'Sitemap', level: 1, permissions: { view: false, add: false, edit: false, delete: false, all: false } },
  { id: 17, name: 'Admin Panel', level: 1, permissions: { view: false, add: false, edit: false, delete: false, all: false } }
];

// Función para obtener elementos hijos de un elemento padre
function getChildren(parentItem) {
  const children = [];
  
  if (parentItem.level === 1) {
    if (parentItem.name === 'Work Platform') {
      children.push(...menuPermissions.filter(item => 
        item.level === 2 && (item.name === 'Home' || item.name === 'Dashboard' || 
        item.name === 'Jobs' || item.name === 'Companies' || item.name === 'My Profile' || 
        item.name === 'Messages' || item.name === 'Blog')
      ));
    } else if (parentItem.name === 'Sell Platform') {
      children.push(...menuPermissions.filter(item => 
        item.level === 2 && (item.name === 'Orders' || item.name === 'Order Detail')
      ));
    }
  } else if (parentItem.level === 2) {
    if (parentItem.name === 'Blog') {
      children.push(...menuPermissions.filter(item => 
        item.level === 3 && (item.name === 'All Articles' || item.name === 'Categories' || 
        item.name === 'Write Article' || item.name === 'My Posts')
      ));
    }
  }
  
  return children;
}

// Función para marcar todos los elementos hijos
function markChildrenView(menuItem) {
  const children = getChildren(menuItem);
  children.forEach(child => {
    child.permissions.view = true;
  });
  console.log(`✅ Marcados ${children.length} elementos hijos de "${menuItem.name}"`);
}

// Función para desmarcar todos los elementos hijos
function unmarkChildrenView(menuItem) {
  const children = getChildren(menuItem);
  children.forEach(child => {
    child.permissions.view = false;
  });
  console.log(`❌ Desmarcados ${children.length} elementos hijos de "${menuItem.name}"`);
}

// Función para obtener el elemento padre de nivel 2
function getParentLevel2(menuItem) {
  if (menuItem.name === 'All Articles' || menuItem.name === 'Categories' || 
      menuItem.name === 'Write Article' || menuItem.name === 'My Posts') {
    return menuPermissions.find(item => item.name === 'Blog');
  }
  return null;
}

// Función para obtener el elemento padre de nivel 1
function getParentLevel1(menuItem) {
  if (menuItem.name === 'Home' || menuItem.name === 'Dashboard' || menuItem.name === 'Jobs' || 
      menuItem.name === 'Companies' || menuItem.name === 'My Profile' || menuItem.name === 'Messages' ||
      menuItem.name === 'Blog') {
    return menuPermissions.find(item => item.name === 'Work Platform');
  } else if (menuItem.name === 'Orders' || menuItem.name === 'Order Detail') {
    return menuPermissions.find(item => item.name === 'Sell Platform');
  }
  return null;
}

// Función para actualizar el estado de view de un elemento basado en sus hijos
function updateElementViewStatus(menuItem) {
  const children = getChildren(menuItem);
  if (children.length > 0) {
    const allChildrenMarked = children.every(child => child.permissions.view);
    const someChildrenMarked = children.some(child => child.permissions.view);
    
    if (allChildrenMarked) {
      menuItem.permissions.view = true;
      console.log(`🔄 "${menuItem.name}" marcado automáticamente (todos los hijos marcados)`);
    } else if (!someChildrenMarked) {
      menuItem.permissions.view = false;
      console.log(`🔄 "${menuItem.name}" desmarcado automáticamente (ningún hijo marcado)`);
    }
  }
}

// Función para actualizar el estado de los elementos padre
function updateParentViewStatus(menuItem) {
  if (menuItem.level === 3) {
    const parentLevel2 = getParentLevel2(menuItem);
    if (parentLevel2) {
      updateElementViewStatus(parentLevel2);
    }
  }
  
  if (menuItem.level === 2) {
    const parentLevel1 = getParentLevel1(menuItem);
    if (parentLevel1) {
      updateElementViewStatus(parentLevel1);
    }
  }
}

// Función principal para aplicar lógica jerárquica
function applyHierarchicalViewLogic(menuItem) {
  console.log(`\n🔄 Aplicando lógica jerárquica para "${menuItem.name}" (Nivel ${menuItem.level})`);
  
  if (menuItem.permissions.view) {
    markChildrenView(menuItem);
  } else {
    unmarkChildrenView(menuItem);
  }
  
  if (menuItem.level > 1) {
    updateParentViewStatus(menuItem);
  }
}

// Función para mostrar el estado actual de los permisos
function showPermissionsStatus() {
  console.log('\n📊 Estado actual de los permisos:');
  console.log('=' .repeat(60));
  
  menuPermissions.forEach(item => {
    const status = item.permissions.view ? '✅' : '❌';
    const indent = '  '.repeat(item.level - 1);
    console.log(`${indent}${status} ${item.name} (Nivel ${item.level})`);
  });
}

// Función para simular un cambio de permiso
function simulatePermissionChange(menuName, newViewValue) {
  const menuItem = menuPermissions.find(item => item.name === menuName);
  if (menuItem) {
    console.log(`\n🎯 Simulando cambio de permiso: "${menuName}" → view = ${newViewValue}`);
    menuItem.permissions.view = newViewValue;
    applyHierarchicalViewLogic(menuItem);
    showPermissionsStatus();
  } else {
    console.log(`❌ Elemento "${menuName}" no encontrado`);
  }
}

// Función para ejecutar pruebas
function runTests() {
  console.log('🚀 Iniciando pruebas de lógica jerárquica de permisos');
  console.log('=' .repeat(60));
  
  // Estado inicial
  showPermissionsStatus();
  
  // Prueba 1: Marcar Work Platform (debe marcar todos los hijos)
  console.log('\n🧪 PRUEBA 1: Marcar Work Platform');
  simulatePermissionChange('Work Platform', true);
  
  // Prueba 2: Desmarcar Jobs (debe desmarcar Work Platform)
  console.log('\n🧪 PRUEBA 2: Desmarcar Jobs');
  simulatePermissionChange('Jobs', false);
  
  // Prueba 3: Marcar Blog (debe marcar sus hijos)
  console.log('\n🧪 PRUEBA 3: Marcar Blog');
  simulatePermissionChange('Blog', true);
  
  // Prueba 4: Marcar todos los elementos de Work Platform individualmente
  console.log('\n🧪 PRUEBA 4: Marcar elementos individuales de Work Platform');
  simulatePermissionChange('Home', true);
  simulatePermissionChange('Dashboard', true);
  simulatePermissionChange('Companies', true);
  simulatePermissionChange('My Profile', true);
  simulatePermissionChange('Messages', true);
  
  // Prueba 5: Marcar elementos de Blog
  console.log('\n🧪 PRUEBA 5: Marcar elementos de Blog');
  simulatePermissionChange('All Articles', true);
  simulatePermissionChange('Categories', true);
  simulatePermissionChange('Write Article', true);
  simulatePermissionChange('My Posts', true);
  
  // Prueba 6: Desmarcar Categories
  console.log('\n🧪 PRUEBA 6: Desmarcar Categories');
  simulatePermissionChange('Categories', false);
  
  console.log('\n✅ Todas las pruebas completadas');
}

// Ejecutar las pruebas si se llama directamente
if (require.main === module) {
  runTests();
}

module.exports = {
  menuPermissions,
  applyHierarchicalViewLogic,
  simulatePermissionChange,
  showPermissionsStatus
};
