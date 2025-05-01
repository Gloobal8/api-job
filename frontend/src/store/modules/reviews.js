import axios from "axios";

const state = {
  reviews: [],
  entityReviews: {},
  userReviews: [],
  currentReview: null,
  loading: false,
  error: null,
};

const getters = {
  getReviewById: (state) => (id) => {
    return state.reviews.find((review) => review.id === id);
  },
  getReviewsByEntity: (state) => (entityType, entityId) => {
    const key = `${entityType}_${entityId}`;
    return state.entityReviews[key] || [];
  },
};

const actions = {
  async fetchReviews({ commit }, filters = {}) {
    try {
      commit("setLoading", true);

      let queryParams = new URLSearchParams();
      Object.keys(filters).forEach((key) => {
        if (filters[key] !== undefined) {
          queryParams.append(key, filters[key]);
        }
      });

      const { data } = await axios.get(
        `/api/reviews?${queryParams.toString()}`
      );
      commit("setReviews", data);
      commit("setLoading", false);
    } catch (error) {
      commit(
        "setError",
        error.response?.data?.message || "Error al cargar reseñas"
      );
      commit("setLoading", false);
    }
  },

  async fetchReviewsByEntity({ commit }, { entityType, entityId }) {
    try {
      commit("setLoading", true);
      const { data } = await axios.get(
        `/api/reviews/entity/${entityType}/${entityId}`
      );
      commit("setEntityReviews", { entityType, entityId, reviews: data });
      commit("setLoading", false);
      return data;
    } catch (error) {
      commit(
        "setError",
        error.response?.data?.message || "Error al cargar reseñas de la entidad"
      );
      commit("setLoading", false);
      throw error;
    }
  },

  async fetchUserReviews({ commit }, userId) {
    try {
      commit("setLoading", true);
      const { data } = await axios.get(`/api/reviews?userId=${userId}`);
      commit("setUserReviews", data);
      commit("setLoading", false);
    } catch (error) {
      commit(
        "setError",
        error.response?.data?.message || "Error al cargar reseñas del usuario"
      );
      commit("setLoading", false);
    }
  },

  async fetchReviewById({ commit }, id) {
    try {
      commit("setLoading", true);
      const { data } = await axios.get(`/api/reviews/${id}`);
      commit("setCurrentReview", data);
      commit("setLoading", false);
      return data;
    } catch (error) {
      commit(
        "setError",
        error.response?.data?.message || "Error al cargar reseña"
      );
      commit("setLoading", false);
      throw error;
    }
  },

  async getAverageRating({ commit }, { entityType, entityId }) {
    try {
      const { data } = await axios.get(
        `/api/reviews/rating/${entityType}/${entityId}`
      );
      return data.averageRating;
    } catch (error) {
      commit(
        "setError",
        error.response?.data?.message ||
          "Error al obtener calificación promedio"
      );
      throw error;
    }
  },

  async getRatingDistribution({ commit }, { entityType, entityId }) {
    try {
      const { data } = await axios.get(
        `/api/reviews/distribution/${entityType}/${entityId}`
      );
      return data;
    } catch (error) {
      commit(
        "setError",
        error.response?.data?.message ||
          "Error al obtener distribución de calificaciones"
      );
      throw error;
    }
  },

  async createReview({ commit }, reviewData) {
    try {
      commit("setLoading", true);
      const { data } = await axios.post("/api/reviews", reviewData);
      commit("addReview", data);
      commit("setLoading", false);
      return data;
    } catch (error) {
      commit(
        "setError",
        error.response?.data?.message || "Error al crear reseña"
      );
      commit("setLoading", false);
      throw error;
    }
  },

  async updateReview({ commit }, { id, reviewData }) {
    try {
      commit("setLoading", true);
      const { data } = await axios.put(`/api/reviews/${id}`, reviewData);
      commit("updateReview", data);
      commit("setLoading", false);
      return data;
    } catch (error) {
      commit(
        "setError",
        error.response?.data?.message || "Error al actualizar reseña"
      );
      commit("setLoading", false);
      throw error;
    }
  },

  async deleteReview({ commit }, id) {
    try {
      commit("setLoading", true);
      await axios.delete(`/api/reviews/${id}`);
      commit("removeReview", id);
      commit("setLoading", false);
    } catch (error) {
      commit(
        "setError",
        error.response?.data?.message || "Error al eliminar reseña"
      );
      commit("setLoading", false);
      throw error;
    }
  },

  async approveReview({ commit }, id) {
    try {
      commit("setLoading", true);
      const { data } = await axios.patch(`/api/reviews/${id}/approve`);
      commit("updateReview", data);
      commit("setLoading", false);
      return data;
    } catch (error) {
      commit(
        "setError",
        error.response?.data?.message || "Error al aprobar reseña"
      );
      commit("setLoading", false);
      throw error;
    }
  },

  async markAsHelpful({ commit }, id) {
    try {
      commit("setLoading", true);
      const { data } = await axios.post(`/api/reviews/${id}/helpful`);
      commit("updateReview", data);
      commit("setLoading", false);
      return data;
    } catch (error) {
      commit(
        "setError",
        error.response?.data?.message || "Error al marcar reseña como útil"
      );
      commit("setLoading", false);
      throw error;
    }
  },

  async reportReview({ commit }, { id, reason }) {
    try {
      commit("setLoading", true);
      const { data } = await axios.post(`/api/reviews/${id}/report`, {
        reason,
      });
      commit("updateReview", data);
      commit("setLoading", false);
      return data;
    } catch (error) {
      commit(
        "setError",
        error.response?.data?.message || "Error al reportar reseña"
      );
      commit("setLoading", false);
      throw error;
    }
  },
};

const mutations = {
  setReviews(state, reviews) {
    state.reviews = reviews;
  },
  setEntityReviews(state, { entityType, entityId, reviews }) {
    const key = `${entityType}_${entityId}`;
    state.entityReviews = {
      ...state.entityReviews,
      [key]: reviews,
    };
  },
  setUserReviews(state, reviews) {
    state.userReviews = reviews;
  },
  setCurrentReview(state, review) {
    state.currentReview = review;
  },
  addReview(state, review) {
    state.reviews.push(review);
    state.userReviews.push(review);

    // Añadir a entityReviews si está aprobada
    if (review.approved) {
      const key = `${review.entityType}_${review.entityId}`;
      if (state.entityReviews[key]) {
        state.entityReviews[key].push(review);
      }
    }
  },
  updateReview(state, updatedReview) {
    // Actualizar en lista general
    const index = state.reviews.findIndex((r) => r.id === updatedReview.id);
    if (index !== -1) {
      state.reviews.splice(index, 1, updatedReview);
    }

    // Actualizar en lista de usuario si existe
    const userIndex = state.userReviews.findIndex(
      (r) => r.id === updatedReview.id
    );
    if (userIndex !== -1) {
      state.userReviews.splice(userIndex, 1, updatedReview);
    }

    // Actualizar en entityReviews
    const key = `${updatedReview.entityType}_${updatedReview.entityId}`;
    if (state.entityReviews[key]) {
      const entityIndex = state.entityReviews[key].findIndex(
        (r) => r.id === updatedReview.id
      );
      if (entityIndex !== -1) {
        if (updatedReview.approved) {
          state.entityReviews[key].splice(entityIndex, 1, updatedReview);
        } else {
          state.entityReviews[key].splice(entityIndex, 1);
        }
      } else if (updatedReview.approved) {
        state.entityReviews[key].push(updatedReview);
      }
    }

    // Actualizar reseña actual si coincide
    if (state.currentReview && state.currentReview.id === updatedReview.id) {
      state.currentReview = updatedReview;
    }
  },
  removeReview(state, id) {
    // Obtener la reseña antes de eliminarla para saber su entityType y entityId
    const review = state.reviews.find((r) => r.id === id);

    state.reviews = state.reviews.filter((r) => r.id !== id);
    state.userReviews = state.userReviews.filter((r) => r.id !== id);

    // Eliminar de entityReviews si existe
    if (review) {
      const key = `${review.entityType}_${review.entityId}`;
      if (state.entityReviews[key]) {
        state.entityReviews[key] = state.entityReviews[key].filter(
          (r) => r.id !== id
        );
      }
    }

    if (state.currentReview && state.currentReview.id === id) {
      state.currentReview = null;
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
