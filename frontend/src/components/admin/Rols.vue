<template>
  <div>
    <v-data-table :headers="roleHeaders" :items="filteredRoleItems" class="elevation-1">
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>Roles</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-text-field v-model="roleSearch" label="Buscar" append-icon="mdi-magnify" single-line hide-details></v-text-field>
          <v-btn color="primary" @click="openModal">Crear Rol</v-btn>
        </v-toolbar>
      </template>
      <template v-slot:item.actions="{ item }">
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn icon v-on="on" @click="editRole(item)">
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
          </template>
          <span>Editar</span>
        </v-tooltip>
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn icon v-on="on" @click="deleteRole(item)">
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
          <span class="headline">{{ isEdit ? 'Editar Rol' : 'Crear Rol' }}</span>
        </v-card-title>
        <v-card-text>
          <v-form ref="form" v-model="valid">
            <v-text-field v-model="formData.nombreRol" label="Nombre del Rol" :rules="[rules.required]" required></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="closeModal">Cancelar</v-btn>
          <v-btn color="primary" @click="saveRole">{{ isEdit ? 'Actualizar' : 'Crear' }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  name: 'RolesManager',
  data() {
    return {
      roleSearch: '',
      modal: false,
      isEdit: false,
      formData: {
        id: null,
        nombreRol: '',
      },
      roleHeaders: [
        { title: 'ID', key: 'id' },
        { title: 'Nombre del Rol', key: 'nombreRol' },
        { title: 'Acciones', key: 'actions', sortable: false },
      ],
      roleItems: [], // This will be populated from the Vuex store
      rules: {
        required: value => !!value || 'Required.',
      },
    };
  },
  computed: {
    filteredRoleItems() {
      return this.roleItems.filter(item => {
        return item.nombreRol.toLowerCase().includes(this.roleSearch.toLowerCase());
      });
    },
  },
  methods: {
    // ...mapActions('roles', ['addRole', 'editRoleAction', 'deleteRole']),
    openModal() {
      this.isEdit = false;
      this.formData = { id: null, nombreRol: '' };
      this.modal = true;
    },
    closeModal() {
      this.modal = false;
    },
    saveRole() {
      if (this.isEdit) {
        this.editRoleAction(this.formData);
      } else {
        // console.log({
        //   data: Object.entries(this.formData),
        //   type: 'add-rol'
        // })
        // this.addRole(this.formData);

        this.$store.dispatch('addRole', this.formData)
      }
      this.closeModal();
    },
    editRole(item) {
      this.isEdit = true;
      this.formData = { ...item }; // Populate form with selected item data
      this.modal = true;
    },
    deleteRole(item) {
      this.deleteRole(item); // Call the delete action from Vuex
    },
  },
  mounted() {
    // Fetch the role items from the store when the component is mounted
    // this.$store.dispatch('roles/getAllRoles').then(roles => {
    //   this.roleItems = roles;
    // });
    console.log('Cargando vista de RolesManager');
  },
};
</script>

<style scoped>
/* Add any additional styles here */
</style>