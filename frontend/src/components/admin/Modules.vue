<template>
  <div>
    <v-card>
      <v-card-title>
        Módulos
        <v-spacer></v-spacer>
        <v-btn color="primary" prepend-icon="mdi-plus" @click="openDialog()">
          Nuevo Módulo
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-progress-linear
          v-if="loading"
          indeterminate
          color="primary"
        ></v-progress-linear>

        <div v-else-if="!moduleTree || moduleTree.length === 0" class="text-center pa-4">
          No hay módulos disponibles
        </div>
        <v-treeview
          v-else
          :items="formattedModules"
          item-children="children"
          item-title="title"
          open-on-click
          rounded
          hoverable
          activatable
          density="comfortable"
        >
          <template v-slot:prepend="{ item }">
            <v-icon :color="item.children && item.children.length ? 'primary' : 'grey'">
              {{ item.children && item.children.length ? 'mdi-folder' : 'mdi-file' }}
            </v-icon>
          </template>

          <template v-slot:append="{ item }">
            <div class="d-flex align-center">
              <v-chip
                v-if="item.descripcion"
                size="small"
                color="indigo-darken-4"
                class="mr-2"
                variant="outlined"
              >
                {{ item.descripcion }}
              </v-chip>
              <v-btn
                icon="mdi-pencil"
                size="small"
                variant="text"
                @click.stop="openDialog(item)"
              ></v-btn>
              <v-btn
                icon="mdi-delete"
                size="small"
                variant="text"
                color="error"
                @click.stop="confirmDelete(item)"
              ></v-btn>
              <v-btn
                icon="mdi-plus"
                size="small"
                variant="text"
                color="success"
                @click.stop="openDialog(null, item)"
              ></v-btn>
            </div>
          </template>
        </v-treeview>
      </v-card-text>
    </v-card>

    <!-- Diálogo para crear/editar módulo -->
    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title>
          {{ formTitle }}
          <v-spacer></v-spacer>
        </v-card-title>

        <v-card-text>
          <v-container>
            <v-form ref="form" v-model="valid">
              <v-text-field
                v-model="editedItem.nombre"
                :rules="[rules.required]"
                label="Nombre del módulo"
                required
                variant="outlined"
                density="comfortable"
              ></v-text-field>

              <v-textarea
                v-model="editedItem.descripcion"
                :rules="[rules.required]"
                label="Descripción"
                required
                variant="outlined"
                density="comfortable"
                auto-grow
                rows="3"
              ></v-textarea>

              <v-select
                v-if="!editedItem._id"
                v-model="editedItem.parentId"
                :items="moduleList"
                item-title="title"
                item-value="_id"
                label="Módulo padre (opcional)"
                clearable
                variant="outlined"
                density="comfortable"
              ></v-select>
            </v-form>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-1" variant="text" @click="closeDialog">
            Cancelar
          </v-btn>
          <v-btn 
            color="primary" 
            :disabled="!valid" 
            :loading="loading"
            @click="save"
          >
            Guardar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Diálogo de confirmación para eliminar -->
    <v-dialog v-model="dialogDelete" max-width="500px">
      <v-card>
        <v-card-title class="text-h6">
          ¿Estás seguro de eliminar este módulo?
        </v-card-title>
        <v-card-text>
          Esta acción eliminará también todos los submódulos asociados y no se puede deshacer.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-1" variant="text" @click="closeDelete">
            Cancelar
          </v-btn>
          <v-btn 
            color="error" 
            variant="text" 
            :loading="loading"
            @click="deleteItemConfirm"
          >
            Eliminar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar para mensajes -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="3000"
      location="top"
    >
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn
          variant="text"
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
  name: 'Modules',

  data: () => ({
    dialog: false,
    dialogDelete: false,
    valid: true,
    editedItem: {
      nombre: '',
      descripcion: '',
      parentId: null
    },
    defaultItem: {
      nombre: '',
      descripcion: '',
      parentId: null
    },
    rules: {
      required: v => !!v || 'Este campo es requerido'
    },
    snackbar: {
      show: false,
      text: '',
      color: 'success'
    }
  }),

  computed: {
    ...mapState('modules', {
      moduleTree: state => state.moduleTree || [],
      loading: state => state.loading,
      error: state => state.error
    }),

    formattedModules() {
      const formatModule = (module) => {
        const formattedModule = {
          id: module._id,
          _id: module._id, // Mantenemos el _id para las operaciones CRUD
          title: module.nombre,
          descripcion: module.descripcion,
          children: []
        };

        if (module.submodules && module.submodules.length > 0) {
          formattedModule.children = module.submodules.map(submodule => formatModule(submodule));
        }

        return formattedModule;
      };

      return this.moduleTree.map(module => formatModule(module));
    },
    
    moduleList() {
      if (!this.moduleTree) return [];
      const flattenModules = (modules, parentPath = '') => {
        return modules.reduce((acc, module) => {
          const currentPath = parentPath ? `${parentPath} / ${module.nombre}` : module.nombre;
          acc.push({
            _id: module._id,
            title: currentPath
          });
          if (module.submodules && module.submodules.length > 0) {
            acc.push(...flattenModules(module.submodules, currentPath));
          }
          return acc;
        }, []);
      };
      return flattenModules(this.moduleTree);
    },

    formTitle() {
      return this.editedItem._id ? 'Editar Módulo' : 'Nuevo Módulo';
    }
  },

  created() {
    this.initialize();
  },

  methods: {
    ...mapActions('modules', ['fetchModules', 'createModule', 'updateModule', 'deleteModule']),

    async initialize() {
      try {
        await this.fetchModules();
      } catch (error) {
        this.showError('Error al cargar los módulos');
        console.error('Error loading modules:', error);
      }
    },

    openDialog(item = null, parentItem = null) {
      if (item) {
        this.editedItem = {
          _id: item._id,
          nombre: item.title,
          descripcion: item.descripcion,
          parentId: item.parentId
        };
      } else {
        this.editedItem = { ...this.defaultItem };
        if (parentItem) {
          this.editedItem.parentId = parentItem._id;
        }
      }
      this.dialog = true;
    },

    closeDialog() {
      this.dialog = false;
      this.$nextTick(() => {
        this.editedItem = { ...this.defaultItem };
        this.$refs.form.reset();
      });
    },

    async save() {
      if (!this.$refs.form.validate()) return;

      try {
        const moduleData = {
          nombre: this.editedItem.nombre,
          descripcion: this.editedItem.descripcion,
          parentId: this.editedItem.parentId || null
        };

        if (this.editedItem._id) {
          await this.updateModule({ ...moduleData, _id: this.editedItem._id });
          this.showSuccess('Módulo actualizado exitosamente');
        } else {
          await this.createModule(moduleData);
          this.showSuccess('Módulo creado exitosamente');
        }

        this.closeDialog();
      } catch (error) {
        this.showError(error.response?.data?.message || 'Error al guardar el módulo');
      }
    },

    confirmDelete(item) {
      this.editedItem = {
        _id: item._id,
        nombre: item.title,
        descripcion: item.descripcion
      };
      this.dialogDelete = true;
    },

    closeDelete() {
      this.dialogDelete = false;
      this.$nextTick(() => {
        this.editedItem = { ...this.defaultItem };
      });
    },

    async deleteItemConfirm() {
      try {
        await this.deleteModule(this.editedItem._id);
        this.showSuccess('Módulo eliminado exitosamente');
        this.closeDelete();
      } catch (error) {
        this.showError(error.response?.data?.message || 'Error al eliminar el módulo');
      }
    },

    showSuccess(text) {
      this.snackbar = {
        show: true,
        text,
        color: 'success'
      };
    },

    showError(text) {
      this.snackbar = {
        show: true,
        text,
        color: 'error'
      };
    }
  }
};
</script>

<style>
.v-treeview-node__root {
  min-height: 40px !important;
}

.v-treeview-node__content {
  margin-left: 8px;
}

.v-treeview-node__level {
  width: 32px;
}

.v-treeview-node__append {
  min-width: 160px;
}
</style> 