<template>
  <div class="job-detail">
    <v-container>
      <v-row>
        <v-col cols="12">
          <v-breadcrumbs :items="breadcrumbs" class="pa-0 mb-4"></v-breadcrumbs>

          <v-card v-if="loading" class="pa-4 text-center">
            <v-progress-circular
              indeterminate
              color="primary"
              size="64"
            ></v-progress-circular>
            <p class="mt-4">Loading job details...</p>
          </v-card>

          <v-card v-else-if="job" class="mb-6">
            <v-card-title class="d-flex align-center">
              <v-avatar size="60" class="mr-4">
                <v-img
                  :src="getCompanyLogo(job.company)"
                  :alt="job.company?.name"
                ></v-img>
              </v-avatar>
              <div>
                <h1 class="text-h4 mb-1">{{ job.title }}</h1>
                <div class="d-flex align-center">
                  <span class="text-subtitle-1 mr-2">{{
                    job.company?.name
                  }}</span>
                  <v-chip
                    v-if="job.featured"
                    color="amber"
                    size="small"
                    class="ml-2"
                  >
                    Featured
                  </v-chip>
                </div>
              </div>
              <v-spacer></v-spacer>
              <v-btn
                v-if="isOwner"
                color="primary"
                variant="outlined"
                :to="`/jobs/${job.id}/edit`"
                class="mr-2"
              >
                <v-icon icon="mdi-pencil" class="mr-2"></v-icon>
                Edit
              </v-btn>
              <v-btn color="primary" @click="applyForJob">
                <v-icon icon="mdi-send" class="mr-2"></v-icon>
                Apply Now
              </v-btn>
            </v-card-title>

            <v-divider></v-divider>

            <v-card-text>
              <v-row>
                <v-col cols="12" md="8">
                  <div class="mb-6">
                    <h2 class="text-h6 mb-3">Job Description</h2>
                    <div v-html="job.description"></div>
                  </div>

                  <div class="mb-6">
                    <h2 class="text-h6 mb-3">Requirements</h2>
                    <div
                      v-collapsible-list
                      class="requirements-section"
                      v-html="job.requirements"
                    ></div>
                  </div>

                  <div v-if="job.benefits">
                    <h2 class="text-h6 mb-3">Benefits</h2>
                    <div
                      v-collapsible-list
                      class="benefits-section"
                      v-html="job.benefits"
                    ></div>
                  </div>
                </v-col>

                <v-col cols="12" md="4">
                  <v-card variant="elevated" class="job-details-card mb-4">
                    <v-card-title class="pb-0">Job Details</v-card-title>
                    <v-card-text>
                      <v-list density="compact" style="background: none">
                        <v-list-item>
                          <template v-slot:prepend>
                            <v-icon
                              color="primary"
                              icon="mdi-map-marker"
                            ></v-icon>
                          </template>
                          <v-list-item-title>Location</v-list-item-title>
                          <v-list-item-subtitle>{{
                            job.location
                          }}</v-list-item-subtitle>
                        </v-list-item>

                        <v-list-item>
                          <template v-slot:prepend>
                            <v-icon
                              color="primary"
                              icon="mdi-briefcase-outline"
                            ></v-icon>
                          </template>
                          <v-list-item-title>Job Type</v-list-item-title>
                          <v-list-item-subtitle>{{
                            job.type
                          }}</v-list-item-subtitle>
                        </v-list-item>

                        <v-list-item v-if="job.category">
                          <template v-slot:prepend>
                            <v-icon
                              color="primary"
                              icon="mdi-tag-outline"
                            ></v-icon>
                          </template>
                          <v-list-item-title>Category</v-list-item-title>
                          <v-list-item-subtitle>{{
                            job.category
                          }}</v-list-item-subtitle>
                        </v-list-item>

                        <v-list-item v-if="job.salary">
                          <template v-slot:prepend>
                            <v-icon
                              color="primary"
                              icon="mdi-currency-usd"
                            ></v-icon>
                          </template>
                          <v-list-item-title>Salary</v-list-item-title>
                          <v-list-item-subtitle>{{
                            job.salary
                          }}</v-list-item-subtitle>
                        </v-list-item>

                        <v-list-item>
                          <template v-slot:prepend>
                            <v-icon
                              color="primary"
                              icon="mdi-calendar"
                            ></v-icon>
                          </template>
                          <v-list-item-title>Posted</v-list-item-title>
                          <v-list-item-subtitle>{{
                            formatDate(job.createdAt)
                          }}</v-list-item-subtitle>
                        </v-list-item>

                        <v-list-item v-if="job.deadline">
                          <template v-slot:prepend>
                            <v-icon
                              color="primary"
                              icon="mdi-clock-outline"
                            ></v-icon>
                          </template>
                          <v-list-item-title>Deadline</v-list-item-title>
                          <v-list-item-subtitle>{{
                            formatDate(job.deadline)
                          }}</v-list-item-subtitle>
                        </v-list-item>
                      </v-list>
                    </v-card-text>
                  </v-card>

                  <v-card variant="elevated" class="company-card">
                    <v-card-text>
                      <div class="text-center mb-4">
                        <v-avatar size="80" class="mb-2">
                          <v-img
                            :src="getCompanyLogo(job.company, 80)"
                            :alt="job.company?.name"
                          ></v-img>
                        </v-avatar>
                        <h3 class="text-h6">{{ job.company?.name }}</h3>
                        <span class="text-subtitle-1">About the Company</span>
                      </div>

                      <p v-if="job.company?.description" class="mb-4">
                        {{ truncateText(job.company?.description, 150) }}
                      </p>

                      <v-btn
                        block
                        color="primary"
                        variant="outlined"
                        :to="`/companies/${job.company?.id}`"
                        class="mt-2"
                      >
                        View Company Profile
                      </v-btn>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-card-text>

            <v-card-actions class="pa-4">
              <v-spacer></v-spacer>
              <v-btn color="primary" size="large" @click="applyForJob">
                Apply for this Job
              </v-btn>
            </v-card-actions>
          </v-card>

          <v-alert v-else type="error" class="mb-6">
            Job not found or has been removed.
          </v-alert>

          <v-card v-if="relatedJobs.length > 0" class="mt-6">
            <v-card-title>Similar Jobs</v-card-title>
            <v-card-text>
              <v-row>
                <v-col
                  v-for="job in relatedJobs"
                  :key="job.id"
                  cols="12"
                  sm="6"
                  md="4"
                >
                  <v-card
                    variant="outlined"
                    :to="`/jobs/${job.id}`"
                    class="job-card"
                  >
                    <v-card-title class="pb-1">
                      <div class="d-flex align-center">
                        <v-avatar size="40" class="mr-3">
                          <v-img
                            :src="getCompanyLogo(job.company, 40)"
                            :alt="job.company?.name"
                          ></v-img>
                        </v-avatar>
                        <div>
                          <div
                            class="text-subtitle-1 font-weight-bold text-truncate"
                          >
                            {{ job.title }}
                          </div>
                          <div class="text-caption text--secondary">
                            {{ job.company?.name }}
                          </div>
                        </div>
                      </div>
                    </v-card-title>

                    <v-card-text>
                      <div class="d-flex mb-2">
                        <v-icon
                          size="small"
                          class="mr-1"
                          icon="mdi-map-marker"
                        ></v-icon>
                        <span class="text-caption">{{ job.location }}</span>
                      </div>

                      <div class="d-flex mb-2">
                        <v-icon
                          size="small"
                          class="mr-1"
                          icon="mdi-briefcase-outline"
                        ></v-icon>
                        <span class="text-caption">{{ job.type }}</span>
                      </div>

                      <div class="d-flex">
                        <v-icon
                          size="small"
                          class="mr-1"
                          icon="mdi-currency-usd"
                        ></v-icon>
                        <span class="text-caption">{{
                          job.salary || "Negotiable"
                        }}</span>
                      </div>
                    </v-card-text>

                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn
                        color="primary"
                        variant="text"
                        :to="`/jobs/${job.id}`"
                      >
                        View Details
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Apply Dialog -->
    <v-dialog v-model="applyDialog" max-width="600px">
      <v-card>
        <v-card-title>Apply for "{{ job?.title }}"</v-card-title>
        <v-card-text>
          <v-form
            ref="form"
            v-model="valid"
            @submit.prevent="submitApplication"
          >
            <v-text-field
              v-model="application.name"
              label="Full Name"
              required
              :rules="[(v) => !!v || 'Name is required']"
              variant="outlined"
              density="comfortable"
            ></v-text-field>

            <v-text-field
              v-model="application.email"
              label="Email"
              required
              :rules="[
                (v) => !!v || 'Email is required',
                (v) => /.+@.+\..+/.test(v) || 'Email must be valid',
              ]"
              variant="outlined"
              density="comfortable"
            ></v-text-field>

            <v-text-field
              v-model="application.phone"
              label="Phone Number"
              variant="outlined"
              density="comfortable"
            ></v-text-field>

            <v-textarea
              v-model="application.coverLetter"
              label="Cover Letter"
              required
              :rules="[(v) => !!v || 'Cover letter is required']"
              variant="outlined"
              auto-grow
              rows="4"
            ></v-textarea>

            <v-file-input
              v-model="application.resume"
              label="Resume/CV"
              required
              :rules="[(v) => !!v || 'Resume is required']"
              variant="outlined"
              density="comfortable"
              accept=".pdf,.doc,.docx"
              prepend-icon="mdi-file-document-outline"
            ></v-file-input>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="applyDialog = false"
            >Cancel</v-btn
          >
          <v-btn
            color="primary"
            :disabled="!valid || loading"
            :loading="loading"
            @click="submitApplication"
          >
            Submit Application
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { ref, computed, onMounted, reactive, getCurrentInstance } from "vue";
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";

export default {
  name: "JobDetailView",
  props: {
    id: {
      type: [String, Number],
      required: true,
    },
  },
  setup(props) {
    const instance = getCurrentInstance();
    const store = useStore();
    const route = useRoute();
    const router = useRouter();

    // Refs
    const job = ref(null);
    const loading = ref(true);
    const relatedJobs = ref([]);
    const applyDialog = ref(false);
    const valid = ref(false);
    const form = ref(null);

    // Reactive data
    const application = reactive({
      name: "",
      email: "",
      phone: "",
      coverLetter: "",
      resume: null,
    });

    // Breadcrumbs
    const breadcrumbs = ref([
      { title: "Home", href: "/" },
      { title: "Jobs", href: "/jobs" },
      { title: "Job Details", disabled: true },
    ]);

    // Computed properties
    const isOwner = computed(() => {
      return (
        store.getters.isAuthenticated &&
        job.value &&
        job.value.userId === store.state.auth.user?.id
      );
    });

    // Helper function to get company logo
    const getCompanyLogo = (company, size = 60) => {
      if (!company || !company.logo) {
        return `https://via.placeholder.com/${size}`;
      }

      try {
        // Try to use the plugin through instance
        if (
          instance &&
          instance.appContext.config.globalProperties.$getImageUrl
        ) {
          return instance.appContext.config.globalProperties.$getImageUrl(
            company.logo,
            "company"
          );
        }

        // Fallback to direct URL
        const baseUrl =
          import.meta.env.VITE_API_URL || process.env.VUE_APP_API_URL || "";
        return company.logo.startsWith("http")
          ? company.logo
          : `${baseUrl}/uploads/companies/${company.logo}`;
      } catch (error) {
        console.warn("Error loading image:", error);
        return `https://via.placeholder.com/${size}`;
      }
    };

    // Methods
    const fetchJobDetails = async () => {
      loading.value = true;
      // In a real app, this would be an API call
      setTimeout(() => {
        job.value = {
          id: props.id,
          title: "Senior Frontend Developer",
          company: {
            id: 1,
            name: "Tech Solutions Inc.",
            logo: "companies/tech-solutions-logo.jpg", // Updated to use relative path for imageHelper
            description:
              "Tech Solutions Inc. is a leading technology company specializing in web and mobile application development, cloud solutions, and digital transformation.",
          },
          location: "New York, USA",
          type: "Full-time",
          category: "IT & Software",
          salary: "$80,000 - $120,000",
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
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
        };

        // Get related jobs
        relatedJobs.value = [
          {
            id: 101,
            title: "Frontend Developer",
            company: {
              id: 1,
              name: "Tech Solutions Inc.",
              logo: "companies/tech-solutions-logo.jpg", // Updated path
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
              logo: "companies/designhub-logo.jpg", // Updated path
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
              logo: "companies/innovatesoft-logo.jpg", // Updated path
            },
            location: "Chicago, USA",
            type: "Full-time",
            salary: "$90,000 - $120,000",
          },
        ];

        loading.value = false;

        // Update breadcrumbs with job title
        if (job.value) {
          breadcrumbs.value[2].title = job.value.title;
        }
      }, 1000);
    };

    const applyForJob = () => {
      if (!store.getters.isAuthenticated) {
        router.push({
          path: "/login",
          query: { redirect: route.fullPath },
        });
        return;
      }

      // Pre-fill form with user data if available
      const user = store.state.auth.user;
      if (user) {
        application.name = user.name || "";
        application.email = user.email || "";
        application.phone = user.phone || "";
      }

      applyDialog.value = true;
    };

    const submitApplication = () => {
      if (!form.value.validate()) return;

      loading.value = true;

      // In a real app, this would be an API call to submit the application
      setTimeout(() => {
        loading.value = false;
        applyDialog.value = false;

        // Show success message
        store.commit("setSnackbar", {
          show: true,
          text: "Your application has been submitted successfully!",
          color: "success",
        });

        // Reset form
        form.value.reset();
      }, 1500);
    };

    const formatDate = (date) => {
      if (!date) return "";
      const options = { year: "numeric", month: "long", day: "numeric" };
      return new Date(date).toLocaleDateString(undefined, options);
    };

    const truncateText = (text, maxLength) => {
      if (!text) return "";
      if (text.length <= maxLength) return text;
      return text.substr(0, maxLength) + "...";
    };

    // Lifecycle hooks
    onMounted(() => {
      fetchJobDetails();
    });

    return {
      job,
      loading,
      relatedJobs,
      breadcrumbs,
      applyDialog,
      valid,
      application,
      form,
      isOwner,
      applyForJob,
      submitApplication,
      formatDate,
      truncateText,
      getCompanyLogo,
    };
  },
};
</script>

<style scoped>
.job-card {
  height: 100%;
  transition: transform 0.2s;
}

.job-card:hover {
  transform: translateY(-5px);
}

.job-details-card,
.company-card {
  transition: box-shadow 0.2s;
  background: whitesmoke;
}

.job-details-card:hover,
.company-card:hover {
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1) !important;
}
</style>
