// Blog module for Vuex
import axios from 'axios';

const state = {
  posts: [],
  post: null,
  categories: [],
  comments: [],
  loading: false,
  error: null,
  totalPosts: 0,
  totalPages: 0
};

const getters = {
  getPostBySlug: (state) => (slug) => {
    return state.posts.find(post => post.slug === slug);
  }
};

const actions = {
  // Fetch all posts with optional filters
  async fetchPosts({ commit }, params = {}) {
    try {
      commit('setLoading', true);
      const response = await axios.get('/api/blog/posts', { params });
      commit('setPosts', response.data.posts);
      commit('setTotalPosts', response.data.total);
      commit('setTotalPages', response.data.totalPages);
      commit('setLoading', false);
    } catch (error) {
      commit('setError', error.response?.data?.message || 'Error fetching posts');
      commit('setLoading', false);
    }
  },
  
  // Fetch a single post by ID
  async fetchPostById({ commit }, id) {
    try {
      commit('setLoading', true);
      const response = await axios.get(`/api/blog/posts/${id}`);
      commit('setPost', response.data.post);
      commit('setLoading', false);
    } catch (error) {
      commit('setError', error.response?.data?.message || 'Error fetching post');
      commit('setLoading', false);
    }
  },
  
  // Create a new post
  async createPost({ commit }, postData) {
    try {
      commit('setLoading', true);
      const response = await axios.post('/api/blog/posts', postData);
      commit('addPost', response.data.post);
      commit('setLoading', false);
      return response.data.post;
    } catch (error) {
      commit('setError', error.response?.data?.message || 'Error creating post');
      commit('setLoading', false);
      throw error;
    }
  },
  
  // Update a post
  async updatePost({ commit }, { id, postData }) {
    try {
      commit('setLoading', true);
      const response = await axios.put(`/api/blog/posts/${id}`, postData);
      commit('updatePost', response.data.post);
      commit('setLoading', false);
      return response.data.post;
    } catch (error) {
      commit('setError', error.response?.data?.message || 'Error updating post');
      commit('setLoading', false);
      throw error;
    }
  },
  
  // Delete a post
  async deletePost({ commit }, id) {
    try {
      commit('setLoading', true);
      await axios.delete(`/api/blog/posts/${id}`);
      commit('removePost', id);
      commit('setLoading', false);
    } catch (error) {
      commit('setError', error.response?.data?.message || 'Error deleting post');
      commit('setLoading', false);
      throw error;
    }
  },
  
  // Fetch all categories
  async fetchCategories({ commit }) {
    try {
      commit('setLoading', true);
      const response = await axios.get('/api/blog/categories');
      commit('setCategories', response.data.categories);
      commit('setLoading', false);
    } catch (error) {
      commit('setError', error.response?.data?.message || 'Error fetching categories');
      commit('setLoading', false);
    }
  },
  
  // Fetch comments for a post
  async fetchCommentsByPost({ commit }, postId) {
    try {
      commit('setLoading', true);
      const response = await axios.get(`/api/blog/posts/${postId}/comments`);
      commit('setComments', response.data.comments);
      commit('setLoading', false);
    } catch (error) {
      commit('setError', error.response?.data?.message || 'Error fetching comments');
      commit('setLoading', false);
    }
  },
  
  // Add a comment to a post
  async addComment({ commit }, { postId, commentData }) {
    try {
      commit('setLoading', true);
      const response = await axios.post(`/api/blog/posts/${postId}/comments`, commentData);
      commit('addComment', response.data.comment);
      commit('setLoading', false);
      return response.data.comment;
    } catch (error) {
      commit('setError', error.response?.data?.message || 'Error adding comment');
      commit('setLoading', false);
      throw error;
    }
  }
};

const mutations = {
  setPosts(state, posts) {
    state.posts = posts;
  },
  setPost(state, post) {
    state.post = post;
  },
  addPost(state, post) {
    state.posts.unshift(post);
  },
  updatePost(state, updatedPost) {
    const index = state.posts.findIndex(post => post.id === updatedPost.id);
    if (index !== -1) {
      state.posts.splice(index, 1, updatedPost);
    }
    if (state.post && state.post.id === updatedPost.id) {
      state.post = updatedPost;
    }
  },
  removePost(state, id) {
    state.posts = state.posts.filter(post => post.id !== id);
    if (state.post && state.post.id === id) {
      state.post = null;
    }
  },
  setCategories(state, categories) {
    state.categories = categories;
  },
  setComments(state, comments) {
    state.comments = comments;
  },
  addComment(state, comment) {
    state.comments.push(comment);
  },
  setLoading(state, status) {
    state.loading = status;
  },
  setError(state, error) {
    state.error = error;
  },
  setTotalPosts(state, total) {
    state.totalPosts = total;
  },
  setTotalPages(state, totalPages) {
    state.totalPages = totalPages;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};