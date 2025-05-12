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
                to="/login"
                class="mb-2"
                block
              >
                Log In
              </v-btn>
  
              <v-btn
                v-if="!verified && !loading && errorType === 'expired'"
                color="secondary"
                @click="resendVerification"
                :loading="resending"
                class="mb-2"
                block
              >
                Resend verification email
              </v-btn>
  
              <v-btn color="primary" variant="text" to="/" class="mt-4">
                Return to the main page
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
        statusMessage: "Verifying your email...",
        statusDescription: "We are processing your verification request..",
        errorType: "",
        userEmail: "",
        titleVerification: 'Email verification'
      };
    },
    async mounted() {
        const token = this.$route.query.token;
        const email = this.$route.query.to;
        console.log({ token, email })
        if (!token) {
            this.handleError("Verification token not provided. Check your inbox again.", "missing");
            return;
        }
        if (!email) {
            this.handleError("We can't find your email. Please try to register again", "missing");
            return;
        }
        try {
          const response = await this.$store.dispatch("verifyEmail", {token});
          if (response.data.status) {
            this.loading = false
            this.verified = true
            this.statusMessage = response.data.message;
            this.statusDescription = 'Verification process completed';
          } else {
            this.statusMessage = response.data.message;
            if (response.data?.type === 'expired') {
              this.resendVerification()
              this.loading = false
              this.statusDescription = "We will send a new verification link to your email.";
            }
          }
          console.log({
            view: 'VerifyEmail.vue',
            response
          });
        } catch (error) {
            // Handle error (e.g., show an error message)
            console.error(error);
        }
    },
    methods: {
      handleError(message, type) {
        this.loading = false;
        this.verified = false;
        this.statusMessage = "Validation failed";
        this.statusDescription = message;
        this.errorType = type;
      },

      async resendVerification() {
        setTimeout(() => {
          this.loading = true
          this.titleVerification = 'Sending mail...'
        }, 1000);
        const email = this.$route.query.to;

        const response = await axios.post("/auth/resend-verification", { email });

        if (response.data.status) {
          this.titleVerification = 'Check your inbox'
          this.statusMessage = response.data.message
          this.statusDescription = 'Click the "Confirm Email" link to complete your registration.'
        } else {
          this.titleVerification = 'Ooops...'
          this.statusMessage = 'The email could not be sent. Please try to register again.'
          this.loading = false
          this.titleVerification = response.data.message
        }
        
        return console.log('resend email...')

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