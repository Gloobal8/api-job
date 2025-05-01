<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="8">
        <v-card class="pa-4">
          <v-card-title class="text-h4">{{ job.title }}</v-card-title>
          <v-card-subtitle
            >{{ job.company }} - {{ job.location }}</v-card-subtitle
          >
          <v-divider class="my-4"></v-divider>
          <v-card-text>
            <div class="text-body-1" v-html="job.description"></div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card class="pa-4">
          <v-btn color="primary" block @click="applyForJob">Apply Now</v-btn>
        </v-card>
      </v-col>

      <!-- Sección de reseñas -->
      <v-divider class="my-5"></v-divider>

      <review-component
        entity-type="job"
        :entity-id="job.id"
        title="Reseñas sobre este trabajo"
      ></review-component>
    </v-row>
  </v-container>
</template>
<script>
import ReviewComponent from "@/components/reviews/ReviewComponent.vue";
export default {
  components: {
    ReviewComponent,
    // Otros componentes...
  },
  data() {
    return {
      job: null,
      loading: false,
      error: null,
      relatedJobs: [],
    };
  },

  async created() {
    try {
      this.loading = true;
      const response = await fetch(`/api/jobs/${this.$route.params.id}`);
      this.job = await response.json();
    } catch (err) {
      this.error = "Failed to load job details";
    } finally {
      this.loading = false;
    }
  },

  methods: {
    async applyForJob() {
      try {
        const response = await fetch(`/api/jobs/${this.job.id}/apply`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: this.$store.state.user.id,
          }),
        });
        if (response.ok) {
          this.$toast.success("Application submitted successfully");
        } else {
          throw new Error("Failed to submit application");
        }
      } catch (error) {
        this.$toast.error("Failed to submit application");
      }
    },

    async fetchRelatedJobs() {
      try {
        const response = await fetch(`/api/jobs/${this.job.id}/related`);
        this.relatedJobs = await response.json();
      } catch (error) {
        console.error("Failed to fetch related jobs:", error);
      }
    },
  },
};
</script>
