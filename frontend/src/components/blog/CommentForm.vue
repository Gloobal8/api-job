<template>
  <div class="comment-form">
    <v-card outlined class="mb-4">
      <v-card-title>
        <h3 class="text-h6">Leave a Comment</h3>
      </v-card-title>

      <v-card-text>
        <v-alert v-if="!isLoggedIn" type="info" outlined>
          Please <router-link to="/login">login</router-link> to leave a
          comment.
        </v-alert>

        <v-form
          v-else
          ref="form"
          v-model="valid"
          @submit.prevent="submitComment"
        >
          <v-textarea
            v-model="comment"
            label="Your Comment"
            :rules="commentRules"
            outlined
            counter="1000"
            rows="4"
            :disabled="submitting"
          ></v-textarea>

          <div class="d-flex justify-end">
            <v-btn
              color="primary"
              :disabled="!valid || submitting"
              :loading="submitting"
              type="submit"
            >
              Submit Comment
            </v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import { mapState } from "vuex";

export default {
  name: "CommentForm",
  props: {
    postId: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      valid: false,
      submitting: false,
      comment: "",
      commentRules: [
        (v) => !!v || "Comment is required",
        (v) => (v && v.length >= 3) || "Comment must be at least 3 characters",
        (v) =>
          (v && v.length <= 1000) ||
          "Comment must be less than 1000 characters",
      ],
    };
  },
  computed: {
    ...mapState({
      user: (state) => state.auth.user,
    }),
    isLoggedIn() {
      return !!this.user;
    },
  },
  methods: {
    async submitComment() {
      if (!this.isLoggedIn || !this.$refs.form.validate()) return;

      try {
        this.submitting = true;

        const commentData = {
          postId: this.postId,
          userId: this.user.id,
          userName: `${this.user.firstName} ${this.user.lastName}`,
          content: this.comment,
        };

        await this.$axios.post(
          `/api/blog/posts/${this.postId}/comments`,
          commentData
        );

        this.$store.dispatch("snackbar/showSnackbar", {
          text: "Comment submitted successfully. It will be visible after approval.",
          color: "success",
        });

        // Reset form
        this.comment = "";
        this.$refs.form.resetValidation();

        // Emit event to parent component to refresh comments
        this.$emit("comment-added");
      } catch (error) {
        console.error("Error submitting comment:", error);
        this.$store.dispatch("snackbar/showSnackbar", {
          text: error.response?.data?.message || "Error submitting comment",
          color: "error",
        });
      } finally {
        this.submitting = false;
      }
    },
  },
};
</script>
