vue
<template>
  <div>
    <v-card elevation="0" class="mb-4">
      <v-card-text class="d-flex" style="justify-content: space-between">
        <div class="d-flex flex-column align-start">
          <div class="text-caption text-uppercase mb-1">Permisos</div>
          <div class="text-h4 font-weight-bold">Gestión de Permisos por Rol</div>
        </div>
        <div class="d-flex align-center">
          <v-btn color="primary" size="large" class="mx-2" prepend-icon="mdi-plus" @click="openRoleModal">
            Nuevo Rol
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <v-card>
      <v-card-text class="pa-0">
        <v-row no-gutters>
          <!-- Tabs verticales del lado izquierdo -->
          <v-col cols="3" class="border-right">
            <v-list class="pa-0">
              <v-list-item
                v-for="role in roles"
                :key="role._id"
                :class="{ 'v-list-item--active': activeRoleTab === role._id }"
                @click="selectRole(role)"
                class="role-tab-item"
              >
                <v-list-item-content>
                  <v-list-item-title class="d-flex align-center">
                    <v-icon left class="mr-2">mdi-account-key</v-icon>
                    {{ role.nombreRol }}
                    <v-badge 
                      :content="getAdminsByRole(role._id).length" 
                      :model-value="getAdminsByRole(role._id).length > 0"
                      color="primary"
                      class="ml-auto"
                    ></v-badge>
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list>
            
            <!-- Mensaje cuando no hay roles -->
            <div v-if="roles.length === 0" class="text-center pa-8">
              <v-icon size="48" color="grey lighten-1">mdi-account-group</v-icon>
              <p class="text-body-2 text-grey mt-2">No hay roles registrados</p>
              <p class="text-caption text-grey">Crea un rol para comenzar</p>
            </div>
          </v-col>

                     <!-- Contenido del lado derecho -->
           <v-col cols="9" class="pa-6 content-background">
            <div v-if="activeRoleTab">
                             <!-- Header del rol seleccionado -->
               <div class="mb-6">
                 <h3 class="text-h5 font-weight-bold">{{ getSelectedRoleName() }}</h3>
               </div>

                             <!-- Matriz de Permisos -->
               <div class="d-flex justify-space-between align-center mb-4">
                 <div>
                   <h4 class="text-h6">Permisos del Rol: {{ getSelectedRoleName() }}</h4>
                   <p class="text-caption text-grey mt-1">
                     Estructura del menú del Job Board con permisos jerárquicos
                   </p>
                 </div>
                 <v-btn 
                   color="primary" 
                   size="small" 
                   prepend-icon="mdi-content-save" 
                   @click="savePermissions"
                   :loading="savingPermissions"
                 >
                   Guardar Permisos
                 </v-btn>
               </div>
              
                                            <!-- Matriz de Permisos -->
                <v-card class="pa-4">
                  <div class="permissions-matrix">
                    <!-- Headers de permisos -->
                    <div class="permissions-header">
                      <div class="menu-item-header">Menú</div>
                      <div class="permission-columns">
                        <div class="permission-header">
                          <v-checkbox 
                            v-model="selectAllView" 
                            label="View" 
                            density="compact"
                            @change="toggleAllPermissions('view')"
                          ></v-checkbox>
                        </div>
                        <div class="permission-header">
                          <v-checkbox 
                            v-model="selectAllAdd" 
                            label="Add" 
                            density="compact"
                            @change="toggleAllPermissions('add')"
                          ></v-checkbox>
                        </div>
                        <div class="permission-header">
                          <v-checkbox 
                            v-model="selectAllEdit" 
                            label="Edit" 
                            density="compact"
                            @change="toggleAllPermissions('edit')"
                          ></v-checkbox>
                        </div>
                        <div class="permission-header">
                          <v-checkbox 
                            v-model="selectAllDelete" 
                            label="Delete" 
                            density="compact"
                            @change="toggleAllPermissions('delete')"
                          ></v-checkbox>
                        </div>
                        <div class="permission-header">
                          <v-checkbox 
                            v-model="selectAllAll" 
                            label="All" 
                            density="compact"
                            @change="toggleAllPermissions('all')"
                          ></v-checkbox>
                        </div>
                      </div>
                    </div>

                                         <!-- Leyenda de niveles -->
                     <div class="permissions-legend mb-3 pa-3">
                       <div class="d-flex align-center mb-2">
                         <span class="legend-title text-caption font-weight-bold">Leyenda de Niveles:</span>
                       </div>
                       <div class="d-flex gap-4">
                         <div class="d-flex align-center">
                           <div class="legend-item top-level-legend"></div>
                           <span class="text-caption ml-2">Nivel Principal</span>
                         </div>
                         <div class="d-flex align-center">
                           <div class="legend-item sub-level-legend-2"></div>
                           <span class="text-caption ml-2">Sub-elemento</span>
                         </div>
                         <div class="d-flex align-center">
                           <div class="legend-item sub-level-legend-3"></div>
                           <span class="text-caption ml-2">Sub-sub-elemento</span>
                         </div>
                       </div>
                     </div>

                     <!-- Filas de permisos -->
                     <div v-for="item in menuPermissions" :key="item.id" 
                          :class="['permission-row', item.level === 1 ? 'top-level' : 'sub-level']"
                          :data-level="item.level">
                                             <div class="menu-item" :data-level="item.level">
                         <span v-if="item.level === 2" class="menu-indicator">├─</span>
                         <span v-if="item.level === 3" class="menu-indicator">│  └─</span>
                         <span class="menu-text">{{ item.name }}</span>
                       </div>
                      <div class="permission-cell">
                        <v-checkbox 
                          v-model="item.permissions.view" 
                          density="compact"
                          :disabled="isCheckboxDisabled(item, 'view')"
                          @change="updatePermission(item.id, 'view')"
                        ></v-checkbox>
                      </div>
                      <div class="permission-cell">
                        <v-checkbox 
                          v-model="item.permissions.add" 
                          density="compact"
                          @change="updatePermission(item.id, 'add')"
                        ></v-checkbox>
                      </div>
                      <div class="permission-cell">
                        <v-checkbox 
                          v-model="item.permissions.edit" 
                          density="compact"
                          @change="updatePermission(item.id, 'edit')"
                        ></v-checkbox>
                      </div>
                      <div class="permission-cell">
                        <v-checkbox 
                          v-model="item.permissions.delete" 
                          density="compact"
                          @change="updatePermission(item.id, 'delete')"
                        ></v-checkbox>
                      </div>
                      <div class="permission-cell">
                        <v-checkbox 
                          v-model="item.permissions.all" 
                          density="compact"
                          @change="updatePermission(item.id, 'all')"
                        ></v-checkbox>
                      </div>
                    </div>
                  </div>
                </v-card>
            </div>

            <!-- Mensaje cuando no hay rol seleccionado -->
            <div v-else class="text-center pa-8">
              <v-icon size="64" color="grey lighten-1">mdi-account-key</v-icon>
              <p class="text-h6 text-grey mt-4">Selecciona un rol</p>
              <p class="text-body-2 text-grey">Elige un rol del panel izquierdo para ver sus detalles y permisos</p>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Dialog para crear/editar rol -->
    <v-dialog v-model="roleModal" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="text-h5">{{ isEditRole ? 'Editar Rol' : 'Crear Nuevo Rol' }}</span>
        </v-card-title>

        <v-card-text>
          <v-container>
            <v-form ref="roleForm" v-model="roleValid" @submit.prevent="saveRole">
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    v-model="roleFormData.nombreRol"
                    :rules="[rules.required, rules.minLength]"
                    label="Nombre del Rol*"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-textarea
                    v-model="roleFormData.descripcion"
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
          <v-btn color="grey darken-1" text @click="closeRoleModal">Cancelar</v-btn>
          <v-btn
            color="primary"
            :disabled="!roleValid || loading"
            :loading="loading"
            @click="saveRole"
          >
            {{ isEditRole ? 'Actualizar' : 'Crear' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog para crear/editar administrador -->
    <v-dialog v-model="adminModal" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="text-h5">{{ isEditAdmin ? 'Editar Administrador' : 'Crear Nuevo Administrador' }}</span>
        </v-card-title>

        <v-card-text>
          <v-container>
            <v-form ref="adminForm" v-model="adminValid" @submit.prevent="saveAdmin">
              <v-row>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="adminFormData.nombre"
                    :rules="[rules.required, rules.minLength]"
                    label="Nombre*"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="adminFormData.apellido"
                    :rules="[rules.required, rules.minLength]"
                    label="Apellido*"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-model="adminFormData.correo"
                    :rules="[rules.required, rules.email]"
                    label="Correo Electrónico*"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-combobox
                    v-model="adminFormData.rolId"
                    :items="roles"
                    item-title="nombreRol"
                    item-value="_id"
                    :return-object="false"
                    dense
                    outlined
                    :rules="[rules.required]"
                    label="Rol*"
                    required
                  ></v-combobox>
                </v-col>
                <v-col cols="12" v-if="!isEditAdmin">
                  <v-text-field
                    v-model="adminFormData.password"
                    :rules="[rules.required, rules.minPassword]"
                    label="Contraseña*"
                    :type="showPassword ? 'text' : 'password'"
                    :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                    @click:append-inner="showPassword = !showPassword"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12" v-if="!isEditAdmin">
                  <v-text-field
                    v-model="adminFormData.confirmPassword"
                    :rules="[rules.required, v => v === adminFormData.password || 'Las contraseñas no coinciden']"
                    label="Verificar Contraseña*"
                    :type="showPassword ? 'text' : 'password'"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12" v-if="isEditAdmin">
                  <v-text-field
                    v-model="adminFormData.password"
                    :rules="[rules.minPasswordOptional]"
                    label="Nueva Contraseña (opcional)"
                    :type="showPassword ? 'text' : 'password'"
                    :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                    @click:append-inner="showPassword = !showPassword"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" v-if="isEditAdmin">
                  <v-text-field
                    v-model="adminFormData.confirmPassword"
                    :rules="[v => !adminFormData.password || v === adminFormData.password || 'Las contraseñas no coinciden']"
                    label="Verificar Nueva Contraseña (opcional)"
                    :type="showPassword ? 'text' : 'password'"
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-form>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey darken-1" text @click="closeAdminModal">Cancelar</v-btn>
          <v-btn
            color="primary"
            :disabled="!adminValid || loading"
            :loading="loading"
            @click="saveAdmin"
          >
            {{ isEditAdmin ? 'Actualizar' : 'Crear' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog de confirmación para eliminar rol -->
    <v-dialog v-model="dialogDeleteRole" max-width="500px">
      <v-card>
        <v-card-title class="text-h5">¿Estás seguro de eliminar este rol?</v-card-title>
        <v-card-text>
          Esta acción no se puede deshacer. El rol será eliminado del sistema.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey darken-1" text @click="closeDeleteRole">Cancelar</v-btn>
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

    <!-- Dialog de confirmación para eliminar administrador -->
    <v-dialog v-model="dialogDeleteAdmin" max-width="500px">
      <v-card>
        <v-card-title class="text-h5">¿Estás seguro de eliminar este administrador?</v-card-title>
        <v-card-text>
          Esta acción no se puede deshacer. El administrador será desactivado del sistema.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey darken-1" text @click="closeDeleteAdmin">Cancelar</v-btn>
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
  name: 'Permissions',
  data() {
    return {
      activeRoleTab: null,
      adminSearch: '',
      roleModal: false,
      adminModal: false,
      dialogDeleteRole: false,
      dialogDeleteAdmin: false,
      loading: false,
      roleValid: true,
      adminValid: true,
      isEditRole: false,
      isEditAdmin: false,
      roleFormData: this.getEmptyRoleFormData(),
      adminFormData: this.getEmptyAdminFormData(),
      roleToDelete: null,
      adminToDelete: null,
      snackbar: {
        show: false,
        text: '',
        color: 'success'
      },
      adminHeaders: [
        { text: 'Nombre', value: 'nombre', sortable: true, visible: true },
        { text: 'Apellido', value: 'apellido', sortable: true, visible: true },
        { text: 'Correo', value: 'correo', sortable: true, visible: true },
        { text: 'Verificado', value: 'verified', sortable: true, visible: true },
        { text: 'Acciones', value: 'actions', sortable: false, align: 'center', visible: true }
      ],
      selectAll: false,
      selectAllColumns: false,
      indeterminate: false,
      indeterminateColumns: false,
      filters: {
        nombre: '',
        apellido: '',
        correo: '',
        verified: '',
      },
      selected: [],
      menuColumns: false,
      rules: {
        required: v => !!v || 'Este campo es requerido',
        minLength: v => (v && v.length >= 2) || 'Mínimo 2 caracteres',
        maxLength: v => !v || v.length <= 500 || 'Máximo 500 caracteres',
        email: v => /.+@.+\..+/.test(v) || 'El correo debe ser válido',
        minPassword: v => (v && v.length >= 6) || 'Mínimo 6 caracteres',
        minPasswordOptional: v => !v || v.length >= 6 || 'Mínimo 6 caracteres',
      },
      showPassword: false,
      rolePermissions: {
        view: true,
        add: true,
        edit: true,
        delete: false,
        admin: true,
        users: false,
        content: true,
        reports: false
      },
      availableModules: [
        { id: 1, name: 'Usuarios', description: 'Gestión de usuarios del sistema', icon: 'mdi-account-group', color: 'primary', enabled: true },
        { id: 2, name: 'Contenido', description: 'Gestión de contenido y publicaciones', icon: 'mdi-file-document', color: 'success', enabled: true },
        { id: 3, name: 'Reportes', description: 'Generación y visualización de reportes', icon: 'mdi-chart-bar', color: 'info', enabled: false },
        { id: 4, name: 'Configuración', description: 'Configuración del sistema', icon: 'mdi-cog', color: 'warning', enabled: true },
        { id: 5, name: 'Seguridad', description: 'Configuración de seguridad y permisos', icon: 'mdi-shield', color: 'error', enabled: false },
        { id: 6, name: 'Analytics', description: 'Análisis y estadísticas', icon: 'mdi-analytics', color: 'purple', enabled: false }
      ],
      // Variables para la matriz de permisos
      savingPermissions: false,
      selectAllView: false,
      selectAllAdd: false,
      selectAllEdit: false,
      selectAllDelete: false,
      selectAllAll: false,
                                         menuPermissions: [
           // Work Platform - Nivel 1
           { id: 1, name: 'Work Platform', level: 1, permissions: { view: false, add: false, edit: false, delete: false, all: false } },
           
           // Elementos del Work Platform - Nivel 2
           { id: 2, name: 'Home', level: 2, permissions: { view: false, add: false, edit: false, delete: false, all: false } },
           { id: 3, name: 'Dashboard', level: 2, permissions: { view: false, add: false, edit: false, delete: false, all: false } },
           { id: 4, name: 'Jobs', level: 2, permissions: { view: false, add: false, edit: false, delete: false, all: false } },
           { id: 5, name: 'Companies', level: 2, permissions: { view: false, add: false, edit: false, delete: false, all: false } },
           { id: 6, name: 'My Profile', level: 2, permissions: { view: false, add: false, edit: false, delete: false, all: false } },
           { id: 7, name: 'Messages', level: 2, permissions: { view: false, add: false, edit: false, delete: false, all: false } },
           
           // Blog - Nivel 2 (dentro de Work Platform)
           { id: 8, name: 'Blog', level: 2, permissions: { view: false, add: false, edit: false, delete: false, all: false } },
           
           // Subelementos del Blog - Nivel 3
           { id: 9, name: 'All Articles', level: 3, permissions: { view: false, add: false, edit: false, delete: false, all: false } },
           { id: 10, name: 'Categories', level: 3, permissions: { view: false, add: false, edit: false, delete: false, all: false } },
           { id: 11, name: 'Write Article', level: 3, permissions: { view: false, add: false, edit: false, delete: false, all: false } },
           { id: 12, name: 'My Posts', level: 3, permissions: { view: false, add: false, edit: false, delete: false, all: false } },
           
           // Sell Platform - Nivel 1
           { id: 13, name: 'Sell Platform', level: 1, permissions: { view: false, add: false, edit: false, delete: false, all: false } },
           
           // Elementos del Sell Platform - Nivel 2
           { id: 14, name: 'Orders', level: 2, permissions: { view: false, add: false, edit: false, delete: false, all: false } },
           { id: 15, name: 'Order Detail', level: 2, permissions: { view: false, add: false, edit: false, delete: false, all: false } },
           
           // Otros elementos - Nivel 1
           { id: 16, name: 'Sitemap', level: 1, permissions: { view: false, add: false, edit: false, delete: false, all: false } },
           { id: 17, name: 'Admin Panel', level: 1, permissions: { view: false, add: false, edit: false, delete: false, all: false } }
         ],
       
    };
  },
  computed: {
    ...mapState({
      roles: state => state.admin.roles,
      admins: state => state.admin.admins
    }),
    filteredAdmins() {
      if (!this.activeRoleTab) return [];
      const adminsByRole = this.getAdminsByRole(this.activeRoleTab);
      return adminsByRole.filter(admin => {
        const search = this.adminSearch.toLowerCase();
        return admin.nombre.toLowerCase().includes(search) ||
               admin.apellido.toLowerCase().includes(search) ||
               admin.correo.toLowerCase().includes(search);
      });
    }
  },
  methods: {
    ...mapActions('admin', [
      'getAllRoles',
      'getAllAdmins',
      'addRole',
      'editRoleAction',
      'deleteRole',
      'addAdmin',
      'editAdminAction',
      'deleteAdmin',
      'getRolePermissions',
      'saveRolePermissions'
    ]),
    getEmptyRoleFormData() {
      return {
        nombreRol: '',
        descripcion: ''
      };
    },
    getEmptyAdminFormData() {
      return {
        nombre: '',
        apellido: '',
        correo: '',
        rolId: '',
        password: '',
        confirmPassword: ''
      };
    },
    selectRole(role) {
      this.activeRoleTab = role._id;
      this.loadRolePermissions(role._id);
    },
    getSelectedRole() {
      return this.roles.find(r => r._id === this.activeRoleTab);
    },
    getSelectedRoleName() {
      const role = this.getSelectedRole();
      return role ? role.nombreRol : '';
    },
    getSelectedRoleDescription() {
      const role = this.getSelectedRole();
      return role ? role.descripcion : '';
    },
    getAdminsByRole(roleId) {
      return this.admins.filter(admin => admin.rolId === roleId);
    },
    openRoleModal() {
      this.isEditRole = false;
      this.roleFormData = this.getEmptyRoleFormData();
      this.roleModal = true;
    },
    closeRoleModal() {
      this.roleModal = false;
      this.$nextTick(() => {
        this.roleFormData = this.getEmptyRoleFormData();
        this.$refs.roleForm.reset();
      });
    },
    openAdminModal() {
      this.isEditAdmin = false;
      this.adminFormData = this.getEmptyAdminFormData();
      this.adminFormData.rolId = this.activeRoleTab;
      this.adminModal = true;
    },
    closeAdminModal() {
      this.adminModal = false;
      this.$nextTick(() => {
        this.adminFormData = this.getEmptyAdminFormData();
        this.$refs.adminForm.reset();
      });
    },
    editRole(role) {
      this.isEditRole = true;
      this.roleFormData = { 
        _id: role._id,
        nombreRol: role.nombreRol,
        descripcion: role.descripcion
      };
      this.roleModal = true;
    },
    editAdmin(item) {
      this.isEditAdmin = true;
      this.adminFormData = { 
        _id: item._id,
        nombre: item.nombre,
        apellido: item.apellido,
        correo: item.correo,
        rolId: item.rolId
      };
      this.adminModal = true;
    },
    confirmDeleteRole(role) {
      this.roleToDelete = role;
      this.dialogDeleteRole = true;
    },
    confirmDeleteAdmin(item) {
      this.adminToDelete = item;
      this.dialogDeleteAdmin = true;
    },
    closeDeleteRole() {
      this.dialogDeleteRole = false;
      this.roleToDelete = null;
    },
    closeDeleteAdmin() {
      this.dialogDeleteAdmin = false;
      this.adminToDelete = null;
    },
    showMessage(text, color = 'success') {
      this.snackbar = {
        show: true,
        text,
        color
      };
    },
    async saveRole() {
      if (!this.$refs.roleForm.validate()) return;

      try {
        this.loading = true;
        if (this.isEditRole) {
          await this.editRoleAction(this.roleFormData);
          this.showMessage('Rol actualizado exitosamente');
        } else {
          const result = await this.addRole(this.roleFormData);
          this.showMessage('Rol creado exitosamente');
          
          // Si se creó un nuevo rol, inicializar sus permisos por defecto
          if (result && result.data && result.data._id) {
            await this.initializeRolePermissions(result.data._id);
          }
        }
        this.closeRoleModal();
        this.loadData();
      } catch (error) {
        this.showMessage(error.response?.data?.message || 'Error al guardar el rol', 'error');
      } finally {
        this.loading = false;
      }
    },
    async saveAdmin() {
      if (!this.$refs.adminForm.validate()) return;

      try {
        this.loading = true;
        if (this.isEditAdmin) {
          const dataToSend = { ...this.adminFormData };
          if (!dataToSend.password) {
            delete dataToSend.password;
            delete dataToSend.confirmPassword;
          }
          await this.editAdminAction(dataToSend);
          this.showMessage('Administrador actualizado exitosamente');
        } else {
          const { password, confirmPassword, ...rest } = this.adminFormData;
          await this.addAdmin({ ...rest, password, confirmPassword });
          this.showMessage('Administrador creado exitosamente. Revisa tu bandeja de entrada para verificar el correo.', 'success');
        }
        this.closeAdminModal();
        this.loadData();
      } catch (error) {
        this.showMessage(error.response?.data?.message || 'Error al guardar el administrador', 'error');
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
        this.loadData();
        // Si se eliminó el rol activo, resetear el tab
        if (this.activeRoleTab === this.roleToDelete._id) {
          this.activeRoleTab = this.roles.length > 0 ? this.roles[0]._id : null;
        }
      } catch (error) {
        this.showMessage(error.response?.data?.message || 'Error al eliminar el rol', 'error');
      } finally {
        this.loading = false;
        this.closeDeleteRole();
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
        this.closeDeleteAdmin();
      }
    },
    async loadData() {
      try {
        this.loading = true;
        await Promise.all([
          this.getAllRoles(),
          this.getAllAdmins()
        ]);
                 // Seleccionar el primer rol por defecto si no hay uno seleccionado
         if (!this.activeRoleTab && this.roles.length > 0) {
           this.activeRoleTab = this.roles[0]._id;
           this.loadRolePermissions(this.roles[0]._id);
         }
         
         // Si no hay roles, inicializar los permisos por defecto
         if (this.roles.length === 0) {
           this.updateSelectAllStates();
         }
      } catch (error) {
        this.showMessage('Error al cargar los datos', 'error');
      } finally {
        this.loading = false;
      }
    },
    handleSelectionChange(value) {
      this.selected = value;
      this.selectAll = value.length === this.filteredAdmins.length && this.filteredAdmins.length > 0;
      this.indeterminate = value.length > 0 && value.length < this.filteredAdmins.length;
    },
    toggleSelectAll(items) {
      this.selected = items;
      this.selectAll = items.length === this.filteredAdmins.length && this.filteredAdmins.length > 0;
      this.indeterminate = items.length > 0 && items.length < this.filteredAdmins.length;
    },
    toggleSelectAllColumns() {
      this.adminHeaders.forEach(header => {
        header.visible = this.selectAllColumns;
      });
      this.indeterminateColumns = false;
    },
    applyTableFilters() {
      // No es necesario, el filtrado es reactivo en computed
    },
    // Métodos para manejar permisos
    updatePermission(menuId, permissionType) {
      const menuItem = this.menuPermissions.find(item => item.id === menuId);
      if (menuItem) {
        // Si se marca "All", marcar todos los permisos
        if (permissionType === 'all' && menuItem.permissions.all) {
          menuItem.permissions.view = true;
          menuItem.permissions.add = true;
          menuItem.permissions.edit = true;
          menuItem.permissions.delete = true;
        }
        // Si se desmarca algún permiso, desmarcar "All"
        else if (permissionType !== 'all' && !menuItem.permissions[permissionType]) {
          menuItem.permissions.all = false;
        }
        // Si todos los permisos están marcados, marcar "All"
        else if (permissionType !== 'all' && 
                 menuItem.permissions.view && 
                 menuItem.permissions.add && 
                 menuItem.permissions.edit && 
                 menuItem.permissions.delete) {
          menuItem.permissions.all = true;
        }
        
        // Aplicar lógica jerárquica para permisos de view
        if (permissionType === 'view') {
          this.applyHierarchicalViewLogic(menuItem);
        }
        
        this.updateSelectAllStates();
      }
    },
                             toggleAllPermissions(permissionType) {
         const isChecked = this[`selectAll${permissionType.charAt(0).toUpperCase() + permissionType.slice(1)}`];
         const selectedRole = this.roles.find(r => r._id === this.activeRoleTab);
         const isAdminRole = selectedRole && selectedRole.nombreRol.toLowerCase() === 'administrador';
         
         this.menuPermissions.forEach(menuItem => {
           // Proteger el Admin Panel para el rol de administrador
           if (isAdminRole && menuItem.name === 'Admin Panel' && permissionType === 'view') {
             // No cambiar el estado del Admin Panel para el rol de administrador
             return;
           }
           
           if (permissionType === 'all') {
             menuItem.permissions.view = isChecked;
             menuItem.permissions.add = isChecked;
             menuItem.permissions.edit = isChecked;
             menuItem.permissions.delete = isChecked;
             menuItem.permissions.all = isChecked;
           } else {
             menuItem.permissions[permissionType] = isChecked;
             // Actualizar estado de "All" si es necesario
             if (isChecked && 
                 menuItem.permissions.view && 
                 menuItem.permissions.add && 
                 menuItem.permissions.edit && 
                 menuItem.permissions.delete) {
               menuItem.permissions.all = true;
             } else if (!isChecked) {
               menuItem.permissions.all = false;
             }
           }
         });
         
         // Aplicar reglas especiales después de cambiar permisos
         if (isAdminRole) {
           this.applyAdminRoleRules(this.activeRoleTab);
         }
         
         this.updateSelectAllStates();
       },
                             updateSelectAllStates() {
         // Actualizar estados de "Select All" basado en los permisos actuales
         const selectedRole = this.roles.find(r => r._id === this.activeRoleTab);
         const isAdminRole = selectedRole && selectedRole.nombreRol.toLowerCase() === 'administrador';
         
         // Para el rol de administrador, excluir el Admin Panel del cálculo de "Select All" para view
         if (isAdminRole) {
           const adminPanelItem = this.menuPermissions.find(item => item.name === 'Admin Panel');
           const otherItems = this.menuPermissions.filter(item => item.name !== 'Admin Panel');
           
           this.selectAllView = otherItems.every(item => item.permissions.view);
           this.selectAllAdd = this.menuPermissions.every(item => item.permissions.add);
           this.selectAllEdit = this.menuPermissions.every(item => item.permissions.edit);
           this.selectAllDelete = this.menuPermissions.every(item => item.permissions.delete);
           this.selectAllAll = this.menuPermissions.every(item => item.permissions.all);
         } else {
           this.selectAllView = this.menuPermissions.every(item => item.permissions.view);
           this.selectAllAdd = this.menuPermissions.every(item => item.permissions.add);
           this.selectAllEdit = this.menuPermissions.every(item => item.permissions.edit);
           this.selectAllDelete = this.menuPermissions.every(item => item.permissions.delete);
           this.selectAllAll = this.menuPermissions.every(item => item.permissions.all);
         }
       },
    async savePermissions() {
      try {
        this.savingPermissions = true;
        
        // Preparar datos para enviar
        const permissionsData = {
          roleId: this.activeRoleTab,
          permissions: this.menuPermissions.map(item => ({
            menuId: item.id,
            menuName: item.name,
            level: item.level,
            permissions: item.permissions
          }))
        };
        
        console.log('Permisos a guardar:', permissionsData);
        
        // Guardar permisos en la base de datos
        await this.saveRolePermissions(permissionsData);
        
        this.showMessage('Permisos guardados exitosamente', 'success');
        
        // NO recargar permisos desde la API - solo actualizar el store local
        console.log('🔄 Permisos guardados, actualizando store local sin recargar desde API...');
        
        // Emitir evento para notificar que los permisos se actualizaron
        this.$emit('permissions-saved', {
          roleId: this.activeRoleTab,
          permissions: permissionsData.permissions
        });
        
        // También disparar un evento personalizado para que App.vue lo escuche
        window.dispatchEvent(new CustomEvent('permissions-saved', {
          detail: {
            roleId: this.activeRoleTab,
            permissions: permissionsData.permissions
          }
        }));
        
        // Evento adicional para forzar actualización inmediata del menú
        window.dispatchEvent(new CustomEvent('permissions-updated-immediate', {
          detail: {
            roleId: this.activeRoleTab,
            permissions: permissionsData.permissions,
            timestamp: Date.now()
          }
        }));
        
        console.log('🔄 Evento de permisos actualizados emitido (SIN recargar desde API)');
        
      } catch (error) {
        this.showMessage('Error al guardar los permisos', 'error');
        console.error('Error saving permissions:', error);
      } finally {
        this.savingPermissions = false;
      }
    },
              async loadRolePermissions(roleId) {
        try {
          console.log('Cargando permisos para el rol:', roleId);
          
          // Cargar permisos desde la base de datos
          const permissions = await this.getRolePermissions(roleId);
          
          if (permissions && permissions.length > 0) {
            // Mapear los permisos de la BD a la estructura del componente
            console.log('🔍 permisos:', permissions);
            this.menuPermissions = this.menuPermissions.map(menuItem => {
              console.log('🔍 menuItem:', menuItem);
              const dbPermission = permissions.find(p => p.menuId === menuItem.id);
              console.log('🔍 dbPermission:', dbPermission);
              if (dbPermission) {
                console.log('🔍 menuItem:', menuItem);
                return {
                  ...menuItem,
                  permissions: dbPermission.permissions
                };
              }
              return menuItem;
            });
          } else {
            // Si no hay permisos en la BD, usar los permisos por defecto
            this.initializeDefaultPermissions();
          }
          
          // Aplicar reglas especiales para el rol de administrador
          this.applyAdminRoleRules(roleId);
          
          // Inicializar estados de "Select All"
          this.updateSelectAllStates();
        } catch (error) {
          console.error('Error al cargar permisos:', error);
          // En caso de error, usar permisos por defecto
          this.initializeDefaultPermissions();
          this.updateSelectAllStates();
        }
      },

      // Método para inicializar permisos por defecto
      initializeDefaultPermissions() {
        this.menuPermissions = this.menuPermissions.map(item => ({
          ...item,
          permissions: {
            view: false,
            add: false,
            edit: false,
            delete: false,
            all: false
          }
        }));
      },

      // Método para aplicar reglas especiales del rol de administrador
      applyAdminRoleRules(roleId) {
        const selectedRole = this.roles.find(r => r._id === roleId);
        if (selectedRole && selectedRole.nombreRol.toLowerCase() === 'administrador') {
          // Para el rol de administrador, siempre activar el view del Admin Panel
          const adminPanelItem = this.menuPermissions.find(item => item.name === 'Admin Panel');
          if (adminPanelItem) {
            adminPanelItem.permissions.view = true;
          }
        }
      },

      // Método para verificar si un checkbox debe estar deshabilitado
      isCheckboxDisabled(menuItem, permissionType) {
        const selectedRole = this.roles.find(r => r._id === this.activeRoleTab);
        if (selectedRole && selectedRole.nombreRol.toLowerCase() === 'administrador') {
          // Para el rol de administrador, el view del Admin Panel no se puede editar
          if (menuItem.name === 'Admin Panel' && permissionType === 'view') {
            return true;
          }
        }
        return false;
      },

      // Método para verificar si un elemento debe estar protegido para el rol de administrador
      isProtectedForAdmin(menuItem, permissionType) {
        const selectedRole = this.roles.find(r => r._id === this.activeRoleTab);
        if (selectedRole && selectedRole.nombreRol.toLowerCase() === 'administrador') {
          return menuItem.name === 'Admin Panel' && permissionType === 'view';
        }
        return false;
      },

      // Método para inicializar permisos por defecto para un nuevo rol
      async initializeRolePermissions(roleId) {
        try {
          const defaultPermissions = this.menuPermissions.map(item => ({
            roleId: roleId,
            menuId: item.id,
            menuName: item.name,
            level: item.level,
            permissions: {
              view: false,
              add: false,
              edit: false,
              delete: false,
              all: false
            }
          }));

          // Guardar permisos por defecto en la base de datos
          await this.saveRolePermissions({
            roleId: roleId,
            permissions: defaultPermissions
          });

          console.log('Permisos por defecto inicializados para el nuevo rol');
        } catch (error) {
          console.error('Error al inicializar permisos por defecto:', error);
        }
      },

      // Método para aplicar lógica jerárquica de permisos de view
      // Lógica implementada:
      // 1. Si se marca un elemento padre (nivel 1 o 2) → se marcan automáticamente todos sus hijos
      // 2. Si se desmarca un elemento padre → se desmarcan automáticamente todos sus hijos
      // 3. Si se marcan todos los elementos hijos → se marca automáticamente el elemento padre
      // 4. Si se desmarca algún elemento hijo → se desmarca automáticamente el elemento padre
      applyHierarchicalViewLogic(menuItem) {
        const selectedRole = this.roles.find(r => r._id === this.activeRoleTab);
        const isAdminRole = selectedRole && selectedRole.nombreRol.toLowerCase() === 'administrador';
        
        // Proteger el Admin Panel para el rol de administrador
        if (isAdminRole && menuItem.name === 'Admin Panel') {
          // No aplicar lógica jerárquica al Admin Panel para el rol de administrador
          return;
        }
        
        if (menuItem.permissions.view) {
          // Si se marca el padre, marcar todos los hijos
          this.markChildrenView(menuItem);
        } else {
          // Si se desmarca el padre, desmarcar todos los hijos
          this.unmarkChildrenView(menuItem);
        }
        
        // Verificar si todos los hijos están marcados para marcar el padre
        this.checkParentViewStatus(menuItem);
        
        // Verificar el estado de los padres cuando se cambia un elemento hijo
        if (menuItem.level > 1) {
          this.updateParentViewStatus(menuItem);
        }
        
        // Aplicar reglas especiales después de la lógica jerárquica
        if (isAdminRole) {
          this.applyAdminRoleRules(this.activeRoleTab);
        }
      },

      // Marcar todos los elementos hijos con view = true
      markChildrenView(menuItem) {
        const children = this.getChildren(menuItem);
        const selectedRole = this.roles.find(r => r._id === this.activeRoleTab);
        const isAdminRole = selectedRole && selectedRole.nombreRol.toLowerCase() === 'administrador';
        
        children.forEach(child => {
          // Proteger el Admin Panel para el rol de administrador
          if (isAdminRole && child.name === 'Admin Panel') {
            return; // No cambiar el estado del Admin Panel
          }
          child.permissions.view = true;
        });
      },

      // Desmarcar todos los elementos hijos con view = false
      unmarkChildrenView(menuItem) {
        const children = this.getChildren(menuItem);
        const selectedRole = this.roles.find(r => r._id === this.activeRoleTab);
        const isAdminRole = selectedRole && selectedRole.nombreRol.toLowerCase() === 'administrador';
        
        children.forEach(child => {
          // Proteger el Admin Panel para el rol de administrador
          if (isAdminRole && child.name === 'Admin Panel') {
            return; // No cambiar el estado del Admin Panel
          }
          child.permissions.view = false;
        });
      },

      // Obtener todos los elementos hijos de un elemento padre
      getChildren(parentItem) {
        const children = [];
        
        // Buscar elementos del siguiente nivel
        if (parentItem.level === 1) {
          // Para elementos de nivel 1, buscar elementos de nivel 2 que pertenezcan al grupo
          if (parentItem.name === 'Work Platform') {
            children.push(...this.menuPermissions.filter(item => 
              item.level === 2 && (item.name === 'Home' || item.name === 'Dashboard' || 
              item.name === 'Jobs' || item.name === 'Companies' || item.name === 'My Profile' || 
              item.name === 'Messages' || item.name === 'Blog')
            ));
          } else if (parentItem.name === 'Sell Platform') {
            children.push(...this.menuPermissions.filter(item => 
              item.level === 2 && (item.name === 'Orders' || item.name === 'Order Detail')
            ));
          }
        } else if (parentItem.level === 2) {
          // Para elementos de nivel 2, buscar elementos de nivel 3 que pertenezcan al mismo grupo
          if (parentItem.name === 'Blog') {
            children.push(...this.menuPermissions.filter(item => 
              item.level === 3 && (item.name === 'All Articles' || item.name === 'Categories' || 
              item.name === 'Write Article' || item.name === 'My Posts')
            ));
          }
        }
        
        return children;
      },

      // Obtener el grupo padre de un elemento
      getParentGroup(item) {
        if (item.level === 2) {
          // Para elementos de nivel 2, buscar el elemento de nivel 1 que los contiene
          if (item.name === 'Home' || item.name === 'Dashboard' || item.name === 'Jobs' || 
              item.name === 'Companies' || item.name === 'My Profile' || item.name === 'Messages') {
            return 'Work Platform';
          } else if (item.name === 'Blog') {
            return 'Work Platform';
          } else if (item.name === 'Orders' || item.name === 'Order Detail') {
            return 'Sell Platform';
          }
        } else if (item.level === 3) {
          // Para elementos de nivel 3, buscar el elemento de nivel 2 que los contiene
          if (item.name === 'All Articles' || item.name === 'Categories' || 
              item.name === 'Write Article' || item.name === 'My Posts') {
            return 'Blog';
          }
        }
        return null;
      },

      // Verificar si un elemento pertenece a un grupo específico
      belongsToGroup(item, groupName) {
        const parentGroup = this.getParentGroup(item);
        return parentGroup === groupName;
      },

      // Verificar si todos los hijos están marcados para marcar el padre
      checkParentViewStatus(menuItem) {
        if (menuItem.level === 1) {
          // Para elementos de nivel 1, verificar si todos los elementos de nivel 2 están marcados
          const level2Items = this.menuPermissions.filter(item => item.level === 2);
          const allLevel2Marked = level2Items.every(item => item.permissions.view);
          
          if (allLevel2Marked) {
            menuItem.permissions.view = true;
          }
        } else if (menuItem.level === 2) {
          // Para elementos de nivel 2, verificar si todos los elementos de nivel 3 están marcados
          const level3Items = this.menuPermissions.filter(item => 
            item.level === 3 && this.belongsToGroup(item, menuItem.name)
          );
          
          if (level3Items.length > 0) {
            const allLevel3Marked = level3Items.every(item => item.permissions.view);
            if (allLevel3Marked) {
              menuItem.permissions.view = true;
            }
          }
        }
      },

      // Actualizar el estado de los elementos padre cuando se cambia un elemento hijo
      updateParentViewStatus(menuItem) {
        // Actualizar el elemento padre de nivel 2
        if (menuItem.level === 3) {
          const parentLevel2 = this.getParentLevel2(menuItem);
          if (parentLevel2) {
            this.updateElementViewStatus(parentLevel2);
          }
        }
        
        // Actualizar el elemento padre de nivel 1
        if (menuItem.level === 2) {
          const parentLevel1 = this.getParentLevel1(menuItem);
          if (parentLevel1) {
            this.updateElementViewStatus(parentLevel1);
          }
        }
      },

      // Obtener el elemento padre de nivel 2 para un elemento de nivel 3
      getParentLevel2(menuItem) {
        if (menuItem.name === 'All Articles' || menuItem.name === 'Categories' || 
            menuItem.name === 'Write Article' || menuItem.name === 'My Posts') {
          return this.menuPermissions.find(item => item.name === 'Blog');
        }
        return null;
      },

      // Obtener el elemento padre de nivel 1 para un elemento de nivel 2
      getParentLevel1(menuItem) {
        if (menuItem.name === 'Home' || menuItem.name === 'Dashboard' || menuItem.name === 'Jobs' || 
            menuItem.name === 'Companies' || menuItem.name === 'My Profile' || menuItem.name === 'Messages' ||
            menuItem.name === 'Blog') {
          return this.menuPermissions.find(item => item.name === 'Work Platform');
        } else if (menuItem.name === 'Orders' || menuItem.name === 'Order Detail') {
          return this.menuPermissions.find(item => item.name === 'Sell Platform');
        }
        return null;
      },

      // Actualizar el estado de view de un elemento basado en sus hijos
      updateElementViewStatus(menuItem) {
        const children = this.getChildren(menuItem);
        if (children.length > 0) {
          const allChildrenMarked = children.every(child => child.permissions.view);
          const someChildrenMarked = children.some(child => child.permissions.view);
          
          if (allChildrenMarked) {
            menuItem.permissions.view = true;
          } else if (!someChildrenMarked) {
            menuItem.permissions.view = false;
          }
        }
      }
  },
  mounted() {
    this.loadData();
  }
};
</script>

<style scoped>
.border-right {
  border-right: 1px solid #e0e0e0;
}

.role-tab-item {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.role-tab-item:hover {
  background-color: #f5f5f5;
}

.role-tab-item.v-list-item--active {
  background-color: #e3f2fd;
  border-right: 3px solid #1976d2;
}

.role-tab-item.v-list-item--active .v-list-item-title {
  font-weight: bold !important;
  color: #1976d2;
}

.content-background {
  background-color: #c2c2c2;
}

.max-width-300 {
  max-width: 300px;
}

.v-data-table ::v-deep .v-data-table__wrapper {
  overflow-x: auto;
}



/* Estilos para la matriz de permisos - Alineamiento perfecto */
.permissions-matrix {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  width: 100%;
}

.permissions-header {
  display: flex;
  background-color: #f5f5f5;
  border-bottom: 2px solid #e0e0e0;
  font-weight: 600;
  min-height: 64px;
}

.menu-item-header {
  width: 300px;
  min-width: 300px;
  padding: 16px;
  border-right: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.permission-columns {
  display: flex;
  flex: 1;
}

.permission-header {
  flex: 1;
  min-width: 120px;
  padding: 16px 8px;
  text-align: center;
  border-right: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.permission-header:last-child {
  border-right: none;
}

.permission-row {
  display: flex;
  border-bottom: 1px solid #e0e0e0;
  transition: background-color 0.2s ease;
  min-height: 64px;
}

.permission-row:hover {
  background-color: #fafafa;
}

.permission-row.top-level {
  background-color: #e3f2fd;
  font-weight: 600;
  border-left: 4px solid #1976d2;
}

.permission-row.sub-level {
  background-color: #ffffff;
}

.permission-row.sub-level[data-level="2"] {
  border-left: 2px solid #42a5f5;
}

.permission-row.sub-level[data-level="3"] {
  border-left: 2px solid #90caf9;
}

.menu-item {
  width: 300px;
  min-width: 300px;
  padding: 16px;
  border-right: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  position: relative;
}

.menu-indicator {
  color: #1976d2;
  font-weight: bold;
  margin-right: 8px;
  font-family: monospace;
  font-size: 14px;
  position: absolute;
  left: 16px;
}

.menu-item[data-level="2"] .menu-indicator {
  left: 32px;
}

.menu-item[data-level="3"] .menu-indicator {
  left: 48px;
}

.menu-item {
  display: flex;
  align-items: center;
  font-weight: 500;
}

.permission-cell {
  flex: 1;
  min-width: 120px;
  padding: 16px 8px;
  text-align: center;
  border-right: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.permission-cell:last-child {
  border-right: none;
}

/* Asegurar que los checkboxes estén perfectamente centrados */
.permission-cell .v-checkbox {
  margin: 0;
  padding: 0;
}

.permission-header .v-checkbox {
  margin: 0;
  padding: 0;
}

/* Estilos para el texto del menú */
.menu-text {
  margin-left: 24px;
}

.menu-item[data-level="2"] .menu-text {
  margin-left: 40px;
}

.menu-item[data-level="3"] .menu-text {
  margin-left: 56px;
}

/* Asegurar alineamiento perfecto de las filas */
.permission-row {
  align-items: stretch;
}

.permission-row > * {
  display: flex;
  align-items: center;
}

/* Asegurar que las columnas tengan el mismo ancho */
.permission-columns > * {
  flex: 1;
  min-width: 0;
}

/* Estilos para la leyenda */
.permissions-legend {
  background-color: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

.legend-item {
  width: 16px;
  height: 16px;
  border-radius: 2px;
}

.top-level-legend {
  background-color: #e3f2fd;
  border-left: 4px solid #1976d2;
}

.sub-level-legend-2 {
  background-color: #ffffff;
  border-left: 2px solid #42a5f5;
}

.sub-level-legend-3 {
  background-color: #ffffff;
  border-left: 2px solid #90caf9;
}

.gap-4 {
  gap: 16px;
}

/* Responsive para pantallas pequeñas */
@media (max-width: 768px) {
  .permissions-matrix {
    overflow-x: auto;
  }
  
  .permissions-header,
  .permission-row {
    min-width: 800px;
  }
  
  .menu-item-header,
  .menu-item {
    min-width: 250px;
    width: 250px;
  }
  
  .permission-header,
  .permission-cell {
    min-width: 100px;
  }
}

/* Asegurar que la matriz mantenga su estructura en todos los navegadores */
.permissions-matrix {
  table-layout: fixed;
  border-collapse: collapse;
}

/* Asegurar que los checkboxes de Vuetify estén perfectamente centrados */
.permission-cell .v-input,
.permission-header .v-input {
  margin: 0;
  padding: 0;
  width: 100%;
  justify-content: center;
}

.permission-cell .v-input__control,
.permission-header .v-input__control {
  justify-content: center;
}
</style>