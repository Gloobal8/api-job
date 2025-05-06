<template>
  <div class="home">
    <!-- Contenedor principal sin márgenes laterales -->
    <v-container class="pa-0" fluid>
      <!-- Sección Hero con fondo personalizado -->
      <div
        class="hero-section mb-6"
        :style="`background-image: url(${getImageUrl(
          '/uploads/backgrounds/bg-banner.svg'
        )})`"
      >
        <v-container class="max-width-container py-12">
          <div class="text-center mb-8">
            <h1 class="text-h3 font-weight-bold mb-4">Find Your Dream Job</h1>
            <p class="text-h6">
              Search through thousands of job listings and find the perfect
              match for your skills
            </p>
          </div>

          <v-row justify="center" class="ma-0">
            <v-col cols="12" class="px-4">
              <v-card class="pa-4 rounded-lg search-card" elevation="0">
                <v-form @submit.prevent="searchJobs">
                  <div class="search-form-container">
                    <v-row class="ma-0">
                      <!-- Input Keywords (ocupa todo el ancho en pantallas grandes) -->
                      <v-col cols="12" class="pa-2 search-container">
                        <v-autocomplete
                          ref="keywordInput"
                          v-model="search.keyword"
                          :items="[]"
                          label="Keywords"
                          variant="outlined"
                          hide-details
                          clearable
                          auto-select-first
                          :menu-props="{
                            contentClass: 'custom-search-menu',
                            maxHeight: '320px',
                            maxWidth: 'fit-content',
                          }"
                          @focus="showSearchMenu = true"
                          @click:clear="clearKeyword"
                          @update:modelValue="onKeywordUpdate"
                          class="search-input"
                          height="56"
                          color="primary"
                          bg-color="grey-lighten-5"
                        >
                          <template v-slot:prepend-inner>
                            <v-icon color="primary">mdi-magnify</v-icon>
                          </template>
                          <template v-slot:append>
                            <v-fade-transition leave-absolute>
                              <v-icon
                                v-if="search.keyword"
                                @click.stop="clearKeyword"
                                color="primary"
                              >
                                mdi-close
                              </v-icon>
                            </v-fade-transition>
                          </template>
                          <template v-slot:no-data>
                            <v-list
                              class="custom-search-dropdown"
                              style="padding: 0px"
                            >
                              <!-- Lista de sugerencias o búsquedas guardadas -->
                              <div v-if="!showSavedSearches">
                                <v-list-subheader class="search-section-title"
                                  >Búsquedas sugeridas</v-list-subheader
                                >
                                <div class="search-results-container">
                                  <v-list-item
                                    v-for="(
                                      suggestion, i
                                    ) in filteredSuggestions"
                                    :key="`suggestion-${i}`"
                                    @click="applyKeyword(suggestion, $event)"
                                    density="compact"
                                    class="search-item"
                                  >
                                    <v-list-item-title>
                                      <v-icon size="small" class="mr-2"
                                        >mdi-magnify</v-icon
                                      >
                                      {{ suggestion }}
                                    </v-list-item-title>
                                    <template v-slot:append>
                                      <v-icon
                                        size="small"
                                        @click.stop="
                                          removeSuggestion(suggestion)
                                        "
                                        class="delete-icon"
                                      >
                                        mdi-delete
                                      </v-icon>
                                    </template>
                                  </v-list-item>

                                  <!-- Opción para crear nueva búsqueda si no hay coincidencias exactas -->
                                  <v-list-item
                                    v-if="showCreateNewOption"
                                    @click="createNewSearch($event)"
                                    density="compact"
                                    class="search-item create-new-item"
                                  >
                                    <v-list-item-title>
                                      <v-icon
                                        size="small"
                                        color="success"
                                        class="mr-2"
                                        >mdi-plus-circle</v-icon
                                      >
                                      Crear búsqueda "<strong>{{
                                        search.keyword
                                      }}</strong
                                      >"
                                    </v-list-item-title>
                                  </v-list-item>

                                  <!-- Mensaje de no hay coincidencias -->
                                  <v-list-item
                                    v-if="
                                      filteredSuggestions.length === 0 &&
                                      !showCreateNewOption
                                    "
                                  >
                                    <v-list-item-title
                                      class="text-center text-body-2 text-disabled"
                                    >
                                      No hay sugerencias que coincidan
                                    </v-list-item-title>
                                  </v-list-item>
                                </div>

                                <!-- Botones fijos en la parte inferior -->
                                <div
                                  class="search-toggle-buttons"
                                  style="padding-bottom: 0px"
                                >
                                  <!-- Botón de Guardar búsqueda -->
                                  <v-btn
                                    v-if="shouldShowSaveButton"
                                    small
                                    text
                                    color="success"
                                    @click.stop="saveCurrentSearch()"
                                    class="text-none"
                                  >
                                    <v-icon size="small" start
                                      >mdi-arrow-up</v-icon
                                    >
                                    Guardar búsqueda
                                  </v-btn>

                                  <v-spacer
                                    v-if="shouldShowSaveButton"
                                  ></v-spacer>

                                  <!-- Botón de Búsquedas guardadas -->
                                  <v-btn
                                    small
                                    text
                                    color="primary"
                                    @click.stop="showSavedSearches = true"
                                    class="text-none"
                                  >
                                    <v-icon size="small" start
                                      >mdi-history</v-icon
                                    >
                                    Búsquedas guardadas
                                  </v-btn>
                                </div>
                              </div>

                              <!-- Lista de búsquedas guardadas -->
                              <div v-else>
                                <v-list-subheader class="search-section-title"
                                  >Búsquedas guardadas</v-list-subheader
                                >
                                <div class="search-results-container">
                                  <v-list-item
                                    v-for="(saved, i) in savedSearches"
                                    :key="`saved-${i}`"
                                    @click="applySavedSearch(saved, $event)"
                                    density="compact"
                                    class="search-item"
                                  >
                                    <v-list-item-title>
                                      <v-icon size="small" class="mr-2"
                                        >mdi-clock-outline</v-icon
                                      >
                                      {{ saved.name }}
                                    </v-list-item-title>
                                    <template v-slot:append>
                                      <v-icon
                                        size="small"
                                        @click.stop="removeSavedSearch(i)"
                                        class="delete-icon"
                                      >
                                        mdi-delete
                                      </v-icon>
                                    </template>
                                  </v-list-item>
                                  <v-list-item
                                    v-if="savedSearches.length === 0"
                                  >
                                    <v-list-item-title
                                      class="text-center text-body-2 text-disabled"
                                    >
                                      No hay búsquedas guardadas
                                    </v-list-item-title>
                                  </v-list-item>
                                </div>

                                <!-- Botones fijos en la parte inferior -->
                                <div class="search-toggle-buttons">
                                  <!-- Botón de Búsquedas sugeridas -->
                                  <v-btn
                                    small
                                    text
                                    color="primary"
                                    @click.stop="showSavedSearches = false"
                                    class="text-none"
                                  >
                                    <v-icon size="small" start
                                      >mdi-magnify</v-icon
                                    >
                                    Búsquedas sugeridas
                                  </v-btn>

                                  <v-spacer></v-spacer>

                                  <!-- Botón de Guardar búsqueda -->
                                  <v-btn
                                    v-if="shouldShowSaveButton"
                                    small
                                    text
                                    color="success"
                                    @click.stop="saveCurrentSearch()"
                                    class="text-none"
                                  >
                                    <v-icon size="small" start
                                      >mdi-arrow-up</v-icon
                                    >
                                    Guardar búsqueda
                                  </v-btn>
                                </div>
                              </div>
                            </v-list>
                          </template>
                        </v-autocomplete>
                      </v-col>

                      <!-- Segunda fila: Category, Location y botón Search -->
                      <v-col cols="12" sm="4" class="pa-2">
                        <v-select
                          v-model="search.category"
                          :items="categories"
                          label="Category"
                          variant="outlined"
                          hide-details
                          clearable
                          class="search-input"
                          height="56"
                        >
                          <template v-slot:prepend-inner>
                            <v-icon>mdi-tag-outline</v-icon>
                          </template>
                        </v-select>
                      </v-col>

                      <v-col cols="12" sm="4" class="pa-2">
                        <v-autocomplete
                          v-model="search.location"
                          :items="locations"
                          label="Location"
                          variant="outlined"
                          hide-details
                          clearable
                          :menu-props="{ maxHeight: '300px' }"
                          class="search-input"
                          height="56"
                        >
                          <template v-slot:prepend-inner>
                            <v-icon>mdi-map-marker-outline</v-icon>
                          </template>
                          <template v-slot:no-data>
                            <v-list-item>
                              <v-list-item-title>
                                <v-text-field
                                  v-model="locationSearch"
                                  label="Search for location"
                                  outlined
                                  hide-details
                                  append-inner-icon="mdi-magnify"
                                  class="mt-2"
                                ></v-text-field>
                              </v-list-item-title>
                            </v-list-item>
                          </template>
                        </v-autocomplete>
                      </v-col>

                      <v-col cols="12" sm="4" class="pa-2">
                        <v-btn
                          color="primary"
                          block
                          type="submit"
                          class="text-none search-button"
                          :loading="loading"
                          height="56"
                        >
                          <v-icon start>mdi-magnify</v-icon>
                          Search Jobs
                        </v-btn>
                      </v-col>
                    </v-row>
                  </div>

                  <!-- Pestañas de búsquedas guardadas -->
                  <v-row class="ma-0 mt-3">
                    <v-col cols="12" class="pa-0">
                      <v-chip-group>
                        <v-chip
                          v-for="(savedSearch, index) in savedSearches"
                          :key="index"
                          outlined
                          @click="applySavedSearch(savedSearch)"
                          class="mr-2"
                          size="small"
                        >
                          <v-icon start size="x-small"
                            >mdi-clock-outline</v-icon
                          >
                          {{ savedSearch.name }}
                        </v-chip>
                      </v-chip-group>
                    </v-col>
                  </v-row>
                </v-form>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </div>

      <!-- Resto del contenido con ancho máximo -->
      <v-container class="max-width-container px-2">
        <!-- Sección de trabajos destacados -->
        <v-row class="ma-0">
          <v-col cols="12">
            <h2 class="text-h4 font-weight-bold mb-4">Featured Jobs</h2>
          </v-col>

          <v-col v-if="loading" cols="12" class="text-center">
            <v-progress-circular
              indeterminate
              color="primary"
              size="70"
            ></v-progress-circular>
          </v-col>

          <template v-else-if="featuredJobs.length > 0">
            <v-col
              v-for="job in featuredJobs"
              :key="job.id"
              cols="12"
              sm="6"
              md="4"
              class="pa-2"
            >
              <v-card class="job-card" outlined :to="'/jobs/' + job.id">
                <v-card-title class="pb-1">
                  <div class="d-flex align-center w-100">
                    <v-avatar size="40" class="mr-3 flex-shrink-0">
                      <v-img
                        :src="getImageUrl(job.company.logo, 'company')"
                        :alt="job.company.name"
                        @error="handleImageError"
                      ></v-img>
                    </v-avatar>
                    <div class="text-truncate">
                      <div
                        class="text-subtitle-1 font-weight-bold text-truncate"
                      >
                        {{ job.title }}
                      </div>
                      <div class="text-caption text--secondary text-truncate">
                        {{ job.company.name }}
                      </div>
                    </div>
                  </div>
                </v-card-title>

                <v-card-text>
                  <div class="d-flex mb-2 align-center">
                    <v-icon small class="mr-1 flex-shrink-0"
                      >mdi-map-marker</v-icon
                    >
                    <span class="text-caption text-truncate">{{
                      job.location
                    }}</span>
                  </div>

                  <div class="d-flex mb-2 align-center">
                    <v-icon small class="mr-1 flex-shrink-0"
                      >mdi-briefcase-outline</v-icon
                    >
                    <span class="text-caption text-truncate">{{
                      job.type
                    }}</span>
                  </div>

                  <div class="d-flex align-center">
                    <v-icon small class="mr-1 flex-shrink-0"
                      >mdi-currency-usd</v-icon
                    >
                    <span class="text-caption text-truncate">{{
                      job.salary || "Negotiable"
                    }}</span>
                  </div>
                </v-card-text>

                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="primary" text :to="'/jobs/' + job.id">
                    View Details
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
          </template>

          <v-col v-else cols="12" class="text-center">
            <v-alert type="info"
              >No featured jobs available at the moment.</v-alert
            >
          </v-col>

          <v-col cols="12" class="text-center mt-4">
            <v-btn color="primary" large to="/jobs"> View All Jobs </v-btn>
          </v-col>
        </v-row>

        <v-divider class="my-8"></v-divider>

        <!-- Sección de empresas destacadas -->
        <v-row class="ma-0">
          <v-col cols="12">
            <h2 class="text-h4 font-weight-bold mb-4">Top Companies</h2>
          </v-col>

          <v-col v-if="loading" cols="12" class="text-center">
            <v-progress-circular
              indeterminate
              color="primary"
              size="70"
            ></v-progress-circular>
          </v-col>

          <template v-else-if="topCompanies.length > 0">
            <v-col
              v-for="company in topCompanies"
              :key="company.id"
              cols="6"
              sm="4"
              md="3"
              class="pa-2"
            >
              <v-card
                class="company-card text-center"
                outlined
                :to="'/companies/' + company.id"
              >
                <v-avatar size="80" class="mt-4">
                  <v-img
                    :src="getImageUrl(company.logo, 'company')"
                    :alt="company.name"
                    @error="handleImageError"
                  ></v-img>
                </v-avatar>

                <v-card-title class="justify-center pb-0 px-2">
                  <div class="text-truncate w-100">{{ company.name }}</div>
                </v-card-title>

                <v-card-text class="text-caption pb-0">
                  {{ company.jobCount }} active jobs
                </v-card-text>

                <v-card-actions class="justify-center">
                  <v-btn color="primary" text :to="'/companies/' + company.id">
                    View Profile
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
          </template>

          <v-col v-else cols="12" class="text-center">
            <v-alert type="info">No companies available at the moment.</v-alert>
          </v-col>

          <v-col cols="12" class="text-center mt-4">
            <v-btn color="primary" large to="/companies">
              View All Companies
            </v-btn>
          </v-col>
        </v-row>
      </v-container>

      <!-- Sección de testimonios -->
      <section class="py-10 grey lighten-4 overflow-hidden">
        <v-container class="max-width-container px-2">
          <testimonial-slider></testimonial-slider>
        </v-container>
      </section>
    </v-container>

    <!-- Diálogo para guardar búsqueda -->
    <v-dialog v-model="showSaveDialog" max-width="500px">
      <v-card>
        <v-card-title>Guardar búsqueda</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="newSearchName"
            label="Nombre de la búsqueda"
            outlined
            hide-details
            placeholder="Ej: Desarrolladores en Madrid"
          ></v-text-field>

          <v-alert
            v-if="showSaveSuccess"
            type="success"
            density="compact"
            class="mt-4"
          >
            Búsqueda guardada correctamente
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" text @click="showSaveDialog = false"
            >Cancelar</v-btn
          >
          <v-btn color="primary" @click="confirmSaveSearch">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Diálogo para confirmar eliminación -->
    <v-dialog v-model="showDeleteDialog" max-width="400px">
      <v-card>
        <v-card-title>Confirmar eliminación</v-card-title>
        <v-card-text>
          ¿Estás seguro de que deseas eliminar esta búsqueda?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" text @click="showDeleteDialog = false"
            >Cancelar</v-btn
          >
          <v-btn color="error" @click="confirmDelete">Eliminar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import TestimonialSlider from "@/components/testimonials/TestimonialSlider.vue";
import axios from "axios";

export default {
  name: "HomeView",
  components: {
    TestimonialSlider,
  },
  data() {
    return {
      search: {
        keyword: "",
        category: null,
        location: null,
      },
      locationSearch: "",
      showSearchMenu: false,
      showSavedSearches: false,
      preventMenuClose: false,
      shouldShowSaveButton: false,
      showSaveDialog: false,
      showDeleteDialog: false,
      deleteIndex: -1,
      deleteType: "", // 'suggestion' o 'saved'
      deleteItem: null,
      newSearchName: "",
      showSaveSuccess: false,
      categories: [
        "IT & Software",
        "Marketing",
        "Finance",
        "Education",
        "Healthcare",
        "Sales",
        "Design",
      ],
      // Sugerencias de palabras clave y búsquedas guardadas se cargarán desde el servidor
      keywordSuggestions: [],
      savedSearches: [],
      // Localizaciones disponibles
      locations: [
        "New York, USA",
        "London, UK",
        "Berlin, Germany",
        "Madrid, Spain",
        "Paris, France",
        "Rome, Italy",
        "Tokyo, Japan",
        "Sydney, Australia",
        "Toronto, Canada",
        "Dubai, UAE",
        "Singapore",
        "Hong Kong",
        "Remote",
      ],
      featuredJobs: [],
      topCompanies: [],
      loading: false,
      backendUrl: "http://localhost:5000",
    };
  },
  computed: {
    // Filtra las sugerencias basadas en lo que el usuario escriba
    filteredSuggestions() {
      if (!this.search.keyword) return this.keywordSuggestions;

      const keyword = this.search.keyword.toLowerCase();
      return this.keywordSuggestions.filter((suggestion) =>
        suggestion.toLowerCase().includes(keyword)
      );
    },

    // Determina si mostrar la opción para crear una nueva búsqueda
    showCreateNewOption() {
      if (!this.search.keyword || this.search.keyword.length < 3) return false;

      // Verificar si ya existe una coincidencia exacta
      const exactMatch = this.keywordSuggestions.some(
        (suggestion) =>
          suggestion.toLowerCase() === this.search.keyword.toLowerCase()
      );

      return !exactMatch;
    },
  },
  created() {
    this.fetchFeaturedJobs();
    this.fetchTopCompanies();
    this.fetchSuggestions();
    this.fetchSavedSearches();

    // Agregar evento para cerrar el menú al hacer clic fuera
    document.addEventListener("click", this.closeSearchMenuOnClickOutside);
  },
  mounted() {
    // Manejar errores de ResizeObserver
    window.addEventListener(
      "error",
      (event) => {
        if (
          event.message === "ResizeObserver loop limit exceeded" ||
          event.message.includes(
            "ResizeObserver loop completed with undelivered notifications"
          )
        ) {
          event.stopPropagation();
          event.stopImmediatePropagation();
          event.preventDefault();
          return false;
        }
      },
      true
    );
  },
  beforeUnmount() {
    // Eliminar evento al destruir el componente
    document.removeEventListener("click", this.closeSearchMenuOnClickOutside);
  },
  methods: {
    // Método para crear una nueva búsqueda
    createNewSearch(event) {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }

      // Agregar la nueva búsqueda a las sugerencias
      const newKeyword = this.search.keyword.trim();
      if (newKeyword && !this.keywordSuggestions.includes(newKeyword)) {
        // En un entorno real, enviaríamos esto al servidor
        // await axios.post(`${this.backendUrl}/api/search/suggestions`, { keyword: newKeyword });

        // Agregar localmente
        this.keywordSuggestions.unshift(newKeyword);

        // Aplicar la nueva búsqueda
        this.$nextTick(() => {
          this.applyKeyword(newKeyword, null);

          // Mostrar un pequeño mensaje de éxito
          this.$nextTick(() => {
            // Si tienes un sistema de notificaciones
            if (this.$toast) {
              this.$toast.success("Búsqueda creada correctamente");
            } else {
              console.log("Búsqueda creada:", newKeyword);
            }
          });
        });
      }
    },

    // Método para cargar sugerencias desde el servidor
    async fetchSuggestions() {
      try {
        // Simular carga desde el servidor (reemplazar con llamada API real)
        // const response = await axios.get(`${this.backendUrl}/api/search/suggestions`);
        // this.keywordSuggestions = response.data;

        // Simulación de datos
        setTimeout(() => {
          this.keywordSuggestions = [
            "Developer",
            "Manager",
            "Designer",
            "Marketing Specialist",
            "Data Analyst",
            "Software Engineer",
            "Project Manager",
            "UX/UI Designer",
            "Sales Representative",
            "Customer Support",
            "Frontend Developer",
            "Backend Engineer",
            "Full Stack Developer",
            "Mobile Developer",
          ];
        }, 300);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      }
    },

    // Método para cargar búsquedas guardadas desde el servidor
    async fetchSavedSearches() {
      try {
        // Simular carga desde el servidor (reemplazar con llamada API real)
        // const response = await axios.get(`${this.backendUrl}/api/search/saved`);
        // this.savedSearches = response.data;

        // Simulación de datos
        setTimeout(() => {
          this.savedSearches = [
            {
              name: "Remote IT Jobs",
              keyword: "Developer",
              location: "Remote",
            },
            {
              name: "Marketing in New York",
              keyword: "Marketing",
              location: "New York, USA",
            },
            { name: "Design Jobs", keyword: "", category: "Design" },
            {
              name: "Healthcare Positions",
              keyword: "",
              category: "Healthcare",
            },
            {
              name: "Sales Jobs in Europe",
              keyword: "Sales",
              location: "Europe",
            },
            {
              name: "Engineering Positions",
              keyword: "Engineer",
              category: "IT & Software",
            },
          ];
        }, 300);
      } catch (error) {
        console.error("Error fetching saved searches:", error);
      }
    },

    // Método para limpiar el campo keyword
    clearKeyword() {
      this.search.keyword = "";
      this.shouldShowSaveButton = false;
    },

    // Método para eliminar una sugerencia
    async removeSuggestion(suggestion) {
      this.deleteType = "suggestion";
      this.deleteItem = suggestion;
      this.showDeleteDialog = true;
    },

    // Método para eliminar una búsqueda guardada
    async removeSavedSearch(index) {
      this.deleteType = "saved";
      this.deleteIndex = index;
      this.showDeleteDialog = true;
    },

    // Método para confirmar la eliminación
    async confirmDelete() {
      try {
        if (this.deleteType === "suggestion") {
          const index = this.keywordSuggestions.indexOf(this.deleteItem);
          if (index !== -1) {
            // Eliminar del servidor (reemplazar con llamada API real)
            // await axios.delete(`${this.backendUrl}/api/search/suggestions/${this.deleteItem}`);

            // Eliminar localmente
            this.keywordSuggestions.splice(index, 1);
            console.log(`Sugerencia eliminada: ${this.deleteItem}`);
          }
        } else if (this.deleteType === "saved") {
          if (this.deleteIndex !== -1) {
            const searchToDelete = this.savedSearches[this.deleteIndex];

            // Eliminar del servidor (reemplazar con llamada API real)
            // await axios.delete(`${this.backendUrl}/api/search/saved/${searchToDelete.id}`);

            // Eliminar localmente
            this.savedSearches.splice(this.deleteIndex, 1);
            console.log(`Búsqueda guardada eliminada: ${searchToDelete.name}`);
          }
        }
      } catch (error) {
        console.error("Error deleting item:", error);
      } finally {
        this.showDeleteDialog = false;
        this.deleteIndex = -1;
        this.deleteType = "";
        this.deleteItem = null;
      }
    },

    // Método para manejar cambios en el input de keywords
    onKeywordUpdate(value) {
      // Mostrar botón de guardar búsqueda si hay más de 3 letras
      this.shouldShowSaveButton = value && value.length >= 3;
    },

    // Método para abrir el diálogo de guardar búsqueda
    saveCurrentSearch() {
      this.newSearchName = this.generateSearchName();
      this.showSaveDialog = true;
      this.showSaveSuccess = false;
    },

    // Método para confirmar guardar la búsqueda
    async confirmSaveSearch() {
      if (this.newSearchName.trim()) {
        try {
          // Crear nueva búsqueda guardada
          const newSearch = {
            name: this.newSearchName,
            keyword: this.search.keyword || "",
            category: this.search.category || null,
            location: this.search.location || null,
            date: new Date().toISOString(),
          };

          // Guardar en el servidor (reemplazar con llamada API real)
          // const response = await axios.post(`${this.backendUrl}/api/search/saved`, newSearch);
          // const savedSearch = response.data;

          // Simular respuesta del servidor
          console.log("Guardando búsqueda:", newSearch);

          // Añadir a la lista de búsquedas guardadas
          this.savedSearches.unshift(newSearch);

          // Limitar a un máximo de 10 búsquedas guardadas
          if (this.savedSearches.length > 10) {
            this.savedSearches.pop();
          }

          // Mostrar mensaje de éxito
          this.showSaveSuccess = true;

          // Cerrar el diálogo después de un momento
          setTimeout(() => {
            this.showSaveDialog = false;
            this.shouldShowSaveButton = false;
            this.showSavedSearches = true;
          }, 1500);
        } catch (error) {
          console.error("Error saving search:", error);
        }
      }
    },

    // Método para generar un nombre de búsqueda automáticamente
    generateSearchName() {
      let name = this.search.keyword;

      if (this.search.category) {
        name += ` en ${this.search.category}`;
      }

      if (this.search.location) {
        name += ` (${this.search.location})`;
      }

      return name;
    },

    // Método para aplicar una palabra clave
    applyKeyword(keyword, event) {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      this.$nextTick(() => {
        this.search.keyword = keyword;
        this.shouldShowSaveButton = keyword && keyword.length >= 3;

        // Cerrar el menú después de un pequeño retraso para evitar problemas de ResizeObserver
        setTimeout(() => {
          this.showSearchMenu = false;
          // Desenfocar el campo para evitar problemas con el menú
          if (this.$refs.keywordInput) {
            this.$refs.keywordInput.blur();
          }
        }, 50);
      });
    },

    // Método para controlar el cierre del menú de búsqueda
    onSearchBlur() {
      // Retrasar el cierre para permitir clics en el menú
      setTimeout(() => {
        if (!this.preventMenuClose) {
          this.showSearchMenu = false;
        }
      }, 200);
    },

    // Cerrar menú al hacer clic fuera
    closeSearchMenuOnClickOutside(event) {
      const searchContainer = this.$el.querySelector(".search-container");
      if (searchContainer && !searchContainer.contains(event.target)) {
        this.showSearchMenu = false;
      }
    },

    // Método para prevenir cierre del menú al hacer clic en él
    preventClose() {
      this.preventMenuClose = true;
      setTimeout(() => {
        this.preventMenuClose = false;
      }, 300);
    },

    // Aplica una búsqueda guardada
    applySavedSearch(savedSearch, event) {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      this.$nextTick(() => {
        this.search.keyword = savedSearch.keyword || "";
        this.search.category = savedSearch.category || null;
        this.search.location = savedSearch.location || null;
        this.shouldShowSaveButton =
          savedSearch.keyword && savedSearch.keyword.length >= 3;

        // Cerrar el menú después de un pequeño retraso
        setTimeout(() => {
          this.showSearchMenu = false;
          // Desenfocar el campo para evitar problemas con el menú
          if (this.$refs.keywordInput) {
            this.$refs.keywordInput.blur();
          }
        }, 50);
      });

      // Ya no navegamos automáticamente
      // this.searchJobs();
    },

    // Resto de los métodos sin cambios
    getImageUrl(path, type = "default") {
      if (!path) {
        const defaults = {
          company: "/uploads/companies/default-company-logo.png",
          background: "/uploads/backgrounds/default-bg.svg",
          default: "/uploads/default-image.png",
        };
        path = defaults[type] || defaults.default;
      }

      if (path.startsWith("http") || path.startsWith("https")) {
        return path;
      }

      const normalizedPath = path.startsWith("/") ? path : `/${path}`;
      return `${this.backendUrl}${normalizedPath}`;
    },

    handleImageError(event) {
      event.target.src = `${this.backendUrl}/uploads/companies/default-company-logo.png`;
    },

    fetchFeaturedJobs() {
      this.loading = true;
      setTimeout(() => {
        this.featuredJobs = [
          {
            id: 1,
            title: "Senior Frontend Developer",
            company: {
              id: 1,
              name: "Tech Solutions Inc.",
              logo: "/uploads/companies/default-company-logo.png",
            },
            location: "New York, USA",
            type: "Full-time",
            salary: "$80,000 - $120,000",
          },
          {
            id: 2,
            title: "Backend Engineer",
            company: {
              id: 2,
              name: "InnovateSoft",
              logo: "/uploads/companies/default-company-logo.png",
            },
            location: "Remote",
            type: "Full-time",
            salary: "$90,000 - $130,000",
          },
          {
            id: 3,
            title: "UX/UI Designer",
            company: {
              id: 3,
              name: "DesignHub",
              logo: "/uploads/companies/default-company-logo.png",
            },
            location: "San Francisco, USA",
            type: "Full-time",
            salary: "$75,000 - $110,000",
          },
        ];
        this.loading = false;
      }, 1000);
    },
    fetchTopCompanies() {
      setTimeout(() => {
        // Asegurarse de que topCompanies sea al menos un array vacío antes de asignar datos
        this.topCompanies = this.topCompanies || [];
        this.topCompanies = [
          {
            id: 1,
            name: "Tech Solutions Inc.",
            logo: "/uploads/companies/default-company-logo.png",
            jobCount: 15,
          },
          {
            id: 2,
            name: "InnovateSoft",
            logo: "/uploads/companies/default-company-logo.png",
            jobCount: 8,
          },
          {
            id: 3,
            name: "DesignHub",
            logo: "/uploads/companies/default-company-logo.png",
            jobCount: 5,
          },
          {
            id: 4,
            name: "DataCorp",
            logo: "/uploads/companies/default-company-logo.png",
            jobCount: 12,
          },
        ];
      }, 1500);
    },
    searchJobs() {
      // Navigate to jobs page with search parameters
      this.$router.push({
        path: "/jobs",
        query: {
          keyword: this.search.keyword,
          category: this.search.category,
          location: this.search.location,
        },
      });
    },
  },
};
</script>

<style scoped>
/* Estilos para la sección hero con fondo personalizado */
.hero-section {
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  width: 100%;
  overflow: hidden;
  position: relative;
  padding: 60px 0;
}

/* Asegurar que el contenido esté por encima del fondo */
.hero-section .v-container {
  position: relative;
  z-index: 2;
}

/* Limitar el ancho de la tarjeta de búsqueda */
.search-card {
  max-width: 994px !important;
  margin: 0 auto !important;
}

/* Estilos para el menú de búsqueda personalizado */
.search-form-container {
  position: relative;
  width: 100%;
}

.search-container {
  position: relative;
}

/* Estilos para el menú de búsqueda */
:deep(.custom-search-menu) {
  width: auto !important;
  max-width: none !important;
  position: absolute !important;
  top: 100% !important;
  left: 0 !important;
  margin-top: 4px !important;
}

:deep(.v-menu__content) {
  max-width: 100% !important;
  width: auto !important;
  overflow: hidden !important;
  contain: content !important;
  min-width: 100% !important;
}

:deep(.custom-search-dropdown) {
  width: 100%;
  padding: 8px 0;
  max-height: 400px;
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden; /* Evitar doble scroll */
}

/* Contenedor para los resultados de búsqueda con scroll único */
.search-results-container {
  overflow-y: auto;
  max-height: 210px;
  contain: content;
}

/* Estilos para los títulos de sección */
:deep(.search-section-title) {
  font-weight: 700 !important;
  color: #333 !important;
  font-size: 1rem !important;
  height: 40px !important;
  padding: 0 16px !important;
  letter-spacing: 0.5px !important;
  position: sticky !important;
  top: 0 !important;
  background-color: white !important;
  z-index: 1 !important;
}

/* Estilos para los botones de alternancia - fijos en la parte inferior */
.search-toggle-buttons {
  display: flex;
  gap: 8px;
  width: 100%;
  padding: 8px 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.12);
  background-color: white;
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 5;
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.05);
}

/* Estilos para los elementos de la lista */
:deep(.search-item) {
  min-height: 40px !important;
  cursor: pointer;
  position: relative;
}

:deep(.search-item:hover) {
  background-color: rgba(0, 0, 0, 0.05);
}

/* Icono de eliminación - solo visible en hover del elemento */
:deep(.delete-icon) {
  opacity: 0;
  transition: opacity 0.2s ease;
  color: rgba(0, 0, 0, 0.54);
}

:deep(.search-item:hover .delete-icon) {
  opacity: 1;
}

/* Cambiar color del icono de eliminación a rojo en hover */
:deep(.delete-icon:hover) {
  color: #f44336 !important;
}

:deep(.v-list) {
  overflow: hidden !important;
  contain: content !important;
}

:deep(.v-list-item-title) {
  font-size: 0.95rem !important;
}

:deep(.v-list-item--active) {
  background-color: rgba(0, 0, 0, 0.05);
}

:deep(.v-autocomplete__content) {
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* .v-field__input {
  align-items: center;
  color: inherit;
  -moz-column-gap: 2px;
  column-gap: 2px;
  display: flex;
  flex-wrap: wrap;
  letter-spacing: 0.009375em;
  opacity: var(--v-high-emphasis-opacity);
  min-height: max(
    var(--v-input-control-height, 56px),
    1.5rem + var(--v-field-input-padding-top) +
      var(--v-field-input-padding-bottom)
  );
  min-width: 0;
  padding-inline: var(--v-field-padding-start) var(--v-field-padding-end);
  padding-top: var(--v-field-input-padding-top);
  padding-bottom: 0;
  position: relative;
  width: 100%;
} */
/* Evitar que el ícono clearable aparezca por defecto */
:deep(.v-field__clearable) {
  display: none !important;
}

:deep(.v-field--dirty .v-field__clearable) {
  display: flex !important;
}

/* Asegurar que todos los inputs tengan la misma altura */
.search-input {
  height: 56px !important;
}

.search-input :deep(.v-field__input) {
  min-height: 56px !important;
  padding-top: 0 !important;
}

.search-input :deep(.v-field__field) {
  height: 56px !important;
}

.search-button {
  height: 56px !important;
}

/* Asegurar que los labels estén en la posición correcta */
.search-input :deep(.v-field__outline) {
  --v-field-border-width: 1px;
}

.search-input :deep(.v-field--variant-outlined .v-field__outline__start) {
  border-radius: 4px 0 0 4px;
}

.search-input :deep(.v-field--variant-outlined .v-field__outline__end) {
  border-radius: 0 4px 4px 0;
}

/* Asegurar que los labels estén arriba por defecto */
.search-input :deep(.v-field .v-label) {
  font-size: 1rem !important;
  color: rgba(0, 0, 0, 1) !important;
}

.search-input :deep(.v-field--variant-outlined .v-field__outline) {
  --v-field-border-opacity: 1;
}

.job-card,
.company-card {
  height: 100%;
  transition: transform 0.2s;
  overflow: hidden;
}

.job-card:hover,
.company-card:hover {
  transform: translateY(-5px);
}

/* Contenedor de ancho máximo */
.max-width-container {
  max-width: 1400px !important; /* Aumentado el ancho máximo */
  margin-left: auto !important;
  margin-right: auto !important;
  width: 100% !important;
  box-sizing: border-box !important;
}

/* Evitar desbordamiento horizontal */
.home {
  overflow-x: hidden;
  width: 100%;
  box-sizing: border-box;
}

/* Asegurar que textos largos no rompan el diseño */
.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

/* Clase para asegurar que los elementos flexibles no desborden */
.w-100 {
  width: 100% !important;
  min-width: 0 !important;
}

/* Evitar que los íconos se compriman */
.flex-shrink-0 {
  flex-shrink: 0;
}

/* Estilos para las pestañas de búsquedas guardadas */
.v-chip {
  cursor: pointer;
}

/* Personalizar el color del outline y clearable */
.custom-outline :deep(.v-field__outline) {
  --v-field-border-width: 1.5px;
  --v-field-border-opacity: 1;
  border-color: rgba(
    var(--v-theme-primary),
    var(--v-field-border-opacity)
  ) !important;
}

.custom-outline :deep(.v-field--focused .v-field__outline) {
  --v-field-border-width: 2px;
  border-color: rgb(var(--v-theme-primary)) !important;
}

.custom-outline :deep(.v-field__clearable) {
  color: var(--v-primary-base) !important;
}

.custom-outline :deep(.v-field__clearable .v-icon) {
  color: rgb(var(--v-theme-primary)) !important;
}

.custom-outline :deep(.v-field__input) {
  background-color: rgb(var(--v-theme-grey-lighten5));
}

/* Asegurarnos que los iconos tengan el color correcto */
.custom-outline :deep(.v-icon) {
  opacity: 1;
}

/* Estilo para la opción de crear nueva búsqueda */
.create-new-item {
  border-top: 1px dashed rgba(0, 0, 0, 0.12);
  margin-top: 4px;
}

.create-new-item:hover {
  background-color: rgba(var(--v-theme-success), 0.1) !important;
}

/* Ajustes para pantallas pequeñas */
@media (max-width: 600px) {
  .hero-section {
    padding: 40px 0;
  }

  .v-container {
    padding: 0 !important;
  }

  .max-width-container {
    padding: 0 8px !important;
  }

  .search-results-container {
    max-height: 200px;
  }
}
</style>
