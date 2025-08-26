<template>
  <div>
    <v-card elevation="2" class="mb-4">
      <v-card-title class="text-h5">
        <v-icon left color="warning">mdi-shield-account</v-icon>
        Panel de Moderador
      </v-card-title>
      <v-card-text>
        <p class="text-body-1">Panel de moderación para gestionar contenido y usuarios del sistema.</p>
      </v-card-text>
    </v-card>

    <v-row>
      <v-col cols="12" md="6">
        <v-card elevation="2">
          <v-card-title class="text-h6">
            <v-icon left color="error">mdi-flag</v-icon>
            Reportes Pendientes
          </v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item>
                <v-list-item-title>Contenido Reportado</v-list-item-title>
                <v-list-item-subtitle>3 reportes pendientes</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>Usuarios Reportados</v-list-item-title>
                <v-list-item-subtitle>1 usuario pendiente</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card elevation="2">
          <v-card-title class="text-h6">
            <v-icon left color="success">mdi-check-circle</v-icon>
            Acciones Recientes
          </v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item>
                <v-list-item-title>Contenido Aprobado</v-list-item-title>
                <v-list-item-subtitle>12 artículos esta semana</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>Contenido Rechazado</v-list-item-title>
                <v-list-item-subtitle>2 artículos esta semana</v-list-item-subtitle>
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
  name: 'ModeratorDashboard',
  props: {
    userInfo: {
      type: Object,
      default: () => ({
        nombre: 'Moderador',
        email: 'moderador@ejemplo.com',
        rol: 'Moderador'
      })
    }
  },
  data() {
    return {
      reports: {
        content: 3,
        users: 1
      },
      actions: {
        approved: 12,
        rejected: 2
      }
    }
  }
}
</script>
