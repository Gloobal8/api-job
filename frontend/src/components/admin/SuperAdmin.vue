<template>
  <div>

    <v-data-table :headers="adminHeaders" :items="filteredAdminItems" class="elevation-1">
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>Administradores</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-text-field v-model="adminSearch" label="Buscar" append-icon="mdi-magnify" single-line hide-details>
          </v-text-field>
          <v-btn color="primary" @click="openModal">Crear Administrador</v-btn>
        </v-toolbar>
      </template>
      <template v-slot:item.actions="{ item }">
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn icon v-on="on" @click="editAdmin(item)">
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
          </template>
          <span>Editar</span>
        </v-tooltip>
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn icon v-on="on" @click="deleteAdmin(item)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </template>
          <span>Eliminar</span>
        </v-tooltip>
      </template>
    </v-data-table>
    <v-dialog v-model="modal" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="headline">{{ isEdit ? 'Editar Administrador' : 'Crear Administrador' }}</span>
        </v-card-title>
        <v-card-text>
          <v-form ref="form" v-model="valid">
            <v-text-field v-model="formData.nombre" label="Nombre" :rules="[rules.required]" required></v-text-field>
            <v-text-field v-model="formData.apellido" label="Apellido" :rules="[rules.required]" required>
            </v-text-field>
            <v-text-field v-model="formData.correo" label="Correo" :rules="[rules.email]" required></v-text-field>
            <v-select v-model="formData.rol" :items="roles" label="Rol" :rules="[rules.required]" required></v-select>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="closeModal">Cancelar</v-btn>
          <v-btn color="primary" @click="saveAdmin">{{ isEdit ? 'Actualizar' : 'Crear' }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
  import {
    mapActions
  } from 'vuex';

  export default {
    name: 'SuperAdmin',
    data() {
      return {
        adminSearch: '',
        modal: false,
        isEdit: false,
        formData: {
          nombre: '',
          apellido: '',
          correo: '',
          rol: '',
        },
        roles: ['Admin', 'User'], // Define the roles
        adminHeaders: [{
            title: 'Nombre',
            key: 'nombre'
          },
          {
            title: 'Apellido',
            key: 'apellido'
          },
          {
            title: 'Correo',
            key: 'correo'
          },
          {
            title: 'Rol',
            key: 'rol'
          },
          {
            title: 'Acciones',
            key: 'actions',
            sortable: false
          },
        ],
        adminItems: [], // This will be populated from the Vuex store
        rules: {
          required: value => !!value || 'Required.',
          email: value => {
            const pattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
            return pattern.test(value) || 'Invalid e-mail.';
          },
        },
      };
    },
    computed: {
      filteredAdminItems() {
        return this.adminItems.filter(item => {
          return (
            item.nombre.toLowerCase().includes(this.adminSearch.toLowerCase()) ||
            item.apellido.toLowerCase().includes(this.adminSearch.toLowerCase()) ||
            item.correo.toLowerCase().includes(this.adminSearch.toLowerCase()) ||
            item.rol.toLowerCase().includes(this.adminSearch.toLowerCase())
          );
        });
      },
    },
    methods: {
      ...mapActions('admin', ['addAdmin', 'editAdminAction', 'deleteAdmin']),
      openModal() {
        this.isEdit = false;
        this.formData = {
          nombre: '',
          apellido: '',
          correo: '',
          rol: ''
        };
        this.modal = true;
      },
      closeModal() {
        this.modal = false;
      },
      saveAdmin() {
        if (this.isEdit) {
          this.editAdminAction(this.formData);
        } else {
          this.addAdmin(this.formData);
        }
        this.closeModal();
      },
      editAdmin(item) {
        this.isEdit = true;
        this.formData = {
          ...item
        }; // Populate form with selected item data
        this.modal = true;
      },
      deleteAdmin(item) {
        this.deleteAdmin(item); // Call the delete action from Vuex
      },
    },
    mounted() {
      // Fetch the admin items from the store when the component is mounted
      // this.$store.dispatch('admin/getAllAdmins').then(admins => {
      //   this.adminItems = admins;
      // });
      console.log('Cargando vista de SuperAdmin')
    },
  };
</script>

<style scoped>
  /* Add any additional styles here */
</style>