<template>
  <v-container>
    <v-card>
      <v-card-title>Job Listings</v-card-title>
      <v-card-text>
        <v-list>
          <v-list-item v-for="job in jobs" :key="job.id">
            <v-list-item-content>
              <v-list-item-title>{{ job.title }}</v-list-item-title>
              <v-list-item-subtitle>{{ job.company }}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      jobs: [],
      filters: {
        location: '',
        jobType: '',
        category: ''
      }
    }
  },
  methods: {
    applyFilters() {
      this.fetchJobs({
        ...this.filters
      });
    }
  },
  template: `
    <div>
      <v-select v-model="filters.location" label="Location" :items="locations"></v-select>
      <v-select v-model="filters.jobType" label="Job Type" :items="jobTypes"></v-select>
      <v-select v-model="filters.category" label="Category" :items="categories"></v-select>
      <v-btn @click="applyFilters">Apply Filters</v-btn>
    </div>
  `
}
</script>
