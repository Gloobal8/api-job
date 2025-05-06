<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="3">
        <v-card class="mb-4">
          <v-list>
            <v-list-item>
              <!-- Replace v-list-item-avatar with template v-slot:prepend -->
              <template v-slot:prepend>
                <v-avatar color="primary">
                  <span class="white--text text-h6">{{ userInitials }}</span>
                </v-avatar>
              </template>

              <!-- Replace v-list-item-content with direct title and subtitle props -->
              <v-list-item-title>{{ user.name }}</v-list-item-title>
              <v-list-item-subtitle>{{ user.email }}</v-list-item-subtitle>
            </v-list-item>

            <v-divider></v-divider>

            <v-list-item
              v-for="(item, i) in dashboardItems"
              :key="i"
              :to="item.to"
              :class="{ 'v-list-item--active': $route.path === item.to }"
            >
              <!-- Replace v-list-item-icon with template v-slot:prepend -->
              <template v-slot:prepend>
                <v-icon>{{ item.icon }}</v-icon>
              </template>

              <!-- Replace v-list-item-content with direct title prop -->
              <v-list-item-title>{{ item.title }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card>

        <v-card v-if="isEmployer" class="mt-4">
          <v-card-title>Quick Actions</v-card-title>
          <v-card-text>
            <v-btn color="primary" block to="/post-job" class="mb-3">
              <!-- Replace left prop with prepend icon -->
              <template v-slot:prepend>
                <v-icon>mdi-plus</v-icon>
              </template>
              Post a New Job
            </v-btn>

            <v-btn color="secondary" block to="/job-applications">
              <!-- Replace left prop with prepend icon -->
              <template v-slot:prepend>
                <v-icon>mdi-account-search</v-icon>
              </template>
              View Applications
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="9">
        <v-card>
          <v-card-title class="headline">
            Dashboard
            <v-spacer></v-spacer>
            <v-btn icon @click="refreshData">
              <v-icon>mdi-refresh</v-icon>
            </v-btn>
          </v-card-title>

          <v-divider></v-divider>

          <v-card-text>
            <v-row v-if="loading">
              <v-col cols="12" class="text-center">
                <v-progress-circular
                  indeterminate
                  color="primary"
                  size="70"
                ></v-progress-circular>
              </v-col>
            </v-row>

            <template v-else>
              <!-- Employer Dashboard -->
              <div v-if="isEmployer">
                <v-row>
                  <v-col cols="12" sm="6" md="4">
                    <v-card outlined>
                      <v-card-text class="text-center">
                        <div class="text-h4 font-weight-bold">
                          {{ stats.postedJobs }}
                        </div>
                        <div class="text-subtitle-1">Posted Jobs</div>
                      </v-card-text>
                    </v-card>
                  </v-col>

                  <v-col cols="12" sm="6" md="4">
                    <v-card outlined>
                      <v-card-text class="text-center">
                        <div class="text-h4 font-weight-bold">
                          {{ stats.activeJobs }}
                        </div>
                        <div class="text-subtitle-1">Active Jobs</div>
                      </v-card-text>
                    </v-card>
                  </v-col>

                  <v-col cols="12" sm="6" md="4">
                    <v-card outlined>
                      <v-card-text class="text-center">
                        <div class="text-h4 font-weight-bold">
                          {{ stats.totalApplications }}
                        </div>
                        <div class="text-subtitle-1">Total Applications</div>
                      </v-card-text>
                    </v-card>
                  </v-col>
                </v-row>

                <h3 class="text-h5 mt-6 mb-3">Recent Job Applications</h3>

                <v-data-table
                  :headers="applicationHeaders"
                  :items="recentApplications"
                  :items-per-page="5"
                  class="elevation-1"
                >
                  <template v-slot:[`item.job`]="{ item }">
                    {{ item.job.title }}
                  </template>

                  <template v-slot:[`item.company`]="{ item }">
                    {{ item.job.company.name }}
                  </template>

                  <template v-slot:[`item.status`]="{ item }">
                    <v-chip :color="getStatusColor(item.status)" small>
                      {{ item.status }}
                    </v-chip>
                  </template>

                  <template v-slot:[`item.createdAt`]="{ item }">
                    {{ formatDate(item.createdAt) }}
                  </template>

                  <template v-slot:[`item.actions`]="{ item }">
                    <v-btn
                      small
                      text
                      color="primary"
                      :to="`/applications/${item.id}`"
                    >
                      View
                    </v-btn>
                  </template>
                </v-data-table>

                <v-btn text color="primary" to="/applications" class="mt-4">
                  View All Applications
                </v-btn>
              </div>

              <!-- Job Seeker Dashboard -->
              <div v-else>
                <v-row>
                  <v-col cols="12" sm="6" md="4">
                    <v-card outlined>
                      <v-card-text class="text-center">
                        <div class="text-h4 font-weight-bold">
                          {{ stats.appliedJobs }}
                        </div>
                        <div class="text-subtitle-1">Applied Jobs</div>
                      </v-card-text>
                    </v-card>
                  </v-col>

                  <v-col cols="12" sm="6" md="4">
                    <v-card outlined>
                      <v-card-text class="text-center">
                        <div class="text-h4 font-weight-bold">
                          {{ stats.savedJobs }}
                        </div>
                        <div class="text-subtitle-1">Saved Jobs</div>
                      </v-card-text>
                    </v-card>
                  </v-col>

                  <v-col cols="12" sm="6" md="4">
                    <v-card outlined>
                      <v-card-text class="text-center">
                        <div class="text-h4 font-weight-bold">
                          {{ stats.profileViews }}
                        </div>
                        <div class="text-subtitle-1">Profile Views</div>
                      </v-card-text>
                    </v-card>
                  </v-col>
                </v-row>

                <h3 class="text-h5 mt-6 mb-3">Recent Applications</h3>

                <v-data-table
                  :headers="applicationHeaders"
                  :items="recentApplications"
                  :items-per-page="5"
                  class="elevation-1"
                >
                  <template v-slot:item.job="{ item }">
                    {{ item.job.title }}
                  </template>

                  <template v-slot:item.company="{ item }">
                    {{ item.job.company.name }}
                  </template>

                  <template v-slot:item.status="{ item }">
                    <v-chip :color="getStatusColor(item.status)" small>
                      {{ item.status }}
                    </v-chip>
                  </template>

                  <template v-slot:item.createdAt="{ item }">
                    {{ formatDate(item.createdAt) }}
                  </template>
                </v-data-table>

                <h3 class="text-h5 mt-6 mb-3">Recommended Jobs</h3>

                <v-row>
                  <v-col
                    v-for="job in recommendedJobs"
                    :key="job.id"
                    cols="12"
                    md="6"
                  >
                    <v-card outlined :to="`/jobs/${job.id}`" hover>
                      <v-card-title class="pb-1">
                        <div class="d-flex align-center">
                          <v-avatar size="40" class="mr-3">
                            <v-img
                              :src="
                                job.company.logo ||
                                'https://via.placeholder.com/40'
                              "
                              :alt="job.company.name"
                            ></v-img>
                          </v-avatar>
                          <div>
                            <div class="text-subtitle-1 font-weight-bold">
                              {{ job.title }}
                            </div>
                            <div class="text-caption text--secondary">
                              {{ job.company.name }}
                            </div>
                          </div>
                        </div>
                      </v-card-title>

                      <v-card-text>
                        <div class="d-flex mb-2">
                          <v-icon small class="mr-1">mdi-map-marker</v-icon>
                          <span class="text-caption">{{ job.location }}</span>
                        </div>

                        <div class="d-flex mb-2">
                          <v-icon small class="mr-1"
                            >mdi-briefcase-outline</v-icon
                          >
                          <span class="text-caption">{{ job.type }}</span>
                        </div>

                        <div class="d-flex">
                          <v-icon small class="mr-1">mdi-currency-usd</v-icon>
                          <span class="text-caption">{{
                            job.salary || "Negotiable"
                          }}</span>
                        </div>
                      </v-card-text>
                    </v-card>
                  </v-col>
                </v-row>
              </div>
            </template>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: "DashboardView",
  data() {
    return {
      loading: false,
      stats: {
        // Employer stats
        postedJobs: 0,
        activeJobs: 0,
        totalApplications: 0,

        // Job seeker stats
        appliedJobs: 0,
        savedJobs: 0,
        profileViews: 0,
      },
      recentApplications: [],
      recommendedJobs: [],
      applicationHeaders: [
        { title: "Job Title", value: "job" },
        { title: "Company", value: "company" },
        { title: "Status", value: "status" },
        { title: "Applied On", value: "createdAt" },
        { title: "Actions", value: "actions", sortable: false },
      ],
    };
  },
  computed: {
    user() {
      return this.$store.getters.currentUser || {};
    },
    isEmployer() {
      return this.$store.getters.isEmployer;
    },
    userInitials() {
      if (!this.user.name) return "";
      return this.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();
    },
    dashboardItems() {
      const items = [
        { title: "Dashboard", icon: "mdi-view-dashboard", to: "/dashboard" },
        { title: "Profile", icon: "mdi-account", to: "/profile" },
      ];

      if (this.isEmployer) {
        items.push(
          { title: "My Jobs", icon: "mdi-briefcase", to: "/my-jobs" },
          {
            title: "Applications",
            icon: "mdi-account-search",
            to: "/applications",
          },
          {
            title: "Company Profile",
            icon: "mdi-domain",
            to: "/company-profile",
          }
        );
      } else {
        items.push(
          {
            title: "My Applications",
            icon: "mdi-clipboard-text",
            to: "/my-applications",
          },
          { title: "Saved Jobs", icon: "mdi-bookmark", to: "/saved-jobs" },
          { title: "Resume", icon: "mdi-file-document", to: "/resume" }
        );
      }

      return items;
    },
  },
  created() {
    this.fetchDashboardData();
  },
  methods: {
    fetchDashboardData() {
      this.loading = true;

      // Simulate API call
      setTimeout(() => {
        if (this.isEmployer) {
          this.stats = {
            postedJobs: 8,
            activeJobs: 5,
            totalApplications: 23,
          };

          this.recentApplications = [
            {
              id: 1,
              job: { title: "Senior Frontend Developer" },
              applicant: { name: "John Doe" },
              status: "pending",
              createdAt: "2023-04-15T10:30:00Z",
            },
            {
              id: 2,
              job: { title: "Backend Engineer" },
              applicant: { name: "Jane Smith" },
              status: "reviewed",
              createdAt: "2023-04-14T09:45:00Z",
            },
            {
              id: 3,
              job: { title: "UX/UI Designer" },
              applicant: { name: "Mike Johnson" },
              status: "interviewed",
              createdAt: "2023-04-12T14:20:00Z",
            },
            {
              id: 4,
              job: { title: "DevOps Engineer" },
              applicant: { name: "Sarah Williams" },
              status: "rejected",
              createdAt: "2023-04-10T11:15:00Z",
            },
          ];
        } else {
          this.stats = {
            appliedJobs: 12,
            savedJobs: 5,
            profileViews: 34,
          };

          this.recentApplications = [
            {
              id: 1,
              job: {
                title: "Senior Frontend Developer",
                company: { name: "Tech Solutions Inc." },
              },
              status: "pending",
              createdAt: "2023-04-15T10:30:00Z",
            },
            {
              id: 2,
              job: {
                title: "Backend Engineer",
                company: { name: "InnovateSoft" },
              },
              status: "reviewed",
              createdAt: "2023-04-12T09:45:00Z",
            },
            {
              id: 3,
              job: {
                title: "UX/UI Designer",
                company: { name: "DesignHub" },
              },
              status: "rejected",
              createdAt: "2023-04-08T14:20:00Z",
            },
          ];

          this.recommendedJobs = [
            {
              id: 1,
              title: "Frontend Developer",
              company: {
                name: "Tech Solutions Inc.",
                logo: "https://via.placeholder.com/40",
              },
              location: "New York, USA",
              type: "Full-time",
              salary: "$70,000 - $90,000",
            },
            {
              id: 2,
              title: "React Developer",
              company: {
                name: "WebDev Agency",
                logo: "https://via.placeholder.com/40",
              },
              location: "Remote",
              type: "Full-time",
              salary: "$80,000 - $100,000",
            },
          ];
        }

        this.loading = false;
      }, 1000);
    },
    refreshData() {
      this.fetchDashboardData();
    },
    getStatusColor(status) {
      const statusColors = {
        pending: "orange",
        reviewed: "blue",
        interviewed: "purple",
        hired: "green",
        rejected: "red",
      };

      return statusColors[status] || "grey";
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    },
  },
};
</script>
