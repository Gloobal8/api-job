import { createStore } from "vuex";
import axios from "axios";
import customFields from "./modules/customFields";
import localization from "./modules/localization";
import testimonials from "./modules/testimonials";
import reviews from "./modules/reviews";
import blog from "./modules/blog";
import snackbar from "./modules/snackbar";

export default createStore({
  state: {
    user: null,
    isAuthenticated: false,
    token: localStorage.getItem("token") || "",
    isLoading: false,
    error: null,
    userEducation: [],
    userExperience: [],
    userTransactions: [],
    userCredits: { balance: 0, history: [] },
    auth: {
      user: null,
      isAuthenticated: false,
    },
  },
  modules: {
    customFields,
    localization,
    testimonials,
    reviews,
    blog,
    snackbar,
    // Otros módulos...
  },
  mutations: {
    SET_USER(state, user) {
      state.user = user;
    },
    SET_TOKEN(state, token) {
      state.token = token;
      localStorage.setItem("token", token);
    },
    CLEAR_USER(state) {
      state.user = null;
      state.token = "";
      localStorage.removeItem("token");
    },
    SET_LOADING(state, isLoading) {
      state.isLoading = isLoading;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
    SET_USER_EDUCATION(state, education) {
      state.userEducation = education;
    },
    SET_USER_EXPERIENCE(state, experience) {
      state.userExperience = experience;
    },
    SET_USER_TRANSACTIONS(state, transactions) {
      state.userTransactions = transactions;
    },
    SET_USER_CREDITS(state, credits) {
      state.userCredits = credits;
    },
    ADD_EDUCATION(state, education) {
      state.userEducation.push(education);
    },
    UPDATE_EDUCATION(state, updatedEducation) {
      const index = state.userEducation.findIndex(
        (e) => e.id === updatedEducation.id
      );
      if (index !== -1) {
        Vue.set(state.userEducation, index, updatedEducation);
      }
    },
    REMOVE_EDUCATION(state, id) {
      state.userEducation = state.userEducation.filter((e) => e.id !== id);
    },
    ADD_EXPERIENCE(state, experience) {
      state.userExperience.push(experience);
    },
    UPDATE_EXPERIENCE(state, updatedExperience) {
      const index = state.userExperience.findIndex(
        (e) => e.id === updatedExperience.id
      );
      if (index !== -1) {
        Vue.set(state.userExperience, index, updatedExperience);
      }
    },
    REMOVE_EXPERIENCE(state, id) {
      state.userExperience = state.userExperience.filter((e) => e.id !== id);
    },
    ADD_TRANSACTION(state, transaction) {
      state.userTransactions.push(transaction);

      // Update credits balance
      if (transaction.type === "credit") {
        state.userCredits.balance += transaction.amount;
      } else if (transaction.type === "debit") {
        state.userCredits.balance -= transaction.amount;
      }

      // Add to history
      state.userCredits.history.push({
        amount: transaction.amount,
        type: transaction.type,
        description: transaction.description,
        date: transaction.createdAt,
      });
    },
  },
  actions: {
    async login({ commit }, credentials) {
      try {
        commit("SET_LOADING", true);
        const response = await axios.post("/auth/login", credentials);

        console.log({
          response,
          archive: 'store/index.js'
        })
        commit("SET_USER", response.data?.user);
        commit("SET_TOKEN", response.data?.token);
        commit("SET_ERROR", null);
        return response;
      } catch (error) {
        commit(
          "SET_ERROR",
          error.response ? error.response.data.message : "Login failed"
        );
        throw error;
      } finally {
        commit("SET_LOADING", false);
      }
    },
    async register({ commit }, userData) {
      try {
        commit("SET_LOADING", true);
        const response = await axios.post("/auth/register", userData);
        commit("SET_ERROR", null);
        return response;
      } catch (error) {
        commit(
          "SET_ERROR",
          error.response ? error.response.data.message : "Registration failed"
        );
        throw error;
      } finally {
        commit("SET_LOADING", false);
      }
    },
    async verifyEmail({ commit }, token) {
      try {
          commit("SET_LOADING", true);
          const response = await axios.post("/auth/verify-email", token);
          commit("SET_ERROR", null);
          return response;
      } catch (error) {
          commit(
              "SET_ERROR",
              error.response ? error.response.data.message : "Verification failed"
          );
          throw error; // Rethrow the error for further handling in the component
      } finally {
          commit("SET_LOADING", false);
      }
    },
    async fetchUser({ commit, state }) {
      if (!state.token) return;

      try {
        commit("SET_LOADING", true);
        const response = await axios.get("/users/profile", {
          headers: { Authorization: `Bearer ${state.token}` },
        });
        commit("SET_USER", response.data);
        commit("SET_ERROR", null);
      } catch (error) {
        commit(
          "SET_ERROR",
          error.response ? error.response.data.message : "Failed to fetch user"
        );
        if (error.response && error.response.status === 401) {
          commit("CLEAR_USER");
        }
      } finally {
        commit("SET_LOADING", false);
      }
    },
    async fetchUserEducation({ commit, state }) {
      if (!state.user || !state.token) return;

      try {
        commit("SET_LOADING", true);
        const response = await axios.get(`/users/${state.user.id}/education`, {
          headers: { Authorization: `Bearer ${state.token}` },
        });
        commit("SET_USER_EDUCATION", response.data.education || []);
        commit("SET_ERROR", null);
      } catch (error) {
        commit(
          "SET_ERROR",
          error.response
            ? error.response.data.message
            : "Failed to fetch education"
        );
      } finally {
        commit("SET_LOADING", false);
      }
    },
    async updateUserEducation({ commit, state }, education) {
      if (!state.user || !state.token) return;

      try {
        commit("SET_LOADING", true);
        const response = await axios.put(
          `/users/${state.user.id}/education`,
          { education },
          {
            headers: { Authorization: `Bearer ${state.token}` },
          }
        );
        commit("SET_USER_EDUCATION", response.data.education);
        commit("SET_ERROR", null);
        return response;
      } catch (error) {
        commit(
          "SET_ERROR",
          error.response
            ? error.response.data.message
            : "Failed to update education"
        );
        throw error;
      } finally {
        commit("SET_LOADING", false);
      }
    },
    async fetchUserExperience({ commit, state }) {
      if (!state.user || !state.token) return;

      try {
        commit("SET_LOADING", true);
        const response = await axios.get(`/users/${state.user.id}/experience`, {
          headers: { Authorization: `Bearer ${state.token}` },
        });
        commit("SET_USER_EXPERIENCE", response.data.experience || []);
        commit("SET_ERROR", null);
      } catch (error) {
        commit(
          "SET_ERROR",
          error.response
            ? error.response.data.message
            : "Failed to fetch experience"
        );
      } finally {
        commit("SET_LOADING", false);
      }
    },
    async updateUserExperience({ commit, state }, experience) {
      if (!state.user || !state.token) return;

      try {
        commit("SET_LOADING", true);
        const response = await axios.put(
          `/users/${state.user.id}/experience`,
          { experience },
          {
            headers: { Authorization: `Bearer ${state.token}` },
          }
        );
        commit("SET_USER_EXPERIENCE", response.data.experience);
        commit("SET_ERROR", null);
        return response;
      } catch (error) {
        commit(
          "SET_ERROR",
          error.response
            ? error.response.data.message
            : "Failed to update experience"
        );
        throw error;
      } finally {
        commit("SET_LOADING", false);
      }
    },
    async fetchUserTransactions({ commit, state }) {
      if (!state.user || !state.token) return;

      try {
        commit("SET_LOADING", true);
        const response = await axios.get(
          `/users/${state.user.id}/transactions`,
          {
            headers: { Authorization: `Bearer ${state.token}` },
          }
        );
        commit("SET_USER_TRANSACTIONS", response.data.transactions || []);
        commit("SET_ERROR", null);
      } catch (error) {
        commit(
          "SET_ERROR",
          error.response
            ? error.response.data.message
            : "Failed to fetch transactions"
        );
      } finally {
        commit("SET_LOADING", false);
      }
    },
    async processTransaction({ commit, state }, transactionData) {
      if (!state.user || !state.token) return;

      try {
        commit("SET_LOADING", true);
        const response = await axios.post(
          `/users/${state.user.id}/credits`,
          transactionData,
          {
            headers: { Authorization: `Bearer ${state.token}` },
          }
        );
        commit("ADD_TRANSACTION", response.data.transaction);
        commit("SET_ERROR", null);
        return response;
      } catch (error) {
        commit(
          "SET_ERROR",
          error.response
            ? error.response.data.message
            : "Failed to process transaction"
        );
        throw error;
      } finally {
        commit("SET_LOADING", false);
      }
    },
    logout({ commit }) {
      commit("CLEAR_USER");
    },
  },
  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user && state.user.role === "admin",
    currentUser: (state) => state.user,
    authStatus: (state) => (state.token ? "authenticated" : ""),
    getUserEducation: (state) => state.userEducation,
    getUserExperience: (state) => state.userExperience,
    getUserTransactions: (state) => state.userTransactions,
    getUserCredits: (state) => state.userCredits,
  },
});
