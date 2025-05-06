<template>
  <div class="comment-section mt-6">
    <h2 class="text-h5 mb-4">Comments ({{ comments.length }})</h2>

    <v-card v-if="comments.length === 0" class="mb-6 pa-4 text-center">
      <v-icon large color="grey lighten-1">mdi-comment-outline</v-icon>
      <p class="mt-2">No comments yet. Be the first to comment!</p>
    </v-card>

    <div v-else class="comments-list">
      <!-- Comentarios principales -->
      <v-card
        v-for="comment in mainComments"
        :key="comment.id"
        class="mb-4"
        elevation="0"
        outlined
      >
        <v-card-text>
          <div class="d-flex">
            <v-avatar size="40" class="mr-3">
              <v-img
                :src="
                  $getImageUrl(
                    `users/avatars/avatar-${comment.authorId}.jpg`,
                    'user'
                  )
                "
                alt="User Avatar"
              ></v-img>
            </v-avatar>
            <div style="width: 100%">
              <div class="d-flex align-center justify-space-between">
                <div>
                  <div class="d-flex align-center">
                    <div class="text-subtitle-1 fw600 fs1-1">
                      {{ comment.authorName }}
                    </div>
                    <div class="text-caption ml-2 card-date-custom">
                      {{ formatDate(comment.createdAt) }}
                    </div>
                  </div>
                </div>
                <div>
                  <v-menu offset-y>
                    <template v-slot:activator="{ props }">
                      <v-btn icon variant="plain" v-bind="props">
                        <v-icon>mdi-dots-vertical</v-icon>
                      </v-btn>
                    </template>

                    <v-list>
                      <v-list-item @click="reportComment(comment)">
                        <template v-slot:prepend>
                          <v-icon>mdi-flag</v-icon>
                        </template>
                        <v-list-item-title>Report</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </div>
              </div>
              <p class="card-text-custom">{{ comment.content }}</p>

              <!-- Acciones del comentario -->
              <div class="d-flex align-center">
                <v-btn
                  icon
                  variant="plain"
                  :color="userLikedComment(comment.id) ? 'primary' : ''"
                  @click="likeComment(comment.id)"
                >
                  <v-icon style="color: darkgrey">mdi-thumb-up</v-icon>
                </v-btn>
                <span class="mr-3" style="color: darkgrey">{{
                  getCommentLikes(comment.id)
                }}</span>

                <v-btn
                  icon
                  variant="plain"
                  :color="userDislikedComment(comment.id) ? 'error' : ''"
                  @click="dislikeComment(comment.id)"
                >
                  <v-icon style="color: darkgrey">mdi-thumb-down</v-icon>
                </v-btn>
                <span class="mr-3" style="color: darkgrey">{{
                  getCommentDislikes(comment.id)
                }}</span>

                <v-btn
                  variant="text"
                  color="primary"
                  @click="replyToComment(comment)"
                >
                  <v-icon class="mr-1">mdi-reply</v-icon>
                  Reply
                </v-btn>
              </div>

              <!-- Respuestas a este comentario -->
              <div v-if="getCommentReplies(comment.id).length > 0">
                <v-btn
                  variant="text"
                  size="large"
                  color="primary"
                  @click="toggleReplies(comment.id)"
                  class="pa-0 text-none"
                >
                  <v-icon size="large" class="mr-1">
                    {{
                      isRepliesVisible(comment.id)
                        ? "mdi-chevron-up"
                        : "mdi-chevron-down"
                    }}
                  </v-icon>
                  {{ getCommentReplies(comment.id).length }}
                  {{
                    getCommentReplies(comment.id).length === 1
                      ? "reply"
                      : "replies"
                  }}
                </v-btn>

                <div
                  v-if="isRepliesVisible(comment.id)"
                  class="replies-container"
                >
                  <v-card
                    v-for="reply in getCommentReplies(comment.id)"
                    :key="reply.id"
                    class="mb-3"
                    elevation="0"
                    style="background: #f8f8f8"
                  >
                    <v-card-text>
                      <div class="d-flex">
                        <v-avatar
                          size="40"
                          class="mr-3"
                          style="margin-top: 4px !important"
                        >
                          <v-img
                            :src="
                              $getImageUrl(
                                `users/avatars/avatar-${reply.authorId}.jpg`,
                                'user'
                              )
                            "
                            alt="User Avatar"
                          ></v-img>
                        </v-avatar>
                        <div style="width: 100%">
                          <div
                            class="d-flex align-center justify-space-between"
                          >
                            <div>
                              <div class="d-flex align-center">
                                <div class="text-subtitle-2 fw600 fs1-1">
                                  {{ reply.authorName }}
                                </div>
                                <div class="text-caption ml-2 card-date-custom">
                                  {{ formatDate(reply.createdAt) }}
                                </div>
                              </div>
                            </div>
                            <div>
                              <v-menu offset-y>
                                <template v-slot:activator="{ props }">
                                  <v-btn icon variant="plain" v-bind="props">
                                    <v-icon>mdi-dots-vertical</v-icon>
                                  </v-btn>
                                </template>

                                <v-list>
                                  <v-list-item @click="reportComment(reply)">
                                    <template v-slot:prepend>
                                      <v-icon>mdi-flag</v-icon>
                                    </template>
                                    <v-list-item-title
                                      >Report</v-list-item-title
                                    >
                                  </v-list-item>
                                </v-list>
                              </v-menu>
                            </div>
                          </div>

                          <p class="card-text-custom">
                            <span
                              v-if="reply.replyTo"
                              class="font-weight-medium primary--text"
                            >
                              @{{ getCommentAuthorName(reply.replyTo) }}
                            </span>
                            <span v-if="reply.replyTo"> </span>
                            {{ reply.content }}
                          </p>

                          <!-- Acciones del comentario -->
                          <div class="d-flex align-center">
                            <v-btn
                              icon
                              variant="plain"
                              :color="
                                userLikedComment(reply.id) ? 'primary' : ''
                              "
                              @click="likeComment(reply.id)"
                            >
                              <v-icon style="color: darkgrey"
                                >mdi-thumb-up</v-icon
                              >
                            </v-btn>
                            <span class="mr-3" style="color: darkgrey">{{
                              getCommentLikes(reply.id)
                            }}</span>

                            <v-btn
                              icon
                              variant="plain"
                              :color="
                                userDislikedComment(reply.id) ? 'error' : ''
                              "
                              @click="dislikeComment(reply.id)"
                            >
                              <v-icon style="color: darkgrey"
                                >mdi-thumb-down</v-icon
                              >
                            </v-btn>
                            <span class="mr-3" style="color: darkgrey">{{
                              getCommentDislikes(reply.id)
                            }}</span>

                            <v-btn
                              variant="text"
                              color="primary"
                              @click="replyToComment(reply)"
                            >
                              <v-icon class="mr-1">mdi-reply</v-icon>
                              Reply
                            </v-btn>
                          </div>
                        </div>
                      </div>
                    </v-card-text>
                  </v-card>
                </div>
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </div>

    <v-card class="mt-6" variant="text" style="background: #f8f8f8">
      <v-card-title>Leave a Comment</v-card-title>
      <v-card-text>
        <v-form ref="form" v-model="valid" @submit.prevent="submitComment">
          <!-- Mostrar a quién se responde con un único chip con avatar -->
          <div v-if="replyingTo" class="mb-3">
            <v-chip
              class="ma-1"
              color="primary"
              variant="outlined"
              closable
              @click:close="cancelReply"
            >
              <template v-slot:prepend>
                <v-avatar size="24" class="mr-1">
                  <v-img
                    :src="
                      $getImageUrl(
                        `users/avatars/avatar-${replyingTo.authorId}.jpg`,
                        'user'
                      )
                    "
                    alt="User Avatar"
                  ></v-img>
                </v-avatar>
              </template>
              {{ replyingTo.name }}
            </v-chip>
          </div>

          <v-textarea
            v-model="newComment"
            label="Your comment"
            required
            :rules="[(v) => !!v || 'Comment is required']"
            variant="outlined"
            auto-grow
            rows="3"
          ></v-textarea>

          <div class="d-flex mt-4">
            <v-btn v-if="replyingTo" variant="text" @click="cancelReply">
              Cancel Reply
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              :disabled="!valid || submitting"
              :loading="submitting"
              @click="submitComment"
            >
              Post Comment
            </v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>

    <!-- Diálogo de denuncia -->
    <v-dialog v-model="reportDialog" max-width="500">
      <v-card>
        <v-card-title>Report Comment</v-card-title>
        <v-card-text>
          <p>Why are you reporting this comment?</p>
          <v-radio-group v-model="reportReason">
            <v-radio
              v-for="reason in reportReasons"
              :key="reason.value"
              :label="reason.text"
              :value="reason.value"
            ></v-radio>
          </v-radio-group>
          <v-textarea
            v-if="reportReason === 'other'"
            v-model="reportDescription"
            label="Please describe the issue"
            outlined
            auto-grow
            rows="3"
          ></v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="reportDialog = false">Cancel</v-btn>
          <v-btn
            color="error"
            @click="submitReport"
            :loading="submittingReport"
          >
            Report
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
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
  data() {
    return {
      valid: false,
      newComment: "",
      submitting: false,
      replyingTo: null, // Será un objeto {id, name} cuando se responda a alguien
      selectedReplyTo: [], // IDs de comentarios a los que se responde
      visibleReplies: {}, // Objeto que controla qué respuestas están visibles
      userReactions: {}, // { commentId: 'like' | 'dislike' | null }
      commentReactions: {}, // { commentId: { likes: 0, dislikes: 0 } }
      reportDialog: false,
      reportingComment: null,
      reportReason: "spam",
      reportDescription: "",
      submittingReport: false,
      reportReasons: [
        { text: "Spam or misleading", value: "spam" },
        { text: "Harassment or hate speech", value: "harassment" },
        { text: "Inappropriate content", value: "inappropriate" },
        { text: "Other", value: "other" },
      ],
    };
  },
  computed: {
    // Filtrar solo comentarios principales (sin parentId)
    mainComments() {
      return this.comments.filter((comment) => !comment.parentId);
    },
  },
  created() {
    // Inicializar las reacciones de los comentarios
    this.initializeCommentReactions();

    // Verificar si hay algún comentario sin reacciones inicializadas
    this.$nextTick(() => {
      if (this.comments && this.comments.length > 0) {
        this.comments.forEach((comment) => {
          if (!this.commentReactions[comment.id]) {
            console.warn(`Reactions not initialized for comment ${comment.id}`);
            this.commentReactions[comment.id] = {
              likes: 0,
              dislikes: 0,
            };
          }
        });
      }
    });
  },
  methods: {
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
    initializeCommentReactions() {
      // Inicializar reacciones para todos los comentarios
      if (this.comments && this.comments.length > 0) {
        this.comments.forEach((comment) => {
          if (!this.commentReactions[comment.id]) {
            this.commentReactions[comment.id] = {
              likes: Math.floor(Math.random() * 10), // Valores aleatorios para demostración
              dislikes: Math.floor(Math.random() * 5),
            };
          }
        });
      }
    },
    // Obtener respuestas a un comentario específico
    getCommentReplies(commentId) {
      // Añadir log para depuración
      console.log("Buscando respuestas para el comentario:", commentId);
      console.log("Total de comentarios:", this.comments.length);

      let replies = this.comments.filter(
        (comment) => comment.parentId === commentId
      );
      console.log("Respuestas encontradas:", replies.length);

      // Si no hay respuestas y estamos en modo demostración, crear algunas
      if (replies.length === 0 && this.postId === "sample-post-1") {
        // Obtener todos los comentarios principales
        const mainComments = this.comments.filter((c) => !c.parentId);
        console.log("Comentarios principales:", mainComments.length);

        // Verificar si este es uno de los comentarios principales
        const commentIndex = mainComments.findIndex((c) => c.id === commentId);
        console.log("Índice del comentario:", commentIndex);

        if (commentIndex !== -1) {
          // Generar respuestas basadas en el índice del comentario
          const demoReplies = [];

          if (commentIndex === 0) {
            // Respuestas para el primer comentario
            demoReplies.push({
              id: "demo-reply-1-" + Date.now(),
              postId: this.postId,
              content:
                "Thanks for your comment! We're working on more content.",
              authorId: "1",
              authorName: "John Doe",
              parentId: commentId,
              replyTo: commentId,
              createdAt: new Date(
                Date.now() - 12 * 60 * 60 * 1000
              ).toISOString(),
              updatedAt: new Date(
                Date.now() - 12 * 60 * 60 * 1000
              ).toISOString(),
            });
          } else if (commentIndex === 1) {
            // Respuestas para el segundo comentario
            const reply1Id = "demo-reply-2-" + Date.now();
            demoReplies.push({
              id: reply1Id,
              postId: this.postId,
              content: "I agree! The design is very clean and modern.",
              authorId: "1",
              authorName: "John Doe",
              parentId: commentId,
              replyTo: commentId,
              createdAt: new Date(
                Date.now() - 10 * 60 * 60 * 1000
              ).toISOString(),
              updatedAt: new Date(
                Date.now() - 10 * 60 * 60 * 1000
              ).toISOString(),
            });

            demoReplies.push({
              id: "demo-reply-3-" + Date.now(),
              postId: this.postId,
              content: "Can you share which part of the design you like most?",
              authorId: "2",
              authorName: "Jane Smith",
              parentId: commentId,
              replyTo: reply1Id,
              createdAt: new Date(
                Date.now() - 8 * 60 * 60 * 1000
              ).toISOString(),
              updatedAt: new Date(
                Date.now() - 8 * 60 * 60 * 1000
              ).toISOString(),
            });
          } else if (commentIndex === 2) {
            // Respuestas para el tercer comentario
            const reply1Id = "demo-reply-4-" + Date.now();
            demoReplies.push({
              id: reply1Id,
              postId: this.postId,
              content:
                "Have you checked out the other posts? They're equally helpful.",
              authorId: "2",
              authorName: "Jane Smith",
              parentId: commentId,
              replyTo: commentId,
              createdAt: new Date(
                Date.now() - 5 * 60 * 60 * 1000
              ).toISOString(),
              updatedAt: new Date(
                Date.now() - 5 * 60 * 60 * 1000
              ).toISOString(),
            });

            demoReplies.push({
              id: "demo-reply-5-" + Date.now(),
              postId: this.postId,
              content:
                "Yes, I've read a few others. The MEVN stack tutorial was particularly useful for my project.",
              authorId: "5",
              authorName: "David Brown",
              parentId: commentId,
              replyTo: reply1Id,
              createdAt: new Date(
                Date.now() - 4 * 60 * 60 * 1000
              ).toISOString(),
              updatedAt: new Date(
                Date.now() - 4 * 60 * 60 * 1000
              ).toISOString(),
            });
          }

          // Añadir las respuestas generadas al array de comentarios
          if (demoReplies.length > 0) {
            console.log(
              "Añadiendo respuestas de demostración:",
              demoReplies.length
            );

            // Añadir al array de comentarios
            for (const reply of demoReplies) {
              this.comments.push(reply);

              // Inicializar reacciones para la respuesta
              this.commentReactions[reply.id] = {
                likes: Math.floor(Math.random() * 5),
                dislikes: Math.floor(Math.random() * 2),
              };
            }

            // Actualizar el array de respuestas
            replies = demoReplies;

            // Hacer que las respuestas sean visibles (En Vue 3 no necesitamos $set)
            this.visibleReplies[commentId] = true;
          }
        }
      }

      return replies;
    },
    // Verificar si las respuestas están visibles
    isRepliesVisible(commentId) {
      return this.visibleReplies[commentId] === false;
    },
    // Alternar visibilidad de respuestas
    toggleReplies(commentId) {
      // En Vue 3 no necesitamos $set
      this.visibleReplies[commentId] = !this.visibleReplies[commentId];
    },
    // Obtener nombre de autor por ID de comentario
    getCommentAuthorName(commentId) {
      const comment = this.comments.find((c) => c.id === commentId);
      return comment ? comment.authorName : "";
    },
    // Verificar si el usuario dio like a un comentario
    userLikedComment(commentId) {
      return this.userReactions[commentId] === "like";
    },
    // Verificar si el usuario dio dislike a un comentario
    userDislikedComment(commentId) {
      return this.userReactions[commentId] === "dislike";
    },
    // Obtener número de likes de un comentario
    getCommentLikes(commentId) {
      if (!this.commentReactions[commentId]) {
        return 0;
      }
      return this.commentReactions[commentId].likes || 0;
    },
    // Obtener número de dislikes de un comentario
    getCommentDislikes(commentId) {
      if (!this.commentReactions[commentId]) {
        return 0;
      }
      return this.commentReactions[commentId].dislikes || 0;
    },
    // Dar like a un comentario
    likeComment(commentId) {
      // Asegurarse de que commentReactions[commentId] existe
      if (!this.commentReactions[commentId]) {
        this.commentReactions[commentId] = {
          likes: 0,
          dislikes: 0,
        };
      }

      // Si el usuario ya dio like, quitarlo
      if (this.userReactions[commentId] === "like") {
        // Quitar like
        this.userReactions[commentId] = null;
        this.commentReactions[commentId].likes--;
        this.showSnackbar("You removed your like from this comment", "info");
      } else {
        // Si había dado dislike, quitarlo primero
        if (this.userReactions[commentId] === "dislike") {
          this.commentReactions[commentId].dislikes--;
        }

        // Dar like
        this.userReactions[commentId] = "like";
        this.commentReactions[commentId].likes++;
        this.showSnackbar("You liked this comment", "success");
      }
    },
    // Dar dislike a un comentario
    dislikeComment(commentId) {
      // Asegurarse de que commentReactions[commentId] existe
      if (!this.commentReactions[commentId]) {
        this.commentReactions[commentId] = {
          likes: 0,
          dislikes: 0,
        };
      }

      // Si el usuario ya dio dislike, quitarlo
      if (this.userReactions[commentId] === "dislike") {
        // Quitar dislike
        this.userReactions[commentId] = null;
        this.commentReactions[commentId].dislikes--;
        this.showSnackbar("You removed your dislike from this comment", "info");
      } else {
        // Si había dado like, quitarlo primero
        if (this.userReactions[commentId] === "like") {
          this.commentReactions[commentId].likes--;
        }

        // Dar dislike
        this.userReactions[commentId] = "dislike";
        this.commentReactions[commentId].dislikes++;
        this.showSnackbar("You disliked this comment", "error");
      }
    },
    // Responder a un comentario
    replyToComment(comment) {
      // Verificar si el usuario está autenticado
      if (!this.$store.getters.isAuthenticated) {
        this.$router.push({
          path: "/login",
          query: { redirect: this.$route.fullPath },
        });
        return;
      }

      // Establecer el usuario al que se responde
      this.replyingTo = {
        id: comment.id,
        name: comment.authorName,
        authorId: comment.authorId,
      };

      // Enfocar el textarea
      this.$nextTick(() => {
        const textarea = this.$el.querySelector("textarea");
        if (textarea) textarea.focus();
      });
    },
    // Cancelar respuesta
    cancelReply() {
      this.replyingTo = null;
    },
    // Enviar un comentario
    async submitComment() {
      if (!this.$refs.form.validate()) return;

      this.submitting = true;

      try {
        // Verificar si el usuario está autenticado
        if (!this.$store.getters.isAuthenticated) {
          // Redirigir al login con redirección de vuelta
          this.$router.push({
            path: "/login",
            query: { redirect: this.$route.fullPath },
          });
          return;
        }

        // Preparar datos del comentario
        const commentData = {
          content: this.newComment,
          parentId:
            this.selectedReplyTo.length > 0 ? this.selectedReplyTo[0] : null,
          replyTo: this.selectedReplyTo.length > 0 ? this.selectedReplyTo : [],
        };

        // En una app real, esto sería una llamada a la API
        const response = await this.$axios.post(
          `/blog/posts/${this.postId}/comments`,
          commentData
        );

        // Emitir evento para que el padre actualice los comentarios
        this.$emit("comment-added", response.data.comment);

        // Limpiar el formulario
        this.newComment = "";
        this.cancelReply();
        this.$refs.form.resetValidation();

        // Mostrar mensaje de éxito
        this.showSnackbar("Comment posted successfully", "success");
      } catch (error) {
        console.error("Error posting comment:", error);

        // Simular creación de comentario para propósitos de demostración
        if (this.postId === "sample-post-1") {
          const newComment = {
            id: "comment-" + (this.comments.length + 1),
            postId: this.postId,
            content: this.newComment,
            authorId: "1", // ID del usuario actual
            authorName: "John Doe", // Nombre del usuario actual
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            parentId:
              this.selectedReplyTo.length > 0 ? this.selectedReplyTo[0] : null,
            replyTo:
              this.selectedReplyTo.length > 0 ? this.selectedReplyTo : [],
          };

          // Inicializar reacciones para el nuevo comentario
          if (!this.commentReactions[newComment.id]) {
            this.commentReactions[newComment.id] = {
              likes: 0,
              dislikes: 0,
            };
          }

          // Emitir evento para que el padre actualice los comentarios
          this.$emit("comment-added", newComment);

          // Limpiar el formulario
          this.newComment = "";
          this.cancelReply();
          this.$refs.form.resetValidation();

          // Mostrar mensaje de éxito
          this.showSnackbar("Comment posted successfully", "success");
        } else {
          // Mostrar mensaje de error
          this.showSnackbar("Error posting comment", "error");
        }
      } finally {
        this.submitting = false;
      }
    },
    // Denunciar un comentario
    reportComment(comment) {
      this.reportingComment = comment;
      this.reportReason = "spam";
      this.reportDescription = "";
      this.reportDialog = true;
    },
    // Enviar denuncia
    async submitReport() {
      this.submittingReport = true;

      try {
        // En una app real, esto sería una llamada a la API
        // await this.$axios.post('/reports', {
        //   commentId: this.reportingComment.id,
        //   reason: this.reportReason,
        //   description: this.reportDescription
        // });

        // Simular envío de denuncia
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Cerrar diálogo
        this.reportDialog = false;

        // Mostrar mensaje de éxito
        this.showSnackbar("Comment reported successfully", "success");
      } catch (error) {
        console.error("Error reporting comment:", error);
        this.showSnackbar("Error reporting comment", "error");
      } finally {
        this.submittingReport = false;
      }
    },

    removeReplyTo(id) {
      const index = this.replyingTo.findIndex((reply) => reply.id === id);
      if (index !== -1) {
        this.replyingTo.splice(index, 1);
      }

      const selectedIndex = this.selectedReplyTo.indexOf(id);
      if (selectedIndex !== -1) {
        this.selectedReplyTo.splice(selectedIndex, 1);
      }
    },

    // Mostrar snackbar
    showSnackbar(text, color) {
      // Si existe un store con módulo snackbar
      if (
        this.$store &&
        this.$store.dispatch &&
        typeof this.$store.dispatch === "function"
      ) {
        this.$store.dispatch("snackbar/showSnackbar", { text, color });
      } else {
        // Alternativa si no hay un store configurado
        console.log(`Snackbar: ${text} (${color})`);
      }
    },
  },
};
</script>

<style scoped>
.v-chip.v-chip--size-default {
  padding: 0 12px 0 5px;
}

.comment-section {
  margin-top: 2rem;
}

.replies-container {
  padding-top: 8px;
}

.card-text-custom {
  font-size: 1.05rem;
}

.card-date-custom {
  color: #838383;
}

.fw600 {
  font-weight: 600 !important;
}

.fs1-1 {
  font-size: 1.1rem !important;
}
</style>
