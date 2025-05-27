<template>
  <div>
    <v-data-table
      :headers="roleHeaders"
      :items="roles"
      :search="roleSearch"
      :loading="loading"
      class="elevation-1"
    >
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>Roles</v-toolbar-title>
          <v-divider class="mx-4" inset vertical></v-divider>
          <v-spacer></v-spacer>
          <v-text-field
            v-model="roleSearch"
            append-icon="mdi-magnify"
            label="Buscar"
            single-line
            hide-details
            class="mr-4"
          ></v-text-field>
          <v-btn color="primary" dark @click="openModal">
            <v-icon left>mdi-plus</v-icon>
            Nuevo Rol
          </v-btn>
        </v-toolbar>
      </template>

      <template v-slot:item.actions="{ item }">
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn icon v-on="on" @click="editRole(item)" class="mr-2">
              <v-icon small>mdi-pencil</v-icon>
            </v-btn>
          </template>
          <span>Editar</span>
        </v-tooltip>
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn icon v-on="on" @click="confirmDelete(item)">
              <v-icon small>mdi-delete</v-icon>
            </v-btn>
          </template>
          <span>Eliminar</span>
        </v-tooltip>
      </template>

      <template v-slot:no-data>
        <v-alert type="info" class="ma-2">No hay roles disponibles</v-alert>
      </template>
    </v-data-table>

    <!-- Dialog para crear/editar rol -->
    <v-dialog v-model="modal" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="text-h5">{{ isEdit ? 'Editar Rol' : 'Crear Nuevo Rol' }}</span>
        </v-card-title>

        <v-card-text>
          <v-container>
            <v-form ref="form" v-model="valid" @submit.prevent="saveRole">
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    v-model="formData.nombreRol"
                    :rules="[rules.required, rules.minLength]"
                    label="Nombre del Rol*"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-textarea
                    v-model="formData.descripcion"
                    :rules="[rules.maxLength]"
                    label="Descripción"
                    rows="3"
                  ></v-textarea>
                </v-col>
              </v-row>
            </v-form>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey darken-1" text @click="closeModal">Cancelar</v-btn>
          <v-btn
            color="primary"
            :disabled="!valid || loading"
            :loading="loading"
            @click="saveRole"
          >
            {{ isEdit ? 'Actualizar' : 'Crear' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog de confirmación para eliminar -->
    <v-dialog v-model="dialogDelete" max-width="500px">
      <v-card>
        <v-card-title class="text-h5">¿Estás seguro de eliminar este rol?</v-card-title>
        <v-card-text>
          Esta acción no se puede deshacer. El rol será desactivado del sistema.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey darken-1" text @click="closeDelete">Cancelar</v-btn>
          <v-btn 
            color="error" 
            text 
            :loading="loading"
            @click="deleteRoleConfirmed"
          >
            Eliminar
          </v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar para mensajes -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="3000"
      top
    >
      {{ snackbar.text }}
      <template v-slot:action="{ attrs }">
        <v-btn
          text
          v-bind="attrs"
          @click="snackbar.show = false"
        >
          Cerrar
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
  name: 'RolesManager',
  data() {
    return {
      roleSearch: '',
      modal: false,
      dialogDelete: false,
      loading: false,
      valid: true,
      isEdit: false,
      formData: this.getEmptyFormData(),
      roleToDelete: null,
      snackbar: {
        show: false,
        text: '',
        color: 'success'
      },
      roleHeaders: [
        { text: 'Nombre del Rol', value: 'nombreRol', sortable: true },
        { text: 'Descripción', value: 'descripcion', sortable: true },
        { text: 'Acciones', value: 'actions', sortable: false, align: 'center' }
      ],
      rules: {
        required: v => !!v || 'Este campo es requerido',
        minLength: v => (v && v.length >= 3) || 'Mínimo 3 caracteres',
        maxLength: v => !v || v.length <= 200 || 'Máximo 200 caracteres'
      }
    };
  },
  computed: {
    ...mapState({
      roles: state => state.admin.roles
    })
  },
  methods: {
    ...mapActions([
      'getAllRoles',
      'addRole',
      'editRoleAction',
      'deleteRole'
    ]),
    getEmptyFormData() {
      return {
        nombreRol: '',
        descripcion: ''
      };
    },
    openModal() {
      this.isEdit = false;
      this.formData = this.getEmptyFormData();
      this.modal = true;
    },
    closeModal() {
      this.modal = false;
      this.$nextTick(() => {
        this.formData = this.getEmptyFormData();
        this.$refs.form.reset();
      });
    },
    editRole(item) {
      this.isEdit = true;
      this.formData = { 
        ...this.getEmptyFormData(),
        ...item
      };
      this.modal = true;
    },
    confirmDelete(item) {
      this.roleToDelete = item;
      this.dialogDelete = true;
    },
    closeDelete() {
      this.dialogDelete = false;
      this.roleToDelete = null;
    },
    showMessage(text, color = 'success') {
      this.snackbar = {
        show: true,
        text,
        color
      };
    },
    async saveRole() {
      if (!this.$refs.form.validate()) return;

      try {
        this.loading = true;
        if (this.isEdit) {
          await this.editRoleAction(this.formData);
          this.showMessage('Rol actualizado exitosamente');
        } else {
          await this.addRole(this.formData);
          this.showMessage('Rol creado exitosamente');
        }
        this.closeModal();
        this.loadRoles();
      } catch (error) {
        this.showMessage(error.response?.data?.message || 'Error al guardar el rol', 'error');
      } finally {
        this.loading = false;
      }
    },
    async deleteRoleConfirmed() {
      if (!this.roleToDelete) return;

      try {
        this.loading = true;
        await this.deleteRole(this.roleToDelete);
        this.showMessage('Rol eliminado exitosamente');
        this.loadRoles();
      } catch (error) {
        this.showMessage(error.response?.data?.message || 'Error al eliminar el rol', 'error');
      } finally {
        this.loading = false;
        this.closeDelete();
      }
    },
    async loadRoles() {
      try {
        this.loading = true;
        await this.getAllRoles();
      } catch (error) {
        this.showMessage('Error al cargar los roles', 'error');
      } finally {
        this.loading = false;
      }
    }
  },
  mounted() {
    this.loadRoles();
  }
};
</script>

<style scoped>
.v-data-table ::v-deep .v-data-table__wrapper {
  overflow-x: auto;
}
</style>