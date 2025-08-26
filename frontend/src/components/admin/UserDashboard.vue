<template>
  <div>
    <v-card elevation="2" class="mb-4">
      <v-card-title class="text-h5">
        <v-icon left color="primary">mdi-account</v-icon>
        Dashboard de Usuario
      </v-card-title>
      <v-card-text>
        <p class="text-body-1">Bienvenido al panel de usuario. Aquí puedes gestionar tu perfil y ver información básica.</p>
      </v-card-text>
    </v-card>

    <v-row>
      <v-col cols="12" md="6">
        <v-card elevation="2">
          <v-card-title class="text-h6">
            <v-icon left color="info">mdi-account-edit</v-icon>
            Mi Perfil
          </v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item>
                <v-list-item-title>Nombre</v-list-item-title>
                <v-list-item-subtitle>{{ userInfo.nombre }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>Email</v-list-item-title>
                <v-list-item-subtitle>{{ userInfo.email }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>Rol</v-list-item-title>
                <v-list-item-subtitle>{{ userInfo.rol }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card elevation="2">
          <v-card-title class="text-h6">
            <v-icon left color="success">mdi-chart-line</v-icon>
            Estadísticas
          </v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item>
                <v-list-item-title>Actividad Reciente</v-list-item-title>
                <v-list-item-subtitle>5 acciones esta semana</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>Último Acceso</v-list-item-title>
                <v-list-item-subtitle>{{ lastAccess }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
export default {
  name: 'UserDashboard',
  props: {
    userInfo: {
      type: Object,
      default: () => ({
        nombre: 'Usuario Ejemplo',
        email: 'usuario@ejemplo.com',
        rol: 'Usuario'
      })
    }
  },
  data() {
    return {
      lastAccess: new Date().toLocaleDateString()
    }
  }
}
</script>
