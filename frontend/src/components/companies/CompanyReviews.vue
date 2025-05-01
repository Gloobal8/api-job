<!-- 
  CompanyReviews.vue
  A component for displaying and managing company reviews
-->
<template>
  <div class="company-reviews">
    <v-card outlined>
      <v-card-title class="d-flex justify-space-between align-center">
        <div>
          <span>Company Reviews</span>
          <span class="ml-2">({{ totalReviews }})</span>
        </div>
        <v-btn
          color="primary"
          @click="showAddReviewDialog = true"
          v-if="canAddReview"
        >
          <v-icon left>mdi-plus</v-icon>
          Add Review
        </v-btn>
      </v-card-title>
      
      <v-card-text>
        <!-- Reviews Summary -->
        <v-row class="mb-4">
          <v-col cols="12" md="4">
            <div class="text-center">
              <div class="text-h3 font-weight-bold primary--text">
                {{ averageRating.toFixed(1) }}
              </div>
              <div class="d-flex justify-center">
                <v-rating
                  :value="averageRating"
                  color="amber"
                  dense
                  half-increments
                  readonly
                  size="18"
                ></v-rating>
              </div>
              <div class="subtitle-1">{{ totalReviews }} reviews</div>
            </div>
          </v-col>
          
          <v-col cols="12" md="8">
            <div v-for="n in 5" :key="n" class="d-flex align-center mb-2">
              <div class="mr-2">{{ 6 - n }}</div>
              <v-progress-linear
                :value="getRatingPercentage(6 - n)"
                height="8"
                rounded
                color="amber darken-3"
                class="flex-grow-1"
              ></v-progress-linear>
              <div class="ml-2">{{ getRatingCount(6 - n) }}</div>
            </div>
          </v-col>
        </v-row>
        
        <!-- Filter Controls -->
        <div class="d-flex flex-wrap align-center mb-4">
          <v-select
            v-model="filterRating"
            :items="ratingOptions"
            label="Filter by Rating"
            outlined
            dense
            hide-details
            class="mr-2 mb-2"
            style="max-width: 200px;"
          ></v-select>
          
          <v-select
            v-model="sortBy"
            :items="sortOptions"
            label="Sort by"
            outlined
            dense
            hide-details
            class="mr-2 mb-2"
            style="max-width: 200px;"
          ></v-select>
          
          <v-spacer></v-spacer>
          
          <v-text-field
            v-model="searchQuery"
            label="Search reviews"
            prepend-inner-icon="mdi-magnify"
            outlined
            dense
            hide-details
            class="mb-2"
            style="max-width: 300px;"
          ></v-text-field>
        </div>
        
        <!-- Review List -->
        <div v-if="filteredReviews.length > 0">
          <v-card
            v-for="(review, index) in filteredReviews"
            :key="index"
            outlined
            class="mb-4"
          >
            <v-card-text>
              <div class="d-flex align-start">
                <v-avatar size="40" color="primary" class="mr-3">
                  <v-img
                    v-if="review.userAvatar"
                    :src="review.userAvatar"
                    alt="User Avatar"
                  ></v-img>
                  <span v-else class="white--text">{{ getInitials(review.userName) }}</span>
                </v-avatar>
                
                <div class="flex-grow-1">
                  <div class="d-flex justify-space-between align-center">
                    <div>
                      <div class="font-weight-bold">{{ review.userName }}</div>
                      <div class="caption">{{ formatDate(review.date) }}</div>
                    </div>
                    
                    <v-rating
                      :value="review.rating"
                      color="amber"
                      dense
                      readonly
                      size="16"
                    ></v-rating>
                  </div>
                  
                  <div class="mt-2 font-weight-bold">{{ review.title }}</div>
                  <div class="mt-1">{{ review.comment }}</div>
                  
                  <!-- Pros and Cons -->
                  <div class="mt-3" v-if="review.pros || review.cons">
                    <div v-if="review.pros" class="mb-2">
                      <div class="caption font-weight-bold success--text">
                        <v-icon small color="success">mdi-plus-circle</v-icon>
                        PROS
                      </div>
                      <div>{{ review.pros }}</div>
                    </div>
                    
                    <div v-if="review.cons">
                      <div class="caption font-weight-bold error--text">
                        <v-icon small color="error">mdi-minus-circle</v-icon>
                        CONS
                      </div>
                      <div>{{ review.cons }}</div>
                    </div>
                  </div>
                  
                  <!-- Review Actions -->
                  <div class="d-flex justify-end mt-2">
                    <v-btn
                      text
                      small
                      color="primary"
                      @click="handleHelpful(review.id)"
                      :disabled="hasMarkedHelpful(review.id)"
                    >
                      <v-icon small left>mdi-thumb-up</v-icon>
                      Helpful ({{ review.helpfulCount || 0 }})
                    </v-btn>
                    
                    <v-btn
                      text
                      small
                      color="error"
                      @click="handleReport(review.id)"
                      :disabled="hasReported(review.id)"
                      class="ml-2"
                    >
                      <v-icon small left>mdi-flag</v-icon>
                      Report
                    </v-btn>
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
          
          <!-- Pagination -->
          <div class="text-center">
            <v-pagination
              v-model="page"
              :length="totalPages"
              :total-visible="7"
            ></v-pagination>
          </div>
        </div>
        
        <v-alert
          v-else
          type="info"
          text
        >
          No reviews found. Be the first to leave a review!
        </v-alert>
      </v-card-text>
    </v-card>
    
    <!-- Add Review Dialog -->
    <v-dialog
      v-model="showAddReviewDialog"
      max-width="600px"
    >
      <v-card>
        <v-card-title>
          Write a Review
        </v-card-title>
        
        <v-card-text>
          <v-form ref="reviewForm" v-model="isReviewFormValid">
            <v-row>
              <v-col cols="12">
                <div class="text-center mb-3">
                  <div class="subtitle-1 mb-1">Overall Rating</div>
                  <v-rating
                    v-model="newReview.rating"
                    color="amber"
                    hover
                    length="5"
                    size="40"
                    half-increments
                  ></v-rating>
                </div>
              </v-col>
              
              <v-col cols="12">
                <v-text-field
                  v-model="newReview.title"
                  label="Review Title"
                  outlined
                  :rules="[v => !!v || 'Title is required']"
                ></v-text-field>
              </v-col>
              
              <v-col cols="12">
                <v-textarea
                  v-model="newReview.comment"
                  label="Your Review"
                  outlined
                  :rules="[v => !!v || 'Review comment is required', v => v.length >= 20 || 'Review must be at least 20 characters']"
                  hint="Minimum 20 characters"
                  counter
                ></v-textarea>
              </v-col>
              
              <v-col cols="12" md="6">
                <v-textarea
                  v-model="newReview.pros"
                  label="Pros"
                  outlined
                  hint="What did you like about this company?"
                  rows="3"
                ></v-textarea>
              </v-col>
              
              <v-col cols="12" md="6">
                <v-textarea
                  v-model="newReview.cons"
                  label="Cons"
                  outlined
                  hint="What could be improved?"
                  rows="3"
                ></v-textarea>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            text
            @click="showAddReviewDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            :disabled="!isReviewFormValid || submittingReview"
            :loading="submittingReview"
            @click="submitReview"
          >
            Submit Review
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'CompanyReviews',
  
  props: {
    companyId: {
      type: String,
      required: true
    },
    
    reviews: {
      type: Array,
      default: () => []
    }
  },
  
  data() {
    return {
      // Filtering and sorting
      filterRating: 'all',
      sortBy: 'newest',
      searchQuery: '',
      page: 1,
      itemsPerPage: 5,
      
      // Filter options
      ratingOptions: [
        { text: 'All Ratings', value: 'all' },
        { text: '5 Stars', value: 5 },
        { text: '4 Stars', value: 4 },
        { text: '3 Stars', value: 3 },
        { text: '2 Stars', value: 2 },
        { text: '1 Star', value: 1 }
      ],
      
      // Sort options
      sortOptions: [
        { text: 'Newest First', value: 'newest' },
        { text: 'Oldest First', value: 'oldest' },
        { text: 'Highest Rating', value: 'highest' },
        { text: 'Lowest Rating', value: 'lowest' },
        { text: 'Most Helpful', value: 'helpful' }
      ],
      
      // User interactions
      helpfulReviews: [],
      reportedReviews: [],
      
      // Add review dialog
      showAddReviewDialog: false,
      isReviewFormValid: false,
      submittingReview: false,
      newReview: this.getEmptyReview()
    };
  },
  
  computed: {
    ...mapGetters(['currentUser']),
    
    // Check if user can add a review
    canAddReview() {
      return this.currentUser && !this.hasUserReviewed();
    },
    
    // Total number of reviews
    totalReviews() {
      return this.reviews.length;
    },
    
    // Average rating
    averageRating() {
      if (this.reviews.length === 0) return 0;
      
      const sum = this.reviews.reduce((total, review) => total + review.rating, 0);
      return sum / this.reviews.length;
    },
    
    // Filtered and sorted reviews
    filteredReviews() {
      let result = [...this.reviews];
      
      // Filter by rating
      if (this.filterRating !== 'all') {
        result = result.filter(review => review.rating === this.filterRating);
      }
      
      // Filter by search query
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        result = result.filter(review => {
          return (
            review.title.toLowerCase().includes(query) ||
            review.comment.toLowerCase().includes(query) ||
            (review.pros && review.pros.toLowerCase().includes(query)) ||
            (review.cons && review.cons.toLowerCase().includes(query))
          );
        });
      }
      
      // Sort reviews
      switch (this.sortBy) {
        case 'newest':
          result.sort((a, b) => new Date(b.date) - new Date(a.date));
          break;
          
        case 'oldest':
          result.sort((a, b) => new Date(a.date) - new Date(b.date));
          break;
          
        case 'highest':
          result.sort((a, b) => b.rating - a.rating);
          break;
          
        case 'lowest':
          result.sort((a, b) => a.rating - b.rating);
          break;
          
        case 'helpful':
          result.sort((a, b) => (b.helpfulCount || 0) - (a.helpfulCount || 0));
          break;
      }
      
      // Paginate results
      const startIndex = (this.page - 1) * this.itemsPerPage;
      const endIndex = startIndex + this.itemsPerPage;
      
      return result.slice(startIndex, endIndex);
    },
    
    // Total pages for pagination
    totalPages() {
      let filteredCount = this.reviews.length;
      
      // Filter by rating
      if (this.filterRating !== 'all') {
        filteredCount = this.reviews.filter(review => review.rating === this.filterRating).length;
      }
      
      // Filter by search query
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filteredCount = this.reviews.filter(review => {
          return (
            review.title.toLowerCase().includes(query) ||
            review.comment.toLowerCase().includes(query) ||
            (review.pros && review.pros.toLowerCase().includes(query)) ||
            (review.cons && review.cons.toLowerCase().includes(query))
          );
        }).length;
      }
      
      return Math.ceil(filteredCount / this.itemsPerPage);
    }
  },
  
  methods: {
    // Get count of reviews with specific rating
    getRatingCount(rating) {
      return this.reviews.filter(review => review.rating === rating).length;
    },
    
    // Get percentage of reviews with specific rating
    getRatingPercentage(rating) {
      if (this.reviews.length === 0) return 0;
      return (this.getRatingCount(rating) / this.reviews.length) * 100;
    },
    
    // Format date
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },
    
    // Get user initials
    getInitials(name) {
      if (!name) return 'U';
      
      const parts = name.split(' ');
      if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
      
      return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    },
    
    // Check if user has already reviewed
    hasUserReviewed() {
      if (!this.currentUser) return false;
      
      return this.reviews.some(review => review.userId === this.currentUser.id);
    },
    
    // Check if user has marked a review as helpful
    hasMarkedHelpful(reviewId) {
      return this.helpfulReviews.includes(reviewId);
    },
    
    // Check if user has reported a review
    hasReported(reviewId) {
      return this.reportedReviews.includes(reviewId);
    },
    
    // Handle marking a review as helpful
    handleHelpful(reviewId) {
      if (this.hasMarkedHelpful(reviewId)) return;
      
      // Add to helpful reviews
      this.helpfulReviews.push(reviewId);
      
      // Update the review
      const reviewIndex = this.reviews.findIndex(review => review.id === reviewId);
      if (reviewIndex !== -1) {
        this.$emit('helpful', reviewId);
      }
    },
    
    // Handle reporting a review
    handleReport(reviewId) {
      if (this.hasReported(reviewId)) return;
      
      // Add to reported reviews
      this.reportedReviews.push(reviewId);
      
      // Emit report event
      this.$emit('report', reviewId);
    },
    
    // Get empty review object
    getEmptyReview() {
      return {
        rating: 0,
        title: '',
        comment: '',
        pros: '',
        cons: ''
      };
    },
    
    // Submit new review
    async submitReview() {
      if (!this.isReviewFormValid) return;
      
      this.submittingReview = true;
      
      try {
        // Create review object
        const review = {
          ...this.newReview,
          companyId: this.companyId,
          userId: this.currentUser.id,
          userName: this.currentUser.name,
          userAvatar: this.currentUser.avatar,
          date: new Date().toISOString(),
          helpfulCount: 0
        };
        
        // Emit submit event
        this.$emit('submit', review);
        
        // Reset form
        this.newReview = this.getEmptyReview();
        this.showAddReviewDialog = false;
        
        // Reset form validation
        if (this.$refs.reviewForm) {
          this.$refs.reviewForm.reset();
        }
      } catch (error) {
        console.error('Error submitting review:', error);
        this.$store.commit('SET_ERROR', 'Failed to submit review');
      } finally {
        this.submittingReview = false;
      }
    }
  },
  
  watch: {
    // Reset to page 1 when filters change
    filterRating() {
      this.page = 1;
    },
    
    searchQuery() {
      this.page = 1;
    },
    
    sortBy() {
      this.page = 1;
    }
  }
};
</script>

<style scoped>
/* Add custom styles here if needed */
</style>