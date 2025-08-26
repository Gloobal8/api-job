// Configuración de roles y sus capacidades
export const roleConfig = {
  // Rol Administrador (máximo privilegio)
  administrador: {
    name: 'Administrador',
    icon: 'mdi-shield-crown',
    color: 'primary',
    description: 'Control total del sistema',
    quickActions: [
      {
        id: 'view-users',
        title: 'Ver Usuarios',
        icon: 'mdi-account-group',
        color: 'primary',
        variant: 'elevated',
        action: 'viewUsers',
        permission: 'admin.users.view'
      },
      {
        id: 'create-user',
        title: 'Crear Usuario',
        icon: 'mdi-account-plus',
        color: 'success',
        variant: 'elevated',
        action: 'createUser',
        permission: 'admin.users.create'
      },
      {
        id: 'manage-roles',
        title: 'Gestionar Roles',
        icon: 'mdi-shield-account',
        color: 'info',
        variant: 'elevated',
        action: 'manageRoles',
        permission: 'admin.roles.manage'
      },
      
      {
        id: 'view-reports',
        title: 'Ver Reportes',
        icon: 'mdi-file-chart',
        color: 'warning',
        variant: 'elevated',
        action: 'viewReports',
        permission: 'admin.reports.view'
      },
      {
        id: 'backup-system',
        title: 'Respaldo del Sistema',
        icon: 'mdi-database-export',
        color: 'error',
        variant: 'elevated',
        action: 'backupSystem',
        permission: 'admin.system.backup'
      }
    ],
         dashboardWidgets: ['stats', 'systemInfo', 'notifications', 'quickActions', 'systemStatus']
  },

  // Rol Super Admin
  super_admin: {
    name: 'Super Administrador',
    icon: 'mdi-shield-star',
    color: 'success',
    description: 'Administración avanzada del sistema',
    quickActions: [
      {
        id: 'view-users',
        title: 'Ver Usuarios',
        icon: 'mdi-account-group',
        color: 'primary',
        variant: 'elevated',
        action: 'viewUsers',
        permission: 'admin.users.view'
      },
      {
        id: 'create-user',
        title: 'Crear Usuario',
        icon: 'mdi-account-plus',
        color: 'success',
        variant: 'elevated',
        action: 'createUser',
        permission: 'admin.users.create'
      },
      {
        id: 'manage-roles',
        title: 'Gestionar Roles',
        icon: 'mdi-shield-account',
        color: 'info',
        variant: 'elevated',
        action: 'manageRoles',
        permission: 'admin.roles.manage'
      },
      {
        id: 'view-reports',
        title: 'Ver Reportes',
        icon: 'mdi-file-chart',
        color: 'warning',
        variant: 'elevated',
        action: 'viewReports',
        permission: 'admin.reports.view'
      }
    ],
         dashboardWidgets: ['stats', 'systemInfo', 'notifications', 'quickActions']
  },

  // Rol Admin
  admin: {
    name: 'Administrador',
    icon: 'mdi-shield-account',
    color: 'info',
    description: 'Administración básica del sistema',
    quickActions: [
      {
        id: 'view-users',
        title: 'Ver Usuarios',
        icon: 'mdi-account-group',
        color: 'primary',
        variant: 'elevated',
        action: 'viewUsers',
        permission: 'admin.users.view'
      },
      {
        id: 'create-user',
        title: 'Crear Usuario',
        icon: 'mdi-account-plus',
        color: 'success',
        variant: 'elevated',
        action: 'createUser',
        permission: 'admin.users.create'
      },
      {
        id: 'view-reports',
        title: 'Ver Reportes',
        icon: 'mdi-file-chart',
        color: 'warning',
        variant: 'elevated',
        action: 'viewReports',
        permission: 'admin.reports.view'
      }
    ],
    dashboardWidgets: ['stats', 'quickActions']
  },

  // Rol Moderador
  moderator: {
    name: 'Moderador',
    icon: 'mdi-shield-check',
    color: 'warning',
    description: 'Moderación de contenido y usuarios',
    quickActions: [
      {
        id: 'view-users',
        title: 'Ver Usuarios',
        icon: 'mdi-account-group',
        color: 'primary',
        variant: 'elevated',
        action: 'viewUsers',
        permission: 'moderator.users.view'
      },
      {
        id: 'moderate-content',
        title: 'Moderar Contenido',
        icon: 'mdi-shield-check',
        color: 'warning',
        variant: 'elevated',
        action: 'moderateContent',
        permission: 'moderator.content.moderate'
      },
      {
        id: 'view-reports',
        title: 'Ver Reportes',
        icon: 'mdi-file-chart',
        color: 'info',
        variant: 'elevated',
        action: 'viewReports',
        permission: 'moderator.reports.view'
      }
    ],
    dashboardWidgets: ['stats', 'quickActions', 'moderationQueue']
  },

  // Rol Usuario
  user: {
    name: 'Usuario',
    icon: 'mdi-account',
    color: 'grey',
    description: 'Usuario estándar del sistema',
    quickActions: [
      {
        id: 'view-profile',
        title: 'Ver Perfil',
        icon: 'mdi-account',
        color: 'primary',
        variant: 'elevated',
        action: 'viewProfile',
        permission: 'user.profile.view'
      },
      {
        id: 'edit-profile',
        title: 'Editar Perfil',
        icon: 'mdi-account-edit',
        color: 'success',
        variant: 'elevated',
        action: 'editProfile',
        permission: 'user.profile.edit'
      }
    ],
    dashboardWidgets: ['stats', 'quickActions']
  }
};

// Función para obtener configuración de un rol
export function getRoleConfig(roleName) {
  const normalizedRoleName = roleName.toLowerCase();
  return roleConfig[normalizedRoleName] || roleConfig.user;
}

// Función para obtener acciones rápidas de un rol
export function getQuickActionsForRole(roleName) {
  const config = getRoleConfig(roleName);
  return config.quickActions || [];
}

// Función para obtener widgets del dashboard de un rol
export function getDashboardWidgetsForRole(roleName) {
  const config = getRoleConfig(roleName);
  return config.dashboardWidgets || [];
}

// Función para verificar si un rol tiene un permiso específico
export function hasPermission(roleName, permission) {
  const config = getRoleConfig(roleName);
  const quickActions = config.quickActions || [];
  return quickActions.some(action => action.permission === permission);
}

// Función para obtener el color del rol
export function getRoleColor(roleName) {
  const config = getRoleConfig(roleName);
  return config.color || 'grey';
}

// Función para obtener el icono del rol
export function getRoleIcon(roleName) {
  const config = getRoleConfig(roleName);
  return config.icon || 'mdi-shield';
}

// Función para obtener la descripción del rol
export function getRoleDescription(roleName) {
  const config = getRoleConfig(roleName);
  return config.description || 'Usuario del sistema';
}

export default roleConfig;
