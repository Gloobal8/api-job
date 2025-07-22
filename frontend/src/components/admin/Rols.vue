<template>
  <div>
    <v-card elevation="0" class="mb-4">
      <v-card-text class="d-flex" style="justify-content: space-between">
        <div class="d-flex flex-column align-start">
          <div class="text-caption text-uppercase mb-1">Roles</div>
          <div class="text-h4 font-weight-bold">Roles</div>
        </div>
        <div class="d-flex align-center">
          <v-btn color="primary" size="large" class="mx-2" prepend-icon="mdi-plus" @click="openModal">
            Nuevo Rol
          </v-btn>
        </div>
      </v-card-text>
    </v-card>
    <v-card>
      <v-card-text>
        <v-data-table
          v-model="selected"
          :headers="headers.filter(h => h.visible)"
          :items="filteredRoles"
          :search="roleSearch"
          :loading="loading"
          :items-per-page="10"
          show-select
          class="elevation-0"
          @update:modelValue="handleSelectionChange"
        >
          <template v-slot:top>
            <v-toolbar flat color="white">
              <v-toolbar-title class="text-h5 font-weight-bold">
                Roles ({{ filteredRoles.length }})
              </v-toolbar-title>
              <v-spacer></v-spacer>
              <v-menu v-model="menuColumns" :close-on-content-click="false" :persistent="false">
                <template v-slot:activator="{ props }">
                  <v-btn icon v-bind="props">
                    <v-icon color="primary">mdi-eye-outline</v-icon>
                  </v-btn>
                </template>
                <v-card class="column-selector">
                  <v-list>
                    <v-list-item>
                      <v-list-item-title>
                        <v-checkbox
                          v-model="selectAllColumns"
                          :indeterminate="indeterminateColumns"
                          label="Todas"
                          hide-details
                          density="compact"
                          @click.stop="toggleSelectAllColumns"
                        ></v-checkbox>
                      </v-list-item-title>
                    </v-list-item>
                    <v-divider></v-divider>
                    <v-list-item v-for="header in headers" :key="header.value">
                      <v-list-item-title>
                        <v-checkbox
                          v-model="header.visible"
                          :label="header.text"
                          hide-details
                          density="compact"
                          :disabled="header.locked"
                          @click.stop
                        ></v-checkbox>
                      </v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-card>
              </v-menu>
            </v-toolbar>
          </template>

          <template v-slot:headers="{ columns }">
            <tr>
              <th class="ps-3" style="width: 48px;"></th>
              <th v-for="column in columns.slice(1)" :key="column.key" style="cursor: pointer">
                <div style="display: inline-block">
                  {{ column.text }}
                </div>
              </th>
            </tr>
            <tr>
              <th class="ps-3" style="background-color: whitesmoke; width: 48px;">
                <v-checkbox
                  v-model="selectAll"
                  :indeterminate="indeterminate"
                  @click="toggleSelectAll(filteredRoles)"
                  hide-details
                  density="compact"
                  aria-label="Seleccionar todos"
                ></v-checkbox>
              </th>
              <th v-for="column in columns.slice(1)" :key="column.key" style="background-color: whitesmoke">
                <v-text-field
                  v-if="column.value !== 'actions'"
                  v-model="filters[column.value]"
                  :label="column.text"
                  density="compact"
                  variant="outlined"
                  hide-details
                  class="mt-1"
                  clearable
                  elevation="1"
                  bg-color="white"
                  style="font-size: 0.75rem"
                  @update:model-value="applyTableFilters"
                ></v-text-field>
              </th>
            </tr>
          </template>

          <template v-slot:item="{ item }">
            <tr>
              <td class="ps-3">
                <v-checkbox
                  :model-value="selected"
                  :value="item"
                  hide-details
                  density="compact"
                  @update:model-value="handleSelectionChange"
                ></v-checkbox>
              </td>
              <td>{{ item.nombreRol }}</td>
              <td>{{ item.descripcion }}</td>
              <td>
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
              </td>
            </tr>
          </template>

          <template v-slot:no-data>
            <v-alert type="info" class="ma-2">No hay roles disponibles</v-alert>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

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
      headers: [
        { text: 'Nombre del Rol', value: 'nombreRol', sortable: true, visible: true },
        { text: 'Descripción', value: 'descripcion', sortable: true, visible: true },
        { text: 'Acciones', value: 'actions', sortable: false, align: 'center', visible: true }
      ],
      selectAll: false,
      selectAllColumns: false,
      indeterminate: false,
      indeterminateColumns: false,
      filters: {
        nombreRol: '',
        descripcion: ''
      },
      selected: [],
      menuColumns: false,
      rules: {
        required: v => !!v || 'Este campo es requerido',
        minLength: v => (v && v.length >= 3) || 'Mínimo 3 caracteres',
        maxLength: v => !v || v.length <= 200 || 'Máximo 200 caracteres'
      }
    };
  },
  computed: {
    ...mapState({
      rolesRaw: state => Array.isArray(state.admin.roles) ? state.admin.roles : []
    }),
    filteredRoles() {
      // Filtrado reactivo por nombre y descripción
      return this.rolesRaw.filter(role => {
        const nombreRol = this.filters.nombreRol.trim().toLowerCase();
        const descripcion = this.filters.descripcion.trim().toLowerCase();
        let match = true;
        if (nombreRol && !role.nombreRol.toLowerCase().includes(nombreRol)) match = false;
        if (descripcion && !role.descripcion.toLowerCase().includes(descripcion)) match = false;
        return match;
      });
    }
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
    },
    handleSelectionChange(value) {
      this.selected = Array.isArray(value) ? value : [];
      const total = Array.isArray(this.filteredRoles) ? this.filteredRoles.length : 0;
      this.selectAll = this.selected.length === total && total > 0;
      this.indeterminate = this.selected.length > 0 && this.selected.length < total;
    },
    toggleSelectAll(items) {
      this.selected = Array.isArray(items) ? items : [];
      const total = Array.isArray(this.filteredRoles) ? this.filteredRoles.length : 0;
      this.selectAll = this.selected.length === total && total > 0;
      this.indeterminate = this.selected.length > 0 && this.selected.length < total;
    },
    toggleSelectAllColumns() {
      this.headers.forEach(header => {
        header.visible = this.selectAllColumns;
      });
      this.indeterminateColumns = false;
    },
    applyTableFilters() {
      // No es necesario, el filtrado es reactivo en computed: filteredRoles
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