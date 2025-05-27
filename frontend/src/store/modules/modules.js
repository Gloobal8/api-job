import axios from 'axios';

const state = () => ({
  moduleTree: [],
  loading: false,
  error: null
});

const getters = {
  getModuleTree: state => state.moduleTree,
  isLoading: state => state.loading,
  getError: state => state.error,
  hasModules: state => state.moduleTree && state.moduleTree.length > 0,
  getFlatModules: state => {
    const flattenModules = (modules, parentPath = '') => {
      if (!modules) return [];
      return modules.reduce((acc, module) => {
        const currentPath = parentPath ? `${parentPath} / ${module.nombre}` : module.nombre;
        acc.push({
          _id: module._id,
          nombre: currentPath,
          nivel: module.nivel
        });
        if (module.submodules && module.submodules.length > 0) {
          acc.push(...flattenModules(module.submodules, currentPath));
        }
        return acc;
      }, []);
    };
    return flattenModules(state.moduleTree);
  }
};

const actions = {
  async fetchModules({ commit }) {
    try {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      
      const response = await axios.get('/modules/modules');
      console.log('Módulos recibidos:', response.data);
      
      // Asegurarse de que la respuesta sea un array
      const modules = Array.isArray(response.data) ? response.data : [];
      commit('SET_MODULE_TREE', modules);
      
      return modules;
    } catch (error) {
      console.error('Error fetching modules:', error);
      commit('SET_ERROR', error.response?.data?.message || 'Error al obtener módulos');
      commit('SET_MODULE_TREE', []);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async createModule({ commit, dispatch }, moduleData) {
    try {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      
      const response = await axios.post('/modules/modules', moduleData);
      await dispatch('fetchModules'); // Recargar módulos después de crear uno nuevo
      
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.message || 'Error al crear módulo');
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async updateModule({ commit, dispatch }, moduleData) {
    try {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      
      const response = await axios.put(`/modules/modules/${moduleData._id}`, moduleData);
      await dispatch('fetchModules'); // Recargar módulos después de actualizar
      
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.message || 'Error al actualizar módulo');
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async deleteModule({ commit, dispatch }, moduleId) {
    try {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      
      const response = await axios.delete(`/modules/modules/${moduleId}`);
      await dispatch('fetchModules'); // Recargar módulos después de eliminar
      
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.message || 'Error al eliminar módulo');
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  }
};

const mutations = {
  SET_MODULE_TREE(state, modules) {
    state.moduleTree = modules;
  },
  SET_LOADING(state, loading) {
    state.loading = loading;
  },
  SET_ERROR(state, error) {
    state.error = error;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}; 