<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8">
        <v-card>
          <v-card-title class="headline">
            Crear Nueva Oferta de Trabajo
          </v-card-title>

          <v-card-text>
            <v-form ref="form" v-model="valid">
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
            </v-form>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text color="secondary" @click="$router.push('/jobs')">
              Cancelar
            </v-btn>
            <v-btn
              color="primary"
              :disabled="!valid"
              :loading="loading"
              @click="submitForm"
            >
              Publicar Trabajo
            </v-btn>
          </v-card-actions>

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
  name: "CreateJobView",
  components: {
    CustomFieldRenderer,
  },
  data() {
    return {
      valid: false,
      loading: false,
      dateMenu: false,
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
        expiryDate: this.getDefaultExpiryDate(),
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
    };
  },
  computed: {
    ...mapState({
      customFields: (state) =>
        state.customFields.customFields.filter(
          (field) => field.entity === "job" && field.active
        ),
    }),
    minDate() {
      // Fecha mínima: hoy + 1 día
      const today = new Date();
      today.setDate(today.getDate() + 1);
      return today.toISOString().substr(0, 10);
    },
    expiryDateFormatted() {
      if (!this.jobData.expiryDate) return "";

      const [year, month, day] = this.jobData.expiryDate.split("-");
      return `${day}/${month}/${year}`;
    },
  },
  created() {
    this.fetchCustomFieldsByEntity("job");
  },
  methods: {
    ...mapActions({
      fetchCustomFieldsByEntity: "customFields/fetchCustomFieldsByEntity",
      createJob: "jobs/createJob",
    }),

    getDefaultExpiryDate() {
      // Por defecto, el trabajo expira en 30 días
      const date = new Date();
      date.setDate(date.getDate() + 30);
      return date.toISOString().substr(0, 10);
    },

    async submitForm() {
      if (this.$refs.form.validate()) {
        try {
          this.loading = true;

          // Preparar datos para enviar
          const jobDataToSend = {
            ...this.jobData,
            datePosted: new Date().toISOString(),
            status: "active",
          };

          // Crear el trabajo
          const result = await this.createJob(jobDataToSend);

          // Mostrar mensaje de éxito
          this.showSnackbar("Trabajo publicado correctamente", "success");

          // Redireccionar a la página de detalles del trabajo
          setTimeout(() => {
            this.$router.push(`/jobs/${result.id}`);
          }, 1500);
        } catch (error) {
          console.error("Error al crear trabajo:", error);
          this.showSnackbar(
            error.response?.data?.message || "Error al crear el trabajo",
            "error"
          );
          this.loading = false;
        }
      }
    },

    showSnackbar(text, color = "success") {
      this.snackbar.text = text;
      this.snackbar.color = color;
      this.snackbar.show = true;
    },
  },
};
</script>
