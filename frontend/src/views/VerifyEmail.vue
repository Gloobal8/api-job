<template>
    <v-container class="verify-email-container">
      <v-row justify="center">
        <v-col cols="12" md="6">
          <v-card class="mx-auto mt-5">
            <v-card-title class="text-h5 text-center">
              Verificación de Email
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
                to="/login"
                class="mb-2"
                block
              >
                Iniciar sesión
              </v-btn>
  
              <v-btn
                v-if="!verified && !loading && errorType === 'expired'"
                color="secondary"
                @click="resendVerification"
                :loading="resending"
                class="mb-2"
                block
              >
                Reenviar email de verificación
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
    name: "VerifyEmailView",
    data() {
      return {
        loading: true,
        verified: false,
        resending: false,
        statusMessage: "Verificando tu email...",
        statusDescription: "Estamos procesando tu solicitud de verificación.",
        errorType: "",
        userEmail: "",
      };
    },
    async mounted() {
        const token = this.$route.query.token;
        if (!token) {
            this.handleError("Token de verificación no proporcionado.", "missing");
            return;
        }

        try {
            const response = await this.$store.dispatch("verifyEmail", {token});
            // Handle successful verification (e.g., show a success message)
            console.log(response);
        } catch (error) {
            // Handle error (e.g., show an error message)
            console.error(error);
        }
  
     
    },
    methods: {
      handleError(message, type) {
        this.loading = false;
        this.verified = false;
        this.statusMessage = "Verificación fallida";
        this.statusDescription = message;
        this.errorType = type;
      },
      async resendVerification() {
        if (!this.userEmail) {
          this.statusDescription =
            "No podemos reenviar el email porque no conocemos tu dirección de correo. Por favor, intenta registrarte nuevamente.";
          return;
        }
  
        this.resending = true;
  
        try {
          const response = await axios.post("/api/auth/resend-verification", {
            email: this.userEmail,
          });
  
          this.statusMessage = "Email reenviado";
          this.statusDescription =
            "Hemos enviado un nuevo email de verificación. Por favor, revisa tu bandeja de entrada.";
  
          // Si estamos en desarrollo, mostrar el enlace de vista previa
          if (response.data.previewUrl) {
            console.log("Preview URL:", response.data.previewUrl);
            this.statusDescription +=
              " (En desarrollo: revisa la consola para ver el enlace de vista previa)";
          }
        } catch (error) {
          console.error("Error resending verification email:", error);
          this.statusDescription =
            "Hubo un error al reenviar el email de verificación. Por favor, intenta registrarte nuevamente.";
        } finally {
          this.resending = false;
        }
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