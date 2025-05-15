<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8">
        <v-card>
          <v-card-title class="headline d-flex justify-space-between">
            <span>Editar Oferta de Trabajo</span>
            <v-btn
              color="error"
              variant="text"
              @click="confirmDelete = true"
              v-if="userCanDelete"
            >
              <v-icon start>mdi-delete</v-icon>
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
                variant="outlined"
                density="comfortable"
                clearable
              ></v-text-field>

              <!-- Editor de texto rico para descripción -->
              <div class="mb-4">
                <label class="v-label theme--light mb-2"
                  >Descripción del trabajo *</label
                >
                <rich-text-editor
                  v-if="useRichEditor"
                  v-model="jobData.description"
                  :api-key="tinymceApiKey"
                  :init="editorConfig"
                ></rich-text-editor>
                <v-textarea
                  v-else
                  v-model="jobData.description"
                  label="Descripción del trabajo"
                  :rules="descriptionRules"
                  required
                  variant="outlined"
                  auto-grow
                  clearable
                ></v-textarea>
                <div v-if="descriptionError" class="text-red text-caption mt-1">
                  {{ descriptionError }}
                </div>
              </div>

              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="jobData.company"
                    label="Empresa"
                    :rules="companyRules"
                    required
                    variant="outlined"
                    density="comfortable"
                    clearable
                  ></v-text-field>
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="jobData.location"
                    label="Ubicación"
                    :rules="locationRules"
                    required
                    variant="outlined"
                    density="comfortable"
                    clearable
                  ></v-text-field>
                </v-col>
              </v-row>

              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="salaryMin"
                    label="Salario mínimo"
                    variant="outlined"
                    density="comfortable"
                    prefix="€"
                    type="number"
                    hint="Deja en blanco si el salario es a negociar"
                    persistent-hint
                    clearable
                    @update:model-value="updateSalary"
                  ></v-text-field>
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="salaryMax"
                    label="Salario máximo"
                    variant="outlined"
                    density="comfortable"
                    prefix="€"
                    type="number"
                    clearable
                    @update:model-value="updateSalary"
                  ></v-text-field>
                </v-col>
              </v-row>

              <v-row>
                <v-col cols="12">
                  <v-select
                    v-model="jobData.jobType"
                    :items="jobTypes"
                    label="Tipo de trabajo"
                    variant="outlined"
                    density="comfortable"
                  ></v-select>
                </v-col>
              </v-row>

              <!-- Requisitos como chips individuales -->
              <v-combobox
                v-model="requirementsList"
                label="Requisitos"
                multiple
                chips
                closable-chips
                variant="outlined"
                hint="Presiona Enter después de cada requisito"
                persistent-hint
                class="mb-4"
              ></v-combobox>

              <!-- Habilidades como chips individuales -->
              <v-combobox
                v-model="jobData.skills"
                label="Habilidades requeridas"
                multiple
                chips
                closable-chips
                variant="outlined"
                hint="Presiona Enter después de cada habilidad"
                persistent-hint
                class="mb-4"
              ></v-combobox>

              <v-select
                v-model="jobData.category"
                :items="categories"
                label="Categoría"
                variant="outlined"
                density="comfortable"
              ></v-select>

              <!-- Sección de campos personalizados -->
              <v-divider class="my-5"></v-divider>
              <h3 class="text-subtitle-1 font-weight-bold mb-3">
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
              <h3 class="text-subtitle-1 font-weight-bold mb-3">
                Opciones de publicación
              </h3>

              <v-switch
                v-model="jobData.isFeatured"
                label="Destacar este trabajo"
                hint="Los trabajos destacados aparecen en la parte superior de los resultados de búsqueda"
                persistent-hint
                class="mb-4"
              ></v-switch>

              <v-select
                v-model="jobData.status"
                :items="statusOptions"
                label="Estado del trabajo"
                variant="outlined"
                density="comfortable"
                class="mb-4"
              ></v-select>

              <v-menu
                v-model="dateMenu"
                :close-on-content-click="false"
                transition="scale-transition"
                min-width="auto"
              >
                <template v-slot:activator="{ props }">
                  <v-text-field
                    v-model="expiryDateFormatted"
                    label="Fecha de expiración"
                    readonly
                    variant="outlined"
                    density="comfortable"
                    v-bind="props"
                    clearable
                    @click:clear="jobData.expiryDate = ''"
                  ></v-text-field>
                </template>
                <v-date-picker
                  v-model="jobData.expiryDate"
                  @update:model-value="dateMenu = false"
                  :min="minDate"
                ></v-date-picker>
              </v-menu>

              <v-alert
                v-if="jobData.datePosted"
                type="info"
                variant="outlined"
                class="mt-4"
              >
                Publicado el {{ formatDate(jobData.datePosted) }}
              </v-alert>
            </v-form>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              variant="text"
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
                <v-btn
                  color="secondary"
                  variant="text"
                  @click="confirmDelete = false"
                >
                  Cancelar
                </v-btn>
                <v-btn
                  color="error"
                  variant="text"
                  :loading="deleting"
                  @click="deleteJob"
                >
                  Eliminar
                </v-btn>
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
            <template v-slot:actions>
              <v-btn variant="text" @click="snackbar.show = false">
                Cerrar
              </v-btn>
            </template>
          </v-snackbar>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useStore } from "vuex";
import { useRouter, useRoute } from "vue-router";
import CustomFieldRenderer from "@/components/CustomFields/CustomFieldRenderer.vue";
import RichTextEditor from "@/components/blog/RichTextEditor.vue";

// Props
const props = defineProps({
  jobId: {
    type: String,
    required: true,
  },
});

// Setup
const store = useStore();
const router = useRouter();
const route = useRoute();

// Referencias
const form = ref(null);
const valid = ref(false);
const loading = ref(true);
const saving = ref(false);
const deleting = ref(false);
const dateMenu = ref(false);
const confirmDelete = ref(false);
const useRichEditor = ref(true);
const descriptionError = ref(null);

// Lista de requisitos separada del jobData
const requirementsList = ref([]);

// Referencias para los campos de salario
const salaryMin = ref("");
const salaryMax = ref("");

// Estado
const jobData = ref({
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
});

const snackbar = ref({
  show: false,
  text: "",
  color: "success",
});

// Reglas de validación
const titleRules = [
  (v) => !!v || "El título es obligatorio",
  (v) => v.length <= 100 || "El título debe tener máximo 100 caracteres",
];

const descriptionRules = [
  (v) => !!v || "La descripción es obligatoria",
  (v) => v.length >= 50 || "La descripción debe tener al menos 50 caracteres",
];

const companyRules = [(v) => !!v || "La empresa es obligatoria"];
const locationRules = [(v) => !!v || "La ubicación es obligatoria"];

// Opciones para selects
const jobTypes = [
  { title: "Tiempo completo", value: "full-time" },
  { title: "Medio tiempo", value: "part-time" },
  { title: "Contrato", value: "contract" },
  { title: "Freelance", value: "freelance" },
  { title: "Temporal", value: "temporary" },
  { title: "Internado", value: "internship" },
];

const categories = [
  { title: "Tecnología", value: "technology" },
  { title: "Marketing", value: "marketing" },
  { title: "Diseño", value: "design" },
  { title: "Ventas", value: "sales" },
  { title: "Servicio al cliente", value: "customer-service" },
  { title: "Administración", value: "administration" },
  { title: "Recursos Humanos", value: "human-resources" },
  { title: "Finanzas", value: "finance" },
  { title: "Educación", value: "education" },
  { title: "Salud", value: "healthcare" },
  { title: "Otros", value: "other" },
];

const statusOptions = [
  { title: "Activo", value: "active" },
  { title: "Pausado", value: "paused" },
  { title: "Cerrado", value: "closed" },
  { title: "Borrador", value: "draft" },
];

// Configuración del editor de texto
const tinymceApiKey = "nncyt616088r0vquiaqbk55q62hymk0hx6yr4ud4x8t0e58f"; // Reemplazar con tu API key
const editorConfig = {
  height: 400,
  menubar: true,
  plugins: ["link", "image", "lists", "code", "help", "wordcount"],
  toolbar:
    "undo redo | formatselect | bold italic backcolor | \
    alignleft aligncenter alignright alignjustify | \
    bullist numlist outdent indent | link image | removeformat | help",
  branding: false,
  promotion: false,
  resize: true,
  setup: function (editor) {
    editor.on("init", function () {
      console.log("TinyMCE initialized");
    });
    editor.on("LoadError", function (e) {
      console.warn("TinyMCE plugin load error:", e);
    });
  },
};

// Computadas
const customFields = computed(() => {
  return (
    store.state.customFields?.customFields?.filter(
      (field) => field.entity === "job" && field.active
    ) || []
  );
});

const currentUser = computed(() => store.state.auth?.user || null);

const minDate = computed(() => {
  const today = new Date();
  return today.toISOString().substr(0, 10);
});

const expiryDateFormatted = computed(() => {
  if (!jobData.value.expiryDate) return "";

  // Verificar si expiryDate es un string y tiene el formato correcto
  if (
    typeof jobData.value.expiryDate === "string" &&
    jobData.value.expiryDate.includes("-")
  ) {
    const [year, month, day] = jobData.value.expiryDate.split("-");
    return `${day}/${month}/${year}`;
  }

  // Si es un objeto Date o tiene otro formato, formatearlo de manera segura
  try {
    const date = new Date(jobData.value.expiryDate);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    }
  } catch (e) {
    console.error("Error formatting date:", e);
  }

  return "";
});

const userCanDelete = computed(() => {
  // Verificar si el usuario puede eliminar este trabajo
  // Por ejemplo, si es el creador o un administrador
  return (
    (currentUser.value &&
      (currentUser.value.role === "admin" ||
        (jobData.value.userId &&
          jobData.value.userId === currentUser.value.id))) ||
    true
  ); // Temporalmente siempre true para pruebas
});

// Función para extraer requisitos de HTML
const extractRequirementsFromHTML = (htmlString) => {
  if (
    !htmlString ||
    typeof htmlString !== "string" ||
    !htmlString.includes("<ul")
  ) {
    return [];
  }

  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = htmlString;
  const listItems = tempDiv.querySelectorAll("li");
  return Array.from(listItems).map((li) => li.textContent);
};

// Función para procesar el campo de salario
const parseSalary = (salaryString) => {
  if (!salaryString) return { min: "", max: "" };

  // Verificar si es un objeto
  if (typeof salaryString === "object" && salaryString !== null) {
    return {
      min: salaryString.min || "",
      max: salaryString.max || "",
    };
  }

  // Si es un string, intentar extraer valores mínimo y máximo
  if (typeof salaryString === "string") {
    // Patrones comunes: "€30,000 - €50,000", "$30,000-$50,000", "30000-50000", etc.
    const regex = /(\d[\d.,]*)\s*-\s*(\d[\d.,]*)/;
    const match = salaryString.match(regex);

    if (match) {
      // Limpiar los valores para quitar símbolos de moneda y comas
      const min = match[1].replace(/[^\d.]/g, "");
      const max = match[2].replace(/[^\d.]/g, "");
      return { min, max };
    }

    // Si no hay rango, usar el valor como mínimo
    const singleValue = salaryString.replace(/[^\d.]/g, "");
    if (singleValue) {
      return { min: singleValue, max: "" };
    }
  }

  return { min: "", max: "" };
};

// Función para actualizar el campo de salario
const updateSalary = () => {
  if (salaryMin.value || salaryMax.value) {
    if (salaryMin.value && salaryMax.value) {
      jobData.value.salary = `€${salaryMin.value} - €${salaryMax.value}`;
    } else if (salaryMin.value) {
      jobData.value.salary = `€${salaryMin.value}`;
    } else if (salaryMax.value) {
      jobData.value.salary = `Hasta €${salaryMax.value}`;
    }
  } else {
    jobData.value.salary = "";
  }
};

// Métodos
const loadJob = async () => {
  try {
    loading.value = true;
    const job = await store.dispatch("jobs/fetchJob", props.jobId);

    if (!job) {
      showSnackbar("Trabajo no encontrado", "error");
      router.push("/jobs");
      return;
    }

    // Inicializar customFields si no existe
    if (!job.customFields) {
      job.customFields = {};
    }

    // Asegurarse de que company sea un string
    if (typeof job.company === "object" && job.company !== null) {
      job.company = job.company.name || "";
    }

    // Actualizar jobData
    jobData.value = { ...job };

    // Procesar el salario
    const { min, max } = parseSalary(job.salary);
    salaryMin.value = min;
    salaryMax.value = max;

    // Procesar requirements si viene como HTML
    if (
      typeof job.requirements === "string" &&
      job.requirements.includes("<ul")
    ) {
      requirementsList.value = extractRequirementsFromHTML(job.requirements);
    } else if (Array.isArray(job.requirements)) {
      requirementsList.value = [...job.requirements];
    } else {
      requirementsList.value = [];
    }

    loading.value = false;
  } catch (error) {
    console.error("Error al cargar trabajo:", error);
    showSnackbar("Error al cargar el trabajo", "error");
    loading.value = false;
    router.push("/jobs");
  }
};

const validateDescription = () => {
  if (!jobData.value.description || jobData.value.description.length < 50) {
    descriptionError.value = "La descripción debe tener al menos 50 caracteres";
    return false;
  }
  descriptionError.value = null;
  return true;
};

const submitForm = async () => {
  if (!valid.value || !validateDescription()) return;

  try {
    saving.value = true;

    // Preparar datos para enviar
    const jobDataToSend = {
      ...jobData.value,
      updatedAt: new Date().toISOString(),
    };

    // Si requirementsList tiene elementos, convertirlos a formato HTML
    if (requirementsList.value && requirementsList.value.length > 0) {
      jobDataToSend.requirements = `<ul class="ul">${requirementsList.value
        .map((req) => `<li>${req}</li>`)
        .join("")}</ul>`;
    } else {
      jobDataToSend.requirements = [];
    }

    // Actualizar el trabajo
    await store.dispatch("jobs/updateJob", {
      id: props.jobId,
      jobData: jobDataToSend,
    });

    // Mostrar mensaje de éxito
    showSnackbar("Trabajo actualizado correctamente", "success");

    // Redireccionar a la página de detalles del trabajo
    setTimeout(() => {
      router.push(`/jobs/${props.jobId}`);
    }, 1500);
  } catch (error) {
    console.error("Error al actualizar trabajo:", error);
    showSnackbar(
      error.response?.data?.message || "Error al actualizar el trabajo",
      "error"
    );
    saving.value = false;
  }
};

const deleteJob = async () => {
  try {
    deleting.value = true;
    await store.dispatch("jobs/deleteJob", props.jobId);

    // Mostrar mensaje de éxito
    showSnackbar("Trabajo eliminado correctamente", "success");

    // Redireccionar a la lista de trabajos
    setTimeout(() => {
      router.push("/jobs");
    }, 1500);
  } catch (error) {
    console.error("Error al eliminar trabajo:", error);
    showSnackbar(
      error.response?.data?.message || "Error al eliminar el trabajo",
      "error"
    );
    deleting.value = false;
    confirmDelete.value = false;
  }
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const showSnackbar = (text, color = "success") => {
  snackbar.value.text = text;
  snackbar.value.color = color;
  snackbar.value.show = true;
};

// Ciclo de vida
onMounted(async () => {
  await store.dispatch("customFields/fetchCustomFieldsByEntity", "job");
  await loadJob();
});
</script>

<style>
.tox-tinymce {
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.38) !important;
}

.v-chip--closable {
  margin-right: 8px;
  margin-bottom: 8px;
}
</style>
