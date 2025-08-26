<template>
  <div>
    <v-card elevation="2" class="mb-4">
      <v-card-title class="text-h5">
        <v-icon left color="success">mdi-crown</v-icon>
        Panel de Super Administrador
      </v-card-title>
      <v-card-text>
        <p class="text-body-1">Panel de control avanzado con acceso completo al sistema y estadísticas detalladas.</p>
      </v-card-text>
    </v-card>

    <v-row>
      <v-col cols="12" md="4">
        <v-card elevation="2">
          <v-card-title class="text-h6">
            <v-icon left color="primary">mdi-account-group</v-icon>
            Usuarios del Sistema
          </v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item>
                <v-list-item-title>Total Usuarios</v-list-item-title>
                <v-list-item-subtitle>1,247 usuarios</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>Usuarios Activos</v-list-item-title>
                <v-list-item-subtitle>1,089 usuarios</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>Nuevos Hoy</v-list-item-title>
                <v-list-item-subtitle>23 usuarios</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card elevation="2">
          <v-card-title class="text-h6">
            <v-icon left color="info">mdi-server</v-icon>
            Estado del Sistema
          </v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item>
                <v-list-item-title>CPU</v-list-item-title>
                <v-list-item-subtitle>45% de uso</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>Memoria</v-list-item-title>
                <v-list-item-subtitle>67% de uso</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>Almacenamiento</v-list-item-title>
                <v-list-item-subtitle>78% de uso</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card elevation="2">
          <v-card-title class="text-h6">
            <v-icon left color="warning">mdi-alert</v-icon>
            Alertas del Sistema
          </v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item>
                <v-list-item-title>Críticas</v-list-item-title>
                <v-list-item-subtitle>0 alertas</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>Advertencias</v-list-item-title>
                <v-list-item-subtitle>2 alertas</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>Informativas</v-list-item-title>
                <v-list-item-subtitle>5 alertas</v-list-item-subtitle>
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
  name: 'SuperAdminDashboard',
  props: {
    userInfo: {
      type: Object,
      default: () => ({
        nombre: 'Super Admin',
        email: 'superadmin@ejemplo.com',
        rol: 'Super Administrador'
      })
    }
  },
  data() {
    return {
      users: {
        total: 1247,
        active: 1089,
        newToday: 23
      },
      system: {
        cpu: 45,
        memory: 67,
        storage: 78
      },
      alerts: {
        critical: 0,
        warning: 2,
        info: 5
      }
    }
  }
}
</script>
