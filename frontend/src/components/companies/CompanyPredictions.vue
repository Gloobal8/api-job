<!-- 
  CompanyPredictions.vue
  A component for displaying predictive analytics for companies
-->
<template>
  <div class="company-predictions">
    <v-card outlined>
      <v-card-title class="d-flex justify-space-between align-center">
        <div>
          <span>Predictive Analytics</span>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon
                small
                class="ml-2"
                color="primary"
                v-bind="attrs"
                v-on="on"
              >
                mdi-information-outline
              </v-icon>
            </template>
            <span>Predictions based on historical data and market trends</span>
          </v-tooltip>
        </div>
        <v-btn
          color="primary"
          @click="refreshPredictions"
          :loading="loading"
          text
          small
        >
          <v-icon left>mdi-refresh</v-icon>
          Refresh
        </v-btn>
      </v-card-title>
      
      <v-card-text>
        <v-skeleton-loader
          v-if="loading"
          type="card"
        ></v-skeleton-loader>
        
        <div v-else-if="error" class="text-center py-4">
          <v-icon large color="error" class="mb-2">mdi-alert-circle</v-icon>
          <div>{{ error }}</div>
          <v-btn
            color="primary"
            @click="refreshPredictions"
            class="mt-4"
            small
          >
            Try Again
          </v-btn>
        </div>
        
        <div v-else-if="predictions">
          <!-- Key Predictions -->
          <v-row>
            <v-col cols="12" md="3">
              <v-card outlined class="text-center pa-4">
                <v-icon color="primary" large class="mb-2">mdi-trending-up</v-icon>
                <div class="text-h5 font-weight-bold">{{ predictions.nextMonthViews }}</div>
                <div class="subtitle-1">Predicted Views</div>
                <div class="caption">Next Month</div>
              </v-card>
            </v-col>
            
            <v-col cols="12" md="3">
              <v-card outlined class="text-center pa-4">
                <v-icon color="success" large class="mb-2">mdi-account-group</v-icon>
                <div class="text-h5 font-weight-bold">{{ predictions.predictedApplicationRate }}</div>
                <div class="subtitle-1">Applications per Job</div>
                <div class="caption">Expected Average</div>
              </v-card>
            </v-col>
            
            <v-col cols="12" md="3">
              <v-card outlined class="text-center pa-4">
                <v-icon color="info" large class="mb-2">mdi-calendar-check</v-icon>
                <div class="text-h5 font-weight-bold">{{ getDayName(predictions.bestDayToPost) }}</div>
                <div class="subtitle-1">Best Day to Post</div>
                <div class="caption">For Maximum Engagement</div>
              </v-card>
            </v-col>
            
            <v-col cols="12" md="3">
              <v-card outlined class="text-center pa-4">
                <v-icon color="warning" large class="mb-2">mdi-clock-outline</v-icon>
                <div class="text-h5 font-weight-bold">{{ predictions.estimatedHiringTimeInDays }} days</div>
                <div class="subtitle-1">Hiring Time</div>
                <div class="caption">Average Estimate</div>
              </v-card>
            </v-col>
          </v-row>
          
          <!-- Growth Areas & Market Trends -->
          <v-row class="mt-4">
            <v-col cols="12" md="6">
              <v-card outlined>
                <v-card-title class="subtitle-1">
                  <v-icon left color="success">mdi-arrow-up-bold</v-icon>
                  Potential Growth Areas
                </v-card-title>
                <v-card-text>
                  <v-chip
                    v-for="(area, index) in predictions.potentialGrowthAreas"
                    :key="'growth-' + index"
                    class="ma-1"
                    color="success"
                    outlined
                  >
                    {{ area }}
                  </v-chip>
                  
                  <div class="mt-4 caption">
                    These areas show potential for growth based on your company profile and market trends.
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
            
            <v-col cols="12" md="6">
              <v-card outlined>
                <v-card-title class="subtitle-1">
                  <v-icon left color="primary">mdi-chart-line</v-icon>
                  Market Trends
                </v-card-title>
                <v-card-text>
                  <div>
                    <div class="font-weight-medium mb-1">
                      <v-icon small color="success">mdi-arrow-up</v-icon>
                      Increasing Demand
                    </div>
                    <v-chip
                      v-for="(skill, index) in predictions.marketTrends.increasingDemand"
                      :key="'up-' + index"
                      class="ma-1"
                      color="success"
                      small
                      outlined
                    >
                      {{ skill }}
                    </v-chip>
                  </div>
                  
                  <div class="mt-3">
                    <div class="font-weight-medium mb-1">
                      <v-icon small color="error">mdi-arrow-down</v-icon>
                      Decreasing Demand
                    </div>
                    <v-chip
                      v-for="(skill, index) in predictions.marketTrends.decreasingDemand"
                      :key="'down-' + index"
                      class="ma-1"
                      color="error"
                      small
                      outlined
                    >
                      {{ skill }}
                    </v-chip>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
          
          <!-- Recommendations -->
          <v-card outlined class="mt-4">
            <v-card-title class="subtitle-1">
              <v-icon left color="primary">mdi-lightbulb-on</v-icon>
              Strategic Recommendations
            </v-card-title>
            <v-card-text>
              <v-timeline dense>
                <v-timeline-item
                  v-for="(recommendation, index) in getRecommendations()"
                  :key="index"
                  small
                  :color="recommendation.color"
                >
                  <div class="font-weight-medium">{{ recommendation.title }}</div>
                  <div class="caption">{{ recommendation.description }}</div>
                </v-timeline-item>
              </v-timeline>
            </v-card-text>
          </v-card>
        </div>
        
        <div v-else class="text-center py-4">
          <v-icon large color="grey" class="mb-2">mdi-chart-line</v-icon>
          <div>No prediction data available</div>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
export default {
  name: 'CompanyPredictions',
  
  props: {
    companyId: {
      type: String,
      required: true
    }
  },
  
  data() {
    return {
      predictions: null,
      loading: false,
      error: null
    };
  },
  
  mounted() {
    this.fetchPredictions();
  },
  
  methods: {
    async fetchPredictions() {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await this.$axios.get(`/companies/${this.companyId}/predictions`);
        this.predictions = response.data;
      } catch (error) {
        console.error('Error fetching predictions:', error);
        this.error = 'Failed to load predictive analytics. Please try again.';
      } finally {
        this.loading = false;
      }
    },
    
    refreshPredictions() {
      this.fetchPredictions();
    },
    
    getDayName(dayNumber) {
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      return days[(dayNumber - 1) % 7];
    },
    
    getRecommendations() {
      if (!this.predictions) return [];
      
      // Generate recommendations based on prediction data
      const recommendations = [
        {
          title: 'Optimize Job Posting Schedule',
          description: `Post new job listings on ${this.getDayName(this.predictions.bestDayToPost)} for maximum visibility and application rate.`,
          color: 'primary'
        }
      ];
      
      // Add recommendation based on growth areas
      if (this.predictions.potentialGrowthAreas && this.predictions.potentialGrowthAreas.length > 0) {
        recommendations.push({
          title: 'Focus on Growth Areas',
          description: `Consider expanding your team in ${this.predictions.potentialGrowthAreas.join(', ')} to align with market demand.`,
          color: 'success'
        });
      }
      
      // Add recommendation based on increasing demand skills
      if (this.predictions.marketTrends && this.predictions.marketTrends.increasingDemand.length > 0) {
        recommendations.push({
          title: 'Adapt to Market Trends',
          description: `Highlight skills in ${this.predictions.marketTrends.increasingDemand.join(', ')} in your job descriptions to attract relevant candidates.`,
          color: 'info'
        });
      }
      
      // Add recommendation for hiring time
      if (this.predictions.estimatedHiringTimeInDays) {
        recommendations.push({
          title: 'Plan Hiring Timeline',
          description: `Expect an average hiring process of ${this.predictions.estimatedHiringTimeInDays} days. Start recruitment earlier for critical positions.`,
          color: 'warning'
        });
      }
      
      return recommendations;
    }
  }
};
</script>

<style scoped>
/* Add custom styles here if needed */
</style>