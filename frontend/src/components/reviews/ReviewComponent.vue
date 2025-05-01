<template>
  <div class="review-component">
    <!-- Mostrar reseñas existentes -->
    <v-card v-if="showReviews" flat class="mb-6">
      <v-card-title class="d-flex justify-space-between align-center">
        <div>
          <span class="text-h5">{{ title }}</span>
          <span v-if="totalReviews > 0" class="ml-2">({{ totalReviews }})</span>
        </div>

        <div class="d-flex align-center">
          <v-select
            v-if="showFilters && totalReviews > 0"
            v-model="sortBy"
            :items="sortOptions"
            label="Ordenar por"
            dense
            outlined
            hide-details
            class="sort-select mr-2"
            style="max-width: 200px"
          ></v-select>

          <v-btn
            v-if="canAddReview"
            color="primary"
            @click="showAddReviewForm = !showAddReviewForm"
          >
            <v-icon left>{{
              showAddReviewForm ? "mdi-close" : "mdi-plus"
            }}</v-icon>
            {{ showAddReviewForm ? "Cancelar" : "Escribir reseña" }}
          </v-btn>
        </div>
      </v-card-title>

      <v-card-text v-if="totalReviews > 0">
        <!-- Resumen de calificaciones -->
        <v-row v-if="showSummary" class="mb-4">
          <v-col
            cols="12"
            md="4"
            class="d-flex flex-column align-center justify-center"
          >
            <div class="text-h2 font-weight-bold">
              {{ averageRating.toFixed(1) }}
            </div>
            <v-rating
              :value="averageRating"
              color="amber"
              half-increments
              readonly
              size="32"
              class="my-2"
            ></v-rating>
            <div class="text-subtitle-1">
              {{ totalReviews }} {{ totalReviews === 1 ? "reseña" : "reseñas" }}
            </div>
          </v-col>

          <v-col cols="12" md="8">
            <div
              v-for="rating in [5, 4, 3, 2, 1]"
              :key="rating"
              class="d-flex align-center mb-2"
            >
              <div class="mr-2" style="width: 12px">{{ rating }}</div>
              <v-progress-linear
                :value="getRatingPercentage(rating)"
                height="12"
                rounded
                color="amber"
                class="flex-grow-1 mr-2"
              ></v-progress-linear>
              <div class="text-caption" style="min-width: 40px">
                {{ ratingDistribution[rating] || 0 }} ({{
                  getRatingPercentage(rating)
                }}%)
              </div>
            </div>
          </v-col>
        </v-row>

        <!-- Lista de reseñas -->
        <v-divider v-if="showSummary"></v-divider>

        <div v-if="loading" class="text-center py-4">
          <v-progress-circular
            indeterminate
            color="primary"
          ></v-progress-circular>
        </div>

        <div v-else-if="sortedReviews.length === 0" class="text-center py-4">
          <v-icon large color="grey lighten-1">mdi-comment-off-outline</v-icon>
          <p class="text-body-1 mt-2">No hay reseñas disponibles</p>
        </div>

        <div v-else>
          <v-card
            v-for="review in sortedReviews"
            :key="review.id"
            outlined
            class="mb-4 review-card"
          >
            <v-card-text>
              <div class="d-flex justify-space-between align-start">
                <div class="d-flex align-start">
                  <v-avatar size="40" class="mr-3">
                    <v-img
                      v-if="review.userAvatar && !review.isAnonymous"
                      :src="review.userAvatar"
                      alt="Avatar"
                    ></v-img>
                    <v-icon v-else size="24" color="grey"
                      >mdi-account-circle</v-icon
                    >
                  </v-avatar>

                  <div>
                    <div class="d-flex align-center">
                      <div class="text-subtitle-1 font-weight-bold">
                        {{ review.userName }}
                      </div>
                      <v-chip
                        v-if="review.isAnonymous"
                        x-small
                        class="ml-2"
                        color="grey lighten-3"
                      >
                        Anónimo
                      </v-chip>
                    </div>
                    <div class="text-caption grey--text">
                      {{ formatDate(review.createdAt) }}
                    </div>
                  </div>
                </div>

                <v-rating
                  :value="review.rating"
                  color="amber"
                  dense
                  half-increments
                  readonly
                  size="18"
                ></v-rating>
              </div>

              <div class="mt-3">
                <div class="text-subtitle-1 font-weight-bold mb-1">
                  {{ review.title }}
                </div>
                <p class="text-body-2">{{ review.content }}</p>

                <div v-if="review.pros && review.pros.length > 0" class="mt-2">
                  <div class="text-caption font-weight-bold text-success">
                    Pros:
                  </div>
                  <ul class="pl-4 mb-0">
                    <li
                      v-for="(pro, index) in review.pros"
                      :key="`pro-${index}`"
                      class="text-body-2"
                    >
                      {{ pro }}
                    </li>
                  </ul>
                </div>

                <div v-if="review.cons && review.cons.length > 0" class="mt-2">
                  <div class="text-caption font-weight-bold text-error">
                    Contras:
                  </div>
                  <ul class="pl-4 mb-0">
                    <li
                      v-for="(con, index) in review.cons"
                      :key="`con-${index}`"
                      class="text-body-2"
                    >
                      {{ con }}
                    </li>
                  </ul>
                </div>
              </div>

              <div class="d-flex justify-space-between align-center mt-3">
                <div class="d-flex align-center">
                  <v-btn
                    text
                    x-small
                    @click="markAsHelpful(review.id)"
                    :disabled="!isUserLoggedIn"
                    color="grey darken-1"
                  >
                    <v-icon left size="16">mdi-thumb-up-outline</v-icon>
                    Útil ({{ review.helpfulCount || 0 }})
                  </v-btn>

                  <v-btn
                    text
                    x-small
                    @click="showReportDialog(review)"
                    :disabled="!isUserLoggedIn"
                    color="grey darken-1"
                    class="ml-2"
                  >
                    <v-icon left size="16">mdi-flag-outline</v-icon>
                    Reportar
                  </v-btn>
                </div>

                <div v-if="canManageReview(review)">
                  <v-btn
                    text
                    x-small
                    color="primary"
                    @click="editReview(review)"
                  >
                    <v-icon left size="16">mdi-pencil</v-icon>
                    Editar
                  </v-btn>

                  <v-btn
                    text
                    x-small
                    color="error"
                    @click="confirmDeleteReview(review)"
                    class="ml-2"
                  >
                    <v-icon left size="16">mdi-delete</v-icon>
                    Eliminar
                  </v-btn>
                </div>
              </div>
            </v-card-text>
          </v-card>

          <div v-if="showPagination && totalPages > 1" class="text-center mt-4">
            <v-pagination
              v-model="currentPage"
              :length="totalPages"
              :total-visible="7"
            ></v-pagination>
          </div>
        </div>
      </v-card-text>

      <v-card-text v-else-if="!loading">
        <div class="text-center py-4">
          <v-icon large color="grey lighten-1">mdi-comment-outline</v-icon>
          <p class="text-body-1 mt-2">
            No hay reseñas todavía. ¡Sé el primero en opinar!
          </p>
        </div>
      </v-card-text>
    </v-card>

    <!-- Formulario para añadir/editar reseña -->
    <v-card v-if="showAddReviewForm || isEditing" outlined class="mb-6">
      <v-card-title>
        {{ isEditing ? "Editar reseña" : "Escribir una reseña" }}
      </v-card-title>

      <v-card-text>
        <v-form ref="form" v-model="valid">
          <div class="d-flex flex-column align-center mb-4">
            <div class="text-subtitle-1 mb-2">Tu calificación general</div>
            <v-rating
              v-model="reviewForm.rating"
              color="amber"
              hover
              size="36"
              class="mb-2"
            ></v-rating>
            <div class="text-caption" v-if="reviewForm.rating > 0">
              {{ getRatingText(reviewForm.rating) }}
            </div>
          </div>

          <v-text-field
            v-model="reviewForm.title"
            label="Título de tu reseña"
            :rules="titleRules"
            required
            outlined
            counter="100"
          ></v-text-field>

          <v-textarea
            v-model="reviewForm.content"
            label="Tu reseña"
            :rules="contentRules"
            required
            outlined
            counter="1000"
            rows="4"
          ></v-textarea>

          <v-row>
            <v-col cols="12" md="6">
              <div class="text-subtitle-2 mb-2">Pros (opcional)</div>
              <div
                v-for="(pro, index) in reviewForm.pros"
                :key="`pro-input-${index}`"
                class="d-flex mb-2"
              >
                <v-text-field
                  v-model="reviewForm.pros[index]"
                  placeholder="Añade un punto positivo"
                  dense
                  outlined
                  hide-details
                  class="flex-grow-1 mr-2"
                ></v-text-field>

                <v-btn icon small color="error" @click="removePro(index)">
                  <v-icon>mdi-close</v-icon>
                </v-btn>
              </div>

              <v-btn
                text
                color="primary"
                @click="addPro"
                class="mt-2"
                :disabled="reviewForm.pros.length >= 5"
              >
                <v-icon left>mdi-plus</v-icon>
                Añadir pro
              </v-btn>
            </v-col>

            <v-col cols="12" md="6">
              <div class="text-subtitle-2 mb-2">Contras (opcional)</div>
              <div
                v-for="(con, index) in reviewForm.cons"
                :key="`con-input-${index}`"
                class="d-flex mb-2"
              >
                <v-text-field
                  v-model="reviewForm.cons[index]"
                  placeholder="Añade un punto negativo"
                  dense
                  outlined
                  hide-details
                  class="flex-grow-1 mr-2"
                ></v-text-field>

                <v-btn icon small color="error" @click="removeCon(index)">
                  <v-icon>mdi-close</v-icon>
                </v-btn>
              </div>

              <v-btn
                text
                color="primary"
                @click="addCon"
                class="mt-2"
                :disabled="reviewForm.cons.length >= 5"
              >
                <v-icon left>mdi-plus</v-icon>
                Añadir contra
              </v-btn>
            </v-col>
          </v-row>

          <v-switch
            v-model="reviewForm.isAnonymous"
            label="Publicar como anónimo"
            hint="Tu nombre no será visible, pero tu reseña seguirá siendo pública"
            persistent-hint
            class="mt-4"
          ></v-switch>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="cancelReview"> Cancelar </v-btn>
        <v-btn
          color="primary"
          :disabled="!valid || reviewForm.rating === 0 || submitting"
          :loading="submitting"
          @click="submitReview"
        >
          {{ isEditing ? "Actualizar" : "Publicar" }}
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- Diálogo para reportar reseña -->
    <v-dialog v-model="reportDialog" max-width="500">
      <v-card>
        <v-card-title>Reportar reseña</v-card-title>
        <v-card-text>
          <p>¿Por qué quieres reportar esta reseña?</p>
          <v-select
            v-model="reportReason"
            :items="reportReasons"
            label="Motivo"
            outlined
            required
          ></v-select>

          <v-textarea
            v-if="reportReason === 'other'"
            v-model="reportComment"
            label="Detalles"
            outlined
            rows="3"
            counter="200"
          ></v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="reportDialog = false">Cancelar</v-btn>
          <v-btn
            color="error"
            :disabled="
              !reportReason || (reportReason === 'other' && !reportComment)
            "
            @click="submitReport"
          >
            Reportar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Diálogo para confirmar eliminación -->
    <v-dialog v-model="deleteDialog" max-width="500">
      <v-card>
        <v-card-title>Eliminar reseña</v-card-title>
        <v-card-text>
          ¿Estás seguro de que deseas eliminar esta reseña? Esta acción no se
          puede deshacer.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="deleteDialog = false">Cancelar</v-btn>
          <v-btn color="error" @click="deleteReview"> Eliminar </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar para mensajes -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
      {{ snackbar.text }}
      <template v-slot:action="{ attrs }">
        <v-btn text v-bind="attrs" @click="snackbar.show = false">
          Cerrar
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";

export default {
  name: "ReviewComponent",
  props: {
    entityType: {
      type: String,
      required: true,
      validator: (value) => ["company", "job"].includes(value),
    },
    entityId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      default: "Reseñas",
    },
    showReviews: {
      type: Boolean,
      default: true,
    },
    showFilters: {
      type: Boolean,
      default: true,
    },
    showSummary: {
      type: Boolean,
      default: true,
    },
    showPagination: {
      type: Boolean,
      default: true,
    },
    pageSize: {
      type: Number,
      default: 5,
    },
  },
  data() {
    return {
      sortBy: "newest",
      currentPage: 1,
      showAddReviewForm: false,
      isEditing: false,
      submitting: false,
      valid: false,
      reviewForm: this.getEmptyReviewForm(),
      editingReviewId: null,
      reportDialog: false,
      deleteDialog: false,
      reportReason: "",
      reportComment: "",
      reportingReview: null,
      deletingReview: null,
      ratingDistribution: {},
      averageRating: 0,
      snackbar: {
        show: false,
        text: "",
        color: "success",
      },
      sortOptions: [
        { text: "Más recientes", value: "newest" },
        { text: "Más antiguos", value: "oldest" },
        { text: "Mejor valorados", value: "highest" },
        { text: "Peor valorados", value: "lowest" },
        { text: "Más útiles", value: "helpful" },
      ],
      reportReasons: [
        { text: "Contenido inapropiado", value: "inappropriate" },
        { text: "Spam", value: "spam" },
        { text: "Información falsa", value: "false_info" },
        { text: "Lenguaje ofensivo", value: "offensive" },
        { text: "Otro motivo", value: "other" },
      ],
      titleRules: [
        (v) => !!v || "El título es obligatorio",
        (v) =>
          (v && v.length <= 100) ||
          "El título debe tener máximo 100 caracteres",
      ],
      contentRules: [
        (v) => !!v || "La reseña es obligatoria",
        (v) =>
          (v && v.length >= 20) ||
          "La reseña debe tener al menos 20 caracteres",
        (v) =>
          (v && v.length <= 1000) ||
          "La reseña debe tener máximo 1000 caracteres",
      ],
    };
  },
  computed: {
    ...mapState({
      reviews: (state) => state.reviews.reviews,
      entityReviews: (state) => state.reviews.entityReviews,
      loading: (state) => state.reviews.loading,
      user: (state) => state.auth.user,
    }),
    isUserLoggedIn() {
      return !!this.user;
    },
    canAddReview() {
      if (!this.isUserLoggedIn) return false;

      // Verificar si el usuario ya ha dejado una reseña para esta entidad
      const key = `${this.entityType}_${this.entityId}`;
      const existingReviews = this.entityReviews[key] || [];
      return !existingReviews.some((review) => review.userId === this.user.id);
    },
    filteredReviews() {
      const key = `${this.entityType}_${this.entityId}`;
      return this.entityReviews[key] || [];
    },
    sortedReviews() {
      const reviews = [...this.filteredReviews];

      switch (this.sortBy) {
        case "newest":
          return reviews.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
        case "oldest":
          return reviews.sort(
            (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
          );
        case "highest":
          return reviews.sort((a, b) => b.rating - a.rating);
        case "lowest":
          return reviews.sort((a, b) => a.rating - b.rating);
        case "helpful":
          return reviews.sort(
            (a, b) => (b.helpfulCount || 0) - (a.helpfulCount || 0)
          );
        default:
          return reviews;
      }
    },
    paginatedReviews() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.sortedReviews.slice(start, end);
    },
    totalReviews() {
      return this.filteredReviews.length;
    },
    totalPages() {
      return Math.ceil(this.totalReviews / this.pageSize);
    },
  },
  watch: {
    entityId: {
      immediate: true,
      handler() {
        this.loadReviews();
      },
    },
  },
  created() {
    this.loadReviews();
  },
  methods: {
    ...mapActions({
      fetchReviewsByEntity: "reviews/fetchReviewsByEntity",
      getAverageRating: "reviews/getAverageRating",
      getRatingDistribution: "reviews/getRatingDistribution",
      createReview: "reviews/createReview",
      updateReviewAction: "reviews/updateReview",
      deleteReviewAction: "reviews/deleteReview",
      markAsHelpfulAction: "reviews/markAsHelpful",
      reportReviewAction: "reviews/reportReview",
    }),
    async loadReviews() {
      try {
        await this.fetchReviewsByEntity({
          entityType: this.entityType,
          entityId: this.entityId,
        });

        // Cargar calificación promedio y distribución
        if (this.showSummary) {
          this.averageRating = await this.getAverageRating({
            entityType: this.entityType,
            entityId: this.entityId,
          });

          this.ratingDistribution = await this.getRatingDistribution({
            entityType: this.entityType,
            entityId: this.entityId,
          });
        }
      } catch (error) {
        console.error("Error loading reviews:", error);
        this.showSnackbar("Error al cargar las reseñas", "error");
      }
    },
    getEmptyReviewForm() {
      return {
        title: "",
        content: "",
        rating: 0,
        pros: [],
        cons: [],
        isAnonymous: false,
      };
    },
    addPro() {
      if (this.reviewForm.pros.length < 5) {
        this.reviewForm.pros.push("");
      }
    },
    removePro(index) {
      this.reviewForm.pros.splice(index, 1);
    },
    addCon() {
      if (this.reviewForm.cons.length < 5) {
        this.reviewForm.cons.push("");
      }
    },
    removeCon(index) {
      this.reviewForm.cons.splice(index, 1);
    },
    async submitReview() {
      if (this.$refs.form.validate() && this.reviewForm.rating > 0) {
        try {
          this.submitting = true;

          // Filtrar pros y contras vacíos
          const pros = this.reviewForm.pros.filter((pro) => pro.trim() !== "");
          const cons = this.reviewForm.cons.filter((con) => con.trim() !== "");

          const reviewData = {
            ...this.reviewForm,
            pros,
            cons,
            entityType: this.entityType,
            entityId: this.entityId,
          };

          if (this.isEditing) {
            await this.updateReviewAction({
              id: this.editingReviewId,
              reviewData,
            });
            this.showSnackbar("Reseña actualizada correctamente", "success");
          } else {
            await this.createReview(reviewData);
            this.showSnackbar(
              "Reseña publicada correctamente. Será revisada antes de aparecer públicamente.",
              "success"
            );
          }

          this.resetForm();
          this.loadReviews();
        } catch (error) {
          console.error("Error submitting review:", error);
          this.showSnackbar(
            error.response?.data?.message || "Error al guardar la reseña",
            "error"
          );
        } finally {
          this.submitting = false;
        }
      }
    },
    editReview(review) {
      this.isEditing = true;
      this.editingReviewId = review.id;
      this.reviewForm = {
        title: review.title,
        content: review.content,
        rating: review.rating,
        pros: [...(review.pros || [])],
        cons: [...(review.cons || [])],
        isAnonymous: review.isAnonymous || false,
      };

      // Asegurarse de que hay al menos un pro y un contra vacío si no hay ninguno
      if (this.reviewForm.pros.length === 0) {
        this.reviewForm.pros.push("");
      }

      if (this.reviewForm.cons.length === 0) {
        this.reviewForm.cons.push("");
      }

      this.showAddReviewForm = false;

      // Desplazarse hasta el formulario
      this.$nextTick(() => {
        const formElement = this.$refs.form.$el;
        formElement.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    },
    cancelReview() {
      this.resetForm();
    },
    resetForm() {
      this.reviewForm = this.getEmptyReviewForm();
      this.isEditing = false;
      this.editingReviewId = null;
      this.showAddReviewForm = false;
      if (this.$refs.form) {
        this.$refs.form.resetValidation();
      }
    },
    confirmDeleteReview(review) {
      this.deletingReview = review;
      this.deleteDialog = true;
    },
    async deleteReview() {
      try {
        await this.deleteReviewAction(this.deletingReview.id);
        this.showSnackbar("Reseña eliminada correctamente", "success");
        this.deleteDialog = false;
        this.deletingReview = null;
        this.loadReviews();
      } catch (error) {
        console.error("Error deleting review:", error);
        this.showSnackbar(
          error.response?.data?.message || "Error al eliminar la reseña",
          "error"
        );
      }
    },
    async markAsHelpful(reviewId) {
      if (!this.isUserLoggedIn) {
        this.showSnackbar(
          "Debes iniciar sesión para marcar una reseña como útil",
          "info"
        );
        return;
      }

      try {
        await this.markAsHelpfulAction(reviewId);
        this.loadReviews();
      } catch (error) {
        console.error("Error marking review as helpful:", error);
        this.showSnackbar(
          error.response?.data?.message ||
            "Error al marcar la reseña como útil",
          "error"
        );
      }
    },
    showReportDialog(review) {
      if (!this.isUserLoggedIn) {
        this.showSnackbar(
          "Debes iniciar sesión para reportar una reseña",
          "info"
        );
        return;
      }

      this.reportingReview = review;
      this.reportReason = "";
      this.reportComment = "";
      this.reportDialog = true;
    },
    async submitReport() {
      if (!this.reportReason) {
        return;
      }

      try {
        const reason =
          this.reportReason === "other"
            ? `${this.reportReason}: ${this.reportComment}`
            : this.reportReason;

        await this.reportReviewAction({
          id: this.reportingReview.id,
          reason,
        });

        this.showSnackbar("Reseña reportada correctamente", "success");
        this.reportDialog = false;
        this.reportingReview = null;
      } catch (error) {
        console.error("Error reporting review:", error);
        this.showSnackbar(
          error.response?.data?.message || "Error al reportar la reseña",
          "error"
        );
      }
    },
    canManageReview(review) {
      if (!this.isUserLoggedIn) return false;

      // El usuario puede gestionar su propia reseña o si es admin
      return review.userId === this.user.id || this.user.role === "admin";
    },
    getRatingPercentage(rating) {
      if (!this.ratingDistribution || this.totalReviews === 0) return 0;

      const count = this.ratingDistribution[rating] || 0;
      return Math.round((count / this.totalReviews) * 100);
    },
    getRatingText(rating) {
      const texts = {
        1: "Muy malo",
        2: "Malo",
        3: "Regular",
        4: "Bueno",
        5: "Excelente",
      };

      return texts[rating] || "";
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    },
    showSnackbar(text, color = "success") {
      this.snackbar.text = text;
      this.snackbar.color = color;
      this.snackbar.show = true;
    },
  },
};
</script>

<style scoped>
.review-card {
  transition: box-shadow 0.3s;
}

.review-card:hover {
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
}

.sort-select ::v-deep .v-input__slot {
  min-height: 40px !important;
}
</style>
