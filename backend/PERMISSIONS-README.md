# Sistema de Permisos - Job Board API

## Descripción

Este sistema de permisos permite gestionar el acceso a diferentes módulos del menú según el rol del usuario. Los permisos se almacenan en la base de datos y se aplican dinámicamente en el frontend.

## Características

- **Permisos granulares**: Control individual para view, add, edit, delete y all
- **Jerarquía de menús**: Soporte para niveles de menú (principal, sub-elemento, sub-sub-elemento)
- **Roles dinámicos**: Los permisos se pueden configurar por rol
- **Reglas especiales**: El rol de administrador tiene reglas especiales para el Admin Panel

## Estructura de la Base de Datos

### Colección: permissions

```javascript
{
  _id: ObjectId,
  roleId: ObjectId,        // Referencia al rol
  menuId: Number,          // ID del elemento del menú
  menuName: String,        // Nombre del elemento del menú
  level: Number,           // Nivel jerárquico (1, 2, 3)
  permissions: {
    view: Boolean,         // Permiso de visualización
    add: Boolean,          // Permiso de creación
    edit: Boolean,         // Permiso de edición
    delete: Boolean,       // Permiso de eliminación
    all: Boolean           // Permiso completo
  },
  activo: Boolean,         // Estado activo/inactivo
  createdAt: Date,         // Fecha de creación
  updatedAt: Date          // Fecha de última actualización
}
```

## Estructura del Menú

### Nivel 1 (Principal)
- Work Platform
- Sell Platform
- Sitemap
- Admin Panel

### Nivel 2 (Sub-elementos)
- Home, Dashboard, Jobs, Companies, My Profile, Messages
- Blog
- Orders, Order Detail

### Nivel 3 (Sub-sub-elementos)
- All Articles, Categories, Write Article, My Posts

## API Endpoints

### Obtener permisos por rol
```
GET /api/permissions/role/:roleId
```

### Obtener permiso específico
```
GET /api/permissions/role/:roleId/menu/:menuId
```

### Crear/actualizar permiso
```
POST /api/permissions/create
```

### Actualizar permiso
```
PUT /api/permissions/role/:roleId/menu/:menuId
```

### Eliminar permiso
```
DELETE /api/permissions/role/:roleId/menu/:menuId
```

### Crear/actualizar permisos en lote
```
POST /api/permissions/bulk-create
```

### Eliminar todos los permisos de un rol
```
DELETE /api/permissions/role/:roleId
```

## Reglas Especiales

### Rol de Administrador
- El checkbox de "view" para "Admin Panel" siempre está activo
- No se puede desactivar ni editar este permiso
- Se aplican automáticamente todos los permisos por defecto

## Inicialización

### Script de Inicialización
Para inicializar permisos por defecto para roles existentes:

```bash
cd backend
node scripts/initializePermissions.js
```

Este script:
1. Se conecta a la base de datos
2. Obtiene todos los roles activos
3. Crea permisos por defecto para cada rol
4. Aplica reglas especiales para el rol de administrador

### Permisos por Defecto
- **Roles normales**: Todos los permisos en false
- **Rol de administrador**: Todos los permisos en true

## Uso en el Frontend

### Componente Permissions.vue
El componente principal para gestionar permisos incluye:

- **Matriz de permisos**: Visualización clara de todos los permisos
- **Checkboxes funcionales**: Control individual de cada permiso
- **Select All**: Funcionalidad para marcar/desmarcar todos los permisos de un tipo
- **Validación**: Los permisos se validan antes de guardar
- **Persistencia**: Los cambios se guardan automáticamente en la base de datos

### Funcionalidades
1. **Carga de permisos**: Se cargan automáticamente al seleccionar un rol
2. **Guardado**: Los permisos se guardan al hacer clic en "Guardar Permisos"
3. **Validación**: Se aplican reglas especiales automáticamente
4. **Sincronización**: Los cambios se reflejan inmediatamente en la interfaz

## Flujo de Trabajo

1. **Crear rol**: Se crea un nuevo rol en el sistema
2. **Inicializar permisos**: Se crean permisos por defecto para el nuevo rol
3. **Configurar permisos**: El administrador configura los permisos específicos
4. **Guardar cambios**: Los permisos se almacenan en la base de datos
5. **Aplicar permisos**: Los permisos se aplican dinámicamente en la aplicación

## Consideraciones de Seguridad

- Los permisos se validan en el backend antes de aplicar
- Solo los administradores pueden modificar permisos
- Los cambios se registran con timestamps
- Soft delete para mantener historial de cambios

## Mantenimiento

### Verificar Integridad
```bash
# Verificar permisos duplicados
db.permissions.aggregate([
  { $group: { _id: { roleId: "$roleId", menuId: "$menuId" }, count: { $sum: 1 } } },
  { $match: { count: { $gt: 1 } } }
])
```

### Limpiar Permisos Inactivos
```bash
# Eliminar permisos de roles inactivos
db.permissions.deleteMany({
  roleId: { $in: db.roles.find({ activo: false }).map(r => r._id) }
})
```

## Troubleshooting

### Problemas Comunes

1. **Permisos no se cargan**: Verificar conexión a la base de datos
2. **Checkboxes no funcionan**: Verificar que el rol esté seleccionado
3. **Cambios no se guardan**: Verificar permisos de escritura en la BD
4. **Errores de validación**: Verificar estructura de datos enviados

### Logs
Los errores se registran en la consola del servidor y en la consola del navegador.

## Futuras Mejoras

- [ ] Cache de permisos para mejor rendimiento
- [ ] Auditoría de cambios de permisos
- [ ] Permisos condicionales basados en contexto
- [ ] API para verificar permisos en tiempo real
- [ ] Sistema de herencia de permisos entre roles
