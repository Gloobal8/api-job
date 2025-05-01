<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title> Administración de Testimonios </v-card-title>

          <v-card-text>
            <v-tabs v-model="activeTab">
              <v-tab>Pendientes</v-tab>
              <v-tab>Aprobados</v-tab>
              <v-tab>Destacados</v-tab>
              <v-tab>Todos</v-tab>

              <v-tab-item>
                <v-card flat>
                  <v-card-text>
                    <v-data-table
                      :headers="headers"
                      :items="pendingTestimonials"
                      :loading="loading"
                      :no-data-text="'No hay testimonios pendientes'"
                      :items-per-page="10"
                      :footer-props="{
                        'items-per-page-options': [5, 10, 15, 20],
                        'items-per-page-text': 'Testimonios por página',
                      }"
                      class="elevation-1"
                    >
                      <template v-slot:item.userName="{ item }">
                        <div class="d-flex align-center">
                          <v-avatar size="32" class="mr-2">
                            <v-img
                              v-if="item.userAvatar"
                              :src="item.userAvatar"
                              alt="Avatar"
                            ></v-img>
                            <v-icon v-else size="16">mdi-account-circle</v-icon>
                          </v-avatar>
                          {{ item.userName }}
                        </div>
                      </template>

                      <template v-slot:item.rating="{ item }">
                        <v-rating
                          :value="item.rating"
                          color="amber"
                          dense
                          half-increments
                          readonly
                          size="16"
                        ></v-rating>
                      </template>

                      <template v-slot:item.content="{ item }">
                        {{ truncateText(item.content, 100) }}
                      </template>

                      <template v-slot:item.createdAt="{ item }">
                        {{ formatDate(item.createdAt) }}
                      </template>

                      <template v-slot:item.actions="{ item }">
                        <v-btn
                          icon
                          small
                          color="primary"
                          @click="viewTestimonial(item)"
                          class="mr-1"
                        >
                          <v-icon small>mdi-eye</v-icon>
                        </v-btn>

                        <v-btn
                          icon
                          small
                          color="success"
                          @click="approveTestimonial(item)"
                          class="mr-1"
                        >
                          <v-icon small>mdi-check</v-icon>
                        </v-btn>

                        <v-btn
                          icon
                          small
                          color="error"
                          @click="confirmDeleteTestimonial(item)"
                        >
                          <v-icon small>mdi-delete</v-icon>
                        </v-btn>
                      </template>
                    </v-data-table>
                  </v-card-text>
                </v-card>
              </v-tab-item>

              <v-tab-item>
                <v-card flat>
                  <v-card-text>
                    <v-data-table
                      :headers="headers"
                      :items="approvedTestimonials"
                      :loading="loading"
                      :no-data-text="'No hay testimonios aprobados'"
                      :items-per-page="10"
                      :footer-props="{
                        'items-per-page-options': [5, 10, 15, 20],
                        'items-per-page-text': 'Testimonios por página',
                      }"
                      class="elevation-1"
                    >
                      <template v-slot:item.userName="{ item }">
                        <div class="d-flex align-center">
                          <v-avatar size="32" class="mr-2">
                            <v-img
                              v-if="item.userAvatar"
                              :src="item.userAvatar"
                              alt="Avatar"
                            ></v-img>
                            <v-icon v-else size="16">mdi-account-circle</v-icon>
                          </v-avatar>
                          {{ item.userName }}
                        </div>
                      </template>

                      <template v-slot:item.rating="{ item }">
                        <v-rating
                          :value="item.rating"
                          color="amber"
                          dense
                          half-increments
                          readonly
                          size="16"
                        ></v-rating>
                      </template>

                      <template v-slot:item.content="{ item }">
                        {{ truncateText(item.content, 100) }}
                      </template>

                      <template v-slot:item.createdAt="{ item }">
                        {{ formatDate(item.createdAt) }}
                      </template>

                      <template v-slot:item.actions="{ item }">
                        <v-btn
                          icon
                          small
                          color="primary"
                          @click="viewTestimonial(item)"
                          class="mr-1"
                        >
                          <v-icon small>mdi-eye</v-icon>
                        </v-btn>

                        <v-btn
                          icon
                          small
                          :color="item.featured ? 'warning' : 'info'"
                          @click="toggleFeature(item)"
                          class="mr-1"
                          :title="
                            item.featured ? 'Quitar destacado' : 'Destacar'
                          "
                        >
                          <v-icon small>{{
                            item.featured ? "mdi-star" : "mdi-star-outline"
                          }}</v-icon>
                        </v-btn>

                        <v-btn
                          icon
                          small
                          color="error"
                          @click="confirmDeleteTestimonial(item)"
                        >
                          <v-icon small>mdi-delete</v-icon>
                        </v-btn>
                      </template>
                    </v-data-table>
                  </v-card-text>
                </v-card>
              </v-tab-item>

              <v-tab-item>
                <v-card flat>
                  <v-card-text>
                    <v-data-table
                      :headers="headers"
                      :items="featuredTestimonials"
                      :loading="loading"
                      :no-data-text="'No hay testimonios destacados'"
                      :items-per-page="10"
                      :footer-props="{
                        'items-per-page-options': [5, 10, 15, 20],
                        'items-per-page-text': 'Testimonios por página',
                      }"
                      class="elevation-1"
                    >
                      <template v-slot:item.userName="{ item }">
                        <div class="d-flex align-center">
                          <v-avatar size="32" class="mr-2">
                            <v-img
                              v-if="item.userAvatar"
                              :src="item.userAvatar"
                              alt="Avatar"
                            ></v-img>
                            <v-icon v-else size="16">mdi-account-circle</v-icon>
                          </v-avatar>
                          {{ item.userName }}
                        </div>
                      </template>

                      <template v-slot:item.rating="{ item }">
                        <v-rating
                          :value="item.rating"
                          color="amber"
                          dense
                          half-increments
                          readonly
                          size="16"
                        ></v-rating>
                      </template>

                      <template v-slot:item.content="{ item }">
                        {{ truncateText(item.content, 100) }}
                      </template>

                      <template v-slot:item.createdAt="{ item }">
                        {{ formatDate(item.createdAt) }}
                      </template>

                      <template v-slot:item.actions="{ item }">
                        <v-btn
                          icon
                          small
                          color="primary"
                          @click="viewTestimonial(item)"
                          class="mr-1"
                        >
                          <v-icon small>mdi-eye</v-icon>
                        </v-btn>

                        <v-btn
                          icon
                          small
                          color="warning"
                          @click="toggleFeature(item)"
                          class="mr-1"
                          title="Quitar destacado"
                        >
                          <v-icon small>mdi-star-off</v-icon>
                        </v-btn>

                        <v-btn
                          icon
                          small
                          color="error"
                          @click="confirmDeleteTestimonial(item)"
                        >
                          <v-icon small>mdi-delete</v-icon>
                        </v-btn>
                      </template>
                    </v-data-table>
                  </v-card-text>
                </v-card>
              </v-tab-item>

              <v-tab-item>
                <v-card flat>
                  <v-card-text>
                    <v-data-table
                      :headers="allHeaders"
                      :items="allTestimonials"
                      :loading="loading"
                      :no-data-text="'No hay testimonios'"
                      :items-per-page="10"
                      :footer-props="{
                        'items-per-page-options': [5, 10, 15, 20],
                        'items-per-page-text': 'Testimonios por página',
                      }"
                      class="elevation-1"
                    >
                      <template v-slot:item.userName="{ item }">
                        <div class="d-flex align-center">
                          <v-avatar size="32" class="mr-2">
                            <v-img
                              v-if="item.userAvatar"
                              :src="item.userAvatar"
                              alt="Avatar"
                            ></v-img>
                            <v-icon v-else size="16">mdi-account-circle</v-icon>
                          </v-avatar>
                          {{ item.userName }}
                        </div>
                      </template>

                      <template v-slot:item.rating="{ item }">
                        <v-rating
                          :value="item.rating"
                          color="amber"
                          dense
                          half-increments
                          readonly
                          size="16"
                        ></v-rating>
                      </template>

                      <template v-slot:item.content="{ item }">
                        {{ truncateText(item.content, 100) }}
                      </template>

                      <template v-slot:item.approved="{ item }">
                        <v-icon :color="item.approved ? 'success' : 'error'">
                          {{ item.approved ? "mdi-check" : "mdi-close" }}
                        </v-icon>
                      </template>

                      <template v-slot:item.featured="{ item }">
                        <v-icon :color="item.featured ? 'warning' : 'grey'">
                          {{ item.featured ? "mdi-star" : "mdi-star-outline" }}
                        </v-icon>
                      </template>

                      <template v-slot:item.createdAt="{ item }">
                        {{ formatDate(item.createdAt) }}
                      </template>

                      <template v-slot:item.actions="{ item }">
                        <v-btn
                          icon
                          small
                          color="primary"
                          @click="viewTestimonial(item)"
                          class="mr-1"
                        >
                          <v-icon small>mdi-eye</v-icon>
                        </v-btn>

                        <v-btn
                          v-if="!item.approved"
                          icon
                          small
                          color="success"
                          @click="approveTestimonial(item)"
                          class="mr-1"
                        >
                          <v-icon small>mdi-check</v-icon>
                        </v-btn>

                        <v-btn
                          v-if="item.approved"
                          icon
                          small
                          :color="item.featured ? 'warning' : 'info'"
                          @click="toggleFeature(item)"
                          class="mr-1"
                          :title="
                            item.featured ? 'Quitar destacado' : 'Destacar'
                          "
                        >
                          <v-icon small>{{
                            item.featured ? "mdi-star-off" : "mdi-star"
                          }}</v-icon>
                        </v-btn>

                        <v-btn
                          icon
                          small
                          color="error"
                          @click="confirmDeleteTestimonial(item)"
                        >
                          <v-icon small>mdi-delete</v-icon>
                        </v-btn>
                      </template>
                    </v-data-table>
                  </v-card-text>
                </v-card>
              </v-tab-item>
            </v-tabs>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Diálogo para ver detalles del testimonio -->
    <v-dialog v-model="detailDialog" max-width="600">
      <v-card v-if="selectedTestimonial">
        <v-card-title> Detalles del testimonio </v-card-title>

        <v-card-text>
          <v-row>
            <v-col cols="12" class="d-flex flex-column align-center mb-4">
              <v-avatar size="80" class="mb-3">
                <v-img
                  v-if="selectedTestimonial.userAvatar"
                  :src="selectedTestimonial.userAvatar"
                  alt="Avatar"
                ></v-img>
                <v-icon v-else size="40" color="primary"
                  >mdi-account-circle</v-icon
                >
              </v-avatar>

              <div class="text-h6 font-weight-bold">
                {{ selectedTestimonial.userName }}
              </div>

              <div
                v-if="
                  selectedTestimonial.position || selectedTestimonial.company
                "
                class="text-subtitle-2 text-center grey--text mb-3"
              >
                {{ selectedTestimonial.position }}
                <template
                  v-if="
                    selectedTestimonial.position && selectedTestimonial.company
                  "
                >
                  en
                </template>
                {{ selectedTestimonial.company }}
              </div>

              <v-rating
                :value="selectedTestimonial.rating"
                color="amber"
                half-increments
                readonly
                size="24"
              ></v-rating>
            </v-col>

            <v-col cols="12">
              <div class="testimonial-content text-center mb-4">
                <v-icon color="grey lighten-1" class="quote-icon"
                  >mdi-format-quote-open</v-icon
                >
                <p class="text-body-1">{{ selectedTestimonial.content }}</p>
                <v-icon color="grey lighten-1" class="quote-icon"
                  >mdi-format-quote-close</v-icon
                >
              </div>

              <v-divider class="mb-4"></v-divider>

              <div class="d-flex justify-space-between">
                <div>
                  <div class="text-caption">ID de usuario</div>
                  <div class="text-body-2">
                    {{ selectedTestimonial.userId }}
                  </div>
                </div>

                <div>
                  <div class="text-caption">Rol de usuario</div>
                  <div class="text-body-2">
                    {{ selectedTestimonial.userRole }}
                  </div>
                </div>
              </div>

              <div class="d-flex justify-space-between mt-4">
                <div>
                  <div class="text-caption">Creado el</div>
                  <div class="text-body-2">
                    {{ formatDate(selectedTestimonial.createdAt) }}
                  </div>
                </div>

                <div>
                  <div class="text-caption">Actualizado el</div>
                  <div class="text-body-2">
                    {{ formatDate(selectedTestimonial.updatedAt) }}
                  </div>
                </div>
              </div>

              <div class="d-flex justify-space-between mt-4">
                <div>
                  <div class="text-caption">Estado</div>
                  <v-chip
                    small
                    :color="selectedTestimonial.approved ? 'success' : 'error'"
                    text-color="white"
                  >
                    {{
                      selectedTestimonial.approved ? "Aprobado" : "Pendiente"
                    }}
                  </v-chip>
                </div>

                <div>
                  <div class="text-caption">Destacado</div>
                  <v-chip
                    small
                    :color="selectedTestimonial.featured ? 'warning' : 'grey'"
                    :text-color="selectedTestimonial.featured ? 'white' : ''"
                  >
                    {{
                      selectedTestimonial.featured
                        ? "Destacado"
                        : "No destacado"
                    }}
                  </v-chip>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="detailDialog = false"> Cerrar </v-btn>

          <v-btn
            v-if="!selectedTestimonial.approved"
            color="success"
            @click="approveTestimonial(selectedTestimonial)"
          >
            <v-icon left>mdi-check</v-icon>
            Aprobar
          </v-btn>

          <v-btn
            v-if="selectedTestimonial.approved && !selectedTestimonial.featured"
            color="warning"
            @click="featureTestimonial(selectedTestimonial)"
          >
            <v-icon left>mdi-star</v-icon>
            Destacar
          </v-btn>

          <v-btn
            v-if="selectedTestimonial.featured"
            color="warning"
            outlined
            @click="unfeatureTestimonial(selectedTestimonial)"
          >
            <v-icon left>mdi-star-off</v-icon>
            Quitar destacado
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Diálogo para confirmar eliminación -->
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

    <!-- Snackbar para mensajes -->
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

export default {
  name: "AdminTestimonialsView",
  data() {
    return {
      activeTab: 0,
      detailDialog: false,
      deleteDialog: false,
      selectedTestimonial: null,
      deletingTestimonial: null,
      headers: [
        { text: "Usuario", value: "userName", sortable: true },
        {
          text: "Valoración",
          value: "rating",
          sortable: true,
          align: "center",
        },
        { text: "Contenido", value: "content", sortable: false },
        { text: "Fecha", value: "createdAt", sortable: true },
        {
          text: "Acciones",
          value: "actions",
          sortable: false,
          align: "center",
        },
      ],
      allHeaders: [
        { text: "Usuario", value: "userName", sortable: true },
        {
          text: "Valoración",
          value: "rating",
          sortable: true,
          align: "center",
        },
        { text: "Contenido", value: "content", sortable: false },
        {
          text: "Aprobado",
          value: "approved",
          sortable: true,
          align: "center",
        },
        {
          text: "Destacado",
          value: "featured",
          sortable: true,
          align: "center",
        },
        { text: "Fecha", value: "createdAt", sortable: true },
        {
          text: "Acciones",
          value: "actions",
          sortable: false,
          align: "center",
        },
      ],
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
      loading: (state) => state.testimonials.loading,
    }),
    pendingTestimonials() {
      return this.allTestimonials.filter((t) => !t.approved);
    },
    approvedTestimonials() {
      return this.allTestimonials.filter((t) => t.approved && !t.featured);
    },
    featuredTestimonials() {
      return this.allTestimonials.filter((t) => t.approved && t.featured);
    },
  },
  created() {
    this.fetchTestimonials();
  },
  methods: {
    ...mapActions({
      fetchTestimonials: "testimonials/fetchTestimonials",
      approveTestimonialAction: "testimonials/approveTestimonial",
      featureTestimonialAction: "testimonials/featureTestimonial",
      unfeatureTestimonialAction: "testimonials/unfeatureTestimonial",
      deleteTestimonialAction: "testimonials/deleteTestimonial",
    }),
    viewTestimonial(testimonial) {
      this.selectedTestimonial = testimonial;
      this.detailDialog = true;
    },
    async approveTestimonial(testimonial) {
      try {
        await this.approveTestimonialAction(testimonial.id);
        this.showSnackbar("Testimonio aprobado correctamente", "success");

        // Si estamos viendo los detalles, cerrar el diálogo
        if (this.detailDialog) {
          this.detailDialog = false;
        }
      } catch (error) {
        console.error("Error approving testimonial:", error);
        this.showSnackbar(
          error.response?.data?.message || "Error al aprobar el testimonio",
          "error"
        );
      }
    },
    async toggleFeature(testimonial) {
      try {
        if (testimonial.featured) {
          await this.unfeatureTestimonialAction(testimonial.id);
          this.showSnackbar(
            "Testimonio quitado de destacados correctamente",
            "success"
          );
        } else {
          await this.featureTestimonialAction(testimonial.id);
          this.showSnackbar("Testimonio destacado correctamente", "success");
        }

        // Si estamos viendo los detalles, cerrar el diálogo
        if (this.detailDialog) {
          this.detailDialog = false;
        }
      } catch (error) {
        console.error("Error toggling feature:", error);
        this.showSnackbar(
          error.response?.data?.message ||
            "Error al cambiar estado de destacado",
          "error"
        );
      }
    },
    async featureTestimonial(testimonial) {
      try {
        await this.featureTestimonialAction(testimonial.id);
        this.showSnackbar("Testimonio destacado correctamente", "success");

        // Si estamos viendo los detalles, cerrar el diálogo
        if (this.detailDialog) {
          this.detailDialog = false;
        }
      } catch (error) {
        console.error("Error featuring testimonial:", error);
        this.showSnackbar(
          error.response?.data?.message || "Error al destacar el testimonio",
          "error"
        );
      }
    },
    async unfeatureTestimonial(testimonial) {
      try {
        await this.unfeatureTestimonialAction(testimonial.id);
        this.showSnackbar(
          "Testimonio quitado de destacados correctamente",
          "success"
        );

        // Si estamos viendo los detalles, cerrar el diálogo
        if (this.detailDialog) {
          this.detailDialog = false;
        }
      } catch (error) {
        console.error("Error unfeaturing testimonial:", error);
        this.showSnackbar(
          error.response?.data?.message ||
            "Error al quitar destacado del testimonio",
          "error"
        );
      }
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

        // Si estamos viendo los detalles y es el mismo testimonio, cerrar el diálogo
        if (
          this.detailDialog &&
          this.selectedTestimonial &&
          this.selectedTestimonial.id === this.deletingTestimonial.id
        ) {
          this.detailDialog = false;
        }
      } catch (error) {
        console.error("Error deleting testimonial:", error);
        this.showSnackbar(
          error.response?.data?.message || "Error al eliminar el testimonio",
          "error"
        );
      }
    },
    truncateText(text, maxLength) {
      if (text.length <= maxLength) return text;
      return text.substr(0, maxLength) + "...";
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
.testimonial-content {
  position: relative;
  padding: 0 20px;
}

.quote-icon {
  opacity: 0.3;
  font-size: 24px;
}
</style>
