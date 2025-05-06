<template>
  <v-container class="blog-create">
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">
          {{ isEditing ? "Edit Post" : "Create New Post" }}
        </h1>
      </v-col>
    </v-row>

    <v-form ref="form" v-model="valid" @submit.prevent="savePost">
      <v-row>
        <v-col cols="12" md="8">
          <v-card class="mb-4">
            <v-card-text>
              <v-text-field
                v-model="post.title"
                label="Post Title"
                :rules="titleRules"
                required
                outlined
                counter="100"
              ></v-text-field>

              <v-textarea
                v-if="!useRichEditor"
                v-model="post.content"
                label="Post Content"
                :rules="contentRules"
                required
                outlined
                counter="20000"
                rows="15"
              ></v-textarea>

              <div v-else>
                <label class="v-label theme--light">Post Content *</label>
                <rich-text-editor
                  v-model="post.content"
                  :api-key="tinymceApiKey"
                  :init="editorConfig"
                ></rich-text-editor>
                <div v-if="contentError" class="error--text text-caption mt-1">
                  {{ contentError }}
                </div>
              </div>
            </v-card-text>
          </v-card>

          <v-card class="mb-4">
            <v-card-title>SEO Settings</v-card-title>
            <v-card-text>
              <v-text-field
                v-model="post.slug"
                label="URL Slug"
                hint="Leave blank to generate automatically from title"
                persistent-hint
                outlined
              ></v-text-field>

              <v-textarea
                v-model="post.metaDescription"
                label="Meta Description"
                hint="Brief description for search engines (150-160 characters recommended)"
                persistent-hint
                outlined
                counter="160"
                rows="3"
                class="mt-4"
              ></v-textarea>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card class="mb-4">
            <v-card-title>Publish</v-card-title>
            <v-card-text>
              <v-select
                v-model="post.status"
                :items="statusOptions"
                label="Status"
                outlined
              ></v-select>

              <v-btn
                color="primary"
                block
                class="mt-4"
                :disabled="(!valid && !validateContent()) || saving"
                :loading="saving"
                type="submit"
              >
                {{ isEditing ? "Update Post" : "Publish Post" }}
              </v-btn>

              <v-btn text block class="mt-2" to="/blog"> Cancel </v-btn>
            </v-card-text>
          </v-card>

          <v-card class="mb-4">
            <v-card-title>Categories</v-card-title>
            <v-card-text>
              <v-select
                v-model="post.categoryId"
                :items="safeCategories"
                item-title="name"
                item-value="id"
                label="Category"
                outlined
                :disabled="categoriesLoading"
              ></v-select>
            </v-card-text>
          </v-card>

          <v-card class="mb-4">
            <v-card-title>Tags</v-card-title>
            <v-card-text>
              <v-combobox
                v-model="post.tags"
                :items="popularTags"
                label="Add Tags"
                multiple
                chips
                small-chips
                outlined
                hint="Press Enter to add a tag"
                persistent-hint
              ></v-combobox>
            </v-card-text>
          </v-card>

          <v-card>
            <v-card-title>Featured Image</v-card-title>
            <v-card-text>
              <v-img
                v-if="post.featuredImage"
                :src="post.featuredImage"
                height="200"
                class="grey lighten-2 mb-4"
                contain
              ></v-img>

              <v-file-input
                v-model="featuredImageFile"
                label="Upload Image"
                outlined
                accept="image/*"
                prepend-icon="mdi-camera"
                @change="handleImageUpload"
                :disabled="imageUploading"
                :loading="imageUploading"
              ></v-file-input>

              <v-text-field
                v-model="post.featuredImage"
                label="or Image URL"
                outlined
              ></v-text-field>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-form>
  </v-container>
</template>

<script>
import { mapState, mapActions } from "vuex";
import RichTextEditor from "@/components/blog/RichTextEditor.vue";

export default {
  name: "BlogCreate",
  components: {
    RichTextEditor,
  },
  data() {
    return {
      valid: false,
      saving: false,
      useRichEditor: true,
      contentError: null,
      featuredImageFile: null,
      imageUploading: false,
      categoriesLoading: false,
      post: {
        title: "",
        content: "",
        slug: "",
        categoryId: null,
        tags: [],
        status: "draft",
        featuredImage: "",
        metaDescription: "",
        authorId: null,
      },
      titleRules: [
        (v) => !!v || "Title is required",
        (v) =>
          (v && v.length <= 100) || "Title must be less than 100 characters",
      ],
      contentRules: [
        (v) => !!v || "Content is required",
        (v) =>
          (v && v.length >= 50) || "Content must be at least 50 characters",
      ],
      statusOptions: [
        { title: "Draft", value: "draft" },
        { title: "Published", value: "published" },
      ],
      popularTags: [
        "JavaScript",
        "Vue.js",
        "Web Development",
        "Design",
        "UX",
        "Career",
        "Tutorial",
      ],
      tinymceApiKey: "nncyt616088r0vquiaqbk55q62hymk0hx6yr4ud4x8t0e58f", // Replace with your TinyMCE API key
      editorConfig: {
        height: 500,
        menubar: true,
        // Reducir la lista de plugins a los más esenciales y que funcionan con tu API key
        plugins: ["link", "image", "lists", "code", "help", "wordcount"],
        // Simplificar la barra de herramientas
        toolbar:
          "undo redo | formatselect | bold italic backcolor | \
          alignleft aligncenter alignright alignjustify | \
          bullist numlist outdent indent | link image | removeformat | help",
        // Agregar opciones para mejorar la experiencia
        branding: false,
        promotion: false,
        resize: true,
        // Manejar errores de carga de plugins
        setup: function (editor) {
          editor.on("init", function () {
            console.log("TinyMCE initialized");
          });

          // Capturar y manejar errores
          editor.on("LoadError", function (e) {
            console.warn("TinyMCE plugin load error:", e);
          });
        },
      },
    };
  },
  computed: {
    ...mapState({
      categories: (state) => state.blog?.categories || [],
      loading: (state) => state.blog?.loading || false,
      error: (state) => state.blog?.error || null,
      user: (state) => state.auth?.user || null,
    }),

    // Propiedades existentes
    categoryOptions() {
      // Versión mejorada con programación defensiva
      return (this.categories || []).map((category) => ({
        title: category.name || "Unnamed Category", // Cambiar text a title para Vuetify 3
        value: category.id,
      }));
    },

    isEditing() {
      return !!this.$route.params.id;
    },

    isAuthenticated() {
      return !!this.user;
    },

    // Nuevas propiedades computadas seguras
    safeCategories() {
      return this.categories || [];
    },

    postTitle() {
      return this.post?.title || "";
    },

    postContent() {
      return this.post?.content || "";
    },

    postCategoryId() {
      return this.post?.categoryId || null;
    },

    postStatus() {
      return this.post?.status || "draft";
    },

    userRole() {
      return this.user?.role || "guest";
    },

    isAdmin() {
      return this.userRole === "admin";
    },

    canEdit() {
      if (!this.user) return false;
      if (this.isAdmin) return true;
      return this.post?.authorId === this.user.id;
    },
  },
  async created() {
    // Redirect if not logged in
    /*if (!this.user) {
      this.$router.push("/login?redirect=" + this.$route.fullPath);
      return;
    }*/

    await this.fetchCategories();

    if (this.isEditing) {
      await this.loadPost();
    }
  },
  methods: {
    ...mapActions({
      fetchCategories: "blog/fetchCategories",
      fetchPostById: "blog/fetchPostById",
      createPost: "blog/createPost",
      updatePost: "blog/updatePost",
    }),
    async loadPost() {
      try {
        // Indicar estado de carga
        this.loading = true;

        await this.fetchPostById(this.$route.params.id);
        const post = this.$store.state.blog.post;

        // Verificar si se obtuvo el post correctamente
        if (!post) {
          this.$store.dispatch("snackbar/showSnackbar", {
            text: "Post not found or has been deleted",
            color: "warning",
          });
          this.$router.push("/blog");
          return;
        }

        // Check if user is authorized to edit
        if (post.authorId !== this.user?.id && this.user?.role !== "admin") {
          this.$store.dispatch("snackbar/showSnackbar", {
            text: "You are not authorized to edit this post",
            color: "error",
          });
          this.$router.push("/blog");
          return;
        }

        // Copy post data to our form with safe defaults
        this.post = {
          title: post.title || "",
          content: post.content || "",
          slug: post.slug || "",
          categoryId: post.categoryId || null,
          tags: post.tags || [],
          status: post.status || "draft",
          featuredImage: post.featuredImage || "",
          metaDescription: post.metaDescription || "",
          ...post,
        };
      } catch (error) {
        console.error("Error loading post:", error);
        this.$store.dispatch("snackbar/showSnackbar", {
          text: "Error loading post: " + (error.message || "Unknown error"),
          color: "error",
        });
        // Redirigir al usuario a una página segura
        this.$router.push("/blog");
      } finally {
        this.loading = false;
      }
    },
    validateContent() {
      if (!this.post.content || this.post.content.length < 50) {
        this.contentError = "Content must be at least 50 characters";
        return false;
      }
      this.contentError = null;
      return true;
    },
    async handleImageUpload() {
      if (!this.featuredImageFile) return;

      try {
        // Indicar estado de carga
        this.imageUploading = true;

        // In a real app, you would upload the file to your server or a cloud storage service
        // Here we're just creating a data URL for demo purposes
        const reader = new FileReader();

        // Usar promesa para manejar la carga asíncrona
        const imageUrl = await new Promise((resolve, reject) => {
          reader.onload = (e) => resolve(e.target.result);
          reader.onerror = (e) =>
            reject(new Error("Failed to read image file"));
          reader.readAsDataURL(this.featuredImageFile);
        });

        this.post.featuredImage = imageUrl;

        // Opcional: Mostrar mensaje de éxito
        this.$store.dispatch("snackbar/showSnackbar", {
          text: "Image uploaded successfully",
          color: "success",
        });
      } catch (error) {
        console.error("Error uploading image:", error);
        this.$store.dispatch("snackbar/showSnackbar", {
          text: "Error uploading image: " + (error.message || "Unknown error"),
          color: "error",
        });
        // Mantener la imagen anterior si hay error
        this.featuredImageFile = null;
      } finally {
        this.imageUploading = false;
      }
    },
    async savePost() {
      if (!this.$refs.form.validate() || !this.validateContent()) return;

      try {
        this.saving = true;

        // Preparar los datos del post con valores por defecto
        const postData = {
          ...this.post,
          title: this.post.title.trim(),
          content: this.post.content || "",
          slug: this.post.slug?.trim() || "",
          status: this.post.status || "draft",
        };

        if (this.isEditing) {
          await this.updatePost({
            id: this.$route.params.id,
            postData: postData,
          });
          this.$store.dispatch("snackbar/showSnackbar", {
            text: "Post updated successfully",
            color: "success",
          });
        } else {
          const newPost = await this.createPost(postData);

          if (newPost && newPost.id) {
            this.$store.dispatch("snackbar/showSnackbar", {
              text: "Post created successfully",
              color: "success",
            });
            this.$router.push(`/blog/${newPost.id}`);
          } else {
            throw new Error("Failed to create post - no ID returned");
          }
        }
      } catch (error) {
        console.error("Error saving post:", error);
        this.$store.dispatch("snackbar/showSnackbar", {
          text:
            error.response?.data?.message ||
            "Error saving post: " + (error.message || "Unknown error"),
          color: "error",
        });
      } finally {
        this.saving = false;
      }
    },
    showError(message, timeout = 5000) {
      // Si tienes un componente de snackbar global
      this.$store.dispatch("snackbar/showSnackbar", {
        text: message,
        color: "error",
        timeout: timeout,
      });

      // Alternativa si no tienes un sistema global de notificaciones
      console.error(message);
    },
  },
};
</script>

<style>
/* Add any custom styles here */
</style>
