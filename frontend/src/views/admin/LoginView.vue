<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card 
          class="elevation-12 position-relative"
          :class="{ 'v-card--loading': loading }"
        >
          <!-- Overlay de loading -->
          <v-overlay
            v-model="loading"
            contained
            persistent
            class="login-overlay"
          >
            <div class="loading-content text-center">
              <v-progress-circular
                indeterminate
                size="80"
                color="primary"
                width="6"
                class="mb-4"
              ></v-progress-circular>
              <div class="text-h5 text-primary mb-3 font-weight-bold">Iniciando Sesión</div>
              <div class="text-body-1 text-grey-darken-1 mb-2">
                {{ loadingMessage }}
              </div>
              <div class="text-caption text-grey">
                Por favor espera, esto puede tomar unos segundos
              </div>
            </div>
          </v-overlay>
          
          <v-toolbar color="primary" dark flat>
            <v-toolbar-title>Login Administrador</v-toolbar-title>
            <v-spacer></v-spacer>
          </v-toolbar>
          
          <!-- Barra de progreso durante el login -->
          <v-progress-linear
            v-if="loading"
            indeterminate
            color="success"
            height="4"
          ></v-progress-linear>
          <v-card-text>
            <v-alert
              v-if="error"
              type="error"
              dismissible
              @input="error = null"
            >
              {{ error }}
            </v-alert>
            
            <!-- Mostrar rol del usuario después del login exitoso -->
            <v-alert
              v-if="userRole && !error"
              type="success"
              class="mb-4"
            >
              <v-icon left>mdi-account-check</v-icon>
              <strong>Rol del usuario:</strong> {{ userRole }}
              <br>
              <small class="text-caption">
                Redirigiendo al panel de administración en 2 segundos...
              </small>
            </v-alert>
            
            <v-form ref="form" v-model="valid" @submit.prevent="login" class="mt-4">
              <v-text-field
                v-model="correo"
                :rules="emailRules"
                label="Correo electrónico"
                prepend-icon="mdi-email"
                type="email"
                required
                :disabled="loading"
                :loading="loading"
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
                :disabled="loading"
                :loading="loading"
              ></v-text-field>
            </v-form>
            
            <!-- Mensaje de estado durante el login -->
            <v-alert
              v-if="loading"
              type="info"
              class="mt-4"
              variant="tonal"
            >
              <v-icon left>mdi-clock-outline</v-icon>
              <strong>Procesando...</strong> Estamos verificando tus credenciales de administrador.
              <div class="mt-2">
                <v-progress-circular
                  indeterminate
                  size="20"
                  color="info"
                  class="mr-2"
                ></v-progress-circular>
                <span class="text-caption">Verificando credenciales...</span>
              </div>
            </v-alert>
          </v-card-text>
          <v-card-actions class="d-flex justify-center">
            <v-btn
              color="primary"
              :loading="loading"
              :disabled="!valid || loading"
              @click="login"
              size="large"
              block
              class="login-btn"
            >
              <v-icon v-if="!loading" left>mdi-login</v-icon>
              <span v-if="!loading">Ingresar</span>
              <span v-else>Iniciando Sesión...</span>
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
      userRole: null, // Variable para almacenar el rol del usuario
      loadingMessage: 'Verificando credenciales de administrador...', // Mensaje dinámico del loading
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
  mounted() {
    // Asegurar que el loading esté en false al montar el componente
    this.loading = false;
    this.loadingMessage = 'Verificando credenciales de administrador...';
  },
  watch: {
    // Detectar cuando se complete la navegación
    '$route'(to, from) {
      if (from.path === '/admin/login' && to.path === '/admin') {
        // La navegación se completó, quitar el loading
        this.loading = false;
      }
    }
  },
  methods: {
    async login() {
      if (this.$refs.form.validate()) {
        this.loading = true;
        this.error = null;
        this.userRole = null; // Limpiar rol anterior
        
        try {
          const res = await this.$store.dispatch('admin/adminLogin', {
            correo: this.correo,
            password: this.password
          });
          
          if (res.data.status) {
            // Capturar el rol del usuario del response
            const adminData = res.data.admin;
            if (adminData && adminData.roleId) {
              this.userRole = adminData.roleId;
              console.log('🔐 Usuario admin logueado con rol:', this.userRole);
            }
            
            // Guardar en localStorage
            localStorage.setItem('admin', JSON.stringify(adminData));
            
            // Mostrar mensaje de éxito antes de redirigir
            this.$store.commit('admin/SET_SUCCESS', '¡Inicio de sesión exitoso! Redirigiendo...');
            
            // Actualizar el mensaje de loading para la redirección
            this.loadingMessage = '¡Login exitoso! Redirigiendo al dashboard...';
            
            // Redirigir inmediatamente sin quitar el loading
            this.$router.push('/admin');
            
            // El loading se mantendrá hasta que se complete la navegación
            // No se ejecuta finally porque queremos que siga cargando
            
          } else {
            this.error = res.data.message;
            this.loading = false; // Solo quitar loading en caso de error
          }
        } catch (error) {
          console.error('❌ Error en login:', error);
          this.error = error.response?.data?.message || 'Error al iniciar sesión. Intenta de nuevo.';
          this.loading = false; // Solo quitar loading en caso de error
        }
      }
    },
    
    // Método para limpiar el formulario
    clearForm() {
      this.correo = '';
      this.password = '';
      this.userRole = null;
      this.error = null;
      this.loadingMessage = 'Verificando credenciales de administrador...';
      this.$refs.form.reset();
    }
  }
}
</script>

<style scoped>
/* Estilos para el estado de loading */
.login-overlay {
  z-index: 1000;
  background-color: rgba(0, 0, 0, 0.8) !important;
}

.loading-content {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  padding: 3rem 2rem;
  border-radius: 24px;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.25);
  min-width: 380px;
  max-width: 420px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
}

.login-btn {
  transition: all 0.3s ease;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.login-btn:active:not(:disabled) {
  transform: translateY(0);
}

/* Animación para los campos durante loading */
.v-text-field--loading {
  opacity: 0.8;
}

/* Estilos para la barra de progreso */
.v-progress-linear {
  border-radius: 0;
}

/* Estilos para el mensaje de estado */
.v-alert--variant-tonal {
  border-left: 4px solid rgb(var(--v-theme-info));
}

/* Efecto de desenfoque durante loading */
.v-card--loading {
  filter: blur(1px);
  transition: filter 0.3s ease;
}

/* Animaciones para el contenido del loading */
.loading-content .v-progress-circular {
  animation: pulse 2s ease-in-out infinite;
}

.loading-content .text-h5 {
  animation: fadeInUp 0.6s ease-out;
}

.loading-content .text-body-1 {
  animation: fadeInUp 0.6s ease-out 0.2s both;
}

.loading-content .text-caption {
  animation: fadeInUp 0.6s ease-out 0.4s both;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>