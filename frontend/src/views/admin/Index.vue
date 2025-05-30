<template>
  <v-container>
    <h1>Dashboard Admin</h1>
    <v-tabs v-model="tab" color="deep-blue accent-4" class="my-5">
      <v-tab value="admins">Administradores</v-tab>
      <v-tab value="rols">Roles</v-tab>
      <v-tab value="permissions">Permisos</v-tab>
      <v-tab value="modules">Módulos</v-tab>
    </v-tabs>
    <v-tabs-items v-model="tab">
      <!-- Administradores Tab -->
      <v-tab-item v-if="tab == 'admins'">
        <SuperAdmin />
      </v-tab-item>
      <!-- Perfiles Tab -->
      <v-tab-item v-if="tab == 'rols'">
        <Rols />
      </v-tab-item>
      <!-- Permisos Tab -->
      <v-tab-item v-if="tab == 'permissions'">
        <h1>Estamos trabajando en los permisos... ¿De verdad verdaita? Si sí, enserio.</h1>
        <!-- <Permissions /> -->
      </v-tab-item>
      <!-- Módulos Tab -->
      <v-tab-item v-if="tab == 'modules'">
        <Modules />
      </v-tab-item>
    </v-tabs-items>
  </v-container>
</template>

<script>
import SuperAdmin from '@/components/admin/SuperAdmin.vue';
import Rols from '@/components/admin/Rols.vue';
import Permissions from '@/components/admin/Permissions.vue';
import Modules from '@/components/admin/Modules.vue';
export default {
  components: {
    SuperAdmin,
    Rols,
    Permissions,
    Modules
  },
  data() {
    return {
      tab: null, // For managing the active tab
      adminSearch: '', // For filtering admin items
      profileSearch: '', // For filtering profile items
      adminHeaders: [
        { title: 'Nombre', key: 'nombre' },
        { title: 'Apellido', key: 'apellido' },
        { title: 'Rol', key: 'rol' },
        { title: 'Acciones', key: 'actions', sortable: false },
      ],
      adminItems: [
        { nombre: 'Juan', apellido: 'Pérez', rol: 'Admin' },
        { nombre: 'Ana', apellido: 'García', rol: 'User' },
      ],
      profileHeaders: [
        { title: 'ID', key: 'id' },
        { title: 'Nombre', key: 'nombre' },
        { title: 'Acciones', key: 'actions', sortable: false },
      ],
      profileItems: [
        { id: 1, nombre: 'Perfil 1' },
        { id: 2, nombre: 'Perfil 2' },
      ],
      permissionHeaders: [
        { title: 'Rol', key: 'rol' },
        { title: 'Permisos', key: 'permissions' },
      ],
      permissionItems: [
        { rol: 'Admin', permissions: { view: true, add: true, edit: true, delete: true, all: true } },
        { rol: 'User', permissions: { view: true, add: false, edit: false, delete: false, all: false } },
      ],
    };
  },
  computed: {
    filteredAdminItems() {
      return this.adminItems.filter(item => {
        return (
          item.nombre.toLowerCase().includes(this.adminSearch.toLowerCase()) ||
          item.apellido.toLowerCase().includes(this.adminSearch.toLowerCase()) ||
          item.rol.toLowerCase().includes(this.adminSearch.toLowerCase())
        );
      });
    },
    filteredProfileItems() {
      return this.profileItems.filter(item => {
        return item.nombre.toLowerCase().includes(this.profileSearch.toLowerCase());
      });
    },
  },
  methods: {
    createAdmin() {
      // Logic for creating an admin
    },
    editAdmin(item) {
      // Logic for editing an admin
    },
    deleteAdmin(item) {
      // Logic for deleting an admin
    },
    createProfile() {
      // Logic for creating a profile
    },
    editProfile(item) {
      // Logic for editing a profile
    },
    deleteProfile(item) {
      // Logic for deleting a profile
    },
  },
};
</script>

<style scoped>
/* Add any additional styles here */
</style>