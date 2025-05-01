<template>
  <v-container class="blog-detail">
    <v-row v-if="loading">
      <v-col cols="12" class="text-center">
        <v-progress-circular
          indeterminate
          color="primary"
          size="64"
        ></v-progress-circular>
      </v-col>
    </v-row>

    <template v-else-if="post">
      <v-row>
        <v-col cols="12">
          <v-breadcrumbs :items="breadcrumbs" divider=">"></v-breadcrumbs>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" md="8">
          <v-card flat class="mb-6">
            <v-img
              v-if="post.featuredImage"
              :src="post.featuredImage"
              height="400"
              class="grey lighten-2"
              :alt="post.title"
            ></v-img>

            <v-card-title class="text-h3 pt-6">{{ post.title }}</v-card-title>

            <v-card-text>
              <div class="d-flex align-center mb-4">
                <v-avatar size="40" class="mr-3">
                  <v-icon v-if="!authorAvatar" size="40" color="primary"
                    >mdi-account-circle</v-icon
                  >
                  <v-img v-else :src="authorAvatar" alt="Author"></v-img>
                </v-avatar>
                <div>
                  <div class="text-subtitle-1">{{ post.authorName }}</div>
                  <div class="text-caption grey--text">
                    {{ formatDate(post.publishedAt || post.createdAt) }} ·
                    {{ post.viewCount }}
                    {{ post.viewCount === 1 ? "view" : "views" }}
                  </div>
                </div>
              </div>

              <!-- Post content rendered as HTML -->
              <div class="post-content" v-html="post.content"></div>

              <!-- Tags -->
              <div class="mt-6" v-if="post.tags && post.tags.length">
                <v-chip
                  v-for="tag in post.tags"
                  :key="tag"
                  class="mr-2 mb-2"
                  small
                  @click="searchByTag(tag)"
                >
                  {{ tag }}
                </v-chip>
              </div>
            </v-card-text>

            <v-divider class="my-4"></v-divider>

            <!-- Author info -->
            <v-card-text>
              <div class="d-flex">
                <v-avatar size="64" class="mr-4">
                  <v-icon v-if="!authorAvatar" size="64" color="primary"
                    >mdi-account-circle</v-icon
                  >
                  <v-img v-else :src="authorAvatar" alt="Author"></v-img>
                </v-avatar>
                <div>
                  <div class="text-h6">About {{ post.authorName }}</div>
                  <p class="text-body-1">
                    {{ authorBio || "This author has not provided a bio yet." }}
                  </p>
                </div>
              </div>
            </v-card-text>

            <!-- Post actions -->
            <v-card-actions v-if="canEdit">
              <v-spacer></v-spacer>
              <v-btn color="primary" text :to="`/blog/edit/${post.id}`">
                <v-icon left>mdi-pencil</v-icon>
                Edit
              </v-btn>
              <v-btn color="error" text @click="confirmDelete = true">
                <v-icon left>mdi-delete</v-icon>
                Delete
              </v-btn>
            </v-card-actions>
          </v-card>

          <!-- Comments section -->
          <comment-section
            :post-id="post.id"
            :comments="comments"
            @comment-added="loadComments"
          ></comment-section>
        </v-col>

        <v-col cols="12" md="4">
          <!-- Author card -->
          <v-card class="mb-6" outlined>
            <v-card-title>About the Author</v-card-title>
            <v-card-text>
              <div class="d-flex flex-column align-center mb-4">
                <v-avatar size="80" class="mb-3">
                  <v-icon v-if="!authorAvatar" size="80" color="primary"
                    >mdi-account-circle</v-icon
                  >
                  <v-img v-else :src="authorAvatar" alt="Author"></v-img>
                </v-avatar>
                <div class="text-h6">{{ post.authorName }}</div>
              </div>
              <p>
                {{ authorBio || "This author has not provided a bio yet." }}
              </p>
              <v-btn
                block
                outlined
                color="primary"
                :to="`/blog/author/${post.authorId}`"
                class="mt-3"
              >
                View all posts
              </v-btn>
            </v-card-text>
          </v-card>

          <!-- Category card -->
          <v-card class="mb-6" outlined v-if="post.category">
            <v-card-title>Category</v-card-title>
            <v-card-text>
              <v-chip color="primary" @click="goToCategory(post.category.slug)">
                {{ post.category.name }}
              </v-chip>
            </v-card-text>
          </v-card>

          <!-- Related posts -->
          <v-card outlined>
            <v-card-title>Related Posts</v-card-title>
            <v-card-text>
              <div v-if="relatedPosts.length === 0" class="text-center py-4">
                <v-icon large color="grey lighten-1"
                  >mdi-file-document-outline</v-icon
                >
                <p class="text-body-1 mt-2">No related posts found</p>
              </div>
              <v-list v-else two-line>
                <v-list-item
                  v-for="relatedPost in relatedPosts"
                  :key="relatedPost.id"
                  :to="`/blog/${relatedPost.slug}`"
                >
                  <v-list-item-avatar v-if="relatedPost.featuredImage">
                    <v-img :src="relatedPost.featuredImage"></v-img>
                  </v-list-item-avatar>
                  <v-list-item-avatar v-else color="grey lighten-3">
                    <v-icon>mdi-file-document-outline</v-icon>
                  </v-list-item-avatar>

                  <v-list-item-content>
                    <v-list-item-title>{{
                      relatedPost.title
                    }}</v-list-item-title>
                    <v-list-item-subtitle>{{
                      formatDate(
                        relatedPost.publishedAt || relatedPost.createdAt
                      )
                    }}</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <v-row v-else>
      <v-col cols="12" class="text-center">
        <v-icon x-large color="grey lighten-1">mdi-alert-circle-outline</v-icon>
        <h2 class="text-h5 mt-4">Post not found</h2>
        <p class="text-body-1">
          The post you're looking for doesn't exist or has been removed.
        </p>
        <v-btn color="primary" class="mt-4" to="/blog"> Back to Blog </v-btn>
      </v-col>
    </v-row>

    <!-- Delete confirmation dialog -->
    <v-dialog v-model="confirmDelete" max-width="500">
      <v-card>
        <v-card-title>Delete Post</v-card-title>
        <v-card-text>
          Are you sure you want to delete this post? This action cannot be
          undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey darken-1" text @click="confirmDelete = false">
            Cancel
          </v-btn>
          <v-btn color="error" text @click="deletePost" :loading="deleting">
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { mapState, mapActions } from "vuex";
import CommentSection from "@/components/blog/CommentSection.vue";

export default {
  name: "BlogDetail",
  components: {
    CommentSection,
  },
  data() {
    return {
      confirmDelete: false,
      deleting: false,
      comments: [],
      relatedPosts: [],
      authorAvatar: null,
      authorBio: null,
    };
  },
  computed: {
    ...mapState({
      post: (state) => state.blog.post,
      loading: (state) => state.blog.loading,
      error: (state) => state.blog.error,
      user: (state) => state.auth.user,
    }),
    canEdit() {
      if (!this.user || !this.post) return false;
      return this.user.id === this.post.authorId || this.user.role === "admin";
    },
    breadcrumbs() {
      const items = [
        {
          text: "Home",
          disabled: false,
          href: "/",
        },
        {
          text: "Blog",
          disabled: false,
          href: "/blog",
        },
      ];

      if (this.post && this.post.category) {
        items.push({
          text: this.post.category.name,
          disabled: false,
          href: `/blog/category/${this.post.category.slug}`,
        });
      }

      if (this.post) {
        items.push({
          text: this.post.title,
          disabled: true,
        });
      }

      return items;
    },
  },
  async created() {
    await this.loadPost();
    if (this.post) {
      this.loadComments();
      this.loadRelatedPosts();
      this.loadAuthorInfo();
    }
  },
  methods: {
    ...mapActions({
      fetchPostById: "blog/fetchPostById",
      deletePostAction: "blog/deletePost",
      fetchPosts: "blog/fetchPosts",
    }),
    async loadPost() {
      try {
        const id = this.$route.params.id;
        await this.fetchPostById(id);
      } catch (error) {
        console.error("Error loading post:", error);
      }
    },
    async loadComments() {
      try {
        const response = await this.$axios.get(
          `/api/blog/posts/${this.post.id}/comments`
        );
        this.comments = response.data.comments;
      } catch (error) {
        console.error("Error loading comments:", error);
      }
    },
    async loadRelatedPosts() {
      try {
        // Get posts in the same category
        const response = await this.$axios.get("/api/blog/posts", {
          params: {
            categoryId: this.post.categoryId,
            limit: 5,
          },
        });

        // Filter out the current post
        this.relatedPosts = response.data.posts.filter(
          (p) => p.id !== this.post.id
        );
      } catch (error) {
        console.error("Error loading related posts:", error);
      }
    },
    async loadAuthorInfo() {
      try {
        // This would typically come from your user API
        const response = await this.$axios.get(
          `/api/users/${this.post.authorId}`
        );
        const author = response.data.user;
        this.authorAvatar = author.avatar;
        this.authorBio = author.bio;
      } catch (error) {
        console.error("Error loading author info:", error);
      }
    },
    async deletePost() {
      try {
        this.deleting = true;
        await this.deletePostAction(this.post.id);
        this.confirmDelete = false;
        this.$router.push("/blog");
        this.$store.dispatch("snackbar/showSnackbar", {
          text: "Post deleted successfully",
          color: "success",
        });
      } catch (error) {
        console.error("Error deleting post:", error);
        this.$store.dispatch("snackbar/showSnackbar", {
          text: "Error deleting post",
          color: "error",
        });
      } finally {
        this.deleting = false;
      }
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    },
    searchByTag(tag) {
      this.$router.push(`/blog?tag=${tag}`);
    },
    goToCategory(slug) {
      this.$router.push(`/blog/category/${slug}`);
    },
  },
};
</script>

<style scoped>
.post-content {
  line-height: 1.8;
  font-size: 1.1rem;
}

.post-content > img {
  max-width: 100%;
  height: auto;
  margin: 20px 0;
}

.post-content > h1,
.post-content > h2,
.post-content > h3,
.post-content > h4,
.post-content > h5,
.post-content > h6 {
  margin-top: 1.5em;
  margin-bottom: 0.5em;
}

.post-content > p {
  margin-bottom: 1.5em;
}

.post-content > blockquote {
  border-left: 4px solid #ccc;
  margin-left: 0;
  padding-left: 16px;
  font-style: italic;
}

.post-content > pre {
  background-color: #f5f5f5;
  padding: 16px;
  border-radius: 4px;
  overflow-x: auto;
}
</style>
