export default {
  namespaced: true,
  state: {
    show: false,
    text: "",
    color: "success",
    timeout: 3000,
  },
  mutations: {
    SET_SNACKBAR(state, payload) {
      state.show = payload.show;
      state.text = payload.text || "";
      state.color = payload.color || "success";
      state.timeout = payload.timeout || 3000;
    },
  },
  actions: {
    showSnackbar({ commit }, payload) {
      commit("SET_SNACKBAR", {
        show: true,
        text: payload.text,
        color: payload.color,
        timeout: payload.timeout,
      });
    },
    hideSnackbar({ commit }) {
      commit("SET_SNACKBAR", { show: false });
    },
  },
};
