<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card flat>
          <v-card-title class="text-h4 justify-center">
            Testimonios de nuestros usuarios
          </v-card-title>

          <v-card-subtitle class="text-center pb-0">
            Descubre lo que opinan los usuarios sobre nuestra plataforma
          </v-card-subtitle>
        </v-card>
      </v-col>
    </v-row>

    <v-row v-if="isUserLoggedIn && !hasUserTestimonial">
      <v-col cols="12" md="8" offset-md="2">
        <v-card outlined class="mb-6">
          <v-card-title>
            <v-icon left color="primary">mdi-comment-quote</v-icon>
            ¿Quieres compartir tu experiencia?
          </v-card-title>

          <v-card-text>
            <p>
              Nos encantaría conocer tu opinión sobre nuestra plataforma. Tu
              testimonio ayudará a otros usuarios a conocer mejor nuestro
              servicio.
            </p>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="showTestimonialForm = true">
              <v-icon left>mdi-plus</v-icon>
              Dejar un testimonio
            </v-btn>
          </v-card-actions>
        </v-card>

        <testimonial-form
          v-if="showTestimonialForm"
          @success="handleTestimonialSuccess"
          @error="handleTestimonialError"
          @cancel="showTestimonialForm = false"
        ></testimonial-form>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-card flat>
          <v-card-text>
            <v-row>
              <v-col
                v-for="testimonial in testimonials"
                :key="testimonial.id"
                cols="12"
                md="6"
                lg="4"
              >
                <v-card
                  outlined
                  height="100%"
                  class="testimonial-card d-flex flex-column"
                >
                  <v-card-text class="flex-grow-1">
                    <div class="d-flex flex-column align-center">
                      <v-avatar size="80" class="mb-3">
                        <v-img
                          v-if="testimonial.userAvatar"
                          :src="testimonial.userAvatar"
                          alt="Avatar"
                        ></v-img>
                        <v-icon v-else size="40" color="primary"
                          >mdi-account-circle</v-icon
                        >
                      </v-avatar>

                      <div class="text-h6 font-weight-bold">
                        {{ testimonial.userName }}
                      </div>

                      <div
                        v-if="testimonial.position || testimonial.company"
                        class="text-subtitle-2 text-center grey--text mb-3"
                      >
                        {{ testimonial.position }}
                        <template
                          v-if="testimonial.position && testimonial.company"
                        >
                          en
                        </template>
                        {{ testimonial.company }}
                      </div>

                      <v-rating
                        :value="testimonial.rating"
                        color="amber"
                        dense
                        half-increments
                        readonly
                        size="18"
                      ></v-rating>
                    </div>

                    <div class="mt-4 testimonial-content text-center">
                      <v-icon color="grey lighten-1" class="quote-icon"
                        >mdi-format-quote-open</v-icon
                      >
                      <p class="text-body-1">{{ testimonial.content }}</p>
                      <v-icon color="grey lighten-1" class="quote-icon"
                        >mdi-format-quote-close</v-icon
                      >
                    </div>
                  </v-card-text>

                  <v-card-actions v-if="canManageTestimonial(testimonial)">
                    <v-spacer></v-spacer>
                    <v-btn
                      text
                      small
                      color="primary"
                      @click="editTestimonial(testimonial)"
                    >
                      <v-icon left>mdi-pencil</v-icon>
                      Editar
                    </v-btn>
                    <v-btn
                      text
                      small
                      color="error"
                      @click="confirmDeleteTestimonial(testimonial)"
                    >
                      <v-icon left>mdi-delete</v-icon>
                      Eliminar
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-col>
            </v-row>

            <div v-if="loading" class="text-center py-6">
              <v-progress-circular
                indeterminate
                color="primary"
              ></v-progress-circular>
            </div>

            <div v-else-if="testimonials.length === 0" class="text-center py-6">
              <v-icon size="64" color="grey lighten-1"
                >mdi-comment-outline</v-icon
              >
              <p class="text-h6 grey--text text--darken-1 mt-2">
                No hay testimonios disponibles
              </p>
            </div>

            <div
              v-if="testimonials.length > 0 && totalPages > 1"
              class="text-center mt-6"
            >
              <v-pagination
                v-model="currentPage"
                :length="totalPages"
                :total-visible="7"
              ></v-pagination>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="editDialog" max-width="600">
      <testimonial-form
        v-if="editingTestimonial"
        :testimonial="editingTestimonial"
        @success="handleEditSuccess"
        @error="handleTestimonialError"
        @cancel="editDialog = false"
      ></testimonial-form>
    </v-dialog>

    <v-dialog v-model="deleteDialog" max-width="500">
      <v-card>
        <v-card-title>Eliminar testimonio</v-card-title>
        <v-card-text>
          ¿Estás seguro de que deseas eliminar este testimonio? Esta acción no
          se puede deshacer.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="deleteDialog = false">Cancelar</v-btn>
          <v-btn color="error" @click="deleteTestimonial"> Eliminar </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
      {{ snackbar.text }}
      <template v-slot:action="{ attrs }">
        <v-btn text v-bind="attrs" @click="snackbar.show = false">
          Cerrar
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script>
import { mapState, mapActions } from "vuex";
import TestimonialForm from "@/components/testimonials/TestimonialForm.vue";

export default {
  name: "TestimonialsView",
  components: {
    TestimonialForm,
  },
  data() {
    return {
      currentPage: 1,
      pageSize: 9,
      showTestimonialForm: false,
      editDialog: false,
      deleteDialog: false,
      editingTestimonial: null,
      deletingTestimonial: null,
      snackbar: {
        show: false,
        text: "",
        color: "success",
      },
    };
  },
  computed: {
    ...mapState({
      allTestimonials: (state) => state.testimonials.testimonials,
      userTestimonials: (state) => state.testimonials.userTestimonials,
      loading: (state) => state.testimonials.loading,
      user: (state) => state.auth.user,
    }),
    isUserLoggedIn() {
      return !!this.user;
    },
    hasUserTestimonial() {
      if (!this.isUserLoggedIn) return false;
      return this.userTestimonials.length > 0;
    },
    testimonials() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.allTestimonials.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.allTestimonials.length / this.pageSize);
    },
  },
  created() {
    this.fetchTestimonials({ approved: true });
    if (this.isUserLoggedIn) {
      this.fetchUserTestimonials(this.user.id);
    }
  },
  methods: {
    ...mapActions({
      fetchTestimonials: "testimonials/fetchTestimonials",
      fetchUserTestimonials: "testimonials/fetchUserTestimonials",
      deleteTestimonialAction: "testimonials/deleteTestimonial",
    }),
    canManageTestimonial(testimonial) {
      if (!this.isUserLoggedIn) return false;

      // El usuario puede gestionar su propio testimonio o si es admin
      return testimonial.userId === this.user.id || this.user.role === "admin";
    },
    editTestimonial(testimonial) {
      this.editingTestimonial = testimonial;
      this.editDialog = true;
    },
    confirmDeleteTestimonial(testimonial) {
      this.deletingTestimonial = testimonial;
      this.deleteDialog = true;
    },
    async deleteTestimonial() {
      try {
        await this.deleteTestimonialAction(this.deletingTestimonial.id);
        this.showSnackbar("Testimonio eliminado correctamente", "success");
        this.deleteDialog = false;
        this.deletingTestimonial = null;

        // Recargar testimonios
        this.fetchTestimonials({ approved: true });
        if (this.isUserLoggedIn) {
          this.fetchUserTestimonials(this.user.id);
        }
      } catch (error) {
        console.error("Error deleting testimonial:", error);
        this.showSnackbar(
          error.response?.data?.message || "Error al eliminar el testimonio",
          "error"
        );
      }
    },
    handleTestimonialSuccess(message) {
      this.showSnackbar(message, "success");
      this.showTestimonialForm = false;

      // Recargar testimonios
      this.fetchTestimonials({ approved: true });
      if (this.isUserLoggedIn) {
        this.fetchUserTestimonials(this.user.id);
      }
    },
    handleEditSuccess(message) {
      this.showSnackbar(message, "success");
      this.editDialog = false;
      this.editingTestimonial = null;

      // Recargar testimonios
      this.fetchTestimonials({ approved: true });
      if (this.isUserLoggedIn) {
        this.fetchUserTestimonials(this.user.id);
      }
    },
    handleTestimonialError(message) {
      this.showSnackbar(message, "error");
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
.testimonial-card {
  transition: transform 0.3s, box-shadow 0.3s;
}

.testimonial-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.testimonial-content {
  position: relative;
  padding: 0 10px;
}

.quote-icon {
  opacity: 0.3;
  font-size: 18px;
}
</style>
