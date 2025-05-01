<template>
  <v-container class="profile-view">
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">Mi Perfil</h1>
      </v-col>
    </v-row>

    <v-row v-if="loading">
      <v-col cols="12">
        <v-skeleton-loader
          type="card, card"
          class="mx-auto"
        ></v-skeleton-loader>
      </v-col>
    </v-row>

    <template v-else-if="user">
      <v-row>
        <!-- Información básica del perfil -->
        <v-col cols="12" md="4">
          <v-card class="mb-4">
            <v-card-text class="text-center">
              <v-avatar size="120" class="mb-4">
                <v-img
                  v-if="user.avatar"
                  :src="user.avatar"
                  alt="Profile Picture"
                ></v-img>
                <v-icon v-else size="80" color="primary"
                  >mdi-account-circle</v-icon
                >
              </v-avatar>

              <h2 class="text-h5">{{ user.firstName }} {{ user.lastName }}</h2>
              <p class="text-subtitle-1 grey--text">{{ user.role }}</p>

              <div class="d-flex justify-center mt-4">
                <v-btn
                  color="primary"
                  small
                  outlined
                  class="mr-2"
                  @click="avatarUpload = true"
                >
                  <v-icon left small>mdi-camera</v-icon>
                  Cambiar foto
                </v-btn>
                <v-btn
                  color="error"
                  small
                  outlined
                  v-if="user.avatar"
                  @click="removeAvatar"
                >
                  <v-icon left small>mdi-delete</v-icon>
                  Eliminar
                </v-btn>
              </div>
            </v-card-text>

            <v-divider></v-divider>

            <v-list dense>
              <v-list-item>
                <v-list-item-icon>
                  <v-icon>mdi-email</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title>{{ user.email }}</v-list-item-title>
                  <v-list-item-subtitle>Email</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>

              <v-list-item v-if="user.phone">
                <v-list-item-icon>
                  <v-icon>mdi-phone</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title>{{ user.phone }}</v-list-item-title>
                  <v-list-item-subtitle>Teléfono</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>

              <v-list-item v-if="user.location">
                <v-list-item-icon>
                  <v-icon>mdi-map-marker</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title>{{ user.location }}</v-list-item-title>
                  <v-list-item-subtitle>Ubicación</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>

              <v-list-item>
                <v-list-item-icon>
                  <v-icon>mdi-calendar</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title>{{
                    formatDate(user.createdAt)
                  }}</v-list-item-title>
                  <v-list-item-subtitle>Miembro desde</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card>

          <!-- Acciones del perfil -->
          <v-card>
            <v-list>
              <v-list-item @click="changePasswordDialog = true">
                <v-list-item-icon>
                  <v-icon>mdi-lock</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title>Cambiar contraseña</v-list-item-title>
                </v-list-item-content>
                <v-list-item-action>
                  <v-icon>mdi-chevron-right</v-icon>
                </v-list-item-action>
              </v-list-item>

              <v-list-item
                v-if="user.role === 'employer'"
                :to="`/company/${user.companyId}`"
              >
                <v-list-item-icon>
                  <v-icon>mdi-domain</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title>Mi empresa</v-list-item-title>
                </v-list-item-content>
                <v-list-item-action>
                  <v-icon>mdi-chevron-right</v-icon>
                </v-list-item-action>
              </v-list-item>

              <v-list-item
                v-if="user.role === 'candidate'"
                :to="`/resume/${user.resumeId}`"
              >
                <v-list-item-icon>
                  <v-icon>mdi-file-document</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title>Mi currículum</v-list-item-title>
                </v-list-item-content>
                <v-list-item-action>
                  <v-icon>mdi-chevron-right</v-icon>
                </v-list-item-action>
              </v-list-item>

              <v-list-item @click="deleteAccountDialog = true">
                <v-list-item-icon>
                  <v-icon color="error">mdi-delete</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title class="error--text"
                    >Eliminar cuenta</v-list-item-title
                  >
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>

        <!-- Formulario de edición del perfil -->
        <v-col cols="12" md="8">
          <v-card>
            <v-tabs v-model="activeTab">
              <v-tab>Información Personal</v-tab>
              <v-tab>Preferencias</v-tab>
              <v-tab>Notificaciones</v-tab>
            </v-tabs>

            <v-tabs-items v-model="activeTab">
              <!-- Pestaña de información personal -->
              <v-tab-item>
                <v-card flat>
                  <v-card-text>
                    <v-form ref="personalForm" v-model="personalFormValid">
                      <v-row>
                        <v-col cols="12" md="6">
                          <v-text-field
                            v-model="profileData.firstName"
                            label="Nombre"
                            outlined
                            :rules="nameRules"
                          ></v-text-field>
                        </v-col>
                        <v-col cols="12" md="6">
                          <v-text-field
                            v-model="profileData.lastName"
                            label="Apellidos"
                            outlined
                            :rules="nameRules"
                          ></v-text-field>
                        </v-col>
                      </v-row>

                      <v-row>
                        <v-col cols="12" md="6">
                          <v-text-field
                            v-model="profileData.email"
                            label="Email"
                            outlined
                            disabled
                          ></v-text-field>
                        </v-col>
                        <v-col cols="12" md="6">
                          <v-text-field
                            v-model="profileData.phone"
                            label="Teléfono"
                            outlined
                            :rules="phoneRules"
                          ></v-text-field>
                        </v-col>
                      </v-row>

                      <v-row>
                        <v-col cols="12">
                          <v-text-field
                            v-model="profileData.location"
                            label="Ubicación"
                            outlined
                            placeholder="Ciudad, País"
                          ></v-text-field>
                        </v-col>
                      </v-row>

                      <v-row>
                        <v-col cols="12">
                          <v-textarea
                            v-model="profileData.bio"
                            label="Biografía"
                            outlined
                            rows="4"
                            counter="500"
                            :rules="bioRules"
                          ></v-textarea>
                        </v-col>
                      </v-row>

                      <v-row>
                        <v-col cols="12" md="6">
                          <v-text-field
                            v-model="profileData.website"
                            label="Sitio web"
                            outlined
                            placeholder="https://example.com"
                          ></v-text-field>
                        </v-col>
                        <v-col cols="12" md="6">
                          <v-select
                            v-model="profileData.language"
                            :items="languages"
                            label="Idioma preferido"
                            outlined
                          ></v-select>
                        </v-col>
                      </v-row>

                      <v-row v-if="user.role === 'candidate'">
                        <v-col cols="12">
                          <v-combobox
                            v-model="profileData.skills"
                            :items="skillSuggestions"
                            label="Habilidades"
                            multiple
                            chips
                            small-chips
                            outlined
                          ></v-combobox>
                        </v-col>
                      </v-row>
                    </v-form>
                  </v-card-text>
                </v-card>
              </v-tab-item>

              <!-- Pestaña de preferencias -->
              <v-tab-item>
                <v-card flat>
                  <v-card-text>
                    <v-form
                      ref="preferencesForm"
                      v-model="preferencesFormValid"
                    >
                      <v-row>
                        <v-col cols="12">
                          <v-select
                            v-model="profileData.theme"
                            :items="themes"
                            label="Tema"
                            outlined
                          ></v-select>
                        </v-col>
                      </v-row>

                      <v-row v-if="user.role === 'candidate'">
                        <v-col cols="12">
                          <v-select
                            v-model="profileData.jobPreferences.jobTypes"
                            :items="jobTypes"
                            label="Tipos de empleo"
                            multiple
                            chips
                            outlined
                          ></v-select>
                        </v-col>
                      </v-row>

                      <v-row v-if="user.role === 'candidate'">
                        <v-col cols="12">
                          <v-select
                            v-model="profileData.jobPreferences.locations"
                            :items="locationOptions"
                            label="Ubicaciones preferidas"
                            multiple
                            chips
                            outlined
                          ></v-select>
                        </v-col>
                      </v-row>

                      <v-row v-if="user.role === 'candidate'">
                        <v-col cols="12">
                          <v-select
                            v-model="profileData.jobPreferences.categories"
                            :items="categoryOptions"
                            label="Categorías de interés"
                            multiple
                            chips
                            outlined
                          ></v-select>
                        </v-col>
                      </v-row>

                      <v-row v-if="user.role === 'candidate'">
                        <v-col cols="12">
                          <v-slider
                            v-model="profileData.jobPreferences.salaryRange"
                            label="Rango salarial (€)"
                            min="15000"
                            max="100000"
                            step="1000"
                            thumb-label="always"
                            range
                          >
                            <template v-slot:prepend>
                              {{ profileData.jobPreferences.salaryRange[0] }}€
                            </template>
                            <template v-slot:append>
                              {{ profileData.jobPreferences.salaryRange[1] }}€
                            </template>
                          </v-slider>
                        </v-col>
                      </v-row>

                      <v-row>
                        <v-col cols="12">
                          <v-switch
                            v-model="
                              profileData.privacySettings.profileVisibility
                            "
                            label="Perfil público"
                            hint="Permite que otros usuarios vean tu perfil"
                            persistent-hint
                          ></v-switch>
                        </v-col>
                      </v-row>

                      <v-row>
                        <v-col cols="12">
                          <v-switch
                            v-model="
                              profileData.privacySettings.showContactInfo
                            "
                            label="Mostrar información de contacto"
                            hint="Permite que otros usuarios vean tu información de contacto"
                            persistent-hint
                          ></v-switch>
                        </v-col>
                      </v-row>
                    </v-form>
                  </v-card-text>
                </v-card>
              </v-tab-item>

              <!-- Pestaña de notificaciones -->
              <v-tab-item>
                <v-card flat>
                  <v-card-text>
                    <v-form
                      ref="notificationsForm"
                      v-model="notificationsFormValid"
                    >
                      <v-list two-line>
                        <v-subheader>Notificaciones por email</v-subheader>

                        <v-list-item>
                          <v-list-item-action>
                            <v-switch
                              v-model="
                                profileData.notifications.emailNewsletter
                              "
                            ></v-switch>
                          </v-list-item-action>
                          <v-list-item-content>
                            <v-list-item-title>Newsletter</v-list-item-title>
                            <v-list-item-subtitle
                              >Recibir newsletter semanal</v-list-item-subtitle
                            >
                          </v-list-item-content>
                        </v-list-item>

                        <v-list-item>
                          <v-list-item-action>
                            <v-switch
                              v-model="profileData.notifications.emailJobAlerts"
                            ></v-switch>
                          </v-list-item-action>
                          <v-list-item-content>
                            <v-list-item-title
                              >Alertas de empleo</v-list-item-title
                            >
                            <v-list-item-subtitle
                              >Recibir alertas de nuevos empleos que coincidan
                              con tus preferencias</v-list-item-subtitle
                            >
                          </v-list-item-content>
                        </v-list-item>

                        <v-list-item>
                          <v-list-item-action>
                            <v-switch
                              v-model="profileData.notifications.emailMessages"
                            ></v-switch>
                          </v-list-item-action>
                          <v-list-item-content>
                            <v-list-item-title>Mensajes</v-list-item-title>
                            <v-list-item-subtitle
                              >Recibir notificaciones por email cuando recibas
                              un mensaje</v-list-item-subtitle
                            >
                          </v-list-item-content>
                        </v-list-item>

                        <v-divider></v-divider>
                        <v-subheader
                          >Notificaciones en la plataforma</v-subheader
                        >

                        <v-list-item>
                          <v-list-item-action>
                            <v-switch
                              v-model="profileData.notifications.appJobAlerts"
                            ></v-switch>
                          </v-list-item-action>
                          <v-list-item-content>
                            <v-list-item-title
                              >Alertas de empleo</v-list-item-title
                            >
                            <v-list-item-subtitle
                              >Recibir notificaciones de nuevos
                              empleos</v-list-item-subtitle
                            >
                          </v-list-item-content>
                        </v-list-item>

                        <v-list-item>
                          <v-list-item-action>
                            <v-switch
                              v-model="profileData.notifications.appMessages"
                            ></v-switch>
                          </v-list-item-action>
                          <v-list-item-content>
                            <v-list-item-title>Mensajes</v-list-item-title>
                            <v-list-item-subtitle
                              >Recibir notificaciones de nuevos
                              mensajes</v-list-item-subtitle
                            >
                          </v-list-item-content>
                        </v-list-item>

                        <v-list-item>
                          <v-list-item-action>
                            <v-switch
                              v-model="profileData.notifications.appUpdates"
                            ></v-switch>
                          </v-list-item-action>
                          <v-list-item-content>
                            <v-list-item-title
                              >Actualizaciones</v-list-item-title
                            >
                            <v-list-item-subtitle
                              >Recibir notificaciones sobre actualizaciones de
                              la plataforma</v-list-item-subtitle
                            >
                          </v-list-item-content>
                        </v-list-item>
                      </v-list>
                    </v-form>
                  </v-card-text>
                </v-card>
              </v-tab-item>
            </v-tabs-items>

            <v-divider></v-divider>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn text @click="resetForm"> Cancelar </v-btn>
              <v-btn
                color="primary"
                :loading="saving"
                :disabled="!isFormValid"
                @click="saveProfile"
              >
                Guardar cambios
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <v-row v-else>
      <v-col cols="12" class="text-center">
        <v-icon x-large color="grey lighten-1">mdi-account-off-outline</v-icon>
        <h2 class="text-h5 mt-4">No has iniciado sesión</h2>
        <p class="text-body-1">Debes iniciar sesión para ver tu perfil</p>
        <v-btn color="primary" class="mt-4" to="/login"> Iniciar sesión </v-btn>
      </v-col>
    </v-row>

    <!-- Diálogo para cambiar contraseña -->
    <v-dialog v-model="changePasswordDialog" max-width="500">
      <v-card>
        <v-card-title>Cambiar contraseña</v-card-title>
        <v-card-text>
          <v-form ref="passwordForm" v-model="passwordFormValid">
            <v-text-field
              v-model="passwordData.currentPassword"
              label="Contraseña actual"
              type="password"
              outlined
              :rules="passwordRules"
            ></v-text-field>
            <v-text-field
              v-model="passwordData.newPassword"
              label="Nueva contraseña"
              type="password"
              outlined
              :rules="newPasswordRules"
            ></v-text-field>
            <v-text-field
              v-model="passwordData.confirmPassword"
              label="Confirmar nueva contraseña"
              type="password"
              outlined
              :rules="confirmPasswordRules"
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="changePasswordDialog = false"> Cancelar </v-btn>
          <v-btn
            color="primary"
            :loading="changingPassword"
            :disabled="!passwordFormValid"
            @click="changePassword"
          >
            Cambiar contraseña
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Diálogo para eliminar cuenta -->
    <v-dialog v-model="deleteAccountDialog" max-width="500">
      <v-card>
        <v-card-title>Eliminar cuenta</v-card-title>
        <v-card-text>
          <p>
            ¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se
            puede deshacer y perderás todos tus datos.
          </p>
          <v-form ref="deleteAccountForm" v-model="deleteAccountFormValid">
            <v-text-field
              v-model="deleteAccountPassword"
              label="Contraseña actual"
              type="password"
              outlined
              :rules="passwordRules"
            ></v-text-field>
            <v-checkbox
              v-model="deleteAccountConfirm"
              label="Confirmo que deseo eliminar mi cuenta permanentemente"
              :rules="[(v) => !!v || 'Debes confirmar esta acción']"
            ></v-checkbox>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="deleteAccountDialog = false"> Cancelar </v-btn>
          <v-btn
            color="error"
            :loading="deletingAccount"
            :disabled="!deleteAccountFormValid"
            @click="deleteAccount"
          >
            Eliminar cuenta
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Diálogo para subir avatar -->
    <v-dialog v-model="avatarUpload" max-width="500">
      <v-card>
        <v-card-title>Cambiar foto de perfil</v-card-title>
        <v-card-text>
          <v-file-input
            v-model="avatarFile"
            label="Seleccionar imagen"
            accept="image/*"
            prepend-icon="mdi-camera"
            outlined
            show-size
            :rules="avatarRules"
          ></v-file-input>
          <v-img
            v-if="avatarPreview"
            :src="avatarPreview"
            max-height="200"
            contain
            class="mt-3"
          ></v-img>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="cancelAvatarUpload"> Cancelar </v-btn>
          <v-btn
            color="primary"
            :loading="uploadingAvatar"
            :disabled="!avatarFile"
            @click="uploadAvatar"
          >
            Subir
          </v-btn>
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
export default {
  name: "ProfileView",
  data() {
    return {
      loading: true,
      saving: false,
      changingPassword: false,
      deletingAccount: false,
      uploadingAvatar: false,
      activeTab: 0,
      personalFormValid: false,
      preferencesFormValid: false,
      notificationsFormValid: false,
      passwordFormValid: false,
      deleteAccountFormValid: false,
      changePasswordDialog: false,
      deleteAccountDialog: false,
      avatarUpload: false,
      avatarFile: null,
      avatarPreview: null,
      deleteAccountPassword: "",
      deleteAccountConfirm: false,
      snackbar: {
        show: false,
        text: "",
        color: "success",
      },
      // Datos del usuario (simulados)
      user: {
        id: "1",
        firstName: "Juan",
        lastName: "Pérez",
        email: "juan.perez@example.com",
        phone: "+34 612 345 678",
        location: "Madrid, España",
        role: "candidate",
        avatar: null,
        createdAt: "2023-01-15T10:30:00Z",
        bio: "Desarrollador Full Stack con experiencia en Vue.js y Node.js.",
        website: "https://juanperez.dev",
        resumeId: "123",
      },
      // Datos del formulario
      profileData: {
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        location: "",
        bio: "",
        website: "",
        language: "es",
        theme: "light",
        skills: [],
        jobPreferences: {
          jobTypes: [],
          locations: [],
          categories: [],
          salaryRange: [25000, 50000],
        },
        privacySettings: {
          profileVisibility: true,
          showContactInfo: true,
        },
        notifications: {
          emailNewsletter: true,
          emailJobAlerts: true,
          emailMessages: true,
          appJobAlerts: true,
          appMessages: true,
          appUpdates: true,
        },
      },
      passwordData: {
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      },
      // Opciones para selects
      languages: [
        { text: "Español", value: "es" },
        { text: "English", value: "en" },
        { text: "Français", value: "fr" },
        { text: "Deutsch", value: "de" },
      ],
      themes: [
        { text: "Claro", value: "light" },
        { text: "Oscuro", value: "dark" },
        { text: "Sistema", value: "system" },
      ],
      jobTypes: [
        { text: "Tiempo completo", value: "full-time" },
        { text: "Medio tiempo", value: "part-time" },
        { text: "Freelance", value: "freelance" },
        { text: "Contrato", value: "contract" },
        { text: "Prácticas", value: "internship" },
      ],
      locationOptions: [
        { text: "Madrid", value: "madrid" },
        { text: "Barcelona", value: "barcelona" },
        { text: "Valencia", value: "valencia" },
        { text: "Sevilla", value: "sevilla" },
        { text: "Remoto", value: "remote" },
      ],
      categoryOptions: [
        { text: "Tecnología", value: "technology" },
        { text: "Marketing", value: "marketing" },
        { text: "Diseño", value: "design" },
        { text: "Ventas", value: "sales" },
        { text: "Educación", value: "education" },
      ],
      skillSuggestions: [
        "JavaScript",
        "Vue.js",
        "React",
        "Angular",
        "Node.js",
        "Python",
        "Java",
        "PHP",
        "HTML",
        "CSS",
        "SQL",
        "MongoDB",
        "Docker",
        "AWS",
        "Git",
        "Agile",
      ],
      // Reglas de validación
      nameRules: [
        (v) => !!v || "Este campo es obligatorio",
        (v) =>
          (v && v.length <= 50) ||
          "El nombre debe tener menos de 50 caracteres",
      ],
      phoneRules: [
        (v) =>
          !v || /^\+?[0-9\s-]{7,15}$/.test(v) || "Formato de teléfono inválido",
      ],
      bioRules: [
        (v) =>
          !v ||
          v.length <= 500 ||
          "La biografía debe tener menos de 500 caracteres",
      ],
      passwordRules: [(v) => !!v || "La contraseña es obligatoria"],
      newPasswordRules: [
        (v) => !!v || "La nueva contraseña es obligatoria",
        (v) =>
          (v && v.length >= 8) ||
          "La contraseña debe tener al menos 8 caracteres",
        (v) =>
          /[A-Z]/.test(v) ||
          "La contraseña debe contener al menos una mayúscula",
        (v) =>
          /[0-9]/.test(v) || "La contraseña debe contener al menos un número",
      ],
      confirmPasswordRules: [
        (v) => !!v || "Debes confirmar la contraseña",
        (v) =>
          v === this.passwordData.newPassword || "Las contraseñas no coinciden",
      ],
      avatarRules: [
        (v) => !v || v.size < 2000000 || "La imagen debe ser menor de 2MB",
        (v) =>
          !v || /^image\//.test(v.type) || "El archivo debe ser una imagen",
      ],
    };
  },
  computed: {
    isFormValid() {
      // Verifica si el formulario activo es válido
      if (this.activeTab === 0) {
        return this.personalFormValid;
      } else if (this.activeTab === 1) {
        return this.preferencesFormValid;
      } else if (this.activeTab === 2) {
        return this.notificationsFormValid;
      }
      return false;
    },
  },
  watch: {
    avatarFile(file) {
      if (file) {
        this.createAvatarPreview(file);
      } else {
        this.avatarPreview = null;
      }
    },
  },
  created() {
    this.loadUserData();
  },
  methods: {
    loadUserData() {
      // Simula la carga de datos del usuario
      setTimeout(() => {
        // En un caso real, aquí cargarías los datos del usuario desde tu API
        // this.user = await this.$store.dispatch('auth/getUserProfile');

        // Copia los datos del usuario al formulario
        if (this.user) {
          this.profileData = {
            firstName: this.user.firstName || "",
            lastName: this.user.lastName || "",
            email: this.user.email || "",
            phone: this.user.phone || "",
            location: this.user.location || "",
            bio: this.user.bio || "",
            website: this.user.website || "",
            language: this.user.language || "es",
            theme: this.user.theme || "light",
            skills: this.user.skills || [],
            jobPreferences: {
              jobTypes: this.user.jobPreferences?.jobTypes || [],
              locations: this.user.jobPreferences?.locations || [],
              categories: this.user.jobPreferences?.categories || [],
              salaryRange: this.user.jobPreferences?.salaryRange || [
                25000, 50000,
              ],
            },
            privacySettings: {
              profileVisibility:
                this.user.privacySettings?.profileVisibility !== false,
              showContactInfo:
                this.user.privacySettings?.showContactInfo !== false,
            },
            notifications: {
              emailNewsletter:
                this.user.notifications?.emailNewsletter !== false,
              emailJobAlerts: this.user.notifications?.emailJobAlerts !== false,
              emailMessages: this.user.notifications?.emailMessages !== false,
              appJobAlerts: this.user.notifications?.appJobAlerts !== false,
              appMessages: this.user.notifications?.appMessages !== false,
              appUpdates: this.user.notifications?.appUpdates !== false,
            },
          };
        }

        this.loading = false;
      }, 1000);
    },

    async saveProfile() {
      if (!this.isFormValid) return;

      try {
        this.saving = true;

        // Simula la actualización del perfil
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // En un caso real, aquí enviarías los datos a tu API
        // await this.$store.dispatch('auth/updateUserProfile', this.profileData);

        // Actualiza los datos del usuario en el estado local
        this.user = {
          ...this.user,
          firstName: this.profileData.firstName,
          lastName: this.profileData.lastName,
          phone: this.profileData.phone,
          location: this.profileData.location,
          bio: this.profileData.bio,
          website: this.profileData.website,
          // ... otros campos que se actualicen
        };

        this.showSnackbar("Perfil actualizado correctamente", "success");
      } catch (error) {
        console.error("Error updating profile:", error);
        this.showSnackbar("Error al actualizar el perfil", "error");
      } finally {
        this.saving = false;
      }
    },

    resetForm() {
      // Restaura los datos del formulario a los valores actuales del usuario
      this.loadUserData();

      // Resetea la validación de los formularios
      if (this.$refs.personalForm) this.$refs.personalForm.resetValidation();
      if (this.$refs.preferencesForm)
        this.$refs.preferencesForm.resetValidation();
      if (this.$refs.notificationsForm)
        this.$refs.notificationsForm.resetValidation();
    },

    async changePassword() {
      if (!this.passwordFormValid) return;

      try {
        this.changingPassword = true;

        // Simula el cambio de contraseña
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // En un caso real, aquí enviarías los datos a tu API
        // await this.$store.dispatch('auth/changePassword', this.passwordData);

        this.showSnackbar("Contraseña actualizada correctamente", "success");
        this.changePasswordDialog = false;
        this.passwordData = {
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        };
      } catch (error) {
        console.error("Error changing password:", error);
        this.showSnackbar("Error al cambiar la contraseña", "error");
      } finally {
        this.changingPassword = false;
      }
    },

    async deleteAccount() {
      if (!this.deleteAccountFormValid) return;

      try {
        this.deletingAccount = true;

        // Simula la eliminación de la cuenta
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // En un caso real, aquí enviarías los datos a tu API
        // await this.$store.dispatch('auth/deleteAccount', { password: this.deleteAccountPassword });

        this.showSnackbar("Cuenta eliminada correctamente", "success");
        this.deleteAccountDialog = false;

        // Redirige al usuario a la página de inicio
        setTimeout(() => {
          this.$router.push("/");
        }, 1500);
      } catch (error) {
        console.error("Error deleting account:", error);
        this.showSnackbar("Error al eliminar la cuenta", "error");
      } finally {
        this.deletingAccount = false;
      }
    },

    createAvatarPreview(file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.avatarPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    },

    async uploadAvatar() {
      if (!this.avatarFile) return;

      try {
        this.uploadingAvatar = true;

        // Simula la subida del avatar
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // En un caso real, aquí subirías la imagen a tu API
        // const response = await this.$store.dispatch('auth/uploadAvatar', this.avatarFile);
        // const avatarUrl = response.data.url;

        // Simulamos la URL del avatar
        const avatarUrl = this.avatarPreview;

        // Actualiza el avatar del usuario
        this.user.avatar = avatarUrl;

        this.showSnackbar(
          "Foto de perfil actualizada correctamente",
          "success"
        );
        this.avatarUpload = false;
        this.avatarFile = null;
        this.avatarPreview = null;
      } catch (error) {
        console.error("Error uploading avatar:", error);
        this.showSnackbar("Error al subir la foto de perfil", "error");
      } finally {
        this.uploadingAvatar = false;
      }
    },

    cancelAvatarUpload() {
      this.avatarUpload = false;
      this.avatarFile = null;
      this.avatarPreview = null;
    },

    async removeAvatar() {
      try {
        // Simula la eliminación del avatar
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // En un caso real, aquí eliminarías el avatar en tu API
        // await this.$store.dispatch('auth/removeAvatar');

        // Elimina el avatar del usuario
        this.user.avatar = null;

        this.showSnackbar("Foto de perfil eliminada correctamente", "success");
      } catch (error) {
        console.error("Error removing avatar:", error);
        this.showSnackbar("Error al eliminar la foto de perfil", "error");
      }
    },

    formatDate(dateString) {
      if (!dateString) return "";

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
.profile-view {
  padding-bottom: 60px;
}
</style>
