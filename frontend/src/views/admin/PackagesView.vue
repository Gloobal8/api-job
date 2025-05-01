<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-6">Choose Your Plan</h1>
      </v-col>
    </v-row>

    <!-- Filters -->
    <v-row class="mb-6">
      <v-col cols="12" md="4">
        <v-select
          v-model="sortOrder"
          :items="sortOptions"
          label="Sort by"
          outlined
          dense
        ></v-select>
      </v-col>
      <v-col cols="12" md="4">
        <v-checkbox
          v-model="showOnlyActive"
          label="Show only active packages"
          hide-details
        ></v-checkbox>
      </v-col>
    </v-row>

    <!-- Packages -->
    <v-row v-if="loading">
      <v-col cols="12" class="text-center">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
      </v-col>
    </v-row>

    <v-row v-else-if="filteredPackages.length === 0">
      <v-col cols="12" class="text-center">
        <p class="text-h6">No packages available</p>
      </v-col>
    </v-row>

    <v-row v-else>
      <v-col
        v-for="(pkg, index) in filteredPackages"
        :key="pkg.id"
        cols="12"
        md="4"
        sm="6"
      >
        <v-card
          class="mx-auto package-card"
          :class="{ 'popular-package': pkg.isPopular }"
          elevation="2"
          height="100%"
        >
          <div v-if="pkg.isPopular" class="popular-badge">
            Popular
          </div>
          <v-card-title class="text-h5">
            {{ pkg.name }}
          </v-card-title>
          <v-card-subtitle class="pb-0">
            <div class="text-h4 font-weight-bold primary--text">
              ${{ pkg.price.toFixed(2) }}
            </div>
            <div class="text-caption">
              {{ pkg.duration }} days
            </div>
          </v-card-subtitle>
          <v-card-text>
            <p>{{ pkg.description }}</p>
            <v-divider class="my-4"></v-divider>
            <v-list dense>
              <v-list-item v-if="pkg.jobLimit">
                <v-list-item-icon>
                  <v-icon color="success">mdi-check</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title>{{ pkg.jobLimit }} Job Postings</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              <v-list-item v-if="pkg.featuredJobs">
                <v-list-item-icon>
                  <v-icon color="success">mdi-check</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title>{{ pkg.featuredJobs }} Featured Jobs</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              <v-list-item v-if="pkg.highlightedJobs">
                <v-list-item-icon>
                  <v-icon color="success">mdi-check</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title>{{ pkg.highlightedJobs }} Highlighted Jobs</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              <v-list-item v-if="pkg.cvAccess">
                <v-list-item-icon>
                  <v-icon color="success">mdi-check</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title>CV Database Access</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              <v-list-item v-for="(feature, i) in pkg.features" :key="i">
                <v-list-item-icon>
                  <v-icon color="success">mdi-check</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title>{{ feature }}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card-text>
          <v-card-actions>
            <v-btn
              color="primary"
              block
              :to="{ name: 'CheckoutView', params: { id: pkg.id }}"
              :disabled="!pkg.isActive"
            >
              {{ pkg.isActive ? 'Select Plan' : 'Currently Unavailable' }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Compare Feature -->
    <v-row class="mt-8">
      <v-col cols="12">
        <v-expansion-panels>
          <v-expansion-panel>
            <v-expansion-panel-header>
              Compare All Plans
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <v-simple-table>
                <template v-slot:default>
                  <thead>
                    <tr>
                      <th class="text-left">Feature</th>
                      <th v-for="pkg in packages" :key="pkg.id" class="text-center">
                        {{ pkg.name }}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Price</td>
                      <td v-for="pkg in packages" :key="pkg.id" class="text-center">
                        ${{ pkg.price.toFixed(2) }}
                      </td>
                    </tr>
                    <tr>
                      <td>Duration</td>
                      <td v-for="pkg in packages" :key="pkg.id" class="text-center">
                        {{ pkg.duration }} days
                      </td>
                    </tr>
                    <tr>
                      <td>Job Postings</td>
                      <td v-for="pkg in packages" :key="pkg.id" class="text-center">
                        {{ pkg.jobLimit || 0 }}
                      </td>
                    </tr>
                    <tr>
                      <td>Featured Jobs</td>
                      <td v-for="pkg in packages" :key="pkg.id" class="text-center">
                        {{ pkg.featuredJobs || 0 }}
                      </td>
                    </tr>
                    <tr>
                      <td>Highlighted Jobs</td>
                      <td v-for="pkg in packages" :key="pkg.id" class="text-center">
                        {{ pkg.highlightedJobs || 0 }}
                      </td>
                    </tr>
                    <tr>
                      <td>CV Database Access</td>
                      <td v-for="pkg in packages" :key="pkg.id" class="text-center">
                        <v-icon v-if="pkg.cvAccess" color="success">mdi-check</v-icon>
                        <v-icon v-else color="error">mdi-close</v-icon>
                      </td>
                    </tr>
                  </tbody>
                </template>
              </v-simple-table>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from 'axios';

export default {
  name: 'PackagesView',
  data() {
    return {
      packages: [],
      loading: true,
      error: null,
      sortOrder: 'price-asc',
      showOnlyActive: true,
      sortOptions: [
        { text: 'Price: Low to High', value: 'price-asc' },
        { text: 'Price: High to Low', value: 'price-desc' },
        { text: 'Duration', value: 'duration' },
        { text: 'Job Limit', value: 'jobs' }
      ]
    };
  },
  computed: {
    filteredPackages() {
      let filtered = [...this.packages];
      
      // Filter active packages if needed
      if (this.showOnlyActive) {
        filtered = filtered.filter(pkg => pkg.isActive);
      }
      
      // Sort packages
      switch (this.sortOrder) {
        case 'price-asc':
          filtered.sort((a, b) => a.price - b.price);
          break;
        case 'price-desc':
          filtered.sort((a, b) => b.price - a.price);
          break;
        case 'duration':
          filtered.sort((a, b) => b.duration - a.duration);
          break;
        case 'jobs':
          filtered.sort((a, b) => b.jobLimit - a.jobLimit);
          break;
        default:
          filtered.sort((a, b) => a.price - b.price);
      }
      
      return filtered;
    }
  },
  async created() {
    try {
      const response = await axios.get('/api/packages');
      this.packages = response.data.data;
    } catch (err) {
      this.error = 'Failed to load packages';
      console.error(err);
    } finally {
      this.loading = false;
    }
  }
};
</script>

<style scoped>
.package-card {
  position: relative;
  transition: transform 0.3s;
}

.package-card:hover {
  transform: translateY(-5px);
}

.popular-package {
  border: 2px solid var(--v-primary-base);
}

.popular-badge {
  position: absolute;
  top: 0;
  right: 0;
  background-color: var(--v-primary-base);
  color: white;
  padding: 5px 10px;
  border-bottom-left-radius: 8px;
  font-weight: bold;
}
</style>