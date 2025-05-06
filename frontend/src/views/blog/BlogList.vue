<template>
  <div class="blog-list">
    <h1 class="text-h4 mb-6">Blog</h1>

    <!-- Filters -->
    <v-card class="mb-6" outlined>
      <v-card-text>
        <v-row>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="searchQuery"
              label="Search"
              prepend-inner-icon="mdi-magnify"
              outlined
              dense
              clearable
              @keyup.enter="fetchPosts"
            ></v-text-field>
          </v-col>

          <v-col cols="12" md="3">
            <v-select
              v-model="selectedCategory"
              :items="categories"
              item-text="name"
              item-value="id"
              label="Category"
              outlined
              dense
              clearable
              @change="fetchPosts"
            ></v-select>
          </v-col>

          <v-col cols="12" md="3">
            <v-select
              v-model="sortBy"
              :items="sortOptions"
              label="Sort by"
              outlined
              dense
              @change="fetchPosts"
            ></v-select>
          </v-col>

          <v-col cols="12" md="2" class="d-flex align-center">
            <v-btn color="primary" @click="fetchPosts" :loading="loading">
              Apply Filters
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Posts -->
    <v-row v-if="!loading && Array.isArray(posts) && posts.length > 0">
      <v-col v-for="post in posts" :key="post.id" cols="12" md="6" lg="4">
        <v-card class="post-card h-100" outlined :to="`/blog/${post.slug}`">
          <v-img
            v-if="post.featuredImage"
            :src="post.featuredImage"
            height="200"
            cover
          ></v-img>
          <v-img
            v-else
            src="@/assets/default-post.jpg"
            height="200"
            cover
          ></v-img>

          <v-card-title class="post-title">
            {{ post.title }}
          </v-card-title>

          <v-card-subtitle>
            <v-chip
              v-if="post.category"
              x-small
              class="mr-2"
              :to="`/blog/category/${post.category.slug}`"
            >
              {{ post.category.name }}
            </v-chip>
            <span class="text-caption">
              {{ formatDate(post.publishedAt || post.createdAt) }}
            </span>
          </v-card-subtitle>

          <v-card-text>
            <p class="post-excerpt">{{ truncate(post.content, 150) }}</p>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text color="primary" :to="`/blog/${post.slug}`">
              Read More
              <v-icon right>mdi-arrow-right</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Loading -->
    <div v-else class="text-center py-6">
      <v-progress-circular
        indeterminate
        color="primary"
        size="64"
      ></v-progress-circular>
      <p class="mt-3">Loading posts...</p>
    </div>

    <!-- No posts found -->
    <v-card
      v-if="!loading && Array.isArray(posts) && posts.length === 0"
      outlined
      class="text-center py-6"
    >
      <v-icon size="64" color="grey lighten-1"
        >mdi-file-document-outline</v-icon
      >
      <p class="text-h6 grey--text text--darken-1 mt-2">No posts found</p>
      <p class="grey--text">Try changing your search criteria</p>
    </v-card>

    <!-- Pagination -->
    <div v-if="totalPages > 1 && !loading" class="text-center mt-6">
      <v-pagination
        v-model="currentPage"
        :length="totalPages"
        :total-visible="7"
        @input="fetchPosts"
      ></v-pagination>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import axios from "axios";

export default {
  name: "BlogList",
  data() {
    return {
      posts: [],
      categories: [],
      loading: true,
      searchQuery: "",
      selectedCategory: null,
      sortBy: "newest",
      currentPage: 1,
      totalPages: 0,
      totalPosts: 0,
      sortOptions: [
        { title: "Newest First", value: "newest" },
        { title: "Oldest First", value: "oldest" },
        { title: "Most Popular", value: "popular" },
      ],
    };
  },
  computed: {
    ...mapState({
      user: (state) => state.auth.user,
    }),
  },
  created() {
    this.fetchCategories();
    this.fetchPosts();
  },
  methods: {
    async fetchPosts() {
      this.loading = true;

      try {
        // For development/testing, you can use mock data
        if (process.env.NODE_ENV === "development") {
          // Simulate API delay
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // Mock data
          this.posts = [
            {
              id: 1,
              title: "Sample Blog Post 1",
              slug: "sample-post-1",
              content:
                "This is a sample blog post content. It can be quite long but will be truncated in the UI.",
              featuredImage: null,
              category: { id: 1, name: "Technology", slug: "technology" },
              publishedAt: new Date().toISOString(),
              createdAt: new Date().toISOString(),
            },
            {
              id: 2,
              title: "Sample Blog Post 2",
              slug: "sample-post-2",
              content: "Another sample blog post content.",
              featuredImage: null,
              category: { id: 2, name: "Design", slug: "design" },
              publishedAt: new Date().toISOString(),
              createdAt: new Date().toISOString(),
            },
          ];
          this.totalPages = 1;
          this.totalPosts = 2;

          this.loading = false;
          return;
        }

        // Actual API call (if not in development)
        const params = {
          page: this.currentPage,
          limit: 9,
          sort: this.sortBy,
        };

        if (this.searchQuery) params.search = this.searchQuery;
        if (this.selectedCategory) params.categoryId = this.selectedCategory;

        // Add a timeout to the axios request
        const response = await axios.get("/blog/posts", {
          params,
          timeout: 10000, // 10 second timeout
        });

        // Ensure posts is always an array
        this.posts = response.data.posts || [];
        this.totalPages = response.data.totalPages || 1;
        this.totalPosts = response.data.total || 0;
      } catch (error) {
        console.error("Error fetching posts:", error);
        // Initialize to empty values on error
        this.posts = [];
        this.totalPages = 0;
        this.totalPosts = 0;

        // You might want to add an error state
        this.error = "Failed to load posts. Please try again later.";
      } finally {
        this.loading = false;
      }
    },

    async fetchCategories() {
      try {
        const response = await axios.get("/blog/categories");
        this.categories = response.data.categories;
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    },

    truncate(text, length) {
      if (!text) return "";
      return text.length > length ? text.substring(0, length) + "..." : text;
    },

    formatDate(dateString) {
      if (!dateString) return "";
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    },
  },
};
</script>

<style scoped>
.post-card {
  transition: transform 0.3s, box-shadow 0.3s;
}

.post-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.post-title {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.post-excerpt {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}
</style>
