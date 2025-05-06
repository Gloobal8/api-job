import axios from "axios";

const state = {
  customFields: [],
  loading: false,
  error: null,
};

const getters = {
  getCustomFieldsByEntity: (state) => (entity) => {
    return state.customFields.filter((field) => field.entity === entity);
  },
  getCustomFieldById: (state) => (id) => {
    return state.customFields.find((field) => field.id === id);
  },
};

const actions = {
  async fetchCustomFields({ commit }) {
    try {
      commit("setLoading", true);
      const { data } = await axios.get("/custom-fields");
      commit("setCustomFields", data);
      commit("setLoading", false);
    } catch (error) {
      commit(
        "setError",
        error.response?.data?.message || "Error al cargar campos personalizados"
      );
      commit("setLoading", false);
    }
  },

  async fetchCustomFieldsByEntity({ commit }, entity) {
    try {
      commit("setLoading", true);
      const { data } = await axios.get(`/custom-fields/entity/${entity}`);
      commit("setCustomFields", data);
      commit("setLoading", false);
    } catch (error) {
      commit(
        "setError",
        error.response?.data?.message || "Error al cargar campos personalizados"
      );
      commit("setLoading", false);
    }
  },

  async createCustomField({ commit }, fieldData) {
    try {
      commit("setLoading", true);
      const { data } = await axios.post("/custom-fields", fieldData);
      commit("addCustomField", data);
      commit("setLoading", false);
      return data;
    } catch (error) {
      commit(
        "setError",
        error.response?.data?.message || "Error al crear campo personalizado"
      );
      commit("setLoading", false);
      throw error;
    }
  },

  async updateCustomField({ commit }, { id, fieldData }) {
    try {
      commit("setLoading", true);
      const { data } = await axios.put(`/custom-fields/${id}`, fieldData);
      commit("updateCustomField", data);
      commit("setLoading", false);
      return data;
    } catch (error) {
      commit(
        "setError",
        error.response?.data?.message ||
          "Error al actualizar campo personalizado"
      );
      commit("setLoading", false);
      throw error;
    }
  },

  async deleteCustomField({ commit }, id) {
    try {
      commit("setLoading", true);
      await axios.delete(`/custom-fields/${id}`);
      commit("removeCustomField", id);
      commit("setLoading", false);
    } catch (error) {
      commit(
        "setError",
        error.response?.data?.message || "Error al eliminar campo personalizado"
      );
      commit("setLoading", false);
      throw error;
    }
  },
};

const mutations = {
  setCustomFields(state, fields) {
    state.customFields = fields;
  },
  addCustomField(state, field) {
    state.customFields.push(field);
  },
  updateCustomField(state, updatedField) {
    const index = state.customFields.findIndex(
      (field) => field.id === updatedField.id
    );
    if (index !== -1) {
      state.customFields.splice(index, 1, updatedField);
    }
  },
  removeCustomField(state, id) {
    state.customFields = state.customFields.filter((field) => field.id !== id);
  },
  setLoading(state, status) {
    state.loading = status;
  },
  setError(state, error) {
    state.error = error;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
