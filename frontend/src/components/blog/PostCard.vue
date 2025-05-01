<template>
  <v-card
    class="post-card"
    :to="`/blog/${post.slug || post.id}`"
    hover
    outlined
  >
    <v-img
      v-if="post.featuredImage"
      :src="post.featuredImage"
      height="200"
      class="grey lighten-2"
      :alt="post.title"
    ></v-img>
    <v-img
      v-else
      height="200"
      class="grey lighten-2"
      src="@/assets/placeholder-image.jpg"
      alt="Placeholder"
    ></v-img>

    <v-card-title class="post-title">{{ post.title }}</v-card-title>

    <v-card-subtitle class="pb-0">
      <div class="d-flex align-center">
        <v-avatar size="24" class="mr-2">
          <v-icon v-if="!authorAvatar" size="24" color="primary"
            >mdi-account-circle</v-icon
          >
          <v-img v-else :src="authorAvatar" alt="Author"></v-img>
        </v-avatar>
        <span>{{ post.authorName }}</span>
        <v-spacer></v-spacer>
        <v-icon small class="mr-1">mdi-calendar</v-icon>
        <span class="caption">{{
          formatDate(post.publishedAt || post.createdAt)
        }}</span>
      </div>
    </v-card-subtitle>

    <v-card-text>
      <p class="post-excerpt">{{ excerpt }}</p>

      <div v-if="post.category" class="mt-2">
        <v-chip x-small color="primary" text-color="white" class="mr-1">
          {{ post.category.name }}
        </v-chip>
      </div>
    </v-card-text>

    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn text color="primary" :to="`/blog/${post.slug || post.id}`">
        Read More
        <v-icon right>mdi-arrow-right</v-icon>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  name: "PostCard",
  props: {
    post: {
      type: Object,
      required: true,
    },
    authorAvatar: {
      type: String,
      default: null,
    },
  },
  computed: {
    excerpt() {
      // Strip HTML tags and get plain text
      const content = this.post.content.replace(/<[^>]*>/g, "");
      return content.length > 150 ? content.substring(0, 150) + "..." : content;
    },
  },
  methods: {
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },
  },
};
</script>

<style scoped>
.post-card {
  transition: transform 0.3s;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.post-card:hover {
  transform: translateY(-5px);
}

.post-title {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  height: 64px;
}

.post-excerpt {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  color: rgba(0, 0, 0, 0.6);
}
</style>
