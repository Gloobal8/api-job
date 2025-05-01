<template>
  <div class="comment-section">
    <v-divider class="my-6"></v-divider>

    <h2 class="text-h5 mb-4">Comments</h2>

    <comment-form
      :post-id="postId"
      @comment-added="$emit('comment-added')"
    ></comment-form>

    <comment-list
      :comments="comments"
      :loading="loading"
      @comment-deleted="$emit('comment-added')"
    ></comment-list>
  </div>
</template>

<script>
import CommentForm from "./CommentForm.vue";
import CommentList from "./CommentList.vue";

export default {
  name: "CommentSection",
  components: {
    CommentForm,
    CommentList,
  },
  props: {
    postId: {
      type: String,
      required: true,
    },
    comments: {
      type: Array,
      default: () => [],
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
};
</script>
