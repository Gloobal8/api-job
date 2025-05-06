<template>
  <v-card
    class="company-card"
    :to="{ name: 'company-detail', params: { id: company.id } }"
    hover
  >
    <v-img
      :src="company.coverImage || 'https://via.placeholder.com/400x150'"
      height="150"
      class="white--text align-end"
      gradient="to bottom, rgba(0,0,0,0) 60%, rgba(0,0,0,0.8) 100%"
    >
    </v-img>

    <v-card-text>
      <div class="d-flex align-center mb-2">
        <v-avatar size="40" class="mr-3">
          <v-img
            :src="company.logo || 'https://via.placeholder.com/40'"
          ></v-img>
          <v-card-title>{{ company.name }}</v-card-title>
        </v-avatar>
        <div>
          <div class="subtitle-1">{{ company.industry }}</div>
          <div class="caption grey--text">{{ company.location }}</div>
        </div>
      </div>

      <div class="company-description">
        {{ truncateDescription(company.description) }}
      </div>
    </v-card-text>

    <v-divider></v-divider>

    <v-card-actions>
      <v-btn
        text
        color="primary"
        :to="{ name: 'company-detail', params: { id: company.id } }"
      >
        View Details
      </v-btn>

      <v-spacer></v-spacer>

      <v-btn text :to="{ name: 'jobs', query: { company: company.id } }">
        View Jobs
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  name: "CompanyCard",
  props: {
    company: {
      type: Object,
      required: true,
    },
  },
  methods: {
    truncateDescription(description) {
      if (!description) return "";
      return description.length > 150
        ? `${description.substring(0, 150)}...`
        : description;
    },
  },
};
</script>

<style scoped>
.company-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.company-description {
  height: 80px;
  overflow: hidden;
}
</style>
