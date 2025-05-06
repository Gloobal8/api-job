<template>
  <div class="sitemap-container">
    <v-container fluid>
      <v-row>
        <v-col cols="12">
          <h1 class="text-h4 font-weight-bold mb-4">Mapa del Proyecto MEVN</h1>
          <p class="text-body-1 mb-6">
            Explore la estructura del proyecto haciendo clic en los archivos
            para obtener más información sobre cada uno y sus relaciones.
          </p>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" md="6">
          <!-- Sección Backend -->
          <v-card class="mb-6">
            <v-card-title class="primary white--text"> Backend </v-card-title>
            <v-card-text>
              <!-- Reemplazamos v-treeview con una implementación manual -->
              <div class="custom-tree">
                <file-tree-item
                  v-for="item in backendFiles"
                  :key="item.id"
                  :item="item"
                  @node-click="handleNodeClick"
                />
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <!-- Sección Frontend -->
          <v-card>
            <v-card-title class="secondary white--text">
              Frontend
            </v-card-title>
            <v-card-text>
              <!-- Reemplazamos v-treeview con una implementación manual -->
              <div class="custom-tree">
                <file-tree-item
                  v-for="item in frontendFiles"
                  :key="item.id"
                  :item="item"
                  @node-click="handleNodeClick"
                />
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Modal para mostrar detalles del archivo -->
    <v-dialog v-model="showFileModal" max-width="800">
      <v-card>
        <v-card-title
          class="headline"
          :class="
            selectedFile?.type === 'backend'
              ? 'bg-primary text-white'
              : 'bg-secondary text-white'
          "
        >
          {{ selectedFile?.name }}
        </v-card-title>

        <v-card-text class="pt-4">
          <p class="text-body-1 mb-4">{{ selectedFile?.description }}</p>

          <div v-if="selectedFile?.purpose" class="mb-4">
            <h3 class="text-subtitle-1 font-weight-bold mb-2">Propósito</h3>
            <p>{{ selectedFile.purpose }}</p>
          </div>

          <div
            v-if="selectedFile?.functions && selectedFile.functions.length > 0"
            class="mb-4"
          >
            <h3 class="text-subtitle-1 font-weight-bold mb-2">
              Funciones Principales
            </h3>
            <v-list density="compact">
              <v-list-item v-for="(func, i) in selectedFile.functions" :key="i">
                <template v-slot:prepend>
                  <v-icon color="primary">mdi-function</v-icon>
                </template>
                <v-list-item-title>{{ func.name }}</v-list-item-title>
                <v-list-item-subtitle>{{
                  func.description
                }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </div>

          <div
            v-if="
              selectedFile?.relatedFiles && selectedFile.relatedFiles.length > 0
            "
          >
            <h3 class="text-subtitle-1 font-weight-bold mb-2">
              Archivos Relacionados
            </h3>
            <p class="text-caption mb-2">
              Al modificar este archivo, tenga en cuenta estos archivos
              relacionados:
            </p>

            <v-chip-group column>
              <v-chip
                v-for="related in selectedFile.relatedFiles"
                :key="related.id"
                variant="outlined"
                :color="related.type === 'backend' ? 'primary' : 'secondary'"
                @click="openRelatedFile(related.id)"
                class="ma-1"
              >
                <template v-slot:prepend>
                  <v-icon size="small">{{
                    getIconForFile(related.fileType)
                  }}</v-icon>
                </template>
                {{ related.name }}
                <template v-slot:append>
                  <v-icon size="x-small">mdi-arrow-right</v-icon>
                </template>
              </v-chip>
            </v-chip-group>

            <div
              v-if="
                selectedFile?.codeExamples &&
                selectedFile.codeExamples.length > 0
              "
              class="mt-4"
            >
              <h3 class="text-subtitle-1 font-weight-bold mb-2">
                Ejemplos de Uso
              </h3>
              <div
                v-for="(example, index) in selectedFile.codeExamples"
                :key="index"
                class="mb-4"
              >
                <p class="font-weight-medium mb-2">{{ example.title }}</p>
                <v-card
                  variant="elevated"
                  style="
                    padding: 15px;
                    background: #2e2e4c;
                    color: lightskyblue;
                  "
                >
                  <v-card-text class="pa-0">
                    <pre
                      class="language-javascript mb-0"
                    ><code>{{ example.code }}</code></pre>
                  </v-card-text>
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                      size="small"
                      variant="text"
                      color="primary"
                      @click="copyToClipboard(example.code)"
                    >
                      <v-icon size="small" class="mr-1"
                        >mdi-content-copy</v-icon
                      >
                      Copiar
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </div>
            </div>

            <v-alert
              v-if="selectedFile.criticalRelations"
              density="compact"
              type="warning"
              class="mt-4"
            >
              <strong>¡Atención!</strong> Este archivo tiene relaciones
              críticas. Cualquier cambio podría afectar significativamente la
              funcionalidad del sistema.
            </v-alert>
          </div>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="grey-darken-1"
            variant="text"
            @click="showFileModal = false"
          >
            Cerrar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar para notificaciones -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="snackbar.timeout"
    >
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn variant="text" @click="snackbar.show = false"> Cerrar </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script>
import FileTreeItem from "@/components/sitemap/FileTreeItem.vue";

export default {
  name: "SiteMap",
  components: {
    FileTreeItem,
  },
  data() {
    return {
      showFileModal: false,
      selectedFile: null,
      backendFiles: [
        {
          id: "backend-root",
          name: "Backend",
          type: "folder",
          children: [
            {
              id: "backend-config",
              name: "Configuración",
              type: "folder",
              children: [
                {
                  id: "env-file",
                  name: ".env",
                  type: "backend",
                  fileType: "config",
                  description:
                    "Archivo de variables de entorno que contiene configuraciones sensibles como credenciales de base de datos, claves API y otras configuraciones específicas del entorno.",
                  purpose:
                    "Almacenar configuraciones sensibles fuera del código fuente para mayor seguridad y permitir diferentes configuraciones en distintos entornos.",
                  relatedFiles: [
                    {
                      id: "server-js",
                      name: "server.js",
                      type: "backend",
                      fileType: "js",
                    },
                    {
                      id: "config-folder",
                      name: "config/",
                      type: "backend",
                      fileType: "folder",
                    },
                  ],
                },
                {
                  id: "config-folder",
                  name: "config/",
                  type: "backend",
                  fileType: "folder",
                  description:
                    "Carpeta que contiene archivos de configuración para diferentes aspectos de la aplicación como base de datos, autenticación, almacenamiento, etc.",
                  purpose:
                    "Centralizar y organizar la configuración de la aplicación en módulos separados.",
                  relatedFiles: [
                    {
                      id: "env-file",
                      name: ".env",
                      type: "backend",
                      fileType: "config",
                    },
                    {
                      id: "server-js",
                      name: "server.js",
                      type: "backend",
                      fileType: "js",
                    },
                  ],
                },
                {
                  id: "nodemon-json",
                  name: "nodemon.json",
                  type: "backend",
                  fileType: "json",
                  description:
                    "Configuración para Nodemon, una herramienta que ayuda a reiniciar automáticamente el servidor Node.js cuando se detectan cambios en los archivos.",
                  purpose:
                    "Mejorar el flujo de trabajo de desarrollo al reiniciar automáticamente el servidor cuando se realizan cambios en el código.",
                  relatedFiles: [
                    {
                      id: "package-json-backend",
                      name: "package.json",
                      type: "backend",
                      fileType: "json",
                    },
                  ],
                },
                {
                  id: "package-json-backend",
                  name: "package.json",
                  type: "backend",
                  fileType: "json",
                  description:
                    "Archivo de configuración de Node.js que contiene metadatos del proyecto, dependencias y scripts.",
                  purpose:
                    "Definir las dependencias del proyecto, scripts de ejecución y otra información relevante para el gestor de paquetes npm.",
                  relatedFiles: [
                    {
                      id: "nodemon-json",
                      name: "nodemon.json",
                      type: "backend",
                      fileType: "json",
                    },
                    {
                      id: "server-js",
                      name: "server.js",
                      type: "backend",
                      fileType: "js",
                    },
                  ],
                  criticalRelations: true,
                },
                {
                  id: "server-js",
                  name: "server.js",
                  type: "backend",
                  fileType: "js",
                  description:
                    "Punto de entrada principal de la aplicación backend. Configura el servidor Express, conecta a la base de datos y registra middleware y rutas.",
                  purpose:
                    "Inicializar y configurar el servidor de la aplicación.",
                  functions: [
                    {
                      name: "Configuración del servidor Express",
                      description:
                        "Configura middleware, CORS, bodyParser, etc.",
                    },
                    {
                      name: "Conexión a la base de datos",
                      description: "Establece conexión con MongoDB",
                    },
                    {
                      name: "Registro de rutas",
                      description:
                        "Registra todas las rutas API de la aplicación",
                    },
                    {
                      name: "Manejo de errores",
                      description: "Configura middleware para manejar errores",
                    },
                    {
                      name: "Inicialización del servidor",
                      description:
                        "Inicia el servidor HTTP en el puerto especificado",
                    },
                  ],
                  relatedFiles: [
                    {
                      id: "env-file",
                      name: ".env",
                      type: "backend",
                      fileType: "config",
                    },
                    {
                      id: "auth-route",
                      name: "auth.js (route)",
                      type: "backend",
                      fileType: "js",
                    },
                    {
                      id: "user-route",
                      name: "users.js (route)",
                      type: "backend",
                      fileType: "js",
                    },
                    {
                      id: "job-route",
                      name: "jobs.js (route)",
                      type: "backend",
                      fileType: "js",
                    },
                  ],
                  criticalRelations: true,
                },
              ],
            },
            {
              id: "backend-controllers",
              name: "Controladores",
              type: "folder",
              children: [
                {
                  id: "application-controller",
                  name: "applicationController.js",
                  type: "backend",
                  fileType: "js",
                  description:
                    "Controlador que maneja todas las operaciones relacionadas con solicitudes de trabajo.",
                  purpose:
                    "Implementar la lógica de negocio para crear, leer, actualizar y eliminar solicitudes de trabajo.",
                  functions: [
                    {
                      name: "createApplication",
                      description: "Crea una nueva solicitud de trabajo",
                    },
                    {
                      name: "getApplications",
                      description:
                        "Obtiene todas las solicitudes de trabajo con opciones de filtrado",
                    },
                    {
                      name: "getApplicationById",
                      description:
                        "Obtiene una solicitud de trabajo específica por ID",
                    },
                    {
                      name: "updateApplication",
                      description:
                        "Actualiza una solicitud de trabajo existente",
                    },
                    {
                      name: "deleteApplication",
                      description: "Elimina una solicitud de trabajo",
                    },
                  ],
                  relatedFiles: [
                    {
                      id: "application-model",
                      name: "JobApplication.js",
                      type: "backend",
                      fileType: "js",
                    },
                    {
                      id: "application-route",
                      name: "applications.js (route)",
                      type: "backend",
                      fileType: "js",
                    },
                    {
                      id: "job-model",
                      name: "Job.js",
                      type: "backend",
                      fileType: "js",
                    },
                    {
                      id: "user-model",
                      name: "user.js",
                      type: "backend",
                      fileType: "js",
                    },
                  ],
                },
                {
                  id: "auth-controller",
                  name: "authController.js",
                  type: "backend",
                  fileType: "js",
                  description:
                    "Controlador que maneja la autenticación y autorización de usuarios.",
                  purpose:
                    "Implementar la lógica de negocio para registro, inicio de sesión, verificación de correo electrónico, restablecimiento de contraseña, etc.",
                  functions: [
                    {
                      name: "register",
                      description: "Registra un nuevo usuario",
                    },
                    {
                      name: "login",
                      description:
                        "Autentica a un usuario y genera un token JWT",
                    },
                    {
                      name: "verifyEmail",
                      description:
                        "Verifica la dirección de correo electrónico de un usuario",
                    },
                    {
                      name: "forgotPassword",
                      description:
                        "Inicia el proceso de restablecimiento de contraseña",
                    },
                    {
                      name: "resetPassword",
                      description: "Restablece la contraseña de un usuario",
                    },
                    {
                      name: "refreshToken",
                      description:
                        "Genera un nuevo token de acceso usando un token de actualización",
                    },
                  ],
                  relatedFiles: [
                    {
                      id: "user-model",
                      name: "user.js",
                      type: "backend",
                      fileType: "js",
                    },
                    {
                      id: "auth-route",
                      name: "auth.js (route)",
                      type: "backend",
                      fileType: "js",
                    },
                    {
                      id: "auth-middleware",
                      name: "auth.js (middleware)",
                      type: "backend",
                      fileType: "js",
                    },
                  ],
                  criticalRelations: true,
                },
                {
                  id: "job-controller",
                  name: "jobController.js",
                  type: "backend",
                  fileType: "js",
                  description:
                    "Controlador que maneja todas las operaciones relacionadas con ofertas de trabajo.",
                  purpose:
                    "Implementar la lógica de negocio para crear, leer, actualizar, eliminar y buscar ofertas de trabajo.",
                  functions: [
                    {
                      name: "createJob",
                      description: "Crea una nueva oferta de trabajo",
                    },
                    {
                      name: "getJobs",
                      description:
                        "Obtiene todas las ofertas de trabajo con opciones de filtrado y búsqueda",
                    },
                    {
                      name: "getJobById",
                      description:
                        "Obtiene una oferta de trabajo específica por ID",
                    },
                    {
                      name: "updateJob",
                      description: "Actualiza una oferta de trabajo existente",
                    },
                    {
                      name: "deleteJob",
                      description: "Elimina una oferta de trabajo",
                    },
                    {
                      name: "searchJobs",
                      description:
                        "Busca ofertas de trabajo basadas en criterios específicos",
                    },
                    {
                      name: "getFeaturedJobs",
                      description: "Obtiene ofertas de trabajo destacadas",
                    },
                  ],
                  relatedFiles: [
                    {
                      id: "job-model",
                      name: "Job.js",
                      type: "backend",
                      fileType: "js",
                    },
                    {
                      id: "job-route",
                      name: "jobs.js (route)",
                      type: "backend",
                      fileType: "js",
                    },
                    {
                      id: "company-model",
                      name: "company.js",
                      type: "backend",
                      fileType: "js",
                    },
                    {
                      id: "category-model",
                      name: "Category.js",
                      type: "backend",
                      fileType: "js",
                    },
                    {
                      id: "application-model",
                      name: "JobApplication.js",
                      type: "backend",
                      fileType: "js",
                    },
                  ],
                },
              ],
            },
            {
              id: "backend-models",
              name: "Modelos",
              type: "folder",
              children: [
                {
                  id: "job-model",
                  name: "Job.js",
                  type: "backend",
                  fileType: "js",
                  description:
                    "Modelo de datos para ofertas de trabajo en MongoDB usando Mongoose.",
                  purpose:
                    "Definir la estructura de datos y validaciones para las ofertas de trabajo en la base de datos.",
                  functions: [
                    {
                      name: "Schema Definition",
                      description:
                        "Define la estructura del documento de trabajo",
                    },
                    {
                      name: "Pre-save hooks",
                      description:
                        "Funciones que se ejecutan antes de guardar un documento",
                    },
                    {
                      name: "Methods",
                      description:
                        "Métodos personalizados para el modelo de trabajo",
                    },
                    {
                      name: "Virtual properties",
                      description:
                        "Propiedades calculadas basadas en campos existentes",
                    },
                  ],
                  relatedFiles: [
                    {
                      id: "job-controller",
                      name: "jobController.js",
                      type: "backend",
                      fileType: "js",
                    },
                    {
                      id: "company-model",
                      name: "company.js",
                      type: "backend",
                      fileType: "js",
                    },
                    {
                      id: "category-model",
                      name: "Category.js",
                      type: "backend",
                      fileType: "js",
                    },
                    {
                      id: "application-model",
                      name: "JobApplication.js",
                      type: "backend",
                      fileType: "js",
                    },
                    {
                      id: "job-type-model",
                      name: "jobType.js",
                      type: "backend",
                      fileType: "js",
                    },
                    {
                      id: "job-experience-model",
                      name: "jobExperience.js",
                      type: "backend",
                      fileType: "js",
                    },
                  ],
                },
                {
                  id: "user-model",
                  name: "user.js",
                  type: "backend",
                  fileType: "js",
                  description:
                    "Modelo de datos para usuarios en MongoDB usando Mongoose.",
                  purpose:
                    "Definir la estructura de datos y validaciones para los usuarios en la base de datos, incluyendo métodos para autenticación.",
                  functions: [
                    {
                      name: "Schema Definition",
                      description:
                        "Define la estructura del documento de usuario",
                    },
                    {
                      name: "Pre-save hooks",
                      description:
                        "Funciones que se ejecutan antes de guardar un documento, como el hash de contraseñas",
                    },
                    {
                      name: "comparePassword",
                      description:
                        "Método para comparar contraseñas para autenticación",
                    },
                    {
                      name: "generateAuthToken",
                      description:
                        "Método para generar un token JWT para el usuario",
                    },
                    {
                      name: "findByCredentials",
                      description:
                        "Método estático para encontrar un usuario por credenciales",
                    },
                  ],
                  relatedFiles: [
                    {
                      id: "auth-controller",
                      name: "authController.js",
                      type: "backend",
                      fileType: "js",
                    },
                    {
                      id: "user-controller",
                      name: "userController.js",
                      type: "backend",
                      fileType: "js",
                    },
                    {
                      id: "application-model",
                      name: "JobApplication.js",
                      type: "backend",
                      fileType: "js",
                    },
                    {
                      id: "education-model",
                      name: "Education.js",
                      type: "backend",
                      fileType: "js",
                    },
                    {
                      id: "experience-model",
                      name: "Experience.js",
                      type: "backend",
                      fileType: "js",
                    },
                  ],
                  criticalRelations: true,
                },
                {
                  id: "company-model",
                  name: "company.js",
                  type: "backend",
                  fileType: "js",
                  description:
                    "Modelo de datos para empresas en MongoDB usando Mongoose.",
                  purpose:
                    "Definir la estructura de datos y validaciones para las empresas en la base de datos.",
                  functions: [
                    {
                      name: "Schema Definition",
                      description:
                        "Define la estructura del documento de empresa",
                    },
                    {
                      name: "Pre-save hooks",
                      description:
                        "Funciones que se ejecutan antes de guardar un documento",
                    },
                    {
                      name: "Methods",
                      description:
                        "Métodos personalizados para el modelo de empresa",
                    },
                    {
                      name: "Virtual properties",
                      description:
                        "Propiedades calculadas como el número de trabajos",
                    },
                  ],
                  relatedFiles: [
                    {
                      id: "company-controller",
                      name: "companyController.js",
                      type: "backend",
                      fileType: "js",
                    },
                    {
                      id: "job-model",
                      name: "Job.js",
                      type: "backend",
                      fileType: "js",
                    },
                    {
                      id: "user-model",
                      name: "user.js",
                      type: "backend",
                      fileType: "js",
                    },
                    {
                      id: "review-model",
                      name: "Review.js",
                      type: "backend",
                      fileType: "js",
                    },
                  ],
                },
              ],
            },
            {
              id: "backend-routes",
              name: "Rutas",
              type: "folder",
              children: [
                {
                  id: "auth-route",
                  name: "auth.js",
                  type: "backend",
                  fileType: "js",
                  description:
                    "Define las rutas de API para la autenticación y autorización de usuarios.",
                  purpose:
                    "Mapear las rutas HTTP a las funciones del controlador de autenticación.",
                  functions: [
                    {
                      name: "POST /api/auth/register",
                      description: "Ruta para registrar un nuevo usuario",
                    },
                    {
                      name: "POST /api/auth/login",
                      description: "Ruta para iniciar sesión",
                    },
                    {
                      name: "POST /api/auth/verify-email",
                      description: "Ruta para verificar el correo electrónico",
                    },
                    {
                      name: "POST /api/auth/forgot-password",
                      description:
                        "Ruta para solicitar restablecimiento de contraseña",
                    },
                    {
                      name: "POST /api/auth/reset-password",
                      description: "Ruta para restablecer la contraseña",
                    },
                    {
                      name: "POST /api/auth/refresh-token",
                      description: "Ruta para actualizar el token de acceso",
                    },
                  ],
                  relatedFiles: [
                    {
                      id: "auth-controller",
                      name: "authController.js",
                      type: "backend",
                      fileType: "js",
                    },
                    {
                      id: "auth-middleware",
                      name: "auth.js (middleware)",
                      type: "backend",
                      fileType: "js",
                    },
                    {
                      id: "user-model",
                      name: "user.js",
                      type: "backend",
                      fileType: "js",
                    },
                  ],
                },
                {
                  id: "job-route",
                  name: "jobs.js",
                  type: "backend",
                  fileType: "js",
                  description:
                    "Define las rutas de API para las operaciones relacionadas con ofertas de trabajo.",
                  purpose:
                    "Mapear las rutas HTTP a las funciones del controlador de trabajos.",
                  functions: [
                    {
                      name: "POST /api/jobs",
                      description:
                        "Ruta para crear una nueva oferta de trabajo",
                    },
                    {
                      name: "GET /api/jobs",
                      description:
                        "Ruta para obtener todas las ofertas de trabajo",
                    },
                    {
                      name: "GET /api/jobs/:id",
                      description:
                        "Ruta para obtener una oferta de trabajo específica",
                    },
                    {
                      name: "PUT /api/jobs/:id",
                      description: "Ruta para actualizar una oferta de trabajo",
                    },
                    {
                      name: "DELETE /api/jobs/:id",
                      description: "Ruta para eliminar una oferta de trabajo",
                    },
                    {
                      name: "GET /api/jobs/search",
                      description: "Ruta para buscar ofertas de trabajo",
                    },
                    {
                      name: "GET /api/jobs/featured",
                      description:
                        "Ruta para obtener ofertas de trabajo destacadas",
                    },
                  ],
                  relatedFiles: [
                    {
                      id: "job-controller",
                      name: "jobController.js",
                      type: "backend",
                      fileType: "js",
                    },
                    {
                      id: "auth-middleware",
                      name: "auth.js (middleware)",
                      type: "backend",
                      fileType: "js",
                    },
                    {
                      id: "job-model",
                      name: "Job.js",
                      type: "backend",
                      fileType: "js",
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
      frontendFiles: [
        {
          id: "frontend-root",
          name: "Frontend",
          type: "folder",
          children: [
            {
              id: "frontend-config",
              name: "Configuración",
              type: "folder",
              children: [
                {
                  id: "package-json-frontend",
                  name: "package.json",
                  type: "frontend",
                  fileType: "json",
                  description:
                    "Archivo de configuración de Node.js para el frontend que contiene metadatos del proyecto, dependencias y scripts.",
                  purpose:
                    "Definir las dependencias del proyecto, scripts de ejecución y otra información relevante para el gestor de paquetes npm.",
                  relatedFiles: [
                    {
                      id: "vue-config",
                      name: "vue.config.js",
                      type: "frontend",
                      fileType: "js",
                    },
                  ],
                  criticalRelations: true,
                },
                {
                  id: "vue-config",
                  name: "vue.config.js",
                  type: "frontend",
                  fileType: "js",
                  description:
                    "Archivo de configuración opcional para Vue CLI que permite personalizar la configuración de Webpack, el servidor de desarrollo y más.",
                  purpose:
                    "Personalizar la configuración de la aplicación Vue.js.",
                  relatedFiles: [
                    {
                      id: "package-json-frontend",
                      name: "package.json",
                      type: "frontend",
                      fileType: "json",
                    },
                    {
                      id: "main-js",
                      name: "main.js",
                      type: "frontend",
                      fileType: "js",
                    },
                  ],
                },
              ],
            },
            {
              id: "frontend-src",
              name: "Código Fuente (src)",
              type: "folder",
              children: [
                {
                  id: "app-vue",
                  name: "App.vue",
                  type: "frontend",
                  fileType: "vue",
                  description:
                    "Componente raíz de la aplicación Vue.js que contiene la estructura principal y los componentes de navegación.",
                  purpose:
                    "Proporcionar la estructura básica de la aplicación y el punto de entrada para todos los demás componentes.",
                  relatedFiles: [
                    {
                      id: "main-js",
                      name: "main.js",
                      type: "frontend",
                      fileType: "js",
                    },
                    {
                      id: "router-index",
                      name: "router/index.js",
                      type: "frontend",
                      fileType: "js",
                    },
                    {
                      id: "store-index",
                      name: "store/index.js",
                      type: "frontend",
                      fileType: "js",
                    },
                  ],
                  criticalRelations: true,
                },
                {
                  id: "main-js",
                  name: "main.js",
                  type: "frontend",
                  fileType: "js",
                  description:
                    "Punto de entrada principal para la aplicación Vue.js. Inicializa la aplicación con el router, store, i18n y otros plugins.",
                  purpose:
                    "Configurar y montar la instancia principal de Vue.js.",
                  relatedFiles: [
                    {
                      id: "app-vue",
                      name: "App.vue",
                      type: "frontend",
                      fileType: "vue",
                    },
                    {
                      id: "router-index",
                      name: "router/index.js",
                      type: "frontend",
                      fileType: "js",
                    },
                    {
                      id: "store-index",
                      name: "store/index.js",
                      type: "frontend",
                      fileType: "js",
                    },
                    {
                      id: "i18n-js",
                      name: "i18n.js",
                      type: "frontend",
                      fileType: "js",
                    },
                  ],
                  criticalRelations: true,
                },
                {
                  id: "i18n-js",
                  name: "i18n.js",
                  type: "frontend",
                  fileType: "js",
                  description:
                    "Configuración para la internacionalización (i18n) de la aplicación usando vue-i18n.",
                  purpose:
                    "Configurar los idiomas disponibles y las traducciones para la aplicación.",
                  relatedFiles: [
                    {
                      id: "main-js",
                      name: "main.js",
                      type: "frontend",
                      fileType: "js",
                    },
                    {
                      id: "i18n-folder",
                      name: "i18n/ (carpeta)",
                      type: "frontend",
                      fileType: "folder",
                    },
                  ],
                },
                {
                  id: "frontend-views",
                  name: "Vistas",
                  type: "folder",
                  children: [
                    {
                      id: "home-view",
                      name: "HomeView.vue",
                      type: "frontend",
                      fileType: "vue",
                      description:
                        "Componente de vista para la página de inicio de la aplicación. Muestra trabajos destacados, empresas y un formulario de búsqueda.",
                      purpose:
                        "Proporcionar la página principal que los usuarios ven al acceder a la aplicación.",
                      functions: [
                        {
                          name: "fetchFeaturedJobs",
                          description: "Obtiene trabajos destacados del API",
                        },
                        {
                          name: "fetchTopCompanies",
                          description:
                            "Obtiene las principales empresas del API",
                        },
                        {
                          name: "searchJobs",
                          description: "Maneja la búsqueda de trabajos",
                        },
                        {
                          name: "applyFilters",
                          description:
                            "Aplica filtros a los resultados de búsqueda",
                        },
                      ],
                      relatedFiles: [
                        {
                          id: "job-component",
                          name: "jobs/JobCard.vue",
                          type: "frontend",
                          fileType: "vue",
                        },
                        {
                          id: "company-component",
                          name: "companies/CompanyCard.vue",
                          type: "frontend",
                          fileType: "vue",
                        },
                        {
                          id: "router-index",
                          name: "router/index.js",
                          type: "frontend",
                          fileType: "js",
                        },
                        {
                          id: "store-job",
                          name: "store/job.js",
                          type: "frontend",
                          fileType: "js",
                        },
                      ],
                    },
                    {
                      id: "login-view",
                      name: "LoginView.vue",
                      type: "frontend",
                      fileType: "vue",
                      description:
                        "Componente de vista para la página de inicio de sesión. Permite a los usuarios autenticarse en la aplicación.",
                      purpose:
                        "Proporcionar una interfaz para que los usuarios inicien sesión en la aplicación.",
                      functions: [
                        {
                          name: "login",
                          description: "Maneja el proceso de inicio de sesión",
                        },
                        {
                          name: "validateForm",
                          description:
                            "Valida el formulario de inicio de sesión",
                        },
                        {
                          name: "forgotPassword",
                          description:
                            "Redirige al flujo de restablecimiento de contraseña",
                        },
                      ],
                      relatedFiles: [
                        {
                          id: "register-view",
                          name: "RegisterView.vue",
                          type: "frontend",
                          fileType: "vue",
                        },
                        {
                          id: "store-auth",
                          name: "store/auth.js",
                          type: "frontend",
                          fileType: "js",
                        },
                        {
                          id: "router-index",
                          name: "router/index.js",
                          type: "frontend",
                          fileType: "js",
                        },
                      ],
                    },
                    {
                      id: "register-view",
                      name: "RegisterView.vue",
                      type: "frontend",
                      fileType: "vue",
                      description:
                        "Componente de vista para la página de registro. Permite a los usuarios crear una nueva cuenta en la aplicación.",
                      purpose:
                        "Proporcionar una interfaz para que los usuarios se registren en la aplicación.",
                      functions: [
                        {
                          name: "register",
                          description: "Maneja el proceso de registro",
                        },
                        {
                          name: "validateForm",
                          description: "Valida el formulario de registro",
                        },
                        {
                          name: "handleUserType",
                          description:
                            "Cambia el formulario según el tipo de usuario (candidato o empresa)",
                        },
                      ],
                      relatedFiles: [
                        {
                          id: "login-view",
                          name: "LoginView.vue",
                          type: "frontend",
                          fileType: "vue",
                        },
                        {
                          id: "store-auth",
                          name: "store/auth.js",
                          type: "frontend",
                          fileType: "js",
                        },
                        {
                          id: "router-index",
                          name: "router/index.js",
                          type: "frontend",
                          fileType: "js",
                        },
                      ],
                    },
                    {
                      id: "dashboard-view",
                      name: "DashboardView.vue",
                      type: "frontend",
                      fileType: "vue",
                      description:
                        "Componente de vista para el panel de control del usuario. Muestra información relevante según el tipo de usuario (candidato o empresa).",
                      purpose:
                        "Proporcionar una visión general personalizada para cada usuario después de iniciar sesión.",
                      functions: [
                        {
                          name: "fetchDashboardData",
                          description:
                            "Obtiene datos personalizados para el panel de control",
                        },
                        {
                          name: "renderUserSpecificContent",
                          description:
                            "Muestra contenido específico según el tipo de usuario",
                        },
                      ],
                      relatedFiles: [
                        {
                          id: "profile-view",
                          name: "ProfileView.vue",
                          type: "frontend",
                          fileType: "vue",
                        },
                        {
                          id: "company-profile-view",
                          name: "CompanyProfileView.vue",
                          type: "frontend",
                          fileType: "vue",
                        },
                        {
                          id: "store-user",
                          name: "store/user.js",
                          type: "frontend",
                          fileType: "js",
                        },
                        {
                          id: "store-job",
                          name: "store/job.js",
                          type: "frontend",
                          fileType: "js",
                        },
                      ],
                    },
                    {
                      id: "jobs-view",
                      name: "jobs/JobsView.vue",
                      type: "frontend",
                      fileType: "vue",
                      description:
                        "Componente de vista para la página de listado de trabajos. Muestra todos los trabajos disponibles con opciones de filtrado y búsqueda.",
                      purpose:
                        "Permitir a los usuarios explorar y buscar ofertas de trabajo disponibles.",
                      functions: [
                        {
                          name: "fetchJobs",
                          description:
                            "Obtiene trabajos del API con paginación",
                        },
                        {
                          name: "applyFilters",
                          description:
                            "Aplica filtros a los resultados de búsqueda",
                        },
                        {
                          name: "handleSearch",
                          description: "Maneja la búsqueda de trabajos",
                        },
                        {
                          name: "handlePagination",
                          description: "Maneja la paginación de resultados",
                        },
                      ],
                      relatedFiles: [
                        {
                          id: "job-detail-view",
                          name: "jobs/JobDetailView.vue",
                          type: "frontend",
                          fileType: "vue",
                        },
                        {
                          id: "job-card",
                          name: "jobs/JobCard.vue",
                          type: "frontend",
                          fileType: "vue",
                        },
                        {
                          id: "job-filter",
                          name: "jobs/JobFilter.vue",
                          type: "frontend",
                          fileType: "vue",
                        },
                        {
                          id: "store-job",
                          name: "store/job.js",
                          type: "frontend",
                          fileType: "js",
                        },
                      ],
                    },
                    {
                      id: "job-detail-view",
                      name: "jobs/JobDetailView.vue",
                      type: "frontend",
                      fileType: "vue",
                      description:
                        "Componente de vista para la página de detalle de trabajo. Muestra información detallada sobre una oferta de trabajo específica.",
                      purpose:
                        "Mostrar detalles completos de una oferta de trabajo y permitir a los usuarios aplicar.",
                      functions: [
                        {
                          name: "fetchJobDetails",
                          description:
                            "Obtiene detalles del trabajo específico",
                        },
                        {
                          name: "applyForJob",
                          description:
                            "Maneja el proceso de solicitud de trabajo",
                        },
                        {
                          name: "saveJob",
                          description:
                            "Guarda el trabajo en favoritos del usuario",
                        },
                        {
                          name: "shareJob",
                          description: "Comparte el trabajo en redes sociales",
                        },
                      ],
                      relatedFiles: [
                        {
                          id: "jobs-view",
                          name: "jobs/JobsView.vue",
                          type: "frontend",
                          fileType: "vue",
                        },
                        {
                          id: "job-application-form",
                          name: "jobs/JobApplicationForm.vue",
                          type: "frontend",
                          fileType: "vue",
                        },
                        {
                          id: "company-detail-view",
                          name: "companies/CompanyDetailView.vue",
                          type: "frontend",
                          fileType: "vue",
                        },
                        {
                          id: "store-job",
                          name: "store/job.js",
                          type: "frontend",
                          fileType: "js",
                        },
                      ],
                    },
                    {
                      id: "company-detail-view",
                      name: "companies/CompanyDetailView.vue",
                      type: "frontend",
                      fileType: "vue",
                      description:
                        "Componente de vista para la página de detalle de empresa. Muestra información detallada sobre una empresa específica y sus ofertas de trabajo.",
                      purpose:
                        "Proporcionar información completa sobre una empresa y sus oportunidades laborales.",
                      functions: [
                        {
                          name: "fetchCompanyDetails",
                          description:
                            "Obtiene detalles de la empresa específica",
                        },
                        {
                          name: "fetchCompanyJobs",
                          description:
                            "Obtiene trabajos publicados por la empresa",
                        },
                        {
                          name: "followCompany",
                          description:
                            "Permite a los usuarios seguir a la empresa",
                        },
                        {
                          name: "submitReview",
                          description:
                            "Permite a los usuarios dejar reseñas sobre la empresa",
                        },
                      ],
                      relatedFiles: [
                        {
                          id: "companies-view",
                          name: "companies/CompaniesView.vue",
                          type: "frontend",
                          fileType: "vue",
                        },
                        {
                          id: "job-card",
                          name: "jobs/JobCard.vue",
                          type: "frontend",
                          fileType: "vue",
                        },
                        {
                          id: "review-component",
                          name: "reviews/ReviewList.vue",
                          type: "frontend",
                          fileType: "vue",
                        },
                        {
                          id: "store-company",
                          name: "store/company.js",
                          type: "frontend",
                          fileType: "js",
                        },
                      ],
                    },
                  ],
                },
                {
                  id: "frontend-components",
                  name: "Componentes",
                  type: "folder",
                  children: [
                    {
                      id: "job-card",
                      name: "jobs/JobCard.vue",
                      type: "frontend",
                      fileType: "vue",
                      description:
                        "Componente reutilizable que muestra una tarjeta con información resumida de una oferta de trabajo.",
                      purpose:
                        "Mostrar un resumen de una oferta de trabajo en diferentes partes de la aplicación.",
                      functions: [
                        {
                          name: "formatSalary",
                          description:
                            "Formatea el salario para su visualización",
                        },
                        {
                          name: "handleClick",
                          description:
                            "Maneja la navegación al detalle del trabajo",
                        },
                        {
                          name: "saveJob",
                          description: "Guarda el trabajo en favoritos",
                        },
                      ],
                      relatedFiles: [
                        {
                          id: "jobs-view",
                          name: "jobs/JobsView.vue",
                          type: "frontend",
                          fileType: "vue",
                        },
                        {
                          id: "home-view",
                          name: "HomeView.vue",
                          type: "frontend",
                          fileType: "vue",
                        },
                        {
                          id: "company-detail-view",
                          name: "companies/CompanyDetailView.vue",
                          type: "frontend",
                          fileType: "vue",
                        },
                      ],
                    },
                    {
                      id: "company-card",
                      name: "companies/CompanyCard.vue",
                      type: "frontend",
                      fileType: "vue",
                      description:
                        "Componente reutilizable que muestra una tarjeta con información resumida de una empresa.",
                      purpose:
                        "Mostrar un resumen de una empresa en diferentes partes de la aplicación.",
                      functions: [
                        {
                          name: "handleClick",
                          description:
                            "Maneja la navegación al detalle de la empresa",
                        },
                        {
                          name: "formatJobCount",
                          description:
                            "Formatea el número de trabajos disponibles",
                        },
                      ],
                      relatedFiles: [
                        {
                          id: "companies-view",
                          name: "companies/CompaniesView.vue",
                          type: "frontend",
                          fileType: "vue",
                        },
                        {
                          id: "home-view",
                          name: "HomeView.vue",
                          type: "frontend",
                          fileType: "vue",
                        },
                      ],
                    },
                    {
                      id: "search-filter",
                      name: "common/SearchFilter.vue",
                      type: "frontend",
                      fileType: "vue",
                      description:
                        "Componente reutilizable que proporciona una interfaz para filtrar y buscar resultados.",
                      purpose:
                        "Permitir a los usuarios filtrar y buscar trabajos o empresas.",
                      functions: [
                        {
                          name: "applyFilters",
                          description: "Aplica los filtros seleccionados",
                        },
                        {
                          name: "resetFilters",
                          description:
                            "Restablece todos los filtros a sus valores predeterminados",
                        },
                        {
                          name: "handleSearch",
                          description: "Maneja la entrada de búsqueda",
                        },
                      ],
                      relatedFiles: [
                        {
                          id: "jobs-view",
                          name: "jobs/JobsView.vue",
                          type: "frontend",
                          fileType: "vue",
                        },
                        {
                          id: "companies-view",
                          name: "companies/CompaniesView.vue",
                          type: "frontend",
                          fileType: "vue",
                        },
                        {
                          id: "home-view",
                          name: "HomeView.vue",
                          type: "frontend",
                          fileType: "vue",
                        },
                      ],
                    },
                    {
                      id: "frontend-components-ui",
                      name: "Ui",
                      type: "folder",
                      children: [
                        {
                          id: "collapsible-list-component",
                          name: "CollapsibleList.vue",
                          type: "frontend",
                          fileType: "vue",
                          description:
                            "Componente reutilizable que permite colapsar y expandir listas HTML (<ul><li>) con un efecto de degradado y un botón para mostrar/ocultar.",
                          purpose:
                            "Mejorar la experiencia de usuario al mostrar listas largas de manera más compacta, permitiendo al usuario expandirlas cuando sea necesario.",
                          functions: [
                            {
                              name: "toggleCollapse",
                              description:
                                "Alterna entre el estado colapsado y expandido de la lista",
                            },
                            {
                              name: "checkListItems",
                              description:
                                "Verifica si la lista tiene suficientes elementos para justificar el colapso",
                            },
                          ],
                          relatedFiles: [
                            {
                              id: "collapsible-list-directive",
                              name: "collapsibleList.js (directiva)",
                              type: "frontend",
                              fileType: "js",
                            },
                            {
                              id: "job-detail-view",
                              name: "jobs/JobDetailView.vue",
                              type: "frontend",
                              fileType: "vue",
                            },
                            {
                              id: "main-js",
                              name: "main.js",
                              type: "frontend",
                              fileType: "js",
                            },
                          ],
                          codeExamples: [
                            {
                              title:
                                "1.1.- Uso básico del componente (Template)",
                              code: `<template>
  <div>
    <h2 class="text-h6 mb-3">Requirements</h2>
    <CollapsibleList>
      <div v-html="job.requirements"></div>
    </CollapsibleList>
  </div>
</template>`,
                            },
                            {
                              title:
                                "1.2.- Script del componente básico (Script)",
                              code: `import CollapsibleList from '@/components/ui/CollapsibleList.vue';

export default {
  components: {
    CollapsibleList
  }
  // ...resto del código
}`,
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  id: "frontend-directives",
                  name: "Directivas",
                  type: "folder",
                  children: [
                    {
                      id: "collapsible-list-directive",
                      name: "collapsibleList.js",
                      type: "frontend",
                      fileType: "js",
                      description:
                        "Directiva personalizada de Vue que añade funcionalidad de colapso a cualquier elemento que contenga listas (<ul><li>). Permite truncar listas largas con un efecto de degradado y un botón para expandir/colapsar.",
                      purpose:
                        "Proporcionar una forma sencilla de aplicar la funcionalidad de colapso a cualquier lista en la aplicación sin necesidad de importar componentes adicionales.",
                      functions: [
                        {
                          name: "mounted",
                          description:
                            "Configura la funcionalidad de colapso cuando el elemento se monta en el DOM",
                        },
                        {
                          name: "toggleCollapse",
                          description:
                            "Función que alterna entre el estado colapsado y expandido",
                        },
                      ],
                      relatedFiles: [
                        {
                          id: "collapsible-list-component",
                          name: "ui/CollapsibleList.vue",
                          type: "frontend",
                          fileType: "vue",
                        },
                        {
                          id: "main-js",
                          name: "main.js",
                          type: "frontend",
                          fileType: "js",
                        },
                        {
                          id: "job-detail-view",
                          name: "jobs/JobDetailView.vue",
                          type: "frontend",
                          fileType: "vue",
                        },
                      ],
                      codeExamples: [
                        {
                          title: "2.1.- Uso de la directiva (Template)",
                          code: `<template>
  <div>
    <h2 class="text-h6 mb-3">Requirements</h2>
    <div v-collapsible-list="{ maxItems: 5, collapsedHeight: 200 }" v-html="job.requirements"></div>
  </div>
</template>`,
                        },
                        {
                          title: "2.2.- Registro de la directiva en main.js",
                          code: `// src/main.js
import { createApp } from 'vue';
import App from './App.vue';
import collapsibleList from './directives/collapsibleList';

const app = createApp(App);
app.directive('collapsible-list', collapsibleList);
// ... resto de tu código
app.mount('#app');`,
                        },
                      ],
                    },
                  ],
                },
                {
                  id: "frontend-router",
                  name: "Enrutamiento",
                  type: "folder",
                  children: [
                    {
                      id: "router-index",
                      name: "router/index.js",
                      type: "frontend",
                      fileType: "js",
                      description:
                        "Configuración del enrutador Vue Router que define todas las rutas de la aplicación.",
                      purpose:
                        "Definir las rutas de la aplicación y sus componentes asociados, incluyendo guardias de navegación para rutas protegidas.",
                      functions: [
                        {
                          name: "Route Configuration",
                          description:
                            "Define todas las rutas de la aplicación",
                        },
                        {
                          name: "Navigation Guards",
                          description:
                            "Implementa guardias para rutas protegidas",
                        },
                        {
                          name: "Lazy Loading",
                          description:
                            "Configura la carga diferida de componentes para optimizar el rendimiento",
                        },
                      ],
                      relatedFiles: [
                        {
                          id: "app-vue",
                          name: "App.vue",
                          type: "frontend",
                          fileType: "vue",
                        },
                        {
                          id: "main-js",
                          name: "main.js",
                          type: "frontend",
                          fileType: "js",
                        },
                        {
                          id: "store-auth",
                          name: "store/auth.js",
                          type: "frontend",
                          fileType: "js",
                        },
                      ],
                      criticalRelations: true,
                    },
                  ],
                },
                {
                  id: "frontend-store",
                  name: "Estado (Store)",
                  type: "folder",
                  children: [
                    {
                      id: "store-index",
                      name: "store/index.js",
                      type: "frontend",
                      fileType: "js",
                      description:
                        "Configuración principal de Vuex que define el almacén de estado global de la aplicación.",
                      purpose:
                        "Centralizar el estado de la aplicación y proporcionar una forma de gestionar cambios de estado de manera predecible.",
                      relatedFiles: [
                        {
                          id: "main-js",
                          name: "main.js",
                          type: "frontend",
                          fileType: "js",
                        },
                        {
                          id: "store-auth",
                          name: "store/auth.js",
                          type: "frontend",
                          fileType: "js",
                        },
                        {
                          id: "store-job",
                          name: "store/job.js",
                          type: "frontend",
                          fileType: "js",
                        },
                        {
                          id: "store-user",
                          name: "store/user.js",
                          type: "frontend",
                          fileType: "js",
                        },
                        {
                          id: "store-company",
                          name: "store/company.js",
                          type: "frontend",
                          fileType: "js",
                        },
                      ],
                      criticalRelations: true,
                    },
                    {
                      id: "store-auth",
                      name: "store/auth.js",
                      type: "frontend",
                      fileType: "js",
                      description:
                        "Módulo Vuex para gestionar el estado de autenticación de la aplicación.",
                      purpose:
                        "Gestionar el estado de autenticación, incluyendo inicio de sesión, registro y cierre de sesión.",
                      functions: [
                        {
                          name: "login",
                          description: "Acción para iniciar sesión",
                        },
                        {
                          name: "register",
                          description: "Acción para registrar un nuevo usuario",
                        },
                        {
                          name: "logout",
                          description: "Acción para cerrar sesión",
                        },
                        {
                          name: "refreshToken",
                          description:
                            "Acción para actualizar el token de acceso",
                        },
                        {
                          name: "checkAuth",
                          description:
                            "Acción para verificar si el usuario está autenticado",
                        },
                      ],
                      relatedFiles: [
                        {
                          id: "login-view",
                          name: "LoginView.vue",
                          type: "frontend",
                          fileType: "vue",
                        },
                        {
                          id: "register-view",
                          name: "RegisterView.vue",
                          type: "frontend",
                          fileType: "vue",
                        },
                        {
                          id: "router-index",
                          name: "router/index.js",
                          type: "frontend",
                          fileType: "js",
                        },
                        {
                          id: "store-user",
                          name: "store/user.js",
                          type: "frontend",
                          fileType: "js",
                        },
                      ],
                      criticalRelations: true,
                    },
                    {
                      id: "store-job",
                      name: "store/job.js",
                      type: "frontend",
                      fileType: "js",
                      description:
                        "Módulo Vuex para gestionar el estado de las ofertas de trabajo.",
                      purpose:
                        "Gestionar el estado relacionado con las ofertas de trabajo, incluyendo listado, búsqueda, filtrado y operaciones CRUD.",
                      functions: [
                        {
                          name: "fetchJobs",
                          description: "Acción para obtener trabajos",
                        },
                        {
                          name: "fetchJobById",
                          description:
                            "Acción para obtener un trabajo específico",
                        },
                        {
                          name: "createJob",
                          description: "Acción para crear un nuevo trabajo",
                        },
                        {
                          name: "updateJob",
                          description:
                            "Acción para actualizar un trabajo existente",
                        },
                        {
                          name: "deleteJob",
                          description: "Acción para eliminar un trabajo",
                        },
                        {
                          name: "searchJobs",
                          description: "Acción para buscar trabajos",
                        },
                        {
                          name: "applyToJob",
                          description: "Acción para aplicar a un trabajo",
                        },
                      ],
                      relatedFiles: [
                        {
                          id: "jobs-view",
                          name: "jobs/JobsView.vue",
                          type: "frontend",
                          fileType: "vue",
                        },
                        {
                          id: "job-detail-view",
                          name: "jobs/JobDetailView.vue",
                          type: "frontend",
                          fileType: "vue",
                        },
                        {
                          id: "job-card",
                          name: "jobs/JobCard.vue",
                          type: "frontend",
                          fileType: "vue",
                        },
                        {
                          id: "store-company",
                          name: "store/company.js",
                          type: "frontend",
                          fileType: "js",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
      // Añadir configuración del snackbar
      snackbar: {
        show: false,
        text: "",
        color: "success",
        timeout: 3000,
      },
    };
  },
  methods: {
    getIconForFile(type) {
      const icons = {
        folder: "mdi-folder",
        js: "mdi-language-javascript",
        vue: "mdi-vuejs",
        json: "mdi-code-json",
        config: "mdi-cog",
        backend: "mdi-server",
        frontend: "mdi-monitor",
      };
      return icons[type] || "mdi-file-document-outline";
    },

    getIconColor(type) {
      const colors = {
        folder: "amber",
        js: "green",
        vue: "green",
        json: "blue",
        config: "purple",
        backend: "indigo",
        frontend: "teal",
      };
      return colors[type] || "grey";
    },

    handleNodeClick(nodeId) {
      // Buscar el archivo en ambos árboles
      let file = this.findFileById(nodeId, this.backendFiles);
      if (!file) {
        file = this.findFileById(nodeId, this.frontendFiles);
      }

      if (file && file.type !== "folder") {
        this.selectedFile = file;
        this.showFileModal = true;
      }
    },

    findFileById(id, items) {
      for (const item of items) {
        if (item.id === id) return item;
        if (item.children) {
          const found = this.findFileById(id, item.children);
          if (found) return found;
        }
      }
      return null;
    },

    openRelatedFile(id) {
      const file =
        this.findFileById(id, this.backendFiles) ||
        this.findFileById(id, this.frontendFiles);
      if (file) {
        this.selectedFile = file;
      }
    },

    // Método para copiar al portapapeles
    copyToClipboard(text) {
      navigator.clipboard.writeText(text).then(
        () => {
          // Mostrar snackbar en lugar de alert
          this.snackbar = {
            show: true,
            text: "Código copiado al portapapeles",
            color: "success",
            timeout: 3000,
          };
        },
        (err) => {
          console.error("Error al copiar texto: ", err);
          // Mostrar mensaje de error en el snackbar
          this.snackbar = {
            show: true,
            text: "Error al copiar el código",
            color: "error",
            timeout: 3000,
          };
        }
      );
    },
  },
};
</script>

<style scoped>
.sitemap-container {
  margin: 20px 0;
}

.custom-tree {
  padding: 8px 0;
}

.tree-item {
  margin-bottom: 4px;
}

.tree-item-header {
  display: flex;
  align-items: center;
  padding: 6px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.tree-item-header:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.tree-item-header.is-folder {
  font-weight: 500;
}

.tree-item-children {
  padding-left: 24px;
  margin-top: 4px;
}

.v-chip {
  cursor: pointer;
}
</style>
