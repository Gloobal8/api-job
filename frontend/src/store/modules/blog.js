import axios from "axios";

const state = {
  posts: [],
  post: null,
  categories: [],
  loading: false,
  error: null,
  totalPosts: 0,
  totalPages: 0,
  currentPage: 1,
};

const mutations = {
  SET_LOADING(state, loading) {
    state.loading = loading;
  },
  SET_ERROR(state, error) {
    state.error = error;
  },
  SET_POSTS(state, posts) {
    state.posts = posts;
  },
  SET_POST(state, post) {
    state.post = post;
  },
  SET_CATEGORIES(state, categories) {
    state.categories = categories;
  },
  SET_PAGINATION(state, { total, totalPages, currentPage }) {
    state.totalPosts = total;
    state.totalPages = totalPages;
    state.currentPage = currentPage;
  },
};

const actions = {
  // Fetch all posts with filters
  async fetchPosts({ commit }, params = {}) {
    try {
      commit("SET_LOADING", true);
      const response = await axios.get("/blog/posts", { params });
      commit("SET_POSTS", response.data.posts);
      commit("SET_PAGINATION", {
        total: response.data.total,
        totalPages: response.data.totalPages,
        currentPage: response.data.currentPage,
      });
      return response.data;
    } catch (error) {
      commit("SET_ERROR", error.message || "Failed to fetch posts");
      throw error;
    } finally {
      commit("SET_LOADING", false);
    }
  },

  // Fetch a single post by ID
  async fetchPostById({ commit }, id) {
    try {
      commit("SET_LOADING", true);
      const response = await axios.get(`/blog/posts/${id}`);
      commit("SET_POST", response.data.post);
      return response.data.post;
    } catch (error) {
      commit("SET_ERROR", error.message || "Failed to fetch post");
      throw error;
    } finally {
      commit("SET_LOADING", false);
    }
  },

  // Fetch a single post by slug
  async fetchPostBySlug({ commit }, slug) {
    try {
      commit("SET_LOADING", true);
      const response = await axios.get(`/blog/posts/slug/${slug}`);
      commit("SET_POST", response.data.post);
      return response.data.post;
    } catch (error) {
      commit("SET_ERROR", error.message || "Failed to fetch post");
      throw error;
    } finally {
      commit("SET_LOADING", false);
    }
  },

  // Create a new post
  async createPost({ commit }, postData) {
    try {
      commit("SET_LOADING", true);
      const response = await axios.post("/blog/posts", postData);
      return response.data.post;
    } catch (error) {
      commit("SET_ERROR", error.message || "Failed to create post");
      throw error;
    } finally {
      commit("SET_LOADING", false);
    }
  },

  // Update a post
  async updatePost({ commit }, { id, postData }) {
    try {
      commit("SET_LOADING", true);
      const response = await axios.put(`/blog/posts/${id}`, postData);
      return response.data.post;
    } catch (error) {
      commit("SET_ERROR", error.message || "Failed to update post");
      throw error;
    } finally {
      commit("SET_LOADING", false);
    }
  },

  // Delete a post
  async deletePost({ commit }, id) {
    try {
      commit("SET_LOADING", true);
      await axios.delete(`/blog/posts/${id}`);
      return true;
    } catch (error) {
      commit("SET_ERROR", error.message || "Failed to delete post");
      throw error;
    } finally {
      commit("SET_LOADING", false);
    }
  },

  // Publish a post
  async publishPost({ commit }, id) {
    try {
      commit("SET_LOADING", true);
      const response = await axios.put(`/blog/posts/${id}/publish`);
      return response.data.post;
    } catch (error) {
      commit("SET_ERROR", error.message || "Failed to publish post");
      throw error;
    } finally {
      commit("SET_LOADING", false);
    }
  },

  // Unpublish a post
  async unpublishPost({ commit }, id) {
    try {
      commit("SET_LOADING", true);
      const response = await axios.put(`/blog/posts/${id}/unpublish`);
      return response.data.post;
    } catch (error) {
      commit("SET_ERROR", error.message || "Failed to unpublish post");
      throw error;
    } finally {
      commit("SET_LOADING", false);
    }
  },

  // Fetch all categories
  async fetchCategories({ commit }) {
    try {
      commit("SET_LOADING", true);
      const response = await axios.get("/blog/categories");
      commit("SET_CATEGORIES", response.data.categories);
      return response.data.categories;
    } catch (error) {
      commit("SET_ERROR", error.message || "Failed to fetch categories");
      throw error;
    } finally {
      commit("SET_LOADING", false);
    }
  },
};

const getters = {
  getPosts: (state) => state.posts,
  getPost: (state) => state.post,
  getCategories: (state) => state.categories,
  isLoading: (state) => state.loading,
  getError: (state) => state.error,
  getTotalPosts: (state) => state.totalPosts,
  getTotalPages: (state) => state.totalPages,
  getCurrentPage: (state) => state.currentPage,
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};
