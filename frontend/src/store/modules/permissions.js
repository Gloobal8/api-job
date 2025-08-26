import axios from 'axios';

const state = {
  userPermissions: null,
  userRole: null,
  loading: false,
  error: null
};

const mutations = {
  SET_USER_PERMISSIONS(state, permissions) {
    state.userPermissions = permissions;
  },
  
  SET_USER_ROLE(state, roleId) {    
    state.userRole = roleId;
  },
  
  SET_LOADING(state, loading) {
    state.loading = loading;
  },
  
  SET_ERROR(state, error) {
    state.error = error;
  },
  
  CLEAR_PERMISSIONS(state) {
    state.userPermissions = null;
    state.userRole = null;
    state.error = null;
  },
  
  // Mutación para forzar actualización de permisos
  FORCE_UPDATE_PERMISSIONS(state) {
    console.log('🔄 FORZANDO actualización de permisos en el store...');
    
    // Crear una nueva referencia para forzar la reactividad
    if (state.userPermissions) {
      // Crear una copia profunda para forzar la reactividad
      const newPermissions = state.userPermissions.map(perm => ({
        ...perm,
        permissions: { ...perm.permissions }
      }));
      
      // Asignar la nueva referencia
      state.userPermissions = newPermissions;
      
      console.log('✅ Permisos forzadamente actualizados en el store:', state.userPermissions);
    } else {
      console.log('⚠️ No hay permisos para forzar actualización');
    }
  },
  
  // Mutación para actualizar permisos específicos inmediatamente
  UPDATE_PERMISSIONS_IMMEDIATE(state, newPermissions) {
    if (newPermissions && Array.isArray(newPermissions)) {
      console.log('🔄 Actualizando permisos en el store:', newPermissions);
      
      // Si no hay permisos existentes, inicializar el array
      if (!state.userPermissions) {
        state.userPermissions = [];
      }
      
      // Actualizar permisos existentes o agregar nuevos
      newPermissions.forEach(newPerm => {
        const existingIndex = state.userPermissions.findIndex(p => p.menuName === newPerm.menuName);
        if (existingIndex !== -1) {
          // Actualizar permiso existente
          console.log(`🔄 Actualizando permiso existente: ${newPerm.menuName}`);
          state.userPermissions[existingIndex] = { ...newPerm };
        } else {
          // Agregar nuevo permiso
          console.log(`🔄 Agregando nuevo permiso: ${newPerm.menuName}`);
          state.userPermissions.push(newPerm);
        }
      });
      
      // Forzar reactividad creando nueva referencia
      state.userPermissions = [...state.userPermissions];
      
      console.log('✅ Permisos actualizados en el store:', state.userPermissions);
    }
  },
  
  // Mutación para actualizar solo los permisos de vista (más eficiente)
  UPDATE_VIEW_PERMISSIONS_ONLY(state, newPermissions) {
    if (newPermissions && Array.isArray(newPermissions)) {
      console.log('🔄 Actualizando solo permisos de vista:', newPermissions);
      
      // Si no hay permisos existentes, inicializar el array
      if (!state.userPermissions) {
        state.userPermissions = [];
      }
      
      // Solo actualizar los permisos de vista (view) para evitar recargas
      newPermissions.forEach(newPerm => {
        const existingIndex = state.userPermissions.findIndex(p => p.menuName === newPerm.menuName);
        if (existingIndex !== -1) {
          // Solo actualizar el permiso de vista
          state.userPermissions[existingIndex].permissions.view = newPerm.permissions.view;
          console.log(`🔄 Permiso de vista actualizado: ${newPerm.menuName} = ${newPerm.permissions.view}`);
        } else {
          // Agregar nuevo permiso solo con vista
          state.userPermissions.push({
            ...newPerm,
            permissions: {
              view: newPerm.permissions.view,
              add: false,
              edit: false,
              delete: false,
              all: false
            }
          });
          console.log(`🔄 Nuevo permiso agregado: ${newPerm.menuName}`);
        }
      });
      
      // Forzar reactividad creando nueva referencia
      state.userPermissions = [...state.userPermissions];
      
      console.log('✅ Permisos de vista actualizados en el store:', state.userPermissions);
    }
  }
};

const actions = {
  // Establecer el rol del usuario y cargar sus permisos
  async setUserRole({ commit, dispatch }, rolId) {
    console.log('🔐 Estableciendo rol en módulo de permisos:', rolId);
    try {
      commit('SET_USER_ROLE', rolId);
      commit('SET_ERROR', null);
      
      // Cargar permisos desde la API
      await dispatch('loadUserPermissions', rolId);
      
      // Forzar actualización para asegurar reactividad
      commit('FORCE_UPDATE_PERMISSIONS');
      
      console.log('✅ Rol establecido y permisos cargados exitosamente');
    } catch (error) {
      console.error('Error al establecer rol del usuario:', error);
      commit('SET_ERROR', error.message);
    }
  },

  // Cargar permisos del usuario desde la API
  async loadUserPermissions({ commit }, rolId) {
    console.log('🔐 Cargando permisos para rol:', rolId);
    try {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);

      const response = await axios.get(`/permissions/role/${rolId}`);
      console.log('🔐 Respuesta de la API:', response.data);
      if (response.data.success) {
        const permissions = response.data.data;
        commit('SET_USER_PERMISSIONS', permissions);
        console.log('🔐 Permisos cargados para rol:', rolId, permissions);
        return permissions;
      } else {
        throw new Error(response.data.message || 'Error al cargar permisos');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Error al cargar permisos';
      commit('SET_ERROR', errorMessage);
      console.error('❌ Error al cargar permisos:', errorMessage);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // Limpiar permisos del usuario
  clearUserPermissions({ commit }) {
    commit('CLEAR_PERMISSIONS');
  },
  
  // Forzar actualización de permisos
  forceUpdatePermissions({ commit }) {
    commit('FORCE_UPDATE_PERMISSIONS');
  },
  
  // Actualizar permisos específicos inmediatamente
  updatePermissionsImmediate({ commit }, newPermissions) {
    commit('UPDATE_PERMISSIONS_IMMEDIATE', newPermissions);
  },
  
  // Actualizar solo permisos de vista (más eficiente)
  updateViewPermissionsOnly({ commit }, newPermissions) {
    commit('UPDATE_VIEW_PERMISSIONS_ONLY', newPermissions);
  }
};

const getters = {
  // Verificar si el usuario puede ver un elemento específico
  canView: (state) => (menuName) => {
    if (!state.userPermissions || !state.userRole) {
      console.log(`🔒 canView('${menuName}'): No hay permisos o rol - Usuario no autenticado`);
      return false;
    }
    
    const permission = state.userPermissions.find(p => p.menuName === menuName);
    const canView = permission ? permission.permissions.view : false;
    
    console.log(`🔍 canView('${menuName}'): ${canView ? '✅' : '❌'}`);
    return canView;
  },

  // Verificar si el usuario puede agregar
  canAdd: (state) => (menuName) => {
    if (!state.userPermissions || !state.userRole) {
      return false;
    }
    
    const permission = state.userPermissions.find(p => p.menuName === menuName);
    return permission ? permission.permissions.add : false;
  },

  // Verificar si el usuario puede editar
  canEdit: (state) => (menuName) => {
    if (!state.userPermissions || !state.userRole) {
      return false;
    }
    
    const permission = state.userPermissions.find(p => p.menuName === menuName);
    return permission ? permission.permissions.edit : false;
  },

  // Verificar si el usuario puede eliminar
  canDelete: (state) => (menuName) => {
    if (!state.userPermissions || !state.userRole) {
      return false;
    }
    
    const permission = state.userPermissions.find(p => p.menuName === menuName);
    return permission ? permission.permissions.delete : false;
  },

  // Verificar si el usuario tiene permisos
  hasPermissions: (state) => {
    const has = !!state.userPermissions && state.userPermissions.length > 0;
    console.log(`🔐 hasPermissions: ${has ? '✅' : '❌'} (${state.userPermissions?.length || 0} permisos)`);
    return has;
  },

  // Verificar si el usuario es administrador
  isAdmin: (state) => {
    if (!state.userPermissions) return false;
    
    // Un usuario es administrador si tiene acceso completo al Admin Panel
    const adminPermission = state.userPermissions.find(p => p.menuName === 'Admin Panel');
    const isAdmin = adminPermission && adminPermission.permissions.view && adminPermission.permissions.add && adminPermission.permissions.edit && adminPermission.permissions.delete;
    
    console.log(`👑 isAdmin: ${isAdmin ? '✅' : '❌'}`);
    return isAdmin;
  },

  // Obtener todos los permisos del usuario
  getUserPermissions: (state) => {
    return state.userPermissions || [];
  },

  // Obtener el rol del usuario
  getUserRole: (state) => {
    return state.userRole;
  },

  // Obtener el estado de carga
  isLoading: (state) => {
    return state.loading;
  },

  // Obtener el error
  getError: (state) => {
    return state.error;
  },

  // Verificar si el Work Platform es visible
  isWorkPlatformVisible: (state) => {
    if (!state.userPermissions) return false;
    
    const workPlatformItems = ['Home', 'Dashboard', 'Jobs', 'Companies', 'My Profile', 'Messages', 'Blog'];
    const hasAnyPermission = workPlatformItems.some(itemName => {
      const permission = state.userPermissions.find(p => p.menuName === itemName);
      return permission && permission.permissions.view;
    });
    
    console.log(`🏢 isWorkPlatformVisible: ${hasAnyPermission ? '✅' : '❌'}`);
    return hasAnyPermission;
  },

  // Verificar si el Blog es visible
  isBlogVisible: (state) => {
    if (!state.userPermissions) return false;
    
    const blogItems = ['All Articles', 'Categories', 'Write Article', 'My Posts'];
    const hasAnyPermission = blogItems.some(itemName => {
      const permission = state.userPermissions.find(p => p.menuName === itemName);
      return permission && permission.permissions.view;
    });
    
    console.log(`📝 isBlogVisible: ${hasAnyPermission ? '✅' : '❌'}`);
    return hasAnyPermission;
  },

  // Verificar si el Sell Platform es visible
  isSellPlatformVisible: (state) => {
    if (!state.userPermissions) return false;
    
    const sellPlatformItems = ['Orders', 'Order Detail'];
    const hasAnyPermission = sellPlatformItems.some(itemName => {
      const permission = state.userPermissions.find(p => p.menuName === itemName);
      return permission && permission.permissions.view;
    });
    
    console.log(`🛒 isSellPlatformVisible: ${hasAnyPermission ? '✅' : '❌'}`);
    return hasAnyPermission;
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
};
