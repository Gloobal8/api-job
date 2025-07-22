<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="elevation-12">
          <v-toolbar color="primary" dark flat>
            <v-toolbar-title>Login Administrador</v-toolbar-title>
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
            <v-form ref="form" v-model="valid" @submit.prevent="login" class="mt-4">
              <v-text-field
                v-model="correo"
                :rules="emailRules"
                label="Correo electrónico"
                prepend-icon="mdi-email"
                type="email"
                required
              ></v-text-field>
              <v-text-field
                v-model="password"
                :rules="passwordRules"
                label="Contraseña"
                prepend-icon="mdi-lock"
                :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append-inner="showPassword = !showPassword"
                :type="showPassword ? 'text' : 'password'"
                required
              ></v-text-field>
            </v-form>
          </v-card-text>
          <v-card-actions class="d-flex justify-center">
            <v-btn
              color="primary"
              :loading="loading"
              :disabled="!valid || loading"
              @click="login"
            >
              Ingresar
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'AdminLoginView',
  data() {
    return {
      valid: false,
      correo: '',
      password: '',
      showPassword: false,
      loading: false,
      error: null,
      emailRules: [
        v => !!v || 'El correo es requerido',
        v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'El correo debe ser válido'
      ],
      passwordRules: [
        v => !!v || 'La contraseña es requerida',
        v => v.length >= 6 || 'La contraseña debe tener al menos 6 caracteres'
      ]
    }
  },
  methods: {
    async login() {
      if (this.$refs.form.validate()) {
        this.loading = true;
        this.error = null;
        try {
          const res = await this.$store.dispatch('admin/adminLogin', {
            correo: this.correo,
            password: this.password
          });
          if (res.data.status) {
            localStorage.setItem('admin', JSON.stringify(res.data.admin));
            this.$router.push('/admin');
          } else {
            this.error = res.data.message;
          }
        } catch (error) {
          this.error = error.response?.data?.message || 'Error al iniciar sesión. Intenta de nuevo.';
        } finally {
          this.loading = false;
        }
      }
    }
  }
}
</script> 