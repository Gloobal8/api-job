<template>
  <v-container class="jobs-view">
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">Empleos Disponibles</h1>
      </v-col>
    </v-row>

    <v-row>
      <!-- Filtros -->
      <v-col cols="12" md="3">
        <v-card outlined class="mb-4">
          <v-card-title>Filtros</v-card-title>
          <v-card-text>
            <v-text-field
              v-model="filters.search"
              label="Buscar empleo"
              outlined
              dense
              prepend-inner-icon="mdi-magnify"
              @input="debouncedSearch"
              clearable
            ></v-text-field>

            <v-select
              v-model="filters.category"
              :items="categories"
              label="Categoría"
              outlined
              dense
              clearable
              @change="loadJobs"
            ></v-select>

            <v-select
              v-model="filters.location"
              :items="locations"
              label="Ubicación"
              outlined
              dense
              clearable
              @change="loadJobs"
            ></v-select>

            <v-select
              v-model="filters.jobType"
              :items="jobTypes"
              label="Tipo de empleo"
              outlined
              dense
              clearable
              @change="loadJobs"
            ></v-select>

            <v-select
              v-model="filters.experience"
              :items="experienceLevels"
              label="Experiencia"
              outlined
              dense
              clearable
              @change="loadJobs"
            ></v-select>

            <v-select
              v-model="sortBy"
              :items="sortOptions"
              label="Ordenar por"
              outlined
              dense
              @change="loadJobs"
            ></v-select>

            <v-btn color="primary" block class="mt-4" @click="loadJobs">
              Aplicar Filtros
            </v-btn>

            <v-btn text block class="mt-2" @click="resetFilters">
              Limpiar Filtros
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Lista de empleos -->
      <v-col cols="12" md="9">
        <v-row v-if="loading">
          <v-col v-for="i in 6" :key="i" cols="12">
            <v-skeleton-loader type="card" height="200"></v-skeleton-loader>
          </v-col>
        </v-row>

        <template v-else>
          <div v-if="jobs.length === 0" class="text-center py-6">
            <v-icon large color="grey lighten-1">mdi-briefcase-outline</v-icon>
            <p class="text-h6 grey--text text--darken-1 mt-2">
              No se encontraron empleos con los filtros seleccionados
            </p>
            <v-btn text color="primary" class="mt-4" @click="resetFilters">
              Limpiar filtros
            </v-btn>
          </div>

          <div v-else>
            <v-card
              v-for="job in jobs"
              :key="job.id"
              outlined
              class="mb-4 job-card"
              :to="`/jobs/${job.id}`"
            >
              <v-card-text>
                <v-row align="center">
                  <v-col cols="12" sm="2" class="text-center">
                    <v-avatar size="70" class="company-logo">
                      <v-img
                        v-if="job.companyLogo"
                        :src="job.companyLogo"
                        alt="Company Logo"
                      ></v-img>
                      <v-icon v-else size="40" color="primary"
                        >mdi-domain</v-icon
                      >
                    </v-avatar>
                  </v-col>

                  <v-col cols="12" sm="7">
                    <div class="text-h6">{{ job.title }}</div>
                    <div class="text-subtitle-1 primary--text">
                      {{ job.companyName }}
                    </div>
                    <div class="d-flex flex-wrap mt-2">
                      <v-chip x-small class="mr-2 mb-2" outlined>
                        <v-icon left small>mdi-map-marker</v-icon>
                        {{ job.location }}
                      </v-chip>
                      <v-chip x-small class="mr-2 mb-2" outlined>
                        <v-icon left small>mdi-briefcase</v-icon>
                        {{ job.jobType }}
                      </v-chip>
                      <v-chip x-small class="mr-2 mb-2" outlined>
                        <v-icon left small>mdi-account-tie</v-icon>
                        {{ job.experience }}
                      </v-chip>
                    </div>
                  </v-col>

                  <v-col cols="12" sm="3" class="text-right">
                    <div
                      v-if="job.salary"
                      class="text-subtitle-1 font-weight-bold"
                    >
                      {{ formatSalary(job.salary) }}
                    </div>
                    <div class="text-caption mt-2">
                      <v-icon small class="mr-1">mdi-clock-outline</v-icon>
                      {{ formatDate(job.postedDate) }}
                    </div>
                    <v-btn
                      color="primary"
                      outlined
                      small
                      class="mt-2"
                      :to="`/jobs/${job.id}`"
                    >
                      Ver Detalles
                    </v-btn>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>

            <v-pagination
              v-if="totalPages > 1"
              v-model="currentPage"
              :length="totalPages"
              @input="loadJobs"
              class="mt-6"
            ></v-pagination>
          </div>
        </template>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: "JobsView",
  data() {
    return {
      loading: false,
      jobs: [],
      totalJobs: 0,
      totalPages: 0,
      currentPage: 1,
      searchTimeout: null,
      filters: {
        search: "",
        category: null,
        location: null,
        jobType: null,
        experience: null,
      },
      sortBy: "recent",
      categories: [
        { title: "Tecnología", value: "technology" },
        { title: "Marketing", value: "marketing" },
        { title: "Ventas", value: "sales" },
        { title: "Diseño", value: "design" },
        { title: "Educación", value: "education" },
      ],
      locations: [
        { title: "Madrid", value: "madrid" },
        { title: "Barcelona", value: "barcelona" },
        { title: "Valencia", value: "valencia" },
        { title: "Sevilla", value: "sevilla" },
        { title: "Remoto", value: "remote" },
      ],
      jobTypes: [
        { title: "Tiempo completo", value: "full-time" },
        { title: "Medio tiempo", value: "part-time" },
        { title: "Contrato", value: "contract" },
        { title: "Freelance", value: "freelance" },
        { title: "Internship", value: "internship" },
      ],
      experienceLevels: [
        { title: "Sin experiencia", value: "entry" },
        { title: "1-2 años", value: "junior" },
        { title: "3-5 años", value: "mid" },
        { title: "5+ años", value: "senior" },
        { title: "10+ años", value: "executive" },
      ],
      sortOptions: [
        { title: "Más recientes", value: "recent" },
        { title: "Salario (mayor a menor)", value: "salary-desc" },
        { title: "Salario (menor a mayor)", value: "salary-asc" },
        { title: "Relevancia", value: "relevance" },
      ],
    };
  },
  created() {
    // Cargar trabajos al iniciar
    this.loadJobs();
  },
  methods: {
    async loadJobs() {
      try {
        this.loading = true;

        // En una implementación real, aquí harías una llamada a la API
        // Por ahora, simulamos una respuesta con datos ficticios
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Datos de ejemplo
        this.jobs = [
          {
            id: "1",
            title: "Desarrollador Full Stack",
            companyName: "TechCorp",
            companyLogo: null,
            location: "Madrid",
            jobType: "Tiempo completo",
            experience: "3-5 años",
            salary: { min: 35000, max: 45000, currency: "EUR", period: "year" },
            postedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          },
          {
            id: "2",
            title: "Diseñador UX/UI",
            companyName: "Creative Studio",
            companyLogo: null,
            location: "Barcelona",
            jobType: "Tiempo completo",
            experience: "1-2 años",
            salary: { min: 28000, max: 32000, currency: "EUR", period: "year" },
            postedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          },
          {
            id: "3",
            title: "Especialista en Marketing Digital",
            companyName: "Growth Agency",
            companyLogo: null,
            location: "Remoto",
            jobType: "Medio tiempo",
            experience: "3-5 años",
            salary: { min: 25000, max: 30000, currency: "EUR", period: "year" },
            postedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          },
        ];

        this.totalJobs = 15; // Total ficticio
        this.totalPages = 5; // Páginas ficticias
      } catch (error) {
        console.error("Error loading jobs:", error);
        // Aquí podrías mostrar un mensaje de error
      } finally {
        this.loading = false;
      }
    },
    debouncedSearch() {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.currentPage = 1;
        this.loadJobs();
      }, 500);
    },
    resetFilters() {
      this.filters = {
        search: "",
        category: null,
        location: null,
        jobType: null,
        experience: null,
      };
      this.sortBy = "recent";
      this.currentPage = 1;
      this.loadJobs();
    },
    formatDate(date) {
      if (!date) return "";

      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        return "Hoy";
      } else if (diffDays === 1) {
        return "Ayer";
      } else if (diffDays < 7) {
        return `Hace ${diffDays} días`;
      } else if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7);
        return `Hace ${weeks} ${weeks === 1 ? "semana" : "semanas"}`;
      } else {
        return date.toLocaleDateString("es-ES", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      }
    },
    formatSalary(salary) {
      if (!salary) return "Salario no especificado";

      const { min, max, currency, period } = salary;
      let formattedSalary = "";

      if (min && max) {
        formattedSalary = `${min.toLocaleString()} - ${max.toLocaleString()} ${currency}`;
      } else if (min) {
        formattedSalary = `Desde ${min.toLocaleString()} ${currency}`;
      } else if (max) {
        formattedSalary = `Hasta ${max.toLocaleString()} ${currency}`;
      }

      if (period) {
        const periodMap = {
          hour: "/hora",
          day: "/día",
          week: "/semana",
          month: "/mes",
          year: "/año",
        };
        formattedSalary += ` ${periodMap[period] || ""}`;
      }

      return formattedSalary;
    },
  },
};
</script>

<style scoped>
.job-card {
  transition: transform 0.2s, box-shadow 0.2s;
}

.job-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1) !important;
}

.company-logo {
  background-color: #f5f5f5;
}
</style>
