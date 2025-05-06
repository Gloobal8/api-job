import axios from "axios";

const state = {
  companies: [],
  company: null,
  loading: false,
  error: null,
};

const getters = {
  allCompanies: (state) => state.companies,
  companyById: (state) => (id) =>
    state.companies.find((company) => company.id === id),
  currentCompany: (state) => state.company,
  isLoading: (state) => state.loading,
  hasError: (state) => state.error !== null,
  errorMessage: (state) => state.error,
};

const actions = {
  async fetchCompanies({ commit }, filters = {}) {
    commit("SET_LOADING", true);
    commit("SET_ERROR", null);

    try {
      // Construir la URL con los filtros
      let url = "/api/companies";
      const queryParams = new URLSearchParams();

      if (filters.industry) queryParams.append("industry", filters.industry);
      if (filters.location) queryParams.append("location", filters.location);
      if (filters.search) queryParams.append("search", filters.search);

      if (queryParams.toString()) {
        url += `?${queryParams.toString()}`;
      }

      const response = await axios.get(url);
      commit("SET_COMPANIES", response.data);
    } catch (error) {
      console.error("Error fetching companies:", error);
      commit("SET_ERROR", "Failed to fetch companies. Please try again later.");
    } finally {
      commit("SET_LOADING", false);
    }
  },

  async fetchCompanyById({ commit }, id) {
    commit("SET_LOADING", true);
    commit("SET_ERROR", null);

    try {
      const response = await axios.get(`/api/companies/${id}`);
      commit("SET_CURRENT_COMPANY", response.data);
    } catch (error) {
      console.error(`Error fetching company with ID ${id}:`, error);
      commit(
        "SET_ERROR",
        "Failed to fetch company details. Please try again later."
      );
    } finally {
      commit("SET_LOADING", false);
    }
  },

  // Otras acciones (crear, actualizar, eliminar) irían aquí
};

const mutations = {
  SET_COMPANIES(state, companies) {
    state.companies = companies;
  },
  SET_CURRENT_COMPANY(state, company) {
    state.company = company;
  },
  SET_LOADING(state, isLoading) {
    state.loading = isLoading;
  },
  SET_ERROR(state, error) {
    state.error = error;
  },
  // Otras mutaciones irían aquí
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
