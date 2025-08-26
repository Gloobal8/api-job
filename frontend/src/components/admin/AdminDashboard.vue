<template>
  <div>
    <v-card elevation="2" class="mb-4">
      <v-card-title class="text-h5">
        <v-icon left color="info">mdi-shield</v-icon>
        Panel de Administrador
      </v-card-title>
      <v-card-text>
        <p class="text-body-1">Panel de administración para gestionar usuarios y contenido del sistema.</p>
      </v-card-text>
    </v-card>

    <v-row>
      <v-col cols="12" md="6">
        <v-card elevation="2">
          <v-card-title class="text-h6">
            <v-icon left color="primary">mdi-account-multiple</v-icon>
            Gestión de Usuarios
          </v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item>
                <v-list-item-title>Usuarios Registrados</v-list-item-title>
                <v-list-item-subtitle>456 usuarios</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>Usuarios Verificados</v-list-item-title>
                <v-list-item-subtitle>398 usuarios</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>Usuarios Suspendidos</v-list-item-title>
                <v-list-item-subtitle>3 usuarios</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card elevation="2">
          <v-card-title class="text-h6">
            <v-icon left color="success">mdi-file-document</v-icon>
            Gestión de Contenido
          </v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item>
                <v-list-item-title>Artículos Publicados</v-list-item-title>
                <v-list-item-subtitle>89 artículos</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>Artículos Pendientes</v-list-item-title>
                <v-list-item-subtitle>12 artículos</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>Comentarios</v-list-item-title>
                <v-list-item-subtitle>234 comentarios</v-list-item-subtitle>
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
  name: 'AdminDashboard',
  props: {
    userInfo: {
      type: Object,
      default: () => ({
        nombre: 'Administrador',
        email: 'admin@ejemplo.com',
        rol: 'Administrador'
      })
    }
  },
  data() {
    return {
      users: {
        registered: 456,
        verified: 398,
        suspended: 3
      },
      content: {
        published: 89,
        pending: 12,
        comments: 234
      }
    }
  }
}
</script>
