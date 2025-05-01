<template>
  <div class="comment-list">
    <h3 class="text-h6 mb-4">
      {{ comments.length }} {{ comments.length === 1 ? "Comment" : "Comments" }}
    </h3>

    <div v-if="loading" class="text-center py-4">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>

    <div v-else-if="comments.length === 0" class="text-center py-4">
      <v-icon large color="grey lighten-1">mdi-comment-outline</v-icon>
      <p class="text-body-1 mt-2">No comments yet. Be the first to comment!</p>
    </div>

    <div v-else>
      <v-card
        v-for="comment in comments"
        :key="comment.id"
        outlined
        class="mb-4"
      >
        <v-card-text>
          <div class="d-flex">
            <v-avatar size="40" class="mr-3">
              <v-icon
                v-if="!getUserAvatar(comment.userId)"
                size="40"
                color="primary"
                >mdi-account-circle</v-icon
              >
              <v-img
                v-else
                :src="getUserAvatar(comment.userId)"
                alt="User"
              ></v-img>
            </v-avatar>

            <div class="flex-grow-1">
              <div class="d-flex align-center">
                <div class="font-weight-medium">{{ comment.userName }}</div>
                <v-spacer></v-spacer>
                <div class="text-caption grey--text">
                  {{ formatDate(comment.createdAt) }}
                </div>
              </div>

              <p class="mt-2 mb-0">{{ comment.content }}</p>

              <div class="d-flex mt-3" v-if="canManageComment(comment)">
                <v-spacer></v-spacer>
                <v-btn
                  x-small
                  text
                  color="error"
                  @click="confirmDeleteComment(comment)"
                >
                  <v-icon x-small left>mdi-delete</v-icon>
                  Delete
                </v-btn>
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </div>

    <!-- Delete confirmation dialog -->
    <v-dialog v-model="deleteDialog" max-width="500">
      <v-card>
        <v-card-title>Delete Comment</v-card-title>
        <v-card-text>
          Are you sure you want to delete this comment? This action cannot be
          undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="deleteDialog = false"> Cancel </v-btn>
          <v-btn color="error" text @click="deleteComment" :loading="deleting">
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapState } from "vuex";

export default {
  name: "CommentList",
  props: {
    comments: {
      type: Array,
      required: true,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      deleteDialog: false,
      deleting: false,
      commentToDelete: null,
      userAvatars: {}, // Cache for user avatars
    };
  },
  computed: {
    ...mapState({
      user: (state) => state.auth.user,
    }),
  },
  methods: {
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
    getUserAvatar(userId) {
      // In a real application, you would fetch user avatars from your API
      // Here we're just returning null for simplicity
      return this.userAvatars[userId] || null;
    },
    canManageComment(comment) {
      if (!this.user) return false;
      return this.user.id === comment.userId || this.user.role === "admin";
    },
    confirmDeleteComment(comment) {
      this.commentToDelete = comment;
      this.deleteDialog = true;
    },
    async deleteComment() {
      try {
        this.deleting = true;
        await this.$axios.delete(
          `/api/blog/comments/${this.commentToDelete.id}`
        );

        this.$store.dispatch("snackbar/showSnackbar", {
          text: "Comment deleted successfully",
          color: "success",
        });

        this.deleteDialog = false;
        this.commentToDelete = null;

        // Emit event to parent component to refresh comments
        this.$emit("comment-deleted");
      } catch (error) {
        console.error("Error deleting comment:", error);
        this.$store.dispatch("snackbar/showSnackbar", {
          text: error.response?.data?.message || "Error deleting comment",
          color: "error",
        });
      } finally {
        this.deleting = false;
      }
    },
  },
};
</script>
