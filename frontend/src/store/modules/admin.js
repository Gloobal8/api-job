import axios from 'axios';

const state = {
  admins: [],
  roles: [],
  loading: false,
  error: null
};

const getters = {
  getAllAdmins: (state) => state.admins,
  getAllRoles: (state) => state.roles,
  isLoading: (state) => state.loading,
  getError: (state) => state.error,
  getAdminById: (state) => (id) => {
    return state.admins.find(admin => admin._id === id);
  },
  getRoleById: (state) => (id) => {
    return state.roles.find(role => role._id === id);
  }
};

const actions = {
  // Admin actions
  async getAllAdmins({ commit }) {
    try {
      commit('SET_LOADING', true);
      const response = await axios.get('/admins/admins');
      console.log({
        archive: 'frontend/src/store/modules/admin.js',
        response: response.data
      });
      commit('SET_ADMINS', response.data);
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.message || 'Error al obtener administradores');
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async addAdmin({ commit, dispatch }, adminData) {
    try {
      commit('SET_LOADING', true);
      const response = await axios.post('/admins/admins/create', adminData);
      await dispatch('getAllAdmins');
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.message || 'Error al crear administrador');
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async editAdminAction({ commit, dispatch }, adminData) {
    try {
      commit('SET_LOADING', true);
      const response = await axios.put(`/admins/admins/${adminData._id}`, adminData);
      await dispatch('getAllAdmins');
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.message || 'Error al actualizar administrador');
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async deleteAdmin({ commit, dispatch }, adminData) {
    try {
      commit('SET_LOADING', true);
      const response = await axios.delete(`/admins/admins/${adminData._id}`);
      await dispatch('getAllAdmins');
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.message || 'Error al eliminar administrador');
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // Role actions
  async getAllRoles({ commit }) {
    try {
      commit('SET_LOADING', true);
      const response = await axios.get('/rols/rols');
      commit('SET_ROLES', response.data);
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.message || 'Error al obtener roles');
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async addRole({ commit, dispatch }, roleData) {
    try {
      commit('SET_LOADING', true);
      const response = await axios.post('/rols/rols/create', roleData);
      await dispatch('getAllRoles');
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.message || 'Error al crear rol');
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async editRoleAction({ commit, dispatch }, roleData) {
    try {
      commit('SET_LOADING', true);
      const response = await axios.put(`/rols/rols/${roleData._id}`, roleData);
      await dispatch('getAllRoles');
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.message || 'Error al actualizar rol');
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async deleteRole({ commit, dispatch }, roleData) {
    try {
      commit('SET_LOADING', true);
      const response = await axios.delete(`/rols/rols/${roleData._id}`);
      await dispatch('getAllRoles');
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.message || 'Error al eliminar rol');
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // Clear error action
  clearError({ commit }) {
    commit('SET_ERROR', null);
  }
};

const mutations = {
  SET_ADMINS(state, admins) {
    state.admins = admins;
  },
  SET_ROLES(state, roles) {
    state.roles = roles;
  },
  SET_LOADING(state, loading) {
    state.loading = loading;
  },
  SET_ERROR(state, error) {
    state.error = error;
  }
};

export default {
  state,
  getters,
  actions,
  mutations
};