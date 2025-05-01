<template>
  <div class="company-analytics-view">
    <v-container v-if="loading">
      <v-row>
        <v-col cols="12" class="text-center">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
        </v-col>
      </v-row>
    </v-container>
    
    <v-container v-else-if="!analytics">
      <v-row>
        <v-col cols="12" class="text-center">
          <v-alert type="error">
            Failed to load analytics data.
          </v-alert>
        </v-col>
      </v-row>
    </v-container>
    
    <v-container v-else>
      <v-row>
        <v-col cols="12">
          <div class="d-flex align-center mb-6">
            <h1 class="text-h4">Company Analytics</h1>
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              @click="exportData"
              :loading="exporting"
            >
              <v-icon left>mdi-download</v-icon>
              Export Data
            </v-btn>
          </div>
          
          <!-- Date Range Selector -->
          <v-card class="mb-6">
            <v-card-text>
              <v-row align="center">
                <v-col cols="12" sm="4">
                  <v-select
                    v-model="dateRange"
                    :items="dateRanges"
                    label="Date Range"
                    outlined
                    dense
                    @change="fetchAnalytics"
                  ></v-select>
                </v-col>
                
                <v-col cols="12" sm="8" v-if="dateRange === 'custom'">
                  <v-row>
                    <v-col cols="6">
                      <v-menu
                        v-model="startDateMenu"
                        :close-on-content-click="false"
                        transition="scale-transition"
                        min-width="290px"
                      >
                        <template v-slot:activator="{ on, attrs }">
                          <v-text-field
                            v-model="startDate"
                            label="Start Date"
                            readonly
                            outlined
                            dense
                            v-bind="attrs"
                            v-on="on"
                          ></v-text-field>
                        </template>
                        <v-date-picker
                          v-model="startDate"
                          @change="startDateMenu = false"
                        ></v-date-picker>
                      </v-menu>
                    </v-col>
                    
                    <v-col cols="6">
                      <v-menu
                        v-model="endDateMenu"
                        :close-on-content-click="false"
                        transition="scale-transition"
                        min-width="290px"
                      >
                        <template v-slot:activator="{ on, attrs }">
                          <v-text-field
                            v-model="endDate"
                            label="End Date"
                            readonly
                            outlined
                            dense
                            v-bind="attrs"
                            v-on="on"
                          ></v-text-field>
                        </template>
                        <v-date-picker
                          v-model="endDate"
                          @change="endDateMenu = false"
                        ></v-date-picker>
                      </v-menu>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
          
          <!-- Analytics Cards -->
          <v-row>
            <!-- Jobs Stats -->
            <v-col cols="12" md="3">
              <v-card class="mb-4" outlined>
                <v-card-text class="text-center">
                  <div class="text-h3 font-weight-bold primary--text">
                    {{ analytics.totalJobs }}
                  </div>
                  <div class="subtitle-1">Total Jobs</div>
                </v-card-text>
              </v-card>
            </v-col>
            
            <v-col cols="12" md="3">
              <v-card class="mb-4" outlined>
                <v-card-text class="text-center">
                  <div class="text-h3 font-weight-bold success--text">
                    {{ analytics.activeJobs }}
                  </div>
                  <div class="subtitle-1">Active Jobs</div>
                </v-card-text>
              </v-card>
            </v-col>
            
            <v-col cols="12" md="3">
              <v-card class="mb-4" outlined>
                <v-card-text class="text-center">
                  <div class="text-h3 font-weight-bold info--text">
                    {{ analytics.totalApplications }}
                  </div>
                  <div class="subtitle-1">Total Applications</div>
                </v-card-text>
              </v-card>
            </v-col>
            
            <v-col cols="12" md="3">
              <v-card class="mb-4" outlined>
                <v-card-text class="text-center">
                  <div class="text-h3 font-weight-bold secondary--text">
                    {{ analytics.applicationRate }}
                  </div>
                  <div class="subtitle-1">Applications per Job</div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
          
          <v-row>
            <!-- Views Stats -->
            <v-col cols="12" md="6">
              <v-card class="mb-6" outlined>
                <v-card-title>Views</v-card-title>
                <v-card-text>
                  <v-row>
                    <v-col cols="6">
                      <div class="text-h4 font-weight-bold text-center">
                        {{ analytics.companyViews }}
                      </div>
                      <div class="subtitle-1 text-center">Company Profile Views</div>
                    </v-col>
                    
                    <v-col cols="6">
                      <div class="text-h4 font-weight-bold text-center">
                        {{ analytics.jobViews }}
                      </div>
                      <div class="subtitle-1 text-center">Job Listing Views</div>
                    </v-col>
                  </v-row>
                  
                  <div class="mt-4">
                    <p class="subtitle-2">
                      <v-icon small color="success" v-if="analytics.monthlyViews > 100">
                        mdi-arrow-up
                      </v-icon>
                      <v-icon small color="error" v-else>
                        mdi-arrow-down
                      </v-icon>
                      Monthly views: {{ analytics.monthlyViews }}
                    </p>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
            
            <!-- Performance Stats -->
            <v-col cols="12" md="6">
              <v-card class="mb-6" outlined>
                <v-card-title>Performance</v-card-title>
                <v-card-text>
                  <v-row>
                    <v-col cols="6">
                      <div class="text-h4 font-weight-bold text-center">
                        {{ analytics.responseTime }} hrs
                      </div>
                      <div class="subtitle-1 text-center">Avg. Response Time</div>
                    </v-col>
                    
                    <v-col cols="6">
                      <div class="text-h4 font-weight-bold text-center">
                        {{ analytics.averageRating }}/5
                      </div>
                      <div class="subtitle-1 text-center">Average Rating</div>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
          
          <!-- Application Status Breakdown -->
          <v-card class="mb-6" outlined>
            <v-card-title>Applications by Status</v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" sm="4">
                  <v-card outlined class="mb-2">
                    <v-card-text class="text-center">
                      <div class="text-h5 font-weight-bold">
                        {{ analytics.applicationsByStatus.pending }}
                      </div>
                      <div class="subtitle-2">Pending</div>
                    </v-card-text>
                  </v-card>
                </v-col>
                
                <v-col cols="12" sm="4">
                  <v-card outlined class="mb-2">
                    <v-card-text class="text-center">
                      <div class="text-h5 font-weight-bold">
                        {{ analytics.applicationsByStatus.reviewed }}
                      </div>
                      <div class="subtitle-2">Reviewed</div>
                    </v-card-text>
                  </v-card>
                </v-col>
                
                <v-col cols="12" sm="4">
                  <v-card outlined class="mb-2">
                    <v-card-text class="text-center">
                      <div class="text-h5 font-weight-bold">
                        {{ analytics.applicationsByStatus.interviewing }}
                      </div>
                      <div class="subtitle-2">Interviewing</div>
                    </v-card-text>
                  </v-card>
                </v-col>
                
                <v-col cols="12" sm="4">
                  <v-card outlined class="mb-2">
                    <v-card-text class="text-center">
                      <div class="text-h5 font-weight-bold">
                        {{ analytics.applicationsByStatus.offered }}
                      </div>
                      <div class="subtitle-2">Offered</div>
                    </v-card-text>
                  </v-card>
                </v-col>
                
                <v-col cols="12" sm="4">
                  <v-card outlined class="mb-2">
                    <v-card-text class="text-center">
                      <div class="text-h5 font-weight-bold">
                        {{ analytics.applicationsByStatus.hired }}
                      </div>
                      <div class="subtitle-2">Hired</div>
                    </v-card-text>
                  </v-card>
                </v-col>
                
                <v-col cols="12" sm="4">
                  <v-card outlined class="mb-2">
                    <v-card-text class="text-center">
                      <div class="text-h5 font-weight-bold">
                        {{ analytics.applicationsByStatus.rejected }}
                      </div>
                      <div class="subtitle-2">Rejected</div>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
          
          <v-card class="mb-6" outlined>
            <v-card-title>Performance Trends</v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" md="6">
                  <company-analytics-chart
                    :type="'line'"
                    :data="viewsChartData"
                    :height="'300px'"
                    :options="{ plugins: { title: { display: true, text: 'View Trends' } } }"
                  ></company-analytics-chart>
                </v-col>
                <v-col cols="12" md="6">
                  <company-analytics-chart
                    :type="'doughnut'"
                    :data="applicationChartData"
                    :height="'300px'"
                    :options="{ plugins: { title: { display: true, text: 'Applications by Status' } } }"
                  ></company-analytics-chart>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
          
          <!-- Data Import Section -->
          <v-card outlined>
            <v-card-title>Data Management</v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" md="6">
                  <h3 class="subtitle-1 font-weight-bold mb-2">Export Company Data</h3>
                  <p>Download all your company data including jobs and applications in JSON format.</p>
                  <v-btn
                    color="primary"
                    @click="exportData"
                    :loading="exporting"
                  >
                    <v-icon left>mdi-download</v-icon>
                    Export Data
                  </v-btn>
                </v-col>
                
                <v-col cols="12" md="6">
                  <h3 class="subtitle-1 font-weight-bold mb-2">Import Company Data</h3>
                  <p>Upload previously exported company data in JSON format.</p>
                  <v-file-input
                    v-model="importFile"
                    label="Select JSON file"
                    accept=".json"
                    outlined
                    dense
                    show-size
                    :loading="importing"
                  ></v-file-input>
                  <v-btn
                    color="primary"
                    @click="importData"
                    :disabled="!importFile"
                    :loading="importing"
                  >
                    <v-icon left>mdi-upload</v-icon>
                    Import Data
                  </v-btn>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
          <company-predictions :company-id="companyId" class="mt-6"></company-predictions>
          </v-col>
          </v-row>
    </v-container>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
const CompanyAnalyticsChart = () => import('@/components/charts/CompanyAnalyticsChart');
import CompanyPredictions from '@/components/companies/CompanyPredictions';

export default {
  name: 'CompanyAnalyticsView',
  components: { CompanyAnalyticsChart, CompanyPredictions },

  data() {
    return {
      analyticsCache: {},
      analytics: null,
      loading: true,
      exporting: false,
      importing: false,
      importFile: null,
      dateRange: 'last30days',
      dateRanges: [
        { text: 'Last 7 Days', value: 'last7days' },
        { text: 'Last 30 Days', value: 'last30days' },
        { text: 'Last 90 Days', value: 'last90days' },
        { text: 'This Year', value: 'thisyear' },
        { text: 'All Time', value: 'alltime' },
        { text: 'Custom Range', value: 'custom' }
      ],
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().substr(0, 10),
      endDate: new Date().toISOString().substr(0, 10),
      startDateMenu: false,
      endDateMenu: false
    };
  },
  
  computed: {
    ...mapGetters(['currentUser']),
    
    companyId() {
      return this.$route.params.id;
    },

    viewsChartData() {
      if (!this.analytics) return { labels: [], datasets: [] };
      return {
        labels: ['Company Views', 'Job Views', 'Monthly Views'],
        datasets: [{
          label: 'Views',
          data: [this.analytics.companyViews, this.analytics.jobViews, this.analytics.monthlyViews],
          backgroundColor: ['rgba(63, 81, 181, 0.6)', 'rgba(0, 150, 136, 0.6)', 'rgba(255, 193, 7, 0.6)'],
          borderColor: ['rgb(63, 81, 181)', 'rgb(0, 150, 136)', 'rgb(255, 193, 7)'],
          borderWidth: 1
        }]
      };
    },

    applicationChartData() {
      if (!this.analytics) return { labels: [], datasets: [] };
      const statuses = Object.keys(this.analytics.applicationsByStatus);
      const counts = statuses.map(status => this.analytics.applicationsByStatus[status]);
      const colors = [
        'rgba(33, 150, 243, 0.6)',
        'rgba(156, 39, 176, 0.6)',
        'rgba(76, 175, 80, 0.6)',
        'rgba(255, 152, 0, 0.6)',
        'rgba(0, 188, 212, 0.6)',
        'rgba(244, 67, 54, 0.6)'
      ];
      return {
        labels: statuses.map(s => s.charAt(0).toUpperCase() + s.slice(1)),
        datasets: [{
          data: counts,
          backgroundColor: colors.slice(0, counts.length),
          borderColor: colors.map(c => c.replace('0.6', '1')),
          borderWidth: 1
        }]
      };
    }
  },
  
  created() {
    this.fetchAnalytics();
  },
  
  methods: {
    async fetchAnalytics() {
      this.loading = true;
      
      if (this.analyticsCache[this.dateRange]) {
        this.analytics = this.analyticsCache[this.dateRange];
        this.loading = false;
        return;
      }
      
      try {
        // Build query parameters based on date range
        const params = {};
        
        if (this.dateRange === 'custom') {
          params.startDate = this.startDate;
          params.endDate = this.endDate;
        } else {
          params.range = this.dateRange;
        }
        
        const response = await this.$axios.get(`/companies/${this.companyId}/analytics`, { params });
        this.analytics = response.data;
      } catch (error) {
        console.error('Error fetching analytics:', error);
        this.$store.commit('SET_ERROR', 'Failed to fetch analytics data');
      } finally {
        this.loading = false;
      }
    },
    
    async exportData() {
      this.exporting = true;
      
      try {
        const response = await this.$axios.get(`/companies/${this.companyId}/export`, {
          responseType: 'blob'
        });
        
        // Create a download link and trigger the download
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `company-${this.companyId}-export.json`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.$store.commit('SET_ERROR', null);
      } catch (error) {
        console.error('Error exporting data:', error);
        this.$store.commit('SET_ERROR', 'Failed to export company data');
      } finally {
        this.exporting = false;
      }
    },
    
    async importData() {
      if (!this.importFile) return;
      
      this.importing = true;
      
      try {
        // Read the file content
        const reader = new FileReader();
        
        reader.onload = async (e) => {
          try {
            // Parse the JSON data
            const data = JSON.parse(e.target.result);
            
            // Send the data to the server
            await this.$axios.post(`/companies/${this.companyId}/import`, { data });
            
            // Show success message
            this.$store.commit('SET_ERROR', null);
            alert('Company data imported successfully!');
            
            // Refresh analytics
            this.fetchAnalytics();
          } catch (error) {
            console.error('Error parsing import file:', error);
            this.$store.commit('SET_ERROR', 'Invalid JSON file format');
          } finally {
            this.importing = false;
          }
        };
        
        reader.onerror = () => {
          this.$store.commit('SET_ERROR', 'Error reading the file');
          this.importing = false;
        };
        
        reader.readAsText(this.importFile);
      } catch (error) {
        console.error('Error importing data:', error);
        this.$store.commit('SET_ERROR', 'Failed to import company data');
        this.importing = false;
      }
    }
  },
  
  watch: {
    dateRange(newVal) {
      if (newVal !== 'custom') {
        this.fetchAnalytics();
      }
    },
    
    startDate() {
      if (this.dateRange === 'custom') {
        this.fetchAnalytics();
      }
    },
    
    endDate() {
      if (this.dateRange === 'custom') {
        this.fetchAnalytics();
      }
    }
  }
};
</script>

<style scoped>
/* Add custom styles here if needed */
</style>