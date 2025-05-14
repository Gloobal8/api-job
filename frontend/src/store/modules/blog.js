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
      console.log("API error, using mock data:", error);
      if (useMockData("fetchPosts")) {
        // Filtrar posts según los parámetros
        let filteredPosts = [...mockPosts];

        if (params.categoryId) {
          filteredPosts = filteredPosts.filter(
            (post) => post.categoryId === params.categoryId
          );
        }

        if (params.tag) {
          filteredPosts = filteredPosts.filter((post) =>
            post.tags.includes(params.tag)
          );
        }

        if (params.status) {
          filteredPosts = filteredPosts.filter(
            (post) => post.status === params.status
          );
        }

        // Paginación
        const page = params.page || 1;
        const limit = params.limit || 10;
        const total = filteredPosts.length;
        const totalPages = Math.ceil(total / limit);
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedPosts = filteredPosts.slice(startIndex, endIndex);

        commit("SET_POSTS", paginatedPosts);
        commit("SET_PAGINATION", {
          total,
          totalPages,
          currentPage: page,
        });

        return {
          posts: paginatedPosts,
          total,
          totalPages,
          currentPage: page,
        };
      } else {
        commit("SET_ERROR", error.message || "Failed to fetch posts");
        throw error;
      }
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
      console.log("API error, using mock data:", error);
      if (useMockData("fetchPostById")) {
        const post = mockPosts.find((post) => post.id === id);

        if (post) {
          commit("SET_POST", post);
          return post;
        }

        throw new Error("Post not found");
      } else {
        commit("SET_ERROR", error.message || "Failed to fetch post");
        throw error;
      }
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
      console.log("API error, using mock data:", error);
      if (useMockData("fetchCategories")) {
        commit("SET_CATEGORIES", mockCategories);
        return mockCategories;
      } else {
        commit("SET_ERROR", error.message || "Failed to fetch categories");
        throw error;
      }
    } finally {
      commit("SET_LOADING", false);
    }
    // Simulación de datos para desarrollo
    if (process.env.NODE_ENV === "development") {
      // Si la respuesta está vacía o hay un error, usar datos simulados
      const mockCategories = [
        {
          id: "1",
          name: "Getting Started",
          slug: "getting-started",
          description: "Tutorials and guides for beginners",
          parentId: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "2",
          name: "Backend Development",
          slug: "backend-development",
          description: "Topics related to server-side development",
          parentId: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "3",
          name: "Frontend Development",
          slug: "frontend-development",
          description: "Everything about client-side development",
          parentId: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "4",
          name: "DevOps",
          slug: "devops",
          description: "Deployment, CI/CD, and infrastructure",
          parentId: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "5",
          name: "Career",
          slug: "career",
          description: "Career advice and professional development",
          parentId: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      const mockPosts = [
        {
          id: "1",
          title: "Getting Started with MEVN Stack",
          slug: "getting-started-with-mevn-stack",
          content: "<p>This is a sample post about MEVN stack...</p>",
          excerpt: "Learn how to set up a MEVN stack project from scratch",
          categoryId: "1",
          status: "published",
          featuredImage: "https://via.placeholder.com/800x400",
          tags: ["Vue.js", "MongoDB", "Express", "Node.js"],
          authorId: "1",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "2",
          title: "Advanced Vue.js Techniques",
          slug: "advanced-vuejs-techniques",
          content: "<p>Explore advanced Vue.js concepts...</p>",
          excerpt: "Take your Vue.js skills to the next level",
          categoryId: "3",
          status: "published",
          featuredImage: "https://via.placeholder.com/800x400",
          tags: ["Vue.js", "JavaScript", "Frontend"],
          authorId: "1",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "3",
          title: "Building RESTful APIs with Express",
          slug: "building-restful-apis-with-express",
          content: "<p>Learn how to create robust APIs...</p>",
          excerpt: "A comprehensive guide to RESTful API design",
          categoryId: "2",
          status: "published",
          featuredImage: "https://via.placeholder.com/800x400",
          tags: ["Express", "Node.js", "API", "Backend"],
          authorId: "1",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      // Función auxiliar para usar datos mock en desarrollo
      const useMockData = (action) => {
        if (process.env.NODE_ENV === "development") {
          console.log(`API error, using mock data for: ${action}`);
          return true;
        }
        return false;
      };

      commit("SET_CATEGORIES", mockCategories);
      return mockCategories;
    }
  },

  // Create a new category
  async createCategory({ commit }, categoryData) {
    try {
      commit("SET_LOADING", true);
      const response = await axios.post("/blog/categories", categoryData);

      // Actualizar la lista de categorías después de crear una nueva
      await this.dispatch("blog/fetchCategories");

      return response.data.category;
    } catch (error) {
      console.log("API error, using mock data:", error);
      if (useMockData("createCategory")) {
        const newCategory = {
          ...categoryData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Actualizar los datos mock
        mockCategories.push(newCategory);
        commit("SET_CATEGORIES", [...mockCategories]);

        return newCategory;
      } else {
        commit("SET_ERROR", error.message || "Failed to create category");
        throw error;
      }
    } finally {
      commit("SET_LOADING", false);
    }
  },

  // Update a category
  async updateCategory({ commit }, { id, categoryData }) {
    try {
      commit("SET_LOADING", true);
      const response = await axios.put(`/blog/categories/${id}`, categoryData);

      // Actualizar la lista de categorías después de actualizar
      await this.dispatch("blog/fetchCategories");

      return response.data.category;
    } catch (error) {
      console.log("API error, using mock data:", error);
      if (useMockData("updateCategory")) {
        const index = mockCategories.findIndex((cat) => cat.id === id);

        if (index !== -1) {
          const updatedCategory = {
            ...mockCategories[index],
            ...categoryData,
            updatedAt: new Date().toISOString(),
          };

          mockCategories[index] = updatedCategory;
          commit("SET_CATEGORIES", [...mockCategories]);

          return updatedCategory;
        }

        throw new Error("Category not found");
      } else {
        commit("SET_ERROR", error.message || "Failed to update category");
        throw error;
      }
    } finally {
      commit("SET_LOADING", false);
    }
  },

  // Delete a category
  async deleteCategory({ commit }, id) {
    try {
      commit("SET_LOADING", true);
      await axios.delete(`/blog/categories/${id}`);

      // Actualizar la lista de categorías después de eliminar
      await this.dispatch("blog/fetchCategories");

      return true;
    } catch (error) {
      console.log("API error, using mock data:", error);
      if (useMockData("deleteCategory")) {
        const index = mockCategories.findIndex((cat) => cat.id === id);

        if (index !== -1) {
          mockCategories.splice(index, 1);
          commit("SET_CATEGORIES", [...mockCategories]);
          return true;
        }

        throw new Error("Category not found");
      } else {
        commit("SET_ERROR", error.message || "Failed to delete category");
        throw error;
      }
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
