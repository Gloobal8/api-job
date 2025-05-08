<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="10" md="8" lg="6">
        <v-card class="elevation-12">
          <v-toolbar color="primary" dark flat>
            <v-toolbar-title>Register</v-toolbar-title>
            <v-spacer></v-spacer>
          </v-toolbar>
          
          <v-card-text>
            <v-alert
              v-if="error"
              type="error"
              dismissible
              @input="error = null"
            >
              {{ error }}
            </v-alert>
            <v-alert
              v-if="success"
              type="success"
              dismissible
            >
              {{ success }}
            </v-alert>
            
            <v-form ref="form" v-model="valid" @submit.prevent="register">
              <v-text-field
                v-model="name"
                :rules="nameRules"
                label="Full Name"
                prepend-icon="mdi-account"
                required
              ></v-text-field>
              
              <v-text-field
                v-model="email"
                :rules="emailRules"
                label="Email"
                prepend-icon="mdi-email"
                type="email"
                required
              ></v-text-field>
              
              <v-text-field
                v-model="password"
                :rules="passwordRules"
                label="Password"
                prepend-icon="mdi-lock"
                :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append-inner="showPassword = !showPassword"
                :type="showPassword ? 'text' : 'password'"
                required
              ></v-text-field>
              
              <v-text-field
                v-model="confirmPassword"
                :rules="confirmPasswordRules"
                label="Confirm Password"
                prepend-icon="mdi-lock-check"
                :type="showPassword ? 'text' : 'password'"
                required
              ></v-text-field>
              
              <v-radio-group
                v-model="role"
                :rules="roleRules"
                row
                required
              >
                <v-radio
                  label="Job Seeker"
                  value="jobseeker"
                ></v-radio>
                <v-radio
                  label="Employer"
                  value="employer"
                ></v-radio>
              </v-radio-group>
            </v-form>
          </v-card-text>
          
          <v-card-actions class="d-flex justify-center ">
            <v-btn
              color="primary"
              :loading="loading"
              :disabled="!valid || loading"
              @click="register"
            >
              Register
            </v-btn>
          </v-card-actions>
          
          <v-card-text class="text-center">
            Already have an account?
            <v-btn text color="primary" to="/login">
              Login
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="showSuccessDialog" max-width="500" persistent>
      <v-card>
        <v-card-title class="text-h5 bg-success text-white">
          Registro exitoso
        </v-card-title>
        <v-card-text class="pt-4">
          <p>¡Tu cuenta ha sido creada con éxito!</p>
          <p>
            Hemos enviado un correo de verificación a
            <strong>{{ email }}</strong
            >. Por favor, revisa tu bandeja de entrada y haz clic en el enlace
            de verificación para activar tu cuenta.
          </p>

          <div v-if="emailPreviewUrl" class="mt-4">
            <p class="text-caption">
              (Modo desarrollo:
              <a :href="emailPreviewUrl" target="_blank"
                >Ver email de verificación</a
              >)
            </p>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="goToLogin">
            Ir a inicio de sesión
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
export default {
  name: 'RegisterView',
  data() {
    return {
      valid: false,
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'jobseeker',
      showPassword: false,
      loading: false,
      error: null,
      success: null,
      showSuccessDialog: false,
      nameRules: [
        v => !!v || 'Name is required',
        v => v.length >= 3 || 'Name must be at least 3 characters'
      ],
      emailRules: [
        v => !!v || 'Email is required',
        v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Email must be valid'
      ],
      passwordRules: [
        v => !!v || 'Password is required',
        v => v.length >= 6 || 'Password must be at least 6 characters'
      ],
      roleRules: [
        v => !!v || 'Please select a role'
      ]
    }
  },
  computed: {
    confirmPasswordRules() {
      return [
        v => !!v || 'Please confirm your password',
        v => v === this.password || 'Passwords do not match'
      ]
    }
  },
  methods: {
    register() {
      if (this.$refs.form.validate()) {
        this.loading = true;
        this.error = null;
        this.success = null;
        
        this.$store.dispatch('register', {
          name: this.name,
          email: this.email,
          password: this.password,
          role: this.role
        })
          .then(() => {
            // Show success message and redirect to login
            this.success = 'User registered successfully';
            this.showSuccessDialog = true;
            localStorage.setItem("pendingVerificationEmail", this.email);
          })
          .catch(error => {
            this.error = error.response?.data?.message || 'Registration failed. Please try again.';
          })
          .finally(() => {
            this.loading = false;
          });
      }
    },
    goToLogin() {
      this.showSuccessDialog = false;
      this.$router.push({
        path: '/login',
        query: { registered: 'success' }
      });
    },
  }
}
</script>