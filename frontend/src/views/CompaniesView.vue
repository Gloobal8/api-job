<template>
  <div class="companies-view">
    <v-container>
      <v-row>
        <v-col cols="12">
          <h1 class="text-h4 mb-4">Companies</h1>
          
          <!-- Filters and search -->
          <v-card class="mb-6">
            <v-card-title>
              <v-text-field
                v-model="search"
                append-icon="mdi-magnify"
                label="Search companies"
                single-line
                hide-details
                @input="fetchCompanies"
              ></v-text-field>
            </v-card-title>
            
            <v-card-text>
              <v-row>
                <v-col cols="12" sm="4">
                  <v-select
                    v-model="filters.industry"
                    :items="industries"
                    label="Industry"
                    outlined
                    dense
                    clearable
                    @change="fetchCompanies"
                  ></v-select>
                </v-col>
                
                <v-col cols="12" sm="4">
                  <v-select
                    v-model="filters.location"
                    :items="locations"
                    label="Location"
                    outlined
                    dense
                    clearable
                    @change="fetchCompanies"
                  ></v-select>
                </v-col>
                
                <v-col cols="12" sm="4">
                  <v-checkbox
                    v-model="filters.featured"
                    label="Featured companies only"
                    @change="fetchCompanies"
                  ></v-checkbox>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
          
          <!-- Companies list -->
          <v-row v-if="loading">
            <v-col cols="12" class="text-center">
              <v-progress-circular indeterminate color="primary"></v-progress-circular>
            </v-col>
          </v-row>
          
          <v-row v-else-if="companies.length === 0">
            <v-col cols="12" class="text-center">
              <v-alert type="info">
                No companies found. Try adjusting your filters.
              </v-alert>
            </v-col>
          </v-row>
          
          <v-row v-else>
            <v-col v-for="company in companies" :key="company.id" cols="12" sm="6" md="4">
              <v-card
                class="mx-auto company-card"
                :to="{ name: 'company-detail', params: { id: company.id }}"
                hover
              >
                <v-img
                  :src="company.coverImage || 'https://via.placeholder.com/350x150'"
                  height="150"
                  class="white--text align-end"
                  gradient="to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 100%"
                >
                  <v-card-title v-text="company.name"></v-card-title>
                </v-img>
                
                <v-card-text>
                  <div class="company-logo">
                    <v-avatar size="64" class="mt-n8 mb-3">
                      <v-img :src="company.logo || 'https://via.placeholder.com/64'"></v-img>
                    </v-avatar>
                  </div>
                  
                  <div v-if="company.description" class="description-text">
                    {{ company.description.substring(0, 100) }}{{ company.description.length > 100 ? '...' : '' }}
                  </div>
                  
                  <v-chip-group column class="mt-2">
                    <v-chip small v-if="company.industry">{{ company.industry }}</v-chip>
                    <v-chip small v-if="company.location">{{ company.location }}</v-chip>
                    <v-chip small v-if="company.size">{{ company.size }}</v-chip>
                  </v-chip-group>
                </v-card-text>
                
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn
                    color="primary"
                    text
                    :to="{ name: 'company-detail', params: { id: company.id }}"
                  >
                    View Details
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
          
          <!-- Pagination -->
          <v-row v-if="totalPages > 1">
            <v-col cols="12" class="text-center">
              <v-pagination
                v-model="page"
                :length="totalPages"
                @input="fetchCompanies"
              ></v-pagination>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'CompaniesView',
  
  data() {
    return {
      search: '',
      page: 1,
      limit: 9,
      totalPages: 0,
      totalCompanies: 0,
      companies: [],
      loading: false,
      filters: {
        industry: null,
        location: null,
        featured: false
      },
      industries: [
        'Technology',
        'Healthcare',
        'Finance',
        'Education',
        'Manufacturing',
        'Retail',
        'Hospitality',
        'Construction',
        'Transportation',
        'Media'
      ],
      locations: [
        'New York',
        'San Francisco',
        'Chicago',
        'Los Angeles',
        'Boston',
        'Seattle',
        'Austin',
        'Denver',
        'Miami',
        'Remote'
      ]
    };
  },
  
  computed: {
    ...mapGetters(['isLoading', 'getError'])
  },
  
  created() {
    this.fetchCompanies();
  },
  
  methods: {
    async fetchCompanies() {
      this.loading = true;
      
      try {
        // Build query parameters
        const params = {
          page: this.page,
          limit: this.limit
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
        
        if (this.filters.featured) {
          params.featured = true;
        }
        
        // Make API request
        const response = await this.$axios.get('/companies', { params });
        
        // Update data
        this.companies = response.data.companies;
        this.totalPages = response.data.totalPages;
        this.totalCompanies = response.data.totalCompanies;
      } catch (error) {
        console.error('Error fetching companies:', error);
        this.$store.commit('SET_ERROR', 'Failed to fetch companies');
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.company-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s;
}

.company-card:hover {
  transform: translateY(-5px);
}

.company-logo {
  display: flex;
  justify-content: center;
}

.description-text {
  height: 60px;
  overflow: hidden;
  margin-bottom: 10px;
}
</style>