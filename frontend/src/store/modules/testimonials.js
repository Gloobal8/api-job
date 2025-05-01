import axios from "axios";

const state = {
  testimonials: [],
  featuredTestimonials: [],
  userTestimonials: [],
  currentTestimonial: null,
  loading: false,
  error: null,
};

const getters = {
  getTestimonialById: (state) => (id) => {
    return state.testimonials.find((testimonial) => testimonial.id === id);
  },
};

const actions = {
  async fetchTestimonials({ commit }, filters = {}) {
    try {
      commit("setLoading", true);

      let queryParams = new URLSearchParams();
      Object.keys(filters).forEach((key) => {
        if (filters[key] !== undefined) {
          queryParams.append(key, filters[key]);
        }
      });

      const { data } = await axios.get(
        `/testimonials?${queryParams.toString()}`
      );
      commit("setTestimonials", data);
      commit("setLoading", false);
    } catch (error) {
      commit(
        "setError",
        error.response?.data?.message || "Error al cargar testimonios"
      );
      commit("setLoading", false);
    }
  },

  async fetchFeaturedTestimonials({ commit }) {
    try {
      commit("setLoading", true);
      const { data } = await axios.get("/testimonials/featured");
      commit("setFeaturedTestimonials", data);
      commit("setLoading", false);
    } catch (error) {
      commit(
        "setError",
        error.response?.data?.message ||
          "Error al cargar testimonios destacados"
      );
      commit("setLoading", false);
    }
  },

  async fetchUserTestimonials({ commit }, userId) {
    try {
      commit("setLoading", true);
      const { data } = await axios.get(`/testimonials?userId=${userId}`);
      commit("setUserTestimonials", data);
      commit("setLoading", false);
    } catch (error) {
      commit(
        "setError",
        error.response?.data?.message ||
          "Error al cargar testimonios del usuario"
      );
      commit("setLoading", false);
    }
  },

  async fetchTestimonialById({ commit }, id) {
    try {
      commit("setLoading", true);
      const { data } = await axios.get(`/testimonials/${id}`);
      commit("setCurrentTestimonial", data);
      commit("setLoading", false);
      return data;
    } catch (error) {
      commit(
        "setError",
        error.response?.data?.message || "Error al cargar testimonio"
      );
      commit("setLoading", false);
      throw error;
    }
  },

  async createTestimonial({ commit }, testimonialData) {
    try {
      commit("setLoading", true);
      const { data } = await axios.post("/testimonials", testimonialData);
      commit("addTestimonial", data);
      commit("setLoading", false);
      return data;
    } catch (error) {
      commit(
        "setError",
        error.response?.data?.message || "Error al crear testimonio"
      );
      commit("setLoading", false);
      throw error;
    }
  },

  async updateTestimonial({ commit }, { id, testimonialData }) {
    try {
      commit("setLoading", true);
      const { data } = await axios.put(
        `/testimonials/${id}`,
        testimonialData
      );
      commit("updateTestimonial", data);
      commit("setLoading", false);
      return data;
    } catch (error) {
      commit(
        "setError",
        error.response?.data?.message || "Error al actualizar testimonio"
      );
      commit("setLoading", false);
      throw error;
    }
  },

  async deleteTestimonial({ commit }, id) {
    try {
      commit("setLoading", true);
      await axios.delete(`/testimonials/${id}`);
      commit("removeTestimonial", id);
      commit("setLoading", false);
    } catch (error) {
      commit(
        "setError",
        error.response?.data?.message || "Error al eliminar testimonio"
      );
      commit("setLoading", false);
      throw error;
    }
  },

  async approveTestimonial({ commit }, id) {
    try {
      commit("setLoading", true);
      const { data } = await axios.patch(`/testimonials/${id}/approve`);
      commit("updateTestimonial", data);
      commit("setLoading", false);
      return data;
    } catch (error) {
      commit(
        "setError",
        error.response?.data?.message || "Error al aprobar testimonio"
      );
      commit("setLoading", false);
      throw error;
    }
  },

  async featureTestimonial({ commit }, id) {
    try {
      commit("setLoading", true);
      const { data } = await axios.patch(`/testimonials/${id}/feature`);
      commit("updateTestimonial", data);
      commit("setLoading", false);
      return data;
    } catch (error) {
      commit(
        "setError",
        error.response?.data?.message || "Error al destacar testimonio"
      );
      commit("setLoading", false);
      throw error;
    }
  },

  async unfeatureTestimonial({ commit }, id) {
    try {
      commit("setLoading", true);
      const { data } = await axios.patch(`/testimonials/${id}/unfeature`);
      commit("updateTestimonial", data);
      commit("setLoading", false);
      return data;
    } catch (error) {
      commit(
        "setError",
        error.response?.data?.message ||
          "Error al quitar destacado de testimonio"
      );
      commit("setLoading", false);
      throw error;
    }
  },
};

const mutations = {
  setTestimonials(state, testimonials) {
    state.testimonials = testimonials;
  },
  setFeaturedTestimonials(state, testimonials) {
    state.featuredTestimonials = testimonials;
  },
  setUserTestimonials(state, testimonials) {
    state.userTestimonials = testimonials;
  },
  setCurrentTestimonial(state, testimonial) {
    state.currentTestimonial = testimonial;
  },
  addTestimonial(state, testimonial) {
    state.testimonials.push(testimonial);
    state.userTestimonials.push(testimonial);
  },
  updateTestimonial(state, updatedTestimonial) {
    // Actualizar en lista general
    const index = state.testimonials.findIndex(
      (t) => t.id === updatedTestimonial.id
    );
    if (index !== -1) {
      state.testimonials.splice(index, 1, updatedTestimonial);
    }

    // Actualizar en lista de destacados si existe
    const featuredIndex = state.featuredTestimonials.findIndex(
      (t) => t.id === updatedTestimonial.id
    );
    if (featuredIndex !== -1) {
      if (updatedTestimonial.featured && updatedTestimonial.approved) {
        state.featuredTestimonials.splice(featuredIndex, 1, updatedTestimonial);
      } else {
        state.featuredTestimonials.splice(featuredIndex, 1);
      }
    } else if (updatedTestimonial.featured && updatedTestimonial.approved) {
      state.featuredTestimonials.push(updatedTestimonial);
    }

    // Actualizar en lista de usuario si existe
    const userIndex = state.userTestimonials.findIndex(
      (t) => t.id === updatedTestimonial.id
    );
    if (userIndex !== -1) {
      state.userTestimonials.splice(userIndex, 1, updatedTestimonial);
    }

    // Actualizar testimonio actual si coincide
    if (
      state.currentTestimonial &&
      state.currentTestimonial.id === updatedTestimonial.id
    ) {
      state.currentTestimonial = updatedTestimonial;
    }
  },
  removeTestimonial(state, id) {
    state.testimonials = state.testimonials.filter((t) => t.id !== id);
    state.featuredTestimonials = state.featuredTestimonials.filter(
      (t) => t.id !== id
    );
    state.userTestimonials = state.userTestimonials.filter((t) => t.id !== id);

    if (state.currentTestimonial && state.currentTestimonial.id === id) {
      state.currentTestimonial = null;
    }
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