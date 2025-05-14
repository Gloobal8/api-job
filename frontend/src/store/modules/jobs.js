// MEVN/frontend/src/store/modules/jobs.js

const state = {
  jobs: [],
  currentJob: null,
  loading: false,
  error: null,
  totalJobs: 0,
  totalPages: 0,
};

const mutations = {
  SET_JOBS(state, jobs) {
    state.jobs = jobs;
  },
  SET_CURRENT_JOB(state, job) {
    state.currentJob = job;
  },
  SET_LOADING(state, status) {
    state.loading = status;
  },
  SET_ERROR(state, error) {
    state.error = error;
  },
  SET_TOTAL_JOBS(state, total) {
    state.totalJobs = total;
  },
  SET_TOTAL_PAGES(state, total) {
    state.totalPages = total;
  },
};

const actions = {
  // Obtener un trabajo específico por ID
  async fetchJob({ commit }, jobId) {
    commit("SET_LOADING", true);

    try {
      // Simulamos una llamada a la API con los datos mock
      return new Promise((resolve) => {
        setTimeout(() => {
          // Datos mock del trabajo
          const mockJob = {
            id: jobId,
            title: "Senior Frontend Developer",
            company: {
              id: 1,
              name: "Tech Solutions Inc.",
              logo: "companies/tech-solutions-logo.jpg",
              description:
                "Tech Solutions Inc. is a leading technology company specializing in web and mobile application development, cloud solutions, and digital transformation.",
            },
            location: "New York, USA",
            type: "Full-time",
            category: "IT & Software",
            salary: "$80,000 - $120,000",
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 días atrás
            deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días desde ahora
            featured: true,
            description: `<p>We are looking for a Senior Frontend Developer to join our dynamic team. The ideal candidate will have strong experience with modern JavaScript frameworks and libraries, particularly Vue.js.</p>
            <p>As a Senior Frontend Developer, you will be responsible for implementing visual elements and their behaviors with user interactions. You will work with both front-end and back-end web developers to build all client-side logic. You will also be bridging the gap between the visual elements and the server-side infrastructure, taking an active role on both sides, and defining how the application looks and functions.</p>`,
            requirements: `<ul class="ul">
              <li>5+ years of experience in frontend development</li>
              <li>Strong proficiency in JavaScript, including DOM manipulation and the JavaScript object model</li>
              <li>Thorough understanding of Vue.js and its core principles</li>
              <li>Experience with popular Vue.js workflows (such as Vuex)</li>
              <li>Familiarity with newer specifications of EcmaScript</li>
              <li>Experience with data structure libraries (e.g., Immutable.js)</li>
              <li>Knowledge of isomorphic React is a plus</li>
              <li>Understanding of RESTful APIs and GraphQL</li>
              <li>Knowledge of modern authorization mechanisms, such as JSON Web Token</li>
              <li>Familiarity with modern front-end build pipelines and tools</li>
              <li>Experience with common front-end development tools such as Babel, Webpack, NPM, etc.</li>
              <li>A knack for benchmarking and optimization</li>
              <li>Familiarity with code versioning tools (Git, SVN, etc.)</li>
            </ul>`,
            benefits: `<ul class="ul">
              <li>Competitive salary and performance bonuses</li>
              <li>Health, dental, and vision insurance</li>
              <li>401(k) retirement plan with company match</li>
              <li>Flexible work hours and remote work options</li>
              <li>Professional development opportunities</li>
              <li>Modern office space with amenities</li>
              <li>Regular team building activities</li>
            </ul>`,
            userId: "1", // Para simular que el usuario actual es el propietario
          };

          commit("SET_CURRENT_JOB", mockJob);
          commit("SET_LOADING", false);
          resolve(mockJob);
        }, 1000);
      });
    } catch (error) {
      console.error("Error fetching job:", error);
      commit("SET_ERROR", error.message || "Error al obtener el trabajo");
      commit("SET_LOADING", false);
      throw error;
    }
  },

  // Buscar trabajos relacionados
  async searchJobs({ commit }, { category, limit = 3, excludeId }) {
    commit("SET_LOADING", true);

    try {
      // Simulamos una llamada a la API con datos mock
      return new Promise((resolve) => {
        setTimeout(() => {
          // Datos mock de trabajos relacionados
          const relatedJobs = [
            {
              id: 101,
              title: "Frontend Developer",
              company: {
                id: 1,
                name: "Tech Solutions Inc.",
                logo: "companies/tech-solutions-logo.jpg",
              },
              location: "Remote",
              type: "Full-time",
              salary: "$70,000 - $90,000",
            },
            {
              id: 102,
              title: "Senior UI/UX Designer",
              company: {
                id: 3,
                name: "DesignHub",
                logo: "companies/designhub-logo.jpg",
              },
              location: "San Francisco, USA",
              type: "Full-time",
              salary: "$85,000 - $110,000",
            },
            {
              id: 103,
              title: "Full Stack Developer",
              company: {
                id: 2,
                name: "InnovateSoft",
                logo: "companies/innovatesoft-logo.jpg",
              },
              location: "Chicago, USA",
              type: "Full-time",
              salary: "$90,000 - $120,000",
            },
          ];

          // Filtrar el trabajo actual si se proporciona excludeId
          const filteredJobs = excludeId
            ? relatedJobs.filter((job) => job.id !== parseInt(excludeId))
            : relatedJobs;

          // Limitar el número de resultados
          const limitedJobs = filteredJobs.slice(0, limit);

          commit("SET_LOADING", false);
          resolve(limitedJobs);
        }, 800);
      });
    } catch (error) {
      console.error("Error searching jobs:", error);
      commit(
        "SET_ERROR",
        error.message || "Error al buscar trabajos relacionados"
      );
      commit("SET_LOADING", false);
      throw error;
    }
  },

  // Aplicar a un trabajo
  async applyForJob({ commit }, { jobId, applicationData }) {
    commit("SET_LOADING", true);

    try {
      // Simulamos una llamada a la API
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log(
            `Application submitted for job ${jobId}:`,
            applicationData
          );

          // Simulamos una respuesta exitosa
          const response = {
            success: true,
            message: "Your application has been submitted successfully!",
          };

          commit("SET_LOADING", false);
          resolve(response);
        }, 1500);
      });
    } catch (error) {
      console.error("Error applying for job:", error);
      commit("SET_ERROR", error.message || "Error al enviar la solicitud");
      commit("SET_LOADING", false);
      throw error;
    }
  },

  // Actualizar un trabajo
  async updateJob({ commit }, { id, jobData }) {
    commit("SET_LOADING", true);

    try {
      // Simulamos una llamada a la API
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log(`Job ${id} updated with:`, jobData);

          // Simulamos una respuesta exitosa
          commit("SET_CURRENT_JOB", { ...jobData, id });
          commit("SET_LOADING", false);
          resolve({ ...jobData, id });
        }, 1500);
      });
    } catch (error) {
      console.error("Error updating job:", error);
      commit("SET_ERROR", error.message || "Error al actualizar el trabajo");
      commit("SET_LOADING", false);
      throw error;
    }
  },

  // Eliminar un trabajo
  async deleteJob({ commit }, id) {
    commit("SET_LOADING", true);

    try {
      // Simulamos una llamada a la API
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log(`Job ${id} deleted`);

          // Simulamos una respuesta exitosa
          commit("SET_LOADING", false);
          resolve({ success: true });
        }, 1500);
      });
    } catch (error) {
      console.error("Error deleting job:", error);
      commit("SET_ERROR", error.message || "Error al eliminar el trabajo");
      commit("SET_LOADING", false);
      throw error;
    }
  },
};

const getters = {
  currentJob: (state) => state.currentJob,
  isLoading: (state) => state.loading,
  hasError: (state) => !!state.error,
  errorMessage: (state) => state.error,
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};
