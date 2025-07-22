<template>
  <v-container class="verify-email-container">
    <v-row justify="center">
      <v-col cols="12" md="6">
        <v-card class="mx-auto mt-5">
          <v-card-title class="text-h5 text-center">
            {{ titleVerification }}
          </v-card-title>

          <v-card-text class="text-center">
            <v-progress-circular
              v-if="loading"
              indeterminate
              color="primary"
              size="64"
              class="mb-4"
            ></v-progress-circular>

            <v-icon v-else-if="verified" color="success" size="64" class="mb-4">
              mdi-check-circle
            </v-icon>

            <v-icon v-else color="error" size="64" class="mb-4">
              mdi-alert-circle
            </v-icon>

            <h3 class="text-h6 mb-4">{{ statusMessage }}</h3>

            <p class="text-body-1 mb-4">{{ statusDescription }}</p>

            <v-btn
              v-if="verified"
              color="primary"
              to="/admin/login"
              class="mb-2"
              block
            >
              Iniciar sesión como administrador
            </v-btn>

            <v-btn
              v-if="!verified && !loading && errorType === 'expired'"
              color="secondary"
              @click="resendVerification"
              :loading="resending"
              class="mb-2"
              block
            >
              Reenviar correo de verificación
            </v-btn>

            <v-btn color="primary" variant="text" to="/" class="mt-4">
              Volver a la página principal
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from "axios";

export default {
  name: "VerifyAdminEmailView",
  data() {
    return {
      loading: true,
      verified: false,
      resending: false,
      statusMessage: "Verificando tu correo de administrador...",
      statusDescription: "Procesando tu solicitud de verificación...",
      errorType: "",
      userEmail: "",
      titleVerification: 'Verificación de correo de administrador'
    };
  },
  async mounted() {
      const token = this.$route.query.token;
      const email = this.$route.query.to;
      if (!token) {
          this.handleError("Token de verificación no proporcionado. Revisa tu bandeja de entrada.", "missing");
          return;
      }
      if (!email) {
          this.handleError("No se encuentra el correo. Intenta registrarte de nuevo.", "missing");
          return;
      }
      try {
        const response = await axios.post("/admins/verify-email", {token});
        if (response.data.status) {
          this.loading = false
          this.verified = true
          this.statusMessage = response.data.message;
          this.statusDescription = 'Verificación completada';
        } else {
          this.statusMessage = response.data.message;
          if (response.data?.type === 'expired') {
            this.resendVerification()
            this.loading = false
            this.statusDescription = "Se enviará un nuevo enlace de verificación a tu correo.";
          }
        }
      } catch (error) {
          this.handleError("Error al verificar el correo. Intenta de nuevo.", "error");
      }
  },
  methods: {
    handleError(message, type) {
      this.loading = false;
      this.verified = false;
      this.statusMessage = "La validación ha fallado";
      this.statusDescription = message;
      this.errorType = type;
    },

    async resendVerification() {
      setTimeout(() => {
        this.loading = true
        this.titleVerification = 'Enviando correo...'
      }, 1000);
      const email = this.$route.query.to;
      const response = await axios.post("/admin/resend-verification", { email });
      if (response.data.status) {
        this.titleVerification = 'Revisa tu bandeja de entrada'
        this.statusMessage = response.data.message
        this.statusDescription = 'Haz clic en el enlace de confirmación para activar tu cuenta.'
      } else {
        this.titleVerification = 'Ooops...'
        this.statusMessage = 'No se pudo enviar el correo. Intenta registrarte de nuevo.'
        this.loading = false
        this.titleVerification = response.data.message
      }
      this.resending = false;
    },
  },
};
</script>

<style scoped>
.verify-email-container {
  padding-top: 2rem;
  padding-bottom: 2rem;
}
</style> 