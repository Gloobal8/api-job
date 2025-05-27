<template>
  <div>
    <v-data-table
      :headers="adminHeaders"
      :items="admins"
      :search="adminSearch"
      :loading="loading"
      class="elevation-1"
    >
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>Administradores</v-toolbar-title>
          <v-divider class="mx-4" inset vertical></v-divider>
          <v-spacer></v-spacer>
          <v-text-field
            v-model="adminSearch"
            append-icon="mdi-magnify"
            label="Buscar"
            single-line
            hide-details
            class="mr-4"
          ></v-text-field>
          <v-btn color="primary" dark @click="openModal">
            <v-icon left>mdi-plus</v-icon>
            Nuevo Administrador
          </v-btn>
        </v-toolbar>
      </template>

      <template v-slot:item.rol="{ item }">
        {{ item.rol.role }}
      </template>

      <template v-slot:item.actions="{ item }">
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn icon v-on="on" @click="editAdmin(item)" class="mr-2">
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
        <v-alert type="info" class="ma-2">No hay administradores disponibles</v-alert>
      </template>
    </v-data-table>

    <!-- Dialog para crear/editar administrador -->
    <v-dialog v-model="modal" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="text-h5">{{ isEdit ? 'Editar Administrador' : 'Crear Nuevo Administrador' }}</span>
        </v-card-title>

        <v-card-text>
          <v-container>
            <v-form ref="form" v-model="valid" @submit.prevent="saveAdmin">
              <v-row>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="formData.nombre"
                    :rules="[rules.required, rules.minLength]"
                    label="Nombre*"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="formData.apellido"
                    :rules="[rules.required, rules.minLength]"
                    label="Apellido*"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-model="formData.correo"
                    :rules="[rules.required, rules.email]"
                    label="Correo Electrónico*"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-select
                    v-model="formData.rolId"
                    :items="roles"
                    :return-object="false"
                    dense
                    outlined
                    :rules="[rules.required]"
                    label="Rol*"
                    required
                  ></v-select>
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
            @click="saveAdmin"
          >
            {{ isEdit ? 'Actualizar' : 'Crear' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog de confirmación para eliminar -->
    <v-dialog v-model="dialogDelete" max-width="500px">
      <v-card>
        <v-card-title class="text-h5">¿Estás seguro de eliminar este administrador?</v-card-title>
        <v-card-text>
          Esta acción no se puede deshacer. El administrador será desactivado del sistema.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey darken-1" text @click="closeDelete">Cancelar</v-btn>
          <v-btn 
            color="error" 
            text 
            :loading="loading"
            @click="deleteAdminConfirmed"
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
  name: 'SuperAdmin',
  data() {
    return {
      adminSearch: '',
      modal: false,
      dialogDelete: false,
      loading: false,
      valid: true,
      isEdit: false,
      formData: this.getEmptyFormData(),
      adminToDelete: null,
      snackbar: {
        show: false,
        text: '',
        color: 'success'
      },
      adminHeaders: [
        { text: 'Nombre', value: 'nombre', sortable: true },
        { text: 'Apellido', value: 'apellido', sortable: true },
        { text: 'Correo', value: 'correo', sortable: true },
        { text: 'Rol', value: 'rolId', sortable: true },
        { text: 'Acciones', value: 'actions', sortable: false, align: 'center' }
      ],
      rules: {
        required: v => !!v || 'Este campo es requerido',
        minLength: v => (v && v.length >= 2) || 'Mínimo 2 caracteres',
        email: v => /.+@.+\..+/.test(v) || 'El correo debe ser válido'
      }
    };
  },
  computed: {
    ...mapState({
      admins: state => state.admin.admins,
      roles: state => {
        const rolesArray = state.admin.roles.map(rol => rol.nombreRol);
        return rolesArray;
      }
    })
  },
  methods: {
    ...mapActions([
      'getAllAdmins',
      'getAllRoles',
      'addAdmin',
      'editAdminAction',
      'deleteAdmin'
    ]),
    getEmptyFormData() {
      return {
        nombre: '',
        apellido: '',
        correo: '',
        rolId: ''
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
    editAdmin(item) {
      this.isEdit = true;
      this.formData = { 
        _id: item._id,
        nombre: item.nombre,
        apellido: item.apellido,
        correo: item.correo,
        rolId: item.rolId
      };
      this.modal = true;
    },
    confirmDelete(item) {
      this.adminToDelete = item;
      this.dialogDelete = true;
    },
    closeDelete() {
      this.dialogDelete = false;
      this.adminToDelete = null;
    },
    showMessage(text, color = 'success') {
      this.snackbar = {
        show: true,
        text,
        color
      };
    },
    async saveAdmin() {
      if (!this.$refs.form.validate()) return;

      try {
        this.loading = true;
        if (this.isEdit) {
          await this.editAdminAction(this.formData);
          this.showMessage('Administrador actualizado exitosamente');
        } else {
          await this.addAdmin(this.formData);
          this.showMessage('Administrador creado exitosamente');
        }
        this.closeModal();
        this.loadData();
      } catch (error) {
        this.showMessage(error.response?.data?.message || 'Error al guardar el administrador', 'error');
      } finally {
        this.loading = false;
      }
    },
    async deleteAdminConfirmed() {
      if (!this.adminToDelete) return;

      try {
        this.loading = true;
        await this.deleteAdmin(this.adminToDelete);
        this.showMessage('Administrador eliminado exitosamente');
        this.loadData();
      } catch (error) {
        this.showMessage(error.response?.data?.message || 'Error al eliminar el administrador', 'error');
      } finally {
        this.loading = false;
        this.closeDelete();
      }
    },
    async loadData() {
      try {
        this.loading = true;
        await Promise.all([
          this.getAllAdmins(),
          this.getAllRoles()
        ]);
      } catch (error) {
        this.showMessage('Error al cargar los datos', 'error');
      } finally {
        this.loading = false;
      }
    }
  },
  mounted() {
    this.loadData();
  }
};
</script>

<style scoped>
.v-data-table ::v-deep .v-data-table__wrapper {
  overflow-x: auto;
}
</style>