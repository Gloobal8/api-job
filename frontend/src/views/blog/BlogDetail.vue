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
          <v-breadcrumbs class="px-0">
            <template v-slot:prepend>
              <v-icon size="small" icon="mdi-home" class="mr-2"></v-icon>
            </template>

            <v-breadcrumbs-item title="Home" :disabled="false" href="/">
              Home
            </v-breadcrumbs-item>

            <v-breadcrumbs-divider>
              <v-icon>mdi-chevron-right</v-icon>
            </v-breadcrumbs-divider>

            <v-breadcrumbs-item title="Blog" :disabled="false" href="/blog">
              Blog
            </v-breadcrumbs-item>

            <v-breadcrumbs-divider>
              <v-icon>mdi-chevron-right</v-icon>
            </v-breadcrumbs-divider>

            <v-breadcrumbs-item
              :title="post ? post.title : 'Post Detail'"
              disabled
            >
              {{ post ? post.title : "Post Detail" }}
            </v-breadcrumbs-item>
          </v-breadcrumbs>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" md="8">
          <v-card flat class="mb-6">
            <v-img
              v-if="post.featuredImage"
              :src="$getImageUrl(post.featuredImage, 'post')"
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
                  <v-img
                    v-else
                    :src="$getImageUrl(authorAvatar, 'user')"
                    alt="Author"
                  ></v-img>
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
                  <v-img
                    v-else
                    :src="$getImageUrl(authorAvatar, 'user')"
                    alt="Author"
                  ></v-img>
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
            ref="commentSection"
            :post-id="post.id"
            :comments="comments"
            @comment-added="handleCommentAdded"
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
                  <v-img
                    v-else
                    :src="$getImageUrl(authorAvatar, 'user')"
                    alt="Author"
                  ></v-img>
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
                  <template v-slot:prepend>
                    <v-avatar v-if="relatedPost.featuredImage">
                      <v-img
                        :src="$getImageUrl(relatedPost.featuredImage, 'post')"
                      ></v-img>
                    </v-avatar>
                    <v-avatar v-else color="grey lighten-3">
                      <v-icon>mdi-file-document-outline</v-icon>
                    </v-avatar>
                  </template>

                  <v-list-item-title>{{ relatedPost.title }}</v-list-item-title>
                  <v-list-item-subtitle>
                    {{
                      formatDate(
                        relatedPost.publishedAt || relatedPost.createdAt
                      )
                    }}
                  </v-list-item-subtitle>
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
import { v4 as uuidv4 } from "uuid";
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
      breadcrumbs: [
        {
          title: "Home",
          disabled: false,
          href: "/",
        },
        {
          title: "Blog",
          disabled: false,
          href: "/blog",
        },
        {
          title: "Loading...",
          disabled: true,
        },
      ],
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
      fetchPostBySlug: "blog/fetchPostBySlug",
      deletePostAction: "blog/deletePost",
      fetchPosts: "blog/fetchPosts",
    }),
    // Actualizar el breadcrumb cuando se carga el post
    updateBreadcrumbs() {
      if (this.post) {
        // Actualizar el último elemento del breadcrumb con el título del post
        this.breadcrumbs = [
          {
            title: "Home",
            disabled: false,
            href: "/",
          },
          {
            title: "Blog",
            disabled: false,
            href: "/blog",
          },
          {
            title: this.post.title || "Post Detail",
            disabled: true,
          },
        ];
      }
    },
    /*async loadPost() {
      try {
        // Obtener el identificador del post de la URL
        const idOrSlug = this.$route.params.id;

        // Verificar si es un ID numérico o un slug
        const isNumeric = /^\d+$/.test(idOrSlug);

        if (isNumeric) {
          // Si es un ID numérico, usar fetchPostById
          await this.fetchPostById(idOrSlug);
        } else {
          // Si es un slug, usar un nuevo método para buscar por slug
          await this.fetchPostBySlug(idOrSlug);
        }

        // Si el post no se encontró, mostrar un error
        if (!this.post) {
          console.error("Post not found");
        }
      } catch (error) {
        console.error("Error loading post:", error);
      }
    },*/
    async loadPost() {
      try {
        const idOrSlug = this.$route.params.id;

        // Intentar cargar desde la API
        try {
          await this.fetchPostById(idOrSlug);
        } catch (apiError) {
          console.warn("API error, using mock data:", apiError);

          // Si la API falla, usar datos de ejemplo
          if (idOrSlug === "sample-post-1") {
            // Simular un post de ejemplo
            const mockPost = {
              id: "sample-post-1",
              title: "Sample Blog Post",
              content:
                "<p>This is a sample blog post content.</p><p>You can add more paragraphs here.</p>",
              authorId: "1",
              authorName: "John Doe",
              categoryId: "1",
              category: { id: "1", name: "Technology", slug: "technology" },
              tags: ["sample", "example", "demo"],
              createdAt: new Date().toISOString(),
              publishedAt: new Date().toISOString(),
              viewCount: 42,
              featuredImage: "blog/sample-post-image.jpg",
            };

            // Actualizar el estado manualmente
            this.$store.commit("blog/SET_POST", mockPost);
          }
        }
        // Actualizar breadcrumbs después de cargar el post
        this.updateBreadcrumbs();
      } catch (error) {
        console.error("Error loading post:", error);
      }
    },
    async loadComments() {
      try {
        // Intentar cargar desde la API
        try {
          const response = await this.$axios.get(
            `/blog/posts/${this.post.id}/comments`
          );
          this.comments = response.data.comments;
        } catch (apiError) {
          console.info("Usando datos de ejemplo para comentarios");

          // Obtener los IDs de los comentarios principales actuales
          const mainCommentIds = this.comments.map((c) => c.id);
          console.log("IDs de comentarios principales:", mainCommentIds);

          // Si ya tenemos comentarios, vamos a añadir respuestas a esos comentarios
          if (mainCommentIds.length > 0) {
            // Crear respuestas para los comentarios existentes
            const replies = [
              {
                id: uuidv4(), // Generar un ID único o usar una biblioteca para ello
                postId: this.post.id,
                content: "I agree! The design is very clean and modern.",
                authorId: "1",
                authorName: "John Doe",
                parentId: mainCommentIds[1], // Respuesta al segundo comentario
                replyTo: mainCommentIds[1],
                createdAt: new Date(
                  Date.now() - 10 * 60 * 60 * 1000
                ).toISOString(),
                updatedAt: new Date(
                  Date.now() - 10 * 60 * 60 * 1000
                ).toISOString(),
              },
              {
                id: uuidv4(),
                postId: this.post.id,
                content:
                  "Have you checked out the other posts? They're equally helpful.",
                authorId: "2",
                authorName: "Jane Smith",
                parentId: mainCommentIds[2], // Respuesta al tercer comentario
                replyTo: mainCommentIds[2],
                createdAt: new Date(
                  Date.now() - 5 * 60 * 60 * 1000
                ).toISOString(),
                updatedAt: new Date(
                  Date.now() - 5 * 60 * 60 * 1000
                ).toISOString(),
              },
            ];

            // Añadir las respuestas a los comentarios existentes
            this.comments = [...this.comments, ...replies];
          } else {
            // Si no hay comentarios, crear comentarios principales y respuestas
            // Crear IDs únicos para los comentarios principales
            const comment1Id = uuidv4();
            const comment2Id = uuidv4();
            const comment3Id = uuidv4();

            this.comments = [
              {
                id: comment1Id,
                postId: this.post.id,
                content:
                  "This is a great sample post! Looking forward to more content.",
                authorId: "3",
                authorName: "Michael Johnson",
                createdAt: new Date(
                  Date.now() - 1 * 24 * 60 * 60 * 1000
                ).toISOString(),
                updatedAt: new Date(
                  Date.now() - 1 * 24 * 60 * 60 * 1000
                ).toISOString(),
                parentId: null, // Comentario principal
              },
              {
                id: comment2Id,
                postId: this.post.id,
                content:
                  "I really like the layout and design of this blog. The comment system works great too!",
                authorId: "4",
                authorName: "Sarah Williams",
                createdAt: new Date(
                  Date.now() - 12 * 60 * 60 * 1000
                ).toISOString(),
                updatedAt: new Date(
                  Date.now() - 12 * 60 * 60 * 1000
                ).toISOString(),
                parentId: null, // Comentario principal
              },
              {
                id: comment3Id,
                postId: this.post.id,
                content:
                  "Thanks for sharing this example. It helped me understand how the blog system works.",
                authorId: "5",
                authorName: "David Brown",
                createdAt: new Date(
                  Date.now() - 6 * 60 * 60 * 1000
                ).toISOString(),
                updatedAt: new Date(
                  Date.now() - 6 * 60 * 60 * 1000
                ).toISOString(),
                parentId: null, // Comentario principal
              },
              // Respuestas anidadas
              {
                id: uuidv4(),
                postId: this.post.id,
                content: "I agree! The design is very clean and modern.",
                authorId: "1",
                authorName: "John Doe",
                parentId: comment2Id, // Respuesta al comentario 2
                replyTo: comment2Id,
                createdAt: new Date(
                  Date.now() - 10 * 60 * 60 * 1000
                ).toISOString(),
                updatedAt: new Date(
                  Date.now() - 10 * 60 * 60 * 1000
                ).toISOString(),
              },
              {
                id: uuidv4(),
                postId: this.post.id,
                content:
                  "Have you checked out the other posts? They're equally helpful.",
                authorId: "2",
                authorName: "Jane Smith",
                parentId: comment3Id, // Respuesta al comentario 3
                replyTo: comment3Id,
                createdAt: new Date(
                  Date.now() - 5 * 60 * 60 * 1000
                ).toISOString(),
                updatedAt: new Date(
                  Date.now() - 5 * 60 * 60 * 1000
                ).toISOString(),
              },
              {
                id: uuidv4(),
                postId: this.post.id,
                content:
                  "Yes, I've read a few others. The MEVN stack tutorial was particularly useful for my project.",
                authorId: "5",
                authorName: "David Brown",
                parentId: comment3Id, // Respuesta al comentario 3
                replyTo: comment3Id,
                createdAt: new Date(
                  Date.now() - 4 * 60 * 60 * 1000
                ).toISOString(),
                updatedAt: new Date(
                  Date.now() - 4 * 60 * 60 * 1000
                ).toISOString(),
              },
            ];
          }

          // Asegurarse de que el componente CommentSection inicialice las reacciones
          this.$nextTick(() => {
            if (
              this.$refs.commentSection &&
              typeof this.$refs.commentSection.initializeCommentReactions ===
                "function"
            ) {
              this.$refs.commentSection.initializeCommentReactions();
            }

            // También asegurarse de que las respuestas sean visibles
            if (this.$refs.commentSection) {
              this.comments.forEach((comment) => {
                if (!comment.parentId) {
                  const replies = this.comments.filter(
                    (c) => c.parentId === comment.id
                  );
                  if (replies.length > 0) {
                    this.$set(
                      this.$refs.commentSection.visibleReplies,
                      comment.id,
                      true
                    );
                  }
                }
              });
            }
          });
        }
      } catch (error) {
        console.error("Error loading comments:", error);
        this.comments = [];
      }
    },

    // Añadir este método para manejar nuevos comentarios
    handleCommentAdded(newComment) {
      // Añadir el nuevo comentario a la lista
      this.comments.push(newComment);

      // Si es una respuesta, asegurarse de que las respuestas del comentario padre estén visibles
      if (newComment.parentId) {
        // Si estamos usando el componente CommentSection con el método toggleReplies,
        // podríamos emitir un evento para mostrar las respuestas
        this.$refs.commentSection.toggleReplies(newComment.parentId);
      }
    },

    async loadRelatedPosts() {
      try {
        // Get posts in the same category
        const response = await this.$axios.get("/blog/posts", {
          params: {
            categoryId: this.post.categoryId,
            limit: 5,
          },
        });

        // Filter out the current post
        this.relatedPosts = response.data.posts.filter(
          (p) => p.id !== this.post.id
        ); // Asegurarse de que las rutas de imágenes sean relativas
        this.relatedPosts = this.relatedPosts.map((post) => {
          if (
            post.featuredImage &&
            post.featuredImage.startsWith("https://via.placeholder.com")
          ) {
            post.featuredImage = `blog/post-${post.id}.jpg`;
          }
          return post;
        });
      } catch (error) {
        console.error("Error loading related posts:", error);
      }
    },
    async loadAuthorInfo() {
      try {
        // This would typically come from your user API
        const response = await this.$axios.get(`/users/${this.post.authorId}`);
        const author = response.data.user;
        // Convertir avatar de placeholder a ruta relativa
        if (
          author.avatar &&
          author.avatar.startsWith("https://via.placeholder.com")
        ) {
          this.authorAvatar = `users/avatar-${author.id}.jpg`;
        } else {
          this.authorAvatar = author.avatar;
        }

        this.authorBio = author.bio;
      } catch (error) {
        console.error("Error loading author info:", error);
        // Si hay error, usar datos de ejemplo
        if (this.post && this.post.authorId) {
          this.authorAvatar = `users/avatar-${this.post.authorId}.jpg`;
          this.authorBio =
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";
        }
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
  watch: {
    // Actualizar breadcrumbs cuando cambia el post
    post: {
      handler(newPost) {
        if (newPost) {
          this.updateBreadcrumbs();
        }
      },
      immediate: true,
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
