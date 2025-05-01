import axios from "axios";

const state = {
  languages: [],
  currentLanguage: localStorage.getItem("userLanguage") || "es",
  loading: false,
  error: null,
};

const getters = {
  getLanguageById: (state) => (id) => {
    return state.languages.find((lang) => lang.id === id);
  },
  getDefaultLanguage: (state) => {
    return state.languages.find((lang) => lang.isDefault) || state.languages[0];
  },
};

const actions = {
  async fetchLanguages({ commit }) {
    try {
      commit("setLoading", true);
      const { data } = await axios.get("/localization/languages");
      commit("setLanguages", data);
      commit("setLoading", false);
    } catch (error) {
      commit(
        "setError",
        error.response?.data?.message || "Error al cargar idiomas"
      );
      commit("setLoading", false);
    }
  },

  async fetchLanguageById({ commit }, id) {
    try {
      commit("setLoading", true);
      const { data } = await axios.get(`/localization/languages/${id}`);
      commit("setLoading", false);
      return data;
    } catch (error) {
      commit(
        "setError",
        error.response?.data?.message || "Error al cargar idioma"
      );
      commit("setLoading", false);
      throw error;
    }
  },

  async createLanguage({ commit }, languageData) {
    try {
      commit("setLoading", true);
      const { data } = await axios.post(
        "/localization/languages",
        languageData
      );
      commit("addLanguage", data);
      commit("setLoading", false);
      return data;
    } catch (error) {
      commit(
        "setError",
        error.response?.data?.message || "Error al crear idioma"
      );
      commit("setLoading", false);
      throw error;
    }
  },

  async updateLanguage({ commit }, { id, languageData }) {
    try {
      commit("setLoading", true);
      const { data } = await axios.put(
        `/localization/languages/${id}`,
        languageData
      );
      commit("updateLanguage", data);
      commit("setLoading", false);
      return data;
    } catch (error) {
      commit(
        "setError",
        error.response?.data?.message || "Error al actualizar idioma"
      );
      commit("setLoading", false);
      throw error;
    }
  },

  async deleteLanguage({ commit }, id) {
    try {
      commit("setLoading", true);
      await axios.delete(`/localization/languages/${id}`);
      commit("removeLanguage", id);
      commit("setLoading", false);
    } catch (error) {
      commit(
        "setError",
        error.response?.data?.message || "Error al eliminar idioma"
      );
      commit("setLoading", false);
      throw error;
    }
  },

  async fetchTranslations({ commit }, lang) {
    try {
      commit("setLoading", true);
      const { data } = await axios.get(
        `/localization/translations/${lang}`
      );
      commit("setLoading", false);
      return data;
    } catch (error) {
      commit(
        "setError",
        error.response?.data?.message || "Error al cargar traducciones"
      );
      commit("setLoading", false);
      throw error;
    }
  },

  async updateTranslations({ commit }, { lang, translations }) {
    try {
      commit("setLoading", true);
      await axios.put(`/localization/translations/${lang}`, translations);
      commit("setLoading", false);
    } catch (error) {
      commit(
        "setError",
        error.response?.data?.message || "Error al actualizar traducciones"
      );
      commit("setLoading", false);
      throw error;
    }
  },
};

const mutations = {
  setLanguages(state, languages) {
    state.languages = languages;
  },
  addLanguage(state, language) {
    state.languages.push(language);
  },
  updateLanguage(state, updatedLanguage) {
    const index = state.languages.findIndex(
      (lang) => lang.id === updatedLanguage.id
    );
    if (index !== -1) {
      state.languages.splice(index, 1, updatedLanguage);
    }
  },
  removeLanguage(state, id) {
    state.languages = state.languages.filter((lang) => lang.id !== id);
  },
  setCurrentLanguage(state, lang) {
    state.currentLanguage = lang;
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