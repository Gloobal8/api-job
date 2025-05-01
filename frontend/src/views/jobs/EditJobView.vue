<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8">
        <v-card>
          <v-card-title class="headline d-flex justify-space-between">
            <span>Editar Oferta de Trabajo</span>
            <v-btn
              color="error"
              text
              @click="confirmDelete = true"
              v-if="userCanDelete"
            >
              <v-icon left>mdi-delete</v-icon>
              Eliminar
            </v-btn>
          </v-card-title>

          <v-card-text>
            <v-skeleton-loader
              v-if="loading && !jobData.id"
              type="article"
            ></v-skeleton-loader>

            <v-form v-else ref="form" v-model="valid">
              <!-- Campos básicos -->
              <v-text-field
                v-model="jobData.title"
                label="Título del trabajo"
                :rules="titleRules"
                required
                outlined
                dense
              ></v-text-field>

              <v-textarea
                v-model="jobData.description"
                label="Descripción del trabajo"
                :rules="descriptionRules"
                required
                outlined
                auto-grow
              ></v-textarea>

              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="jobData.company"
                    label="Empresa"
                    :rules="companyRules"
                    required
                    outlined
                    dense
                  ></v-text-field>
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="jobData.location"
                    label="Ubicación"
                    :rules="locationRules"
                    required
                    outlined
                    dense
                  ></v-text-field>
                </v-col>
              </v-row>

              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="jobData.salary"
                    label="Salario"
                    outlined
                    dense
                    prefix="€"
                    hint="Deja en blanco si el salario es a negociar"
                    persistent-hint
                  ></v-text-field>
                </v-col>

                <v-col cols="12" md="6">
                  <v-select
                    v-model="jobData.jobType"
                    :items="jobTypes"
                    label="Tipo de trabajo"
                    outlined
                    dense
                  ></v-select>
                </v-col>
              </v-row>

              <v-combobox
                v-model="jobData.requirements"
                label="Requisitos"
                multiple
                chips
                outlined
                hint="Presiona Enter después de cada requisito"
                persistent-hint
              ></v-combobox>

              <v-combobox
                v-model="jobData.skills"
                label="Habilidades requeridas"
                multiple
                chips
                outlined
                hint="Presiona Enter después de cada habilidad"
                persistent-hint
              ></v-combobox>

              <v-select
                v-model="jobData.category"
                :items="categories"
                label="Categoría"
                outlined
                dense
              ></v-select>

              <!-- Sección de campos personalizados -->
              <v-divider class="my-5"></v-divider>
              <h3 class="subtitle-1 font-weight-bold mb-3">
                Campos adicionales
              </h3>

              <div v-if="customFields.length > 0">
                <custom-field-renderer
                  v-for="field in customFields"
                  :key="field.id"
                  :field="field"
                  v-model="jobData.customFields[field.name]"
                ></custom-field-renderer>
              </div>
              <div v-else class="text-center py-3">
                <v-chip color="info"
                  >No hay campos personalizados definidos</v-chip
                >
              </div>

              <!-- Opciones de publicación -->
              <v-divider class="my-5"></v-divider>
              <h3 class="subtitle-1 font-weight-bold mb-3">
                Opciones de publicación
              </h3>

              <v-switch
                v-model="jobData.isFeatured"
                label="Destacar este trabajo"
                hint="Los trabajos destacados aparecen en la parte superior de los resultados de búsqueda"
                persistent-hint
              ></v-switch>

              <v-select
                v-model="jobData.status"
                :items="statusOptions"
                label="Estado del trabajo"
                outlined
                dense
              ></v-select>

              <v-menu
                v-model="dateMenu"
                :close-on-content-click="false"
                :nudge-right="40"
                transition="scale-transition"
                offset-y
                min-width="auto"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    v-model="expiryDateFormatted"
                    label="Fecha de expiración"
                    readonly
                    outlined
                    dense
                    v-bind="attrs"
                    v-on="on"
                  ></v-text-field>
                </template>
                <v-date-picker
                  v-model="jobData.expiryDate"
                  @input="dateMenu = false"
                  :min="minDate"
                ></v-date-picker>
              </v-menu>

              <v-alert
                v-if="jobData.datePosted"
                type="info"
                outlined
                class="mt-4"
              >
                Publicado el {{ formatDate(jobData.datePosted) }}
              </v-alert>
            </v-form>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              text
              color="secondary"
              @click="$router.push(`/jobs/${jobId}`)"
            >
              Cancelar
            </v-btn>
            <v-btn
              color="primary"
              :disabled="!valid || (loading && jobData.id)"
              :loading="saving"
              @click="submitForm"
            >
              Guardar Cambios
            </v-btn>
          </v-card-actions>

          <!-- Diálogo de confirmación para eliminar -->
          <v-dialog v-model="confirmDelete" max-width="500">
            <v-card>
              <v-card-title>Eliminar trabajo</v-card-title>
              <v-card-text>
                ¿Estás seguro de que deseas eliminar este trabajo? Esta acción
                no se puede deshacer.
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="secondary" text @click="confirmDelete = false"
                  >Cancelar</v-btn
                >
                <v-btn color="error" text :loading="deleting" @click="deleteJob"
                  >Eliminar</v-btn
                >
              </v-card-actions>
            </v-card>
          </v-dialog>

          <!-- Snackbar para mensajes -->
          <v-snackbar
            v-model="snackbar.show"
            :color="snackbar.color"
            :timeout="3000"
          >
            {{ snackbar.text }}
            <template v-slot:action="{ attrs }">
              <v-btn text v-bind="attrs" @click="snackbar.show = false">
                Cerrar
              </v-btn>
            </template>
          </v-snackbar>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapState, mapActions } from "vuex";
import CustomFieldRenderer from "@/components/CustomFields/CustomFieldRenderer.vue";

export default {
  name: "EditJobView",
  components: {
    CustomFieldRenderer,
  },
  props: {
    jobId: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      valid: false,
      loading: true,
      saving: false,
      deleting: false,
      dateMenu: false,
      confirmDelete: false,
      jobData: {
        title: "",
        description: "",
        company: "",
        location: "",
        salary: "",
        jobType: "full-time",
        requirements: [],
        skills: [],
        category: "",
        isFeatured: false,
        status: "active",
        expiryDate: "",
        customFields: {},
      },
      snackbar: {
        show: false,
        text: "",
        color: "success",
      },
      titleRules: [
        (v) => !!v || "El título es obligatorio",
        (v) => v.length <= 100 || "El título debe tener máximo 100 caracteres",
      ],
      descriptionRules: [
        (v) => !!v || "La descripción es obligatoria",
        (v) =>
          v.length >= 50 || "La descripción debe tener al menos 50 caracteres",
      ],
      companyRules: [(v) => !!v || "La empresa es obligatoria"],
      locationRules: [(v) => !!v || "La ubicación es obligatoria"],
      jobTypes: [
        { text: "Tiempo completo", value: "full-time" },
        { text: "Medio tiempo", value: "part-time" },
        { text: "Contrato", value: "contract" },
        { text: "Freelance", value: "freelance" },
        { text: "Temporal", value: "temporary" },
        { text: "Internado", value: "internship" },
      ],
      categories: [
        { text: "Tecnología", value: "technology" },
        { text: "Marketing", value: "marketing" },
        { text: "Diseño", value: "design" },
        { text: "Ventas", value: "sales" },
        { text: "Servicio al cliente", value: "customer-service" },
        { text: "Administración", value: "administration" },
        { text: "Recursos Humanos", value: "human-resources" },
        { text: "Finanzas", value: "finance" },
        { text: "Educación", value: "education" },
        { text: "Salud", value: "healthcare" },
        { text: "Otros", value: "other" },
      ],
      statusOptions: [
        { text: "Activo", value: "active" },
        { text: "Pausado", value: "paused" },
        { text: "Cerrado", value: "closed" },
        { text: "Borrador", value: "draft" },
      ],
    };
  },
  computed: {
    ...mapState({
      customFields: (state) =>
        state.customFields.customFields.filter(
          (field) => field.entity === "job" && field.active
        ),
      currentUser: (state) => state.auth.user,
    }),
    minDate() {
      // Fecha mínima: hoy
      const today = new Date();
      return today.toISOString().substr(0, 10);
    },
    expiryDateFormatted() {
      if (!this.jobData.expiryDate) return "";

      const [year, month, day] = this.jobData.expiryDate.split("-");
      return `${day}/${month}/${year}`;
    },
    userCanDelete() {
      // Verificar si el usuario puede eliminar este trabajo
      // Por ejemplo, si es el creador o un administrador
      return (
        this.currentUser &&
        (this.currentUser.role === "admin" ||
          (this.jobData.userId && this.jobData.userId === this.currentUser.id))
      );
    },
  },
  created() {
    this.loadJob();
    this.fetchCustomFieldsByEntity("job");
  },
  methods: {
    ...mapActions({
      fetchCustomFieldsByEntity: "customFields/fetchCustomFieldsByEntity",
      fetchJob: "jobs/fetchJob",
      updateJob: "jobs/updateJob",
      removeJob: "jobs/deleteJob",
    }),

    async loadJob() {
      try {
        this.loading = true;
        const job = await this.fetchJob(this.jobId);

        if (!job) {
          this.showSnackbar("Trabajo no encontrado", "error");
          this.$router.push("/jobs");
          return;
        }

        // Inicializar customFields si no existe
        if (!job.customFields) {
          job.customFields = {};
        }

        this.jobData = { ...job };
        this.loading = false;
      } catch (error) {
        console.error("Error al cargar trabajo:", error);
        this.showSnackbar("Error al cargar el trabajo", "error");
        this.loading = false;
        this.$router.push("/jobs");
      }
    },

    async submitForm() {
      if (this.$refs.form.validate()) {
        try {
          this.saving = true;

          // Preparar datos para enviar
          const jobDataToSend = {
            ...this.jobData,
            updatedAt: new Date().toISOString(),
          };

          // Actualizar el trabajo
          await this.updateJob({ id: this.jobId, jobData: jobDataToSend });

          // Mostrar mensaje de éxito
          this.showSnackbar("Trabajo actualizado correctamente", "success");

          // Redireccionar a la página de detalles del trabajo
          setTimeout(() => {
            this.$router.push(`/jobs/${this.jobId}`);
          }, 1500);
        } catch (error) {
          console.error("Error al actualizar trabajo:", error);
          this.showSnackbar(
            error.response?.data?.message || "Error al actualizar el trabajo",
            "error"
          );
          this.saving = false;
        }
      }
    },

    async deleteJob() {
      try {
        this.deleting = true;
        await this.removeJob(this.jobId);

        // Mostrar mensaje de éxito
        this.showSnackbar("Trabajo eliminado correctamente", "success");

        // Redireccionar a la lista de trabajos
        setTimeout(() => {
          this.$router.push("/jobs");
        }, 1500);
      } catch (error) {
        console.error("Error al eliminar trabajo:", error);
        this.showSnackbar(
          error.response?.data?.message || "Error al eliminar el trabajo",
          "error"
        );
        this.deleting = false;
        this.confirmDelete = false;
      }
    },

    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
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
