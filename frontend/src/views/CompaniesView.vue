<template>
  <div class="companies-view">
    <v-container fluid>
      <v-row>
        <v-col cols="12">
          <h1 class="text-h4 mb-4">Companies</h1>

          <!-- Alert for demo data -->
          <v-alert
            v-if="error && companies.length > 0"
            type="info"
            class="mb-4"
            density="compact"
            variant="outlined"
          >
            {{ error }}
          </v-alert>
        </v-col>
      </v-row>

      <v-row>
        <!-- Sidebar Filters -->
        <v-col cols="12" md="3" class="pr-md-4">
          <v-card class="mb-4 sidebar-card">
            <v-card-title
              class="d-flex justify-space-between align-center pt-3 pb-2"
            >
              <span class="text-subtitle-1">Filters</span>
              <v-btn
                icon
                variant="text"
                size="small"
                @click="showFilters = !showFilters"
              >
                <v-icon>{{
                  showFilters ? "mdi-chevron-up" : "mdi-chevron-down"
                }}</v-icon>
              </v-btn>
            </v-card-title>

            <v-expand-transition>
              <div v-show="showFilters">
                <v-divider></v-divider>

                <v-card-text>
                  <v-text-field
                    v-model="search"
                    prepend-inner-icon="mdi-magnify"
                    label="Search companies"
                    variant="outlined"
                    density="compact"
                    hide-details
                    class="mb-4"
                    @input="debounceSearch"
                  ></v-text-field>

                  <v-select
                    v-model="filters.industry"
                    :items="industries"
                    label="Industry"
                    variant="outlined"
                    density="compact"
                    clearable
                    class="mb-4"
                    @update:model-value="fetchCompanies"
                  ></v-select>

                  <v-select
                    v-model="filters.location"
                    :items="locations"
                    label="Location"
                    variant="outlined"
                    density="compact"
                    clearable
                    class="mb-4"
                    @update:model-value="fetchCompanies"
                  ></v-select>

                  <v-select
                    v-model="filters.size"
                    :items="companySizes"
                    label="Company Size"
                    variant="outlined"
                    density="compact"
                    clearable
                    class="mb-4"
                    @update:model-value="fetchCompanies"
                  ></v-select>

                  <v-checkbox
                    v-model="filters.featured"
                    label="Featured companies only"
                    density="compact"
                    hide-details
                    class="mb-2"
                    @update:model-value="fetchCompanies"
                  ></v-checkbox>

                  <v-divider class="my-4"></v-divider>

                  <v-btn
                    block
                    color="error"
                    variant="outlined"
                    @click="resetFilters"
                    prepend-icon="mdi-filter-remove"
                    size="small"
                  >
                    Reset Filters
                  </v-btn>
                </v-card-text>
              </div>
            </v-expand-transition>
          </v-card>

          <!-- Additional sidebar content like featured companies -->
          <v-card class="sidebar-card" v-if="featuredCompanies.length > 0">
            <v-card-title class="text-subtitle-1 pt-3 pb-2">
              Featured Companies
            </v-card-title>
            <v-divider></v-divider>
            <v-list density="compact">
              <v-list-item
                v-for="company in featuredCompanies"
                :key="company.id"
                :to="`/companies/${company.id}`"
                class="featured-company-item"
              >
                <template v-slot:prepend>
                  <v-avatar size="36">
                    <v-img :src="formatUrl(company.logo, true)"></v-img>
                  </v-avatar>
                </template>
                <v-list-item-title>{{ company.name }}</v-list-item-title>
                <v-list-item-subtitle>{{
                  company.industry
                }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>

        <!-- Main Content Area -->
        <v-col cols="12" md="9">
          <!-- Sort options -->
          <v-card class="mb-4 sort-card">
            <v-card-text class="d-flex justify-space-between align-center py-2">
              <div class="d-flex align-center">
                <div class="text-body-2 mr-4">
                  {{ totalCompanies }} companies found
                </div>

                <!-- Selector de modo de visualización -->
                <v-menu offset-y>
                  <template v-slot:activator="{ props }">
                    <v-btn
                      icon
                      variant="text"
                      color="primary"
                      v-bind="props"
                      class="mr-2"
                    >
                      <v-icon>{{
                        viewMode === "pagination"
                          ? "mdi-view-grid"
                          : "mdi-arrow-down-circle"
                      }}</v-icon>
                    </v-btn>
                  </template>
                  <v-list density="compact">
                    <v-list-item
                      @click="setViewMode('pagination')"
                      :active="viewMode === 'pagination'"
                    >
                      <template v-slot:prepend>
                        <v-icon>mdi-view-grid</v-icon>
                      </template>
                      <v-list-item-title>Pagination</v-list-item-title>
                    </v-list-item>
                    <v-list-item
                      @click="setViewMode('infinite')"
                      :active="viewMode === 'infinite'"
                    >
                      <template v-slot:prepend>
                        <v-icon>mdi-arrow-down-circle</v-icon>
                      </template>
                      <v-list-item-title>Infinite Scroll</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </div>

              <v-select
                v-model="sortOption"
                :items="sortOptions"
                label="Sort by"
                variant="outlined"
                density="compact"
                hide-details
                style="max-width: 200px"
                @update:model-value="sortCompanies"
              ></v-select>
            </v-card-text>
          </v-card>

          <!-- Loading state -->
          <v-row v-if="loading">
            <v-col cols="12" class="text-center py-8">
              <v-progress-circular
                indeterminate
                color="primary"
                size="64"
              ></v-progress-circular>
              <p class="mt-3">Loading companies...</p>
            </v-col>
          </v-row>

          <!-- Error state with no companies -->
          <v-row v-else-if="error && companies.length === 0">
            <v-col cols="12" class="text-center py-8">
              <v-alert type="error" class="mb-4">{{ error }}</v-alert>
              <v-btn color="primary" @click="fetchCompanies"> Try Again </v-btn>
            </v-col>
          </v-row>

          <!-- No results state -->
          <v-row v-else-if="companies.length === 0">
            <v-col cols="12" class="text-center py-8">
              <v-alert type="info" class="mb-4">
                No companies found. Try adjusting your filters.
              </v-alert>
              <v-btn color="primary" @click="resetFilters">
                Reset Filters
              </v-btn>
            </v-col>
          </v-row>

          <!-- Companies grid -->
          <v-row v-else>
            <v-col
              v-for="company in companies"
              :key="company.id"
              cols="12"
              sm="6"
              lg="4"
              class="company-col"
            >
              <v-card
                class="company-card"
                :to="`/companies/${company.id}`"
                hover
                elevation="2"
              >
                <v-img
                  :src="formatUrl(company.coverImage, false)"
                  height="150"
                  cover
                  class="white--text"
                  gradient="to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 100%"
                >
                  <v-card-title
                    class="text-white"
                    v-text="company.name"
                  ></v-card-title>
                </v-img>

                <v-card-text>
                  <div class="company-logo">
                    <v-avatar size="64" class="mt-n8 mb-3 company-avatar">
                      <v-img
                        :src="formatUrl(company.logo, true)"
                        @error="handleImageError"
                      ></v-img>
                    </v-avatar>
                  </div>

                  <div v-if="company.description" class="description-text">
                    {{ truncateDescription(company.description, 100) }}
                  </div>

                  <v-chip-group class="mt-2">
                    <v-chip
                      size="small"
                      color="primary"
                      variant="outlined"
                      v-if="company.industry"
                    >
                      {{ company.industry }}
                    </v-chip>
                    <v-chip
                      size="small"
                      color="secondary"
                      variant="outlined"
                      v-if="company.location"
                    >
                      {{ company.location }}
                    </v-chip>
                    <v-chip
                      size="small"
                      color="grey"
                      variant="outlined"
                      v-if="company.size"
                    >
                      {{ company.size }}
                    </v-chip>
                  </v-chip-group>
                </v-card-text>

                <v-divider></v-divider>

                <v-card-actions>
                  <v-btn
                    density="comfortable"
                    variant="text"
                    color="primary"
                    prepend-icon="mdi-eye"
                    :to="`/companies/${company.id}`"
                    @click="goToCompanyDetail(company)"
                  >
                    View Details
                  </v-btn>
                  <v-spacer></v-spacer>

                  <!-- Botón de pantalla completa -->
                  <v-btn
                    icon
                    variant="text"
                    color="grey"
                    size="small"
                    @click.stop.prevent="openCompanyModal(company)"
                    class="mr-2"
                  >
                    <v-icon>mdi-fullscreen</v-icon>
                  </v-btn>

                  <!-- Botón de favoritos existente -->
                  <v-btn
                    icon
                    variant="text"
                    color="grey"
                    size="small"
                    @click.stop.prevent="toggleFavorite(company)"
                  >
                    <v-icon>{{
                      isFavorite(company) ? "mdi-heart" : "mdi-heart-outline"
                    }}</v-icon>
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>

          <!-- Sistema de paginación avanzado -->
          <v-row v-if="viewMode === 'pagination' && totalPages > 0">
            <v-col cols="12">
              <div class="pagination-container">
                <div
                  class="pagination-controls d-flex flex-wrap align-center justify-space-between"
                >
                  <div class="d-flex align-center">
                    <v-select
                      v-model="limit"
                      :items="[9, 12, 18, 24, 36]"
                      label="Items per page"
                      variant="outlined"
                      density="compact"
                      hide-details
                      style="width: 110px"
                      class="mr-4"
                      @update:model-value="onItemsPerPageChange"
                    ></v-select>

                    <span class="text-body-2">
                      Showing {{ (page - 1) * limit + 1 }}-{{
                        Math.min(page * limit, totalCompanies)
                      }}
                      of {{ totalCompanies }}
                    </span>
                  </div>

                  <div class="d-flex align-center">
                    <v-text-field
                      v-model="goToPage"
                      type="number"
                      min="1"
                      :max="totalPages"
                      label="Go to page"
                      variant="outlined"
                      density="compact"
                      hide-details
                      style="width: 100px"
                      class="mr-2"
                      @keydown.enter="onGoToPage"
                    ></v-text-field>

                    <v-btn
                      size="small"
                      color="primary"
                      variant="text"
                      @click="onGoToPage"
                      class="mr-4"
                    >
                      Go
                    </v-btn>

                    <v-pagination
                      v-model="page"
                      :length="totalPages"
                      :total-visible="5"
                      rounded
                      @update:model-value="fetchCompanies"
                    >
                      <template v-slot:prev="{ props }">
                        <v-btn
                          variant="text"
                          icon
                          v-bind="props"
                          aria-label="Previous page"
                        >
                          <v-icon>mdi-chevron-left</v-icon>
                        </v-btn>
                      </template>

                      <template v-slot:next="{ props }">
                        <v-btn
                          variant="text"
                          icon
                          v-bind="props"
                          aria-label="Next page"
                        >
                          <v-icon>mdi-chevron-right</v-icon>
                        </v-btn>
                      </template>
                    </v-pagination>

                    <div class="pagination-jumps d-none d-md-flex">
                      <v-btn
                        icon
                        variant="text"
                        @click="goToFirstPage"
                        :disabled="page === 1"
                        aria-label="First page"
                      >
                        <v-icon>mdi-page-first</v-icon>
                      </v-btn>

                      <v-btn
                        icon
                        variant="text"
                        @click="goToLastPage"
                        :disabled="page === totalPages"
                        aria-label="Last page"
                      >
                        <v-icon>mdi-page-last</v-icon>
                      </v-btn>
                    </div>
                  </div>
                </div>
              </div>
            </v-col>
          </v-row>

          <!-- Botón de carga más para scroll infinito -->
          <v-row v-if="viewMode === 'infinite' && hasMoreCompanies">
            <v-col cols="12" class="text-center mt-4">
              <v-btn
                color="primary"
                variant="outlined"
                @click="loadMoreCompanies"
                :loading="loadingMore"
                :disabled="loadingMore"
              >
                Load More Companies
              </v-btn>
            </v-col>
          </v-row>

          <!-- Modal para mostrar CompanyDetailView -->
          <v-dialog
            v-model="showDetailModal"
            fullscreen
            transition="dialog-bottom-transition"
            :retain-focus="false"
          >
            <v-card>
              <v-toolbar dark color="primary">
                <v-btn icon dark @click="showDetailModal = false">
                  <v-icon>mdi-close</v-icon>
                </v-btn>
                <v-toolbar-title>Company Details</v-toolbar-title>
                <v-spacer></v-spacer>
                <v-toolbar-items>
                  <v-btn
                    icon
                    @click="toggleFavorite({ id: selectedCompanyId })"
                    :color="
                      isFavorite({ id: selectedCompanyId }) ? 'red' : 'grey'
                    "
                  >
                    <v-icon>
                      {{
                        isFavorite({ id: selectedCompanyId })
                          ? "mdi-heart"
                          : "mdi-heart-outline"
                      }}
                    </v-icon>
                  </v-btn>
                </v-toolbar-items>
              </v-toolbar>

              <v-container fluid class="pa-0 fill-height">
                <!-- CompanyDetailView dentro del modal -->
                <CompanyDetailView
                  v-if="selectedCompanyId"
                  :id="selectedCompanyId"
                  :key="selectedCompanyId"
                />
              </v-container>
            </v-card>
          </v-dialog>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import debounce from "lodash/debounce";
import CompanyDetailView from "./companies/CompanyDetailView.vue";

export default {
  name: "CompaniesView",
  components: {
    CompanyDetailView, // Registrar el componente
  },
  data() {
    return {
      search: "",
      page: 1,
      limit: 9,
      totalPages: 0,
      totalCompanies: 0,
      companies: [],
      loading: false,
      error: null,
      showFilters: true, // Controla si los filtros están expandidos o colapsados
      filters: {
        industry: null,
        location: null,
        featured: false,
        size: null,
      },
      viewMode: "pagination", // 'pagination' o 'infinite'
      goToPage: 1, // Para el campo de ir a página específica
      loadingMore: false, // Para el estado de carga en scroll infinito
      allCompanies: [], // Guarda todas las empresas para scroll infinito
      sortOption: "newest", // Opción de ordenación por defecto
      sortOptions: [
        { title: "Newest First", value: "newest" },
        { title: "Oldest First", value: "oldest" },
        { title: "A-Z", value: "name_asc" },
        { title: "Z-A", value: "name_desc" },
        { title: "Most Jobs", value: "most_jobs" },
      ],
      favoriteCompanies: [], // Para almacenar IDs de empresas favoritas
      industries: [
        "Technology",
        "Healthcare",
        "Finance",
        "Education",
        "Manufacturing",
        "Retail",
        "Hospitality",
        "Construction",
        "Transportation",
        "Media",
        "Tecnología y Software",
        "Marketing y Publicidad",
        "Finanzas y Tecnología",
        "Salud y Bienestar",
        "Educación",
        "Retail y E-commerce",
      ],
      locations: [
        "New York",
        "San Francisco",
        "Chicago",
        "Los Angeles",
        "Boston",
        "Seattle",
        "Austin",
        "Denver",
        "Miami",
        "Remote",
        "Madrid, España",
        "Barcelona, España",
        "Valencia, España",
        "Sevilla, España",
        "Bilbao, España",
        "Remoto",
      ],
      companySizes: [
        "1-10 employees",
        "11-50 employees",
        "51-200 employees",
        "201-500 employees",
        "501-1000 employees",
        "1001+ employees",
        "10-25 empleados",
        "25-50 empleados",
        "50-100 empleados",
        "100-250 empleados",
        "250-500 empleados",
      ],
      // Para el modal de detalles
      showDetailModal: false,
      selectedCompanyId: null,
    };
  },

  computed: {
    ...mapGetters(["isLoading", "getError"]),

    // Empresas destacadas para mostrar en la barra lateral
    featuredCompanies() {
      // Usando las primeras 3 empresas como destacadas (en una app real, vendrían de la API)
      return this.companies.slice(0, 3);
    },
    hasMoreCompanies() {
      // Para controlar si hay más empresas para cargar en scroll infinito
      return this.companies.length < this.totalCompanies;
    },
  },

  created() {
    console.log("Component created, fetching companies...");
    this.fetchCompanies();
    // Crear versión debounced de la función de búsqueda
    this.debounceSearch = debounce(() => {
      this.fetchCompanies();
    }, 500);

    // Cargar favoritos desde localStorage
    const savedFavorites = localStorage.getItem("favoriteCompanies");
    if (savedFavorites) {
      try {
        this.favoriteCompanies = JSON.parse(savedFavorites);
      } catch (e) {
        console.error("Error loading favorites:", e);
      }
    }

    // Cargar preferencia de modo de visualización
    const savedViewMode = localStorage.getItem("companiesViewMode");
    if (savedViewMode && ["pagination", "infinite"].includes(savedViewMode)) {
      this.viewMode = savedViewMode;
    }

    // Inicializar goToPage con la página actual
    this.goToPage = this.page;
  },

  methods: {
    goToCompanyDetail(company) {
      console.log("Navigating to company:", company.id);
      this.$router.push({ name: "company-detail", params: { id: company.id } });
    },

    resetFilters() {
      this.search = "";
      this.filters = {
        industry: null,
        location: null,
        featured: false,
        size: null,
      };
      this.page = 1;
      this.fetchCompanies();
    },

    sortCompanies() {
      // Esta función ordenará las empresas según la opción seleccionada
      if (!this.companies.length) return;

      switch (this.sortOption) {
        case "newest":
          // En datos de prueba, usamos el ID como proxy para la fecha
          this.companies.sort((a, b) => b.id - a.id);
          break;
        case "oldest":
          this.companies.sort((a, b) => a.id - b.id);
          break;
        case "name_asc":
          this.companies.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case "name_desc":
          this.companies.sort((a, b) => b.name.localeCompare(a.name));
          break;
        case "most_jobs":
          // Suponiendo que cada empresa tiene una propiedad jobCount
          this.companies.sort((a, b) => (b.jobCount || 0) - (a.jobCount || 0));
          break;
      }
    },

    toggleFavorite(company) {
      // Obtener el ID de la empresa, ya sea que recibamos un objeto completo o solo un ID
      const companyId = typeof company === "object" ? company.id : company;

      const index = this.favoriteCompanies.indexOf(companyId);
      if (index === -1) {
        // Añadir a favoritos
        this.favoriteCompanies.push(companyId);
      } else {
        // Quitar de favoritos
        this.favoriteCompanies.splice(index, 1);
      }

      // Guardar en localStorage
      localStorage.setItem(
        "favoriteCompanies",
        JSON.stringify(this.favoriteCompanies)
      );
    },

    isFavorite(company) {
      // Asegurarse de que funcione tanto si recibe un objeto completo como solo un ID
      const companyId = typeof company === "object" ? company.id : company;
      return this.favoriteCompanies.includes(companyId);
    },

    onItemsPerPageChange() {
      this.page = 1; // Resetear a la primera página cuando cambia el límite
      this.fetchCompanies();
    },

    onGoToPage() {
      // Validar que el número de página sea válido
      const pageNum = parseInt(this.goToPage);
      if (isNaN(pageNum) || pageNum < 1 || pageNum > this.totalPages) {
        // Restaurar al valor actual si es inválido
        this.goToPage = this.page;
        return;
      }

      this.page = pageNum;
      this.fetchCompanies();
    },

    goToFirstPage() {
      this.page = 1;
      this.fetchCompanies();
    },

    goToLastPage() {
      this.page = this.totalPages;
      this.fetchCompanies();
    },

    async loadMoreCompanies() {
      if (this.loadingMore || !this.hasMoreCompanies) return;

      this.loadingMore = true;

      try {
        // Incrementar la página para cargar el siguiente conjunto
        this.page += 1;

        // Replicar la lógica de fetchCompanies pero para añadir en lugar de reemplazar
        // ... (código similar a fetchCompanies pero adaptado)

        // Simulamos una carga de más empresas con los datos de prueba
        await new Promise((resolve) => setTimeout(resolve, 800)); // Simular tiempo de carga

        // En una app real, esto sería una llamada a la API
        const mockCompanies = [
          {
            id: 1,
            name: "Tech Solutions Inc.",
            logo: null,
            coverImage: null,
            location: "Madrid, España",
            industry: "Tecnología y Software",
            size: "250-500 empleados",
            jobCount: 12,
            description:
              "Empresa líder en desarrollo de software y soluciones tecnológicas para empresas de todos los tamaños.",
          },
          {
            id: 2,
            name: "Global Marketing Group",
            logo: null,
            coverImage: null,
            location: "Barcelona, España",
            industry: "Marketing y Publicidad",
            size: "50-100 empleados",
            jobCount: 8,
            description:
              "Agencia de marketing digital especializada en estrategias de crecimiento para startups y empresas tecnológicas.",
          },
          {
            id: 3,
            name: "FinTech Innovations",
            logo: null,
            coverImage: null,
            location: "Valencia, España",
            industry: "Finanzas y Tecnología",
            size: "100-250 empleados",
            jobCount: 15,
            description:
              "Desarrollamos soluciones financieras innovadoras utilizando las últimas tecnologías blockchain y AI.",
          },
          {
            id: 4,
            name: "HealthPlus Systems",
            logo: null,
            coverImage: null,
            location: "Sevilla, España",
            industry: "Salud y Bienestar",
            size: "100-250 empleados",
            jobCount: 6,
            description:
              "Plataforma de telemedicina y gestión de salud digital para profesionales médicos y pacientes.",
          },
          {
            id: 5,
            name: "EduTech Learning",
            logo: null,
            coverImage: null,
            location: "Bilbao, España",
            industry: "Educación",
            size: "25-50 empleados",
            jobCount: 4,
            description:
              "Transformamos la educación con plataformas de aprendizaje adaptativo y contenido interactivo.",
          },
          {
            id: 6,
            name: "Retail Revolution",
            logo: null,
            coverImage: null,
            location: "Madrid, España",
            industry: "Retail y E-commerce",
            size: "50-100 empleados",
            jobCount: 10,
            description:
              "Soluciones omnicanal para minoristas que buscan digitalizar su negocio y mejorar la experiencia del cliente.",
          },
          {
            id: 7,
            name: "Cloud Secure Solutions",
            logo: null,
            coverImage: null,
            location: "Remoto",
            industry: "Tecnología y Software",
            size: "25-50 empleados",
            jobCount: 7,
            description:
              "Especialistas en seguridad en la nube y protección de datos para empresas que operan en entornos regulados.",
          },
          {
            id: 8,
            name: "Digital Nomads Agency",
            logo: null,
            coverImage: null,
            location: "Remoto",
            industry: "Marketing y Publicidad",
            size: "10-25 empleados",
            jobCount: 5,
            description:
              "Agencia de marketing digital con un equipo completamente remoto especializado en estrategias de contenido y SEO.",
          },
          {
            id: 9,
            name: "Green Energy Tech",
            logo: null,
            coverImage: null,
            location: "Barcelona, España",
            industry: "Tecnología y Software",
            size: "50-100 empleados",
            jobCount: 9,
            description:
              "Desarrollamos tecnología para optimizar el consumo energético y promover fuentes de energía renovable.",
          },
        ];

        // Duplicar los datos para tener suficientes para el scroll infinito
        let extendedMockCompanies = [...mockCompanies];
        const originalLength = mockCompanies.length;

        for (let i = 0; i < 20; i++) {
          const duplicates = mockCompanies.map((company) => ({
            ...company,
            id: company.id + 100 + i * 100,
            name: `${company.name} (${i + 1})`,
          }));
          extendedMockCompanies = [...extendedMockCompanies, ...duplicates];
        }

        // Aplicar filtros y ordenación como en fetchCompanies
        let filteredCompanies = [...extendedMockCompanies];

        if (this.search) {
          const searchLower = this.search.toLowerCase();
          filteredCompanies = filteredCompanies.filter(
            (company) =>
              company.name.toLowerCase().includes(searchLower) ||
              (company.description &&
                company.description.toLowerCase().includes(searchLower))
          );
        }

        // Aplicar resto de filtros como en fetchCompanies
        // ...

        // Aplicar ordenación
        switch (this.sortOption) {
          case "newest":
            filteredCompanies.sort((a, b) => b.id - a.id);
            break;
          // ...otras opciones de ordenación...
        }

        // ... (aplicar los mismos filtros y ordenación)

        // Calcular qué empresas mostrar para esta página
        const startIndex = (this.page - 1) * this.limit;
        const endIndex = startIndex + this.limit;
        const newCompanies = filteredCompanies.slice(startIndex, endIndex);

        // Añadir las nuevas empresas al conjunto existente
        this.allCompanies = [...this.allCompanies, ...newCompanies];
        this.companies = this.allCompanies;
      } catch (error) {
        console.error("Error loading more companies:", error);
      } finally {
        this.loadingMore = false;
      }
    },

    async fetchCompanies() {
      // Si estamos en modo scroll infinito y no es la primera carga, usamos loadMoreCompanies
      if (
        this.viewMode === "infinite" &&
        this.allCompanies.length > 0 &&
        this.page > 1
      ) {
        return this.loadMoreCompanies();
      }

      this.loading = true;
      this.error = null;

      // Resetear las empresas acumuladas en modo infinito si es la primera página
      if (this.viewMode === "infinite" && this.page === 1) {
        this.allCompanies = [];
      }

      try {
        // Build query parameters
        const params = {
          page: this.page,
          limit: this.limit,
          sort: this.sortOption,
        };

        if (this.search) {
          params.search = this.search;
        }

        if (this.filters.industry) {
          params.industry = this.filters.industry;
        }

        if (this.filters.location) {
          params.location = this.filters.location;
        }

        if (this.filters.size) {
          params.size = this.filters.size;
        }

        if (this.filters.featured) {
          params.featured = true;
        }

        // Añadir logs de depuración
        console.log("Requesting companies with URL:", "/companies");
        console.log("Params:", params);
        console.log("Axios baseURL:", this.$axios.defaults.baseURL);

        // Make API request
        const response = await this.$axios.get("/companies", { params });

        console.log("API response:", response.data);

        // Verificar la estructura de la respuesta
        if (response.data.companies) {
          // Si la API devuelve un objeto con propiedad companies
          this.companies = response.data.companies;
          this.totalPages = response.data.totalPages || 1;
          this.totalCompanies =
            response.data.totalCompanies || this.companies.length;
        } else if (Array.isArray(response.data)) {
          // Si la API devuelve directamente un array de compañías
          this.companies = response.data;

          // Calcular la paginación manualmente
          this.totalCompanies = response.data.length;
          this.totalPages = Math.ceil(this.totalCompanies / this.limit);
          console.log(
            `Pagination info: ${this.totalCompanies} companies, ${this.totalPages} pages, current page: ${this.page}`
          );
          console.log(`View mode: ${this.viewMode}`);

          // Aplicar paginación manualmente si es necesario
          const startIndex = (this.page - 1) * this.limit;
          const endIndex = startIndex + this.limit;
          this.companies = response.data.slice(startIndex, endIndex);
        } else {
          throw new Error("Unexpected API response format");
        }

        // Aplicar ordenación
        this.sortCompanies();
      } catch (error) {
        console.error("Error fetching companies:", error);
        console.error("Error details:", {
          message: error.message,
          response: error.response
            ? {
                status: error.response.status,
                data: error.response.data,
              }
            : "No response",
          request: error.request
            ? "Request was made but no response received"
            : "No request",
        });

        // SOLUCIÓN TEMPORAL: Usar datos de prueba cuando falla la API
        console.log("Using mock data as fallback");

        // Datos de prueba para empresas con jobCount añadido
        const mockCompanies = [
          {
            id: 1,
            name: "Tech Solutions Inc.",
            logo: null,
            coverImage: null,
            location: "Madrid, España",
            industry: "Tecnología y Software",
            size: "250-500 empleados",
            jobCount: 12,
            description:
              "Empresa líder en desarrollo de software y soluciones tecnológicas para empresas de todos los tamaños.",
          },
          {
            id: 2,
            name: "Global Marketing Group",
            logo: null,
            coverImage: null,
            location: "Barcelona, España",
            industry: "Marketing y Publicidad",
            size: "50-100 empleados",
            jobCount: 8,
            description:
              "Agencia de marketing digital especializada en estrategias de crecimiento para startups y empresas tecnológicas.",
          },
          {
            id: 3,
            name: "FinTech Innovations",
            logo: null,
            coverImage: null,
            location: "Valencia, España",
            industry: "Finanzas y Tecnología",
            size: "100-250 empleados",
            jobCount: 15,
            description:
              "Desarrollamos soluciones financieras innovadoras utilizando las últimas tecnologías blockchain y AI.",
          },
          {
            id: 4,
            name: "HealthPlus Systems",
            logo: null,
            coverImage: null,
            location: "Sevilla, España",
            industry: "Salud y Bienestar",
            size: "100-250 empleados",
            jobCount: 6,
            description:
              "Plataforma de telemedicina y gestión de salud digital para profesionales médicos y pacientes.",
          },
          {
            id: 5,
            name: "EduTech Learning",
            logo: null,
            coverImage: null,
            location: "Bilbao, España",
            industry: "Educación",
            size: "25-50 empleados",
            jobCount: 4,
            description:
              "Transformamos la educación con plataformas de aprendizaje adaptativo y contenido interactivo.",
          },
          {
            id: 6,
            name: "Retail Revolution",
            logo: null,
            coverImage: null,
            location: "Madrid, España",
            industry: "Retail y E-commerce",
            size: "50-100 empleados",
            jobCount: 10,
            description:
              "Soluciones omnicanal para minoristas que buscan digitalizar su negocio y mejorar la experiencia del cliente.",
          },
          {
            id: 7,
            name: "Cloud Secure Solutions",
            logo: null,
            coverImage: null,
            location: "Remoto",
            industry: "Tecnología y Software",
            size: "25-50 empleados",
            jobCount: 7,
            description:
              "Especialistas en seguridad en la nube y protección de datos para empresas que operan en entornos regulados.",
          },
          {
            id: 8,
            name: "Digital Nomads Agency",
            logo: null,
            coverImage: null,
            location: "Remoto",
            industry: "Marketing y Publicidad",
            size: "10-25 empleados",
            jobCount: 5,
            description:
              "Agencia de marketing digital con un equipo completamente remoto especializado en estrategias de contenido y SEO.",
          },
          {
            id: 9,
            name: "Green Energy Tech",
            logo: null,
            coverImage: null,
            location: "Barcelona, España",
            industry: "Tecnología y Software",
            size: "50-100 empleados",
            jobCount: 9,
            description:
              "Desarrollamos tecnología para optimizar el consumo energético y promover fuentes de energía renovable.",
          },
        ];

        // Aplicar filtros a los datos de prueba
        let filteredCompanies = [...mockCompanies];

        if (this.search) {
          const searchLower = this.search.toLowerCase();
          filteredCompanies = filteredCompanies.filter(
            (company) =>
              company.name.toLowerCase().includes(searchLower) ||
              (company.description &&
                company.description.toLowerCase().includes(searchLower))
          );
        }

        if (this.filters.industry) {
          filteredCompanies = filteredCompanies.filter(
            (company) => company.industry === this.filters.industry
          );
        }

        if (this.filters.location) {
          filteredCompanies = filteredCompanies.filter(
            (company) => company.location === this.filters.location
          );
        }

        if (this.filters.size) {
          filteredCompanies = filteredCompanies.filter(
            (company) => company.size === this.filters.size
          );
        }

        if (this.filters.featured) {
          // Simulamos empresas destacadas (las que tienen más de 10 trabajos)
          filteredCompanies = filteredCompanies.filter(
            (company) => company.jobCount > 8
          );
        }

        // Calcular paginación
        this.totalCompanies = filteredCompanies.length;
        this.totalPages = Math.ceil(this.totalCompanies / this.limit);

        // Aplicar ordenación antes de la paginación
        switch (this.sortOption) {
          case "newest":
            filteredCompanies.sort((a, b) => b.id - a.id);
            break;
          case "oldest":
            filteredCompanies.sort((a, b) => a.id - b.id);
            break;
          case "name_asc":
            filteredCompanies.sort((a, b) => a.name.localeCompare(b.name));
            break;
          case "name_desc":
            filteredCompanies.sort((a, b) => b.name.localeCompare(a.name));
            break;
          case "most_jobs":
            filteredCompanies.sort((a, b) => b.jobCount - a.jobCount);
            break;
        }

        // Aplicar paginación
        const startIndex = (this.page - 1) * this.limit;
        const endIndex = startIndex + this.limit;
        this.companies = filteredCompanies.slice(startIndex, endIndex);

        // Mensaje más amigable para el usuario
        this.error =
          "Usando datos de demostración. El servidor está en mantenimiento.";
      } finally {
        this.loading = false;
      }

      // Al final de fetchCompanies, para el modo infinito:
      if (this.viewMode === "infinite") {
        this.allCompanies = this.companies;
      }
    },

    formatUrl(path, isLogo = false) {
      if (!path) {
        // Generar IDs consistentes basados en el nombre de la empresa
        const companyIndex = this.companies.findIndex(
          (c) => c.logo === path || c.coverImage === path
        );
        const baseId = (companyIndex + 1) * 100; // Asegurar diferentes IDs para cada empresa

        if (isLogo) {
          // Para logos, usar imágenes de personas o avatares
          return `https://randomuser.me/api/portraits/${
            companyIndex % 2 ? "men" : "women"
          }/${baseId % 99 || 1}.jpg`;
        } else {
          // Para imágenes de portada, usar paisajes o negocios
          const coverImages = [
            "https://images.unsplash.com/photo-1497366754035-f200968a6e72",
            "https://images.unsplash.com/photo-1497215842964-222b430dc094",
            "https://images.unsplash.com/photo-1497366811353-6870744d04b2",
            "https://images.unsplash.com/photo-1504384308090-c894fdcc538d",
            "https://images.unsplash.com/photo-1556761175-b413da4baf72",
            "https://images.unsplash.com/photo-1462826303086-329426d1aef5",
            "https://images.unsplash.com/photo-1564069114553-7215e1ff1890",
            "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40",
            "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4",
            "https://images.unsplash.com/photo-1577412647305-991150c7d163",
          ];

          // Usar el índice de la empresa para seleccionar una imagen consistente
          const imageIndex = Math.abs(companyIndex) % coverImages.length;
          return `${coverImages[imageIndex]}?auto=format&fit=crop&w=800&q=80`;
        }
      }

      if (path.startsWith("http") || path.startsWith("https")) {
        return path;
      }

      // Asumiendo que tienes una URL base para tus recursos
      const baseUrl = "http://localhost:5000"; // Ajusta según tu configuración
      return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
    },

    handleImageError(event) {
      // Fallback a una imagen por defecto si la imagen no se puede cargar
      if (event.target.src.includes("company")) {
        event.target.src = "https://via.placeholder.com/64?text=Company";
      } else {
        event.target.src =
          "https://via.placeholder.com/350x150?text=Cover+Image";
      }
    },

    truncateDescription(description, length = 100) {
      if (!description) return "";
      return description.length > length
        ? `${description.substring(0, length)}...`
        : description;
    },

    setViewMode(mode) {
      if (this.viewMode === mode) return;

      console.log(`Changing view mode from ${this.viewMode} to ${mode}`);
      this.viewMode = mode;

      if (mode === "infinite") {
        // Guardamos las empresas actuales como punto de partida
        this.allCompanies = [...this.companies];
        console.log(`Set allCompanies with ${this.allCompanies.length} items`);
      } else {
        // Volvemos a la paginación normal
        this.page = 1;
        this.fetchCompanies();
      }

      // Guardar preferencia en localStorage
      localStorage.setItem("companiesViewMode", mode);
    },

    openCompanyModal(company) {
      // Prevenir la navegación predeterminada
      event.preventDefault();
      event.stopPropagation();

      // Establecer la empresa seleccionada y mostrar el modal
      this.selectedCompanyId = company.id;
      this.showDetailModal = true;

      // Registrar el evento para análisis
      console.log(
        `Opening modal for company: ${company.name} (ID: ${company.id})`
      );
    },
  },
};
</script>

<style scoped>
.companies-view {
  background-color: #f9f9f9;
  min-height: 100vh;
}

.sidebar-card {
  position: sticky;
  top: 80px;
  transition: box-shadow 0.3s;
}

.sidebar-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
}

.sort-card {
  transition: box-shadow 0.3s;
}

.sort-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
}

.company-col {
  transition: transform 0.3s;
}

.company-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: all 0.3s;
  border-radius: 12px;
  overflow: hidden;
}

.company-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1) !important;
}

.company-logo {
  display: flex;
  justify-content: center;
}

.company-avatar {
  border: 2px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.description-text {
  height: 60px;
  overflow: hidden;
  margin-bottom: 10px;
  color: rgba(0, 0, 0, 0.7);
}

.featured-company-item {
  transition: background-color 0.2s;
}

.featured-company-item:hover {
  background-color: rgba(0, 0, 0, 0.03);
}

/* Estilos responsivos */
@media (max-width: 960px) {
  .sidebar-card {
    position: relative;
    top: 0;
    margin-bottom: 16px;
  }
}

@media (max-width: 600px) {
  .company-card {
    margin-bottom: 16px;
  }

  .company-col {
    padding-bottom: 0;
  }
}

/* Animaciones */
.v-expand-transition-enter-active,
.v-expand-transition-leave-active {
  transition: all 0.3s ease-out;
}

.v-expand-transition-enter-from,
.v-expand-transition-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* Mejoras para los chips */
.v-chip {
  font-size: 0.75rem;
  font-weight: 500;
}

/* Estilo para el botón de favoritos */
.v-btn--icon.v-btn--density-default {
  width: 36px;
  height: 36px;
}

/* Estilo para el contador de resultados */
.text-body-2 {
  color: rgba(0, 0, 0, 0.6);
}

/* Estilo para los títulos de las tarjetas */
.v-card-title.text-subtitle-1 {
  font-weight: 600;
  letter-spacing: 0.0125em;
}

/* Estilo para las imágenes de portada */
.v-img.white--text {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

/* Estilos para el sistema de paginación avanzado */
.pagination-container {
  margin-top: 24px;
  margin-bottom: 24px;
}

.pagination-controls {
  background-color: white;
  border-radius: 8px;
  padding: 12px 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.pagination-jumps {
  margin-left: 8px;
}

/* Estilos para scroll infinito */
.infinite-scroll-trigger {
  height: 20px;
  margin-top: 20px;
  margin-bottom: 20px;
}

/* Mejorar estilos responsivos */
@media (max-width: 768px) {
  .pagination-controls {
    flex-direction: column;
    align-items: center;
  }

  .pagination-controls > div {
    margin-bottom: 16px;
    width: 100%;
    justify-content: center;
  }

  .pagination-controls .v-pagination {
    margin-top: 8px;
  }
}

/* Estilo para el botón de reset */
.v-btn[color="error"] {
  opacity: 0.9;
}

.v-btn[color="error"]:hover {
  opacity: 1;
}

/* Estilos para el modal */
.v-dialog--fullscreen {
  background-color: #f9f9f9;
}

/* Estilo para el botón de pantalla completa */
.mdi-fullscreen {
  transition: transform 0.2s;
}

.mdi-fullscreen:hover {
  transform: scale(1.1);
}

/* Añadir animación al modal */
.dialog-bottom-transition-enter-active,
.dialog-bottom-transition-leave-active {
  transition: transform 0.3s ease-in-out;
}

.dialog-bottom-transition-enter-from,
.dialog-bottom-transition-leave-to {
  transform: translateY(100%);
}

.v-container.fill-height {
  justify-content: space-evenly;
}
</style>
