<template>
  <div>
    <v-card>
      <v-card-title>
        Módulos
        <v-spacer></v-spacer>
        <v-text-field
          v-model="searchQuery"
          prepend-icon="mdi-magnify"
          label="Buscar módulos"
          single-line
          hide-details
          density="compact"
          class="mx-4"
          style="max-width: 300px"
          clearable
        ></v-text-field>
        <v-btn class="mt-2" color="primary" prepend-icon="mdi-plus" @click="openDialog()">
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
          v-model:open="openNodes"
          :search="searchQuery"
        >
          <template v-slot:prepend="{ item }">
            <v-icon :color="item.children && item.children.length ? 'primary' : 'grey'">
              {{ item.children && item.children.length ? 'mdi-folder' : 'mdi-file' }}
            </v-icon>
          </template>

          <template v-slot:append="{ item }">
            <div class="d-flex align-center">
              <v-btn
                icon="mdi-information"
                size="small"
                variant="text"
                color="info"
                @click.stop="openDescriptionModal(item)"
              ></v-btn>
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

    <!-- Nueva sección para reorganizar módulos -->
    <v-card class="mt-4" hidden>
      <v-card-title class="d-flex align-center">
        Reorganizar Módulos
        <v-spacer></v-spacer>
        <v-btn
          v-if="hasChanges"
          color="warning"
          variant="text"
          size="small"
          prepend-icon="mdi-refresh"
          @click="resetDragModules"
        >
          Deshacer cambios
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-alert
          v-if="hasChanges"
          type="info"
          variant="tonal"
          class="mb-4"
        >
          Has realizado cambios en la organización. Guarda los cambios para aplicarlos.
        </v-alert>

        <div class="draggable-tree pa-2">
          <v-btn
            color="primary"
            variant="text"
            class="mb-4"
            prepend-icon="mdi-unfold-more-horizontal"
            @click="toggleAllNodes"
          >
            {{ allNodesExpanded ? 'Colapsar todo' : 'Expandir todo' }}
          </v-btn>

          <draggable
            v-model="dragModules"
            :group="{ name: 'modules', pull: true, put: true }"
            item-key="_id"
            class="modules-list"
            @end="handleDragEnd"
            @start="handleDragStart"
            :animation="200"
            ghost-class="ghost-module"
            drag-class="dragging-module"
          >
            <template #item="{ element }">
              <div 
                class="tree-node mb-2"
                :class="{ 'is-expanded': expandedNodes.includes(element._id) }"
              >
                <v-hover v-slot="{ isHovering, props }">
                  <v-card 
                    v-bind="props"
                    variant="outlined" 
                    class="pa-2"
                    :class="{ 
                      'module-card': true,
                      'has-children': element.children && element.children.length,
                      'is-dragging': isDragging && draggedNodeId === element._id,
                      'is-hover': isHovering
                    }"
                  >
                    <div class="d-flex align-center">
                      <v-icon
                        v-if="element.children && element.children.length"
                        :icon="expandedNodes.includes(element._id) ? 'mdi-chevron-down' : 'mdi-chevron-right'"
                        class="mr-2 expand-icon"
                        @click.stop="toggleNode(element._id)"
                      ></v-icon>
                      <v-icon
                        v-else
                        class="mr-2 invisible-icon"
                      >
                        mdi-chevron-right
                      </v-icon>
                      <v-icon
                        color="grey-darken-1"
                        class="handle mr-2"
                        style="cursor: move"
                      >
                        mdi-drag
                      </v-icon>
                      <v-icon
                        :color="element.children && element.children.length ? 'primary' : 'grey'"
                        class="mr-2"
                      >
                        {{ element.children && element.children.length ? 'mdi-folder' : 'mdi-file' }}
                      </v-icon>
                      <span class="module-title">{{ element.title }}</span>
                      
                      <v-spacer></v-spacer>
                      
                      <div class="node-actions">
                        <v-btn
                          icon="mdi-arrow-up"
                          variant="text"
                          size="x-small"
                          color="primary"
                          @click="moveToRoot(element)"
                          v-if="element.parentId"
                          :title="'Mover al nivel raíz'"
                        ></v-btn>
                      </div>
                    </div>

                    <div 
                      v-if="element.children && element.children.length" 
                      class="pl-8 mt-2"
                      v-show="expandedNodes.includes(element._id)"
                    >
                      <draggable
                        v-model="element.children"
                        :group="{ name: 'modules', pull: true, put: true }"
                        item-key="_id"
                        class="modules-list"
                        @end="handleDragEnd"
                        @start="handleDragStart"
                        :animation="200"
                        ghost-class="ghost-module"
                        drag-class="dragging-module"
                      >
                        <template #item="{ element: child }">
                          <div class="tree-node mb-2">
                            <v-hover v-slot="{ isHovering, props }">
                              <v-card 
                                v-bind="props"
                                variant="outlined" 
                                class="pa-2"
                                :class="{ 
                                  'module-card': true,
                                  'has-children': child.children && child.children.length,
                                  'is-dragging': isDragging && draggedNodeId === child._id,
                                  'is-hover': isHovering
                                }"
                              >
                                <div class="d-flex align-center">
                                  <v-icon
                                    color="grey-darken-1"
                                    class="handle mr-2"
                                    style="cursor: move"
                                  >
                                    mdi-drag
                                  </v-icon>
                                  <v-icon
                                    :color="child.children && child.children.length ? 'primary' : 'grey'"
                                    class="mr-2"
                                  >
                                    {{ child.children && child.children.length ? 'mdi-folder' : 'mdi-file' }}
                                  </v-icon>
                                  <span class="module-title">{{ child.title }}</span>
                                  
                                  <v-spacer></v-spacer>
                                  
                                  <div class="node-actions">
                                    <v-btn
                                      icon="mdi-arrow-up"
                                      variant="text"
                                      size="x-small"
                                      color="primary"
                                      @click="moveToRoot(child)"
                                      :title="'Mover al nivel raíz'"
                                    ></v-btn>
                                  </div>
                                </div>

                                <div 
                                  v-if="child.children && child.children.length" 
                                  class="pl-8 mt-2"
                                  v-show="expandedNodes.includes(child._id)"
                                >
                                  <draggable
                                    v-model="child.children"
                                    :group="{ name: 'modules', pull: true, put: true }"
                                    item-key="_id"
                                    class="modules-list"
                                    @end="handleDragEnd"
                                    @start="handleDragStart"
                                    :animation="200"
                                    ghost-class="ghost-module"
                                    drag-class="dragging-module"
                                  >
                                    <template #item="{ element: grandChild }">
                                      <div class="tree-node mb-2">
                                        <v-hover v-slot="{ isHovering, props }">
                                          <v-card 
                                            v-bind="props"
                                            variant="outlined" 
                                            class="pa-2"
                                            :class="{ 
                                              'module-card': true,
                                              'has-children': grandChild.children && grandChild.children.length,
                                              'is-dragging': isDragging && draggedNodeId === grandChild._id,
                                              'is-hover': isHovering
                                            }"
                                          >
                                            <div class="d-flex align-center">
                                              <v-icon
                                                v-if="grandChild.children && grandChild.children.length"
                                                :icon="expandedNodes.includes(grandChild._id) ? 'mdi-chevron-down' : 'mdi-chevron-right'"
                                                class="mr-2 expand-icon"
                                                @click.stop="toggleNode(grandChild._id)"
                                              ></v-icon>
                                              <v-icon
                                                v-else
                                                class="mr-2 invisible-icon"
                                              >
                                                mdi-chevron-right
                                              </v-icon>
                                              <v-icon
                                                color="grey-darken-1"
                                                class="handle mr-2"
                                                style="cursor: move"
                                              >
                                                mdi-drag
                                              </v-icon>
                                              <v-icon
                                                :color="grandChild.children && grandChild.children.length ? 'primary' : 'grey'"
                                                class="mr-2"
                                              >
                                                {{ grandChild.children && grandChild.children.length ? 'mdi-folder' : 'mdi-file' }}
                                              </v-icon>
                                              <span class="module-title">{{ grandChild.title }}</span>
                                              
                                              <v-spacer></v-spacer>
                                              
                                              <div class="node-actions">
                                                <v-btn
                                                  icon="mdi-arrow-up"
                                                  variant="text"
                                                  size="x-small"
                                                  color="primary"
                                                  @click="moveToRoot(grandChild)"
                                                  :title="'Mover al nivel raíz'"
                                                ></v-btn>
                                              </div>
                                            </div>

                                            <div 
                                              v-if="grandChild.children && grandChild.children.length" 
                                              class="pl-8 mt-2"
                                              v-show="expandedNodes.includes(grandChild._id)"
                                            >
                                              <draggable
                                                v-model="grandChild.children"
                                                :group="{ name: 'modules', pull: true, put: true }"
                                                item-key="_id"
                                                class="modules-list"
                                                @end="handleDragEnd"
                                                @start="handleDragStart"
                                                :animation="200"
                                                ghost-class="ghost-module"
                                                drag-class="dragging-module"
                                              >
                                                <template #item="{ element: greatGrandChild }">
                                                  <ModuleNode 
                                                    :module="greatGrandChild"
                                                    :is-dragging="isDragging"
                                                    :dragged-node-id="draggedNodeId"
                                                    :expanded-nodes="expandedNodes"
                                                    @toggle-node="toggleNode"
                                                    @move-to-root="moveToRoot"
                                                    @drag-start="handleDragStart"
                                                    @drag-end="handleDragEnd"
                                                  />
                                                </template>
                                              </draggable>
                                            </div>
                                          </v-card>
                                        </v-hover>
                                      </div>
                                    </template>
                                  </draggable>
                                </div>
                              </v-card>
                            </v-hover>
                          </div>
                        </template>
                      </draggable>
                    </div>
                  </v-card>
                </v-hover>
              </div>
            </template>
          </draggable>
        </div>
      </v-card-text>

      <v-card-actions v-if="hasChanges">
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          @click="saveChanges"
          :loading="saving"
        >
          Guardar cambios
        </v-btn>
      </v-card-actions>
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

              <v-combobox
                v-model="editedItem.parentId"
                :items="availableParents"
                item-title="title"
                item-value="_id"
                label="Módulo padre (opcional)"
                clearable
                variant="outlined"
                density="comfortable"
                :loading="loading"
                :hint="editedItem._id ? 'Al cambiar el módulo padre, se moverá este módulo y todos sus submódulos' : ''"
                persistent-hint
                return-object
              >
                <template v-slot:prepend>
                  <v-icon color="primary">mdi-folder-move</v-icon>
                </template>
              </v-combobox>
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

    <!-- Modal para mostrar la descripción -->
    <v-dialog v-model="descriptionDialog" max-width="500">
      <v-card>
        <v-card-title class="text-h6 d-flex align-center">
          {{ selectedItem?.title }}
        </v-card-title>

        <v-card-text class="pt-4">
          <v-sheet
            class="pa-4 rounded d-flex flex-column"
            color="grey-lighten-4"
            v-if="selectedItem?.descripcion"
          >
            <h4 class="mb-2">Descripción</h4>
            {{ selectedItem.descripcion }}
          </v-sheet>
          <div v-else class="text-center text-body-2 text-grey">
            Este módulo no tiene descripción
          </div>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            variant="text"
            @click="descriptionDialog = false"
          >
            Cerrar
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
import { defineComponent } from 'vue'
import { mapState, mapActions } from 'vuex'
import draggable from 'vuedraggable'

// Componente recursivo para manejar niveles infinitos de módulos
const ModuleNode = {
  name: 'ModuleNode',
  components: {
    draggable
  },
  props: {
    module: {
      type: Object,
      required: true
    },
    isDragging: {
      type: Boolean,
      required: true
    },
    draggedNodeId: {
      type: String,
      default: null
    },
    expandedNodes: {
      type: Array,
      required: true
    }
  },
  template: `
    <div class="tree-node mb-2">
      <v-hover v-slot="{ isHovering, props }">
        <v-card 
          v-bind="props"
          variant="outlined" 
          class="pa-2"
          :class="{ 
            'module-card': true,
            'has-children': module.children && module.children.length,
            'is-dragging': isDragging && draggedNodeId === module._id,
            'is-hover': isHovering
          }"
        >
          <div class="d-flex align-center">
            <v-icon
              v-if="module.children && module.children.length"
              :icon="expandedNodes.includes(module._id) ? 'mdi-chevron-down' : 'mdi-chevron-right'"
              class="mr-2 expand-icon"
              @click.stop="$emit('toggle-node', module._id)"
            ></v-icon>
            <v-icon
              v-else
              class="mr-2 invisible-icon"
            >
              mdi-chevron-right
            </v-icon>
            <v-icon
              color="grey-darken-1"
              class="handle mr-2"
              style="cursor: move"
            >
              mdi-drag
            </v-icon>
            <v-icon
              :color="module.children && module.children.length ? 'primary' : 'grey'"
              class="mr-2"
            >
              {{ module.children && module.children.length ? 'mdi-folder' : 'mdi-file' }}
            </v-icon>
            <span class="module-title">{{ module.title }}</span>
            
            <v-spacer></v-spacer>
            
            <div class="node-actions">
              <v-btn
                icon="mdi-arrow-up"
                variant="text"
                size="x-small"
                color="primary"
                @click="$emit('move-to-root', module)"
                :title="'Mover al nivel raíz'"
              ></v-btn>
            </div>
          </div>

          <div 
            v-if="module.children && module.children.length" 
            class="pl-8 mt-2"
            v-show="expandedNodes.includes(module._id)"
          >
            <draggable
              v-model="module.children"
              :group="{ name: 'modules', pull: true, put: true }"
              item-key="_id"
              class="modules-list"
              @end="$emit('drag-end', $event)"
              @start="$emit('drag-start', $event)"
              :animation="200"
              ghost-class="ghost-module"
              drag-class="dragging-module"
            >
              <template #item="{ element: child }">
                <ModuleNode 
                  :module="child"
                  :is-dragging="isDragging"
                  :dragged-node-id="draggedNodeId"
                  :expanded-nodes="expandedNodes"
                  @toggle-node="$emit('toggle-node', $event)"
                  @move-to-root="$emit('move-to-root', $event)"
                  @drag-start="$emit('drag-start', $event)"
                  @drag-end="$emit('drag-end', $event)"
                />
              </template>
            </draggable>
          </div>
        </v-card>
      </v-hover>
    </div>
  `
}

export default defineComponent({
  name: 'Modules',
  components: {
    draggable,
    ModuleNode
  },

  data: () => ({
    dialog: false,
    dialogDelete: false,
    descriptionDialog: false,
    selectedItem: null,
    selectedModuleId: null,
    valid: true,
    openNodes: [],
    dragModules: [],
    originalModules: [],
    expandedNodes: [],
    isDragging: false,
    draggedNodeId: null,
    saving: false,
    searchQuery: '',
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
    },
    allNodesExpanded: false,
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
          _id: module._id,
          title: module.nombre || '',
          descripcion: module.descripcion || '',
          children: []
        };

        if (module.submodules && module.submodules.length > 0) {
          formattedModule.children = module.submodules.map(submodule => formatModule(submodule));
        }

        return formattedModule;
      };

      let modules = this.moduleTree.map(module => formatModule(module));

      // Si hay una búsqueda activa, filtrar los módulos
      if (this.searchQuery) {
        const searchLower = this.searchQuery.toLowerCase().trim();
        const matchingIds = new Set();

        const filterModules = (items) => {
          return items.filter(item => {
            // Verificar si el módulo actual coincide
            const titleMatch = item.title.toLowerCase().includes(searchLower);
            const descMatch = item.descripcion.toLowerCase().includes(searchLower);
            const matches = titleMatch || descMatch;

            if (matches) {
              matchingIds.add(item.id);
              // También agregar los IDs de todos los padres hasta la raíz
              let currentParent = items.find(m => m.children?.some(child => child.id === item.id));
              while (currentParent) {
                matchingIds.add(currentParent.id);
                currentParent = items.find(m => m.children?.some(child => child.id === currentParent.id));
              }
            }

            // Procesar hijos recursivamente
            if (item.children && item.children.length > 0) {
              const filteredChildren = filterModules(item.children);
              
              // Si hay hijos que coinciden, mantener esos hijos y agregar el ID del padre
              if (filteredChildren.length > 0) {
                item.children = filteredChildren;
                matchingIds.add(item.id);
                return true;
              } else if (matches) {
                // Si el padre coincide pero no tiene hijos que coincidan, mantener el padre
                item.children = []; // Limpiar los hijos que no coinciden
                return true;
              }
              return false;
            }

            return matches;
          });
        };

        // Aplicar el filtro y actualizar los nodos expandidos
        modules = filterModules(modules);
        
        // Asegurarse de que los nodos se expandan después de la actualización
        this.$nextTick(() => {
          const idsToExpand = Array.from(matchingIds);
          console.log('IDs a expandir:', idsToExpand);
          console.log('Módulos filtrados:', modules);
          this.openNodes = idsToExpand;
        });
      }

      return modules;
    },
    
    availableParents() {
      if (!this.moduleTree) return [];
      const currentModuleId = this.editedItem._id;
      
      // Función para obtener todos los IDs de los submódulos
      const getSubmoduleIds = (module) => {
        let ids = [module._id];
        if (module.submodules && module.submodules.length > 0) {
          module.submodules.forEach(sub => {
            ids = [...ids, ...getSubmoduleIds(sub)];
          });
        }
        return ids;
      };

      // Encontrar el módulo actual y sus submódulos
      const findCurrentModuleIds = (modules) => {
        if (!currentModuleId) return [];
        for (const module of modules) {
          if (module._id === currentModuleId) {
            return getSubmoduleIds(module);
          }
          if (module.submodules && module.submodules.length > 0) {
            const found = findCurrentModuleIds(module.submodules);
            if (found.length > 0) return found;
          }
        }
        return [];
      };

      // Obtener todos los IDs que deben ser excluidos
      const excludeIds = findCurrentModuleIds(this.moduleTree);

      const flattenModules = (modules, parentPath = '') => {
        return modules.reduce((acc, module) => {
          // Excluir el módulo actual y sus submódulos
          if (excludeIds.includes(module._id)) {
            return acc;
          }
          
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
    },

    hasChanges() {
      return JSON.stringify(this.dragModules) !== JSON.stringify(this.originalModules);
    }
  },

  watch: {
    moduleTree: {
      handler(newVal) {
        this.initializeDragModules();
      },
      immediate: true
    },
    searchQuery: {
      immediate: true,
      handler(newVal) {
        if (!newVal) {
          // Cuando se limpia la búsqueda, restaurar el árbol completo
          this.openNodes = [...this.expandedNodes];
        }
      }
    }
  },

  created() {
    this.initialize();
  },

  methods: {
    ...mapActions('modules', ['fetchModules', 'createModule', 'updateModule', 'deleteModule']),

    getAllModuleIds(modules) {
      let ids = [];
      modules.forEach(module => {
        ids.push(module.id);
        if (module.children && module.children.length > 0) {
          ids = [...ids, ...this.getAllModuleIds(module.children)];
        }
      });
      return ids;
    },

    findModulePath(targetId, modules = this.formattedModules) {
      const findPath = (items, target, path = []) => {
        for (const item of items) {
          const currentPath = [...path, item.id];
          if (item.id === target) {
            return currentPath;
          }
          if (item.children && item.children.length > 0) {
            const foundPath = findPath(item.children, target, currentPath);
            if (foundPath) return foundPath;
          }
        }
        return null;
      };
      return findPath(modules, targetId);
    },

    async initialize() {
      try {
        await this.fetchModules();
        this.initializeDragModules();
      } catch (error) {
        this.showError('Error al cargar los módulos');
        console.error('Error loading modules:', error);
      }
    },

    initializeDragModules() {
      if (!this.moduleTree) return;
      
      const formatForDrag = (modules) => {
        return modules.map(module => {
          // Primero buscamos todos los submodulos posibles
          let allChildren = [];
          
          // Verificar submodules directos
          if (Array.isArray(module.submodules)) {
            allChildren = [...allChildren, ...module.submodules];
          }
          
          // Verificar children directos
          if (Array.isArray(module.children)) {
            allChildren = [...allChildren, ...module.children];
          }
          
          // Crear el objeto formateado asegurando que title nunca sea null
          return {
            _id: module._id,
            id: module._id,
            title: module.nombre || 'Sin nombre',
            nombre: module.nombre || 'Sin nombre', // Mantener el campo original
            descripcion: module.descripcion,
            parentId: module.parentId,
            children: allChildren.length > 0 ? formatForDrag(allChildren) : []
          };
        });
      };

      this.dragModules = formatForDrag(this.moduleTree);
      this.originalModules = JSON.parse(JSON.stringify(this.dragModules));
      this.expandAllNodes();
    },

    getAvailableParents(module) {
      if (!module) return [];

      const getDescendantIds = (mod) => {
        if (!mod) return [];
        let ids = [mod._id];
        if (mod.children && mod.children.length > 0) {
          mod.children.forEach(child => {
            ids = [...ids, ...getDescendantIds(child)];
          });
        }
        return ids;
      };

      const descendantIds = getDescendantIds(module);
      return this.dragModules.filter(m => 
        m && m._id && !descendantIds.includes(m._id) && m._id !== module._id
      );
    },

    canDrop(evt, targetElement) {
      if (!evt || !evt.draggedContext || !evt.draggedContext.element) return false;
      
      const draggedNode = evt.draggedContext.element;
      
      // No permitir que un módulo sea su propio padre o hijo de sus descendientes
      const descendants = this.getAvailableParents(draggedNode);
      return !descendants.some(d => d._id === targetElement._id);
    },

    handleDragEnd(evt) {
      this.isDragging = false;
      this.draggedNodeId = null;
      
      if (!evt || !evt.item || !evt.item.__draggable_context) return;
      
      const movedItem = evt.item.__draggable_context.element;
      const newParentEl = evt.to.closest('.tree-node');
      const oldParentEl = evt.from.closest('.tree-node');
      
      const findOriginalModule = (modules, id) => {
        for (const module of modules) {
          if (module._id === id) {
            let allChildren = [];
            if (Array.isArray(module.children)) {
              allChildren = [...allChildren, ...module.children];
            }
            if (Array.isArray(module.submodules)) {
              allChildren = [...allChildren, ...module.submodules];
            }
            return {
              ...module,
              title: module.nombre || module.title || 'Sin nombre', // Asegurar que siempre haya un título
              nombre: module.nombre || module.title || 'Sin nombre', // Mantener el campo original
              children: allChildren
            };
          }
          
          if (module.children && module.children.length) {
            const found = findOriginalModule(module.children, id);
            if (found) return found;
          }
          
          if (module.submodules && module.submodules.length) {
            const found = findOriginalModule(module.submodules, id);
            if (found) return found;
          }
        }
        return null;
      };

      const originalModule = findOriginalModule(this.dragModules, movedItem._id);
      if (!originalModule) {
        console.warn('No se encontró el módulo original:', movedItem._id);
        return;
      }

      // Asegurar que el módulo movido mantenga sus propiedades
      movedItem.children = originalModule.children || [];
      movedItem.title = originalModule.title || 'Sin nombre';
      movedItem.nombre = originalModule.nombre || originalModule.title || 'Sin nombre';
      movedItem.descripcion = originalModule.descripcion;
      
      if (newParentEl && newParentEl.__vue__) {
        const newParent = newParentEl.__vue__.element;
        movedItem.parentId = newParent ? newParent._id : null;
      } else {
        movedItem.parentId = null;
      }

      // Si el módulo se movió a un nuevo padre, asegurarse de que se mantenga en la estructura correcta
      if (oldParentEl && oldParentEl.__vue__) {
        const oldParent = oldParentEl.__vue__.element;
        if (oldParent) {
          // Eliminar el módulo de su ubicación anterior si es necesario
          if (oldParent.children) {
            const index = oldParent.children.findIndex(child => child._id === movedItem._id);
            if (index !== -1) {
              oldParent.children.splice(index, 1);
            }
          }
          if (oldParent.submodules) {
            const index = oldParent.submodules.findIndex(sub => sub._id === movedItem._id);
            if (index !== -1) {
              oldParent.submodules.splice(index, 1);
            }
          }
        }
      }
      
      this.$nextTick(() => {
        this.updateDragModules();
        // Asegurarse de que el nodo movido esté expandido
        if (!this.expandedNodes.includes(movedItem._id)) {
          this.expandedNodes.push(movedItem._id);
        }
      });
    },

    moveToRoot(module) {
      if (!module) return;
      
      // Encontrar el módulo original con sus hijos
      const findOriginalModule = (modules, id) => {
        for (const module of modules) {
          if (module._id === id) {
            return {
              ...module,
              children: module.children || module.submodules || []
            };
          }
          if (module.children && module.children.length) {
            const found = findOriginalModule(module.children, id);
            if (found) return found;
          }
          if (module.submodules && module.submodules.length) {
            const found = findOriginalModule(module.submodules, id);
            if (found) return found;
          }
        }
        return null;
      };

      const originalModule = findOriginalModule(this.dragModules, module._id);
      if (!originalModule) return;

      // Preservar los hijos al mover al nivel raíz
      module.children = originalModule.children || originalModule.submodules || [];
      module.parentId = null;

      // Eliminar el módulo de su ubicación anterior
      const removeFromParent = (modules) => {
        for (const m of modules) {
          if (m.children) {
            const index = m.children.findIndex(child => child._id === module._id);
            if (index !== -1) {
              m.children.splice(index, 1);
              return true;
            }
            if (removeFromParent(m.children)) return true;
          }
          if (m.submodules) {
            const index = m.submodules.findIndex(sub => sub._id === module._id);
            if (index !== -1) {
              m.submodules.splice(index, 1);
              return true;
            }
            if (removeFromParent(m.submodules)) return true;
          }
        }
        return false;
      };

      removeFromParent(this.dragModules);
      
      // Agregar el módulo al nivel raíz si no está ahí
      if (!this.dragModules.find(m => m._id === module._id)) {
        this.dragModules.push(module);
      }

      this.$nextTick(() => {
        this.updateDragModules();
        // Asegurarse de que el nodo movido esté expandido
        if (!this.expandedNodes.includes(module._id)) {
          this.expandedNodes.push(module._id);
        }
      });
    },

    moveAsChild(module, newParent) {
      if (!module || !newParent) return;
      
      const availableParents = this.getAvailableParents(module);
      if (availableParents.some(p => p._id === newParent._id)) {
        module.parentId = newParent._id;
        this.updateDragModules();
      } else {
        this.showError('No se puede mover un módulo como hijo de uno de sus descendientes');
      }
    },

    updateDragModules() {
      // Crear una copia profunda para forzar la actualización de la vista
      const deepClone = (items) => {
        return items.map(item => {
          // Recolectar todos los hijos posibles
          let allChildren = [];
          if (Array.isArray(item.children)) {
            allChildren = [...allChildren, ...item.children];
          }
          if (Array.isArray(item.submodules)) {
            allChildren = [...allChildren, ...item.submodules];
          }
          
          return {
            ...item,
            children: allChildren.length > 0 ? deepClone(allChildren) : []
          };
        });
      };
      
      this.dragModules = deepClone(this.dragModules);
    },

    resetDragModules() {
      this.dragModules = JSON.parse(JSON.stringify(this.originalModules));
    },

    async saveChanges() {
      this.saving = true;
      try {
        // Función para convertir el formato de árbol a un formato que mantenga la jerarquía
        const prepareModuleUpdates = (modules, parentId = null) => {
          let updates = [];
          
          modules.forEach(module => {
            // Preparar la actualización del módulo actual
            const moduleUpdate = {
              _id: module._id,
              nombre: module.title || module.nombre,
              descripcion: module.descripcion,
              parentId: parentId,
              submodules: [] // Inicializar array de submodules
            };

            // Si el módulo tiene hijos, procesarlos recursivamente
            if (module.children && module.children.length > 0) {
              // Obtener los IDs de los submódulos en el orden correcto
              moduleUpdate.submodules = module.children.map(child => child._id);
              
              // Procesar recursivamente los hijos para sus propias actualizaciones
              const childUpdates = prepareModuleUpdates(module.children, module._id);
              updates = [...updates, ...childUpdates];
            }

            updates.push(moduleUpdate);
          });

          return updates;
        };

        // Preparar todas las actualizaciones
        const updates = prepareModuleUpdates(this.dragModules);

        // Verificar que todos los módulos tengan nombre
        const invalidModules = updates.filter(m => !m.nombre);
        if (invalidModules.length > 0) {
          console.error('Módulos sin nombre:', invalidModules);
          throw new Error('Hay módulos sin nombre válido');
        }

        // Actualizar cada módulo con su nueva estructura
        await Promise.all(updates.map(async update => {
          try {
            await this.updateModule({
              _id: update._id,
              nombre: update.nombre,
              descripcion: update.descripcion,
              parentId: update.parentId,
              submodules: update.submodules
            });
          } catch (error) {
            console.error(`Error al actualizar el módulo ${update._id}:`, error);
            throw error;
          }
        }));

        this.showSuccess('Cambios guardados exitosamente');
        await this.initialize();
      } catch (error) {
        console.error('Error al guardar los cambios:', error);
        this.showError(error.message || 'Error al guardar los cambios');
      } finally {
        this.saving = false;
      }
    },

    openDialog(item = null, parentItem = null) {
      this.selectedModuleId = null;
      if (item) {
        const parentModule = this.availableParents.find(p => p._id === item.parentId);
        this.editedItem = {
          _id: item._id,
          nombre: item.title,
          descripcion: item.descripcion,
          parentId: parentModule || null
        };
      } else {
        this.editedItem = { ...this.defaultItem };
        if (parentItem) {
          const parentModule = this.availableParents.find(p => p._id === parentItem._id);
          this.editedItem.parentId = parentModule || null;
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
          parentId: this.editedItem.parentId?._id || null
        };

        let savedModuleId;
        if (this.editedItem._id) {
          const result = await this.updateModule({ 
            ...moduleData, 
            _id: this.editedItem._id,
          });
          savedModuleId = this.editedItem._id;
          this.showSuccess('Módulo actualizado exitosamente');
        } else {
          const result = await this.createModule(moduleData);
          savedModuleId = result.data?._id || result._id;
          this.showSuccess('Módulo creado exitosamente');
        }

        this.closeDialog();
        
        this.selectedModuleId = savedModuleId;
        
        await this.initialize();
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
    },

    openDescriptionModal(item) {
      this.selectedItem = item;
      this.descriptionDialog = true;
    },

    async expandToModule(moduleId) {
      const path = this.findModulePath(moduleId);
      if (path) {
        this.openNodes = [...new Set([...this.openNodes, ...path])];
      }
    },

    toggleNode(nodeId) {
      const index = this.expandedNodes.indexOf(nodeId);
      if (index === -1) {
        this.expandedNodes.push(nodeId);
      } else {
        this.expandedNodes.splice(index, 1);
      }
      
      // Si no hay búsqueda activa, sincronizar con openNodes
      if (!this.searchQuery) {
        this.openNodes = [...this.expandedNodes];
      }
    },

    handleDragStart(evt) {
      this.isDragging = true;
      this.draggedNodeId = evt.item.__draggable_context.element._id;
      // Expandir todos los nodos durante el arrastre
      this.expandAllNodes();
    },

    toggleAllNodes() {
      if (this.allNodesExpanded) {
        this.collapseAllNodes();
      } else {
        this.expandAllNodes();
      }
    },

    expandAllNodes() {
      const getAllNodeIds = (modules) => {
        let ids = [];
        modules.forEach(module => {
          ids.push(module._id);
          if (module.children && module.children.length) {
            ids = [...ids, ...getAllNodeIds(module.children)];
          }
          if (module.submodules && module.submodules.length) {
            ids = [...ids, ...getAllNodeIds(module.submodules)];
          }
        });
        return ids;
      };
      
      this.expandedNodes = getAllNodeIds(this.dragModules);
      if (!this.searchQuery) {
        this.openNodes = [...this.expandedNodes];
      }
      this.allNodesExpanded = true;
    },

    collapseAllNodes() {
      this.expandedNodes = [];
      if (!this.searchQuery) {
        this.openNodes = [];
      }
      this.allNodesExpanded = false;
    },
  }
});
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
  min-width: 180px;
}
</style>

<style scoped>
.draggable-tree {
  max-height: 600px;
  overflow-y: auto;
  padding: 1rem;
  background-color: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
}

.module-card {
  transition: all 0.2s;
  border: 2px solid transparent !important;
}

.module-card.is-hover {
  transform: translateX(4px);
  background-color: rgba(var(--v-theme-primary), 0.05) !important;
}

.module-card.has-children {
  border-left-color: var(--v-theme-primary) !important;
}

.ghost-module {
  opacity: 0.5;
  background: rgba(var(--v-theme-primary), 0.1) !important;
  border: 2px dashed var(--v-theme-primary) !important;
}

.dragging-module {
  background: rgba(var(--v-theme-primary), 0.05) !important;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1) !important;
}

.is-dragging {
  border: 2px dashed var(--v-theme-primary) !important;
  opacity: 0.7;
}

.sortable-chosen {
  background-color: rgba(var(--v-theme-primary), 0.1) !important;
}

.sortable-ghost {
  opacity: 0.5;
  background-color: rgba(var(--v-theme-primary), 0.2) !important;
}

.sortable-drag {
  transform: rotate(2deg);
  cursor: grabbing !important;
}

.expand-icon {
  cursor: pointer;
  opacity: 0.7;
  transition: all 0.2s;
}

.expand-icon:hover {
  opacity: 1;
  transform: scale(1.1);
}

.invisible-icon {
  opacity: 0;
  pointer-events: none;
}

.module-title {
  user-select: none;
}
</style> 