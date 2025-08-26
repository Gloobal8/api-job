<template>
  <v-container>
        <div class="d-flex align-center mb-4">
      <div class="mr-auto">
        <h1>Dashboard</h1>
        <!-- Mostrar información del usuario logueado -->
        <div v-if="currentAdmin" class="d-flex align-center mt-2">
          <v-icon color="primary" class="mr-2">mdi-account-circle</v-icon>
          <div>
            <div class="text-subtitle-1">
              <strong>Bienvenido:</strong> {{ currentAdmin.correo || 'N/A' }}
            </div>
                         <div class="text-caption text-grey-darken-1">
                              <strong>Rol:</strong> 
                <v-chip
                  :color="getRoleColor(currentAdmin?.rolId)"
                  text-color="white"
                  x-small
                  class="ml-1"
                >
                  {{ getRoleName(currentAdmin?.rolId) || 'N/A' }}
                </v-chip>
                <div class="text-caption text-grey mt-1">
                  ID: {{ currentAdmin?.rolId || 'N/A' }}
                </div>
             </div>
          </div>
        </div>
        
        <!-- Indicador de carga -->
        <div v-else-if="loadingAdmin" class="d-flex align-center mt-2">
          <v-progress-circular indeterminate size="20" color="primary" class="mr-2"></v-progress-circular>
          <span class="text-caption text-grey">Cargando información del usuario...</span>
        </div>
        
        <!-- Mensaje de error -->
        <div v-else-if="adminError" class="d-flex align-center mt-2">
          <v-icon color="error" class="mr-2">mdi-alert-circle</v-icon>
          <span class="text-caption text-error">{{ adminError }}</span>
        </div>
        
        <!-- Botón de debug para permisos 
        <div v-if="currentAdmin" class="mt-2">
          <v-btn
            color="info"
            text
            small
            @click="checkPermissionsStatus"
            class="text-caption"
          >
            <v-icon left small>mdi-bug</v-icon>
            Verificar Permisos
          </v-btn>
          
          
          <div class="mt-2">
            <v-chip
              :color="$store.getters['permissions/hasPermissions'] ? 'success' : 'warning'"
              text-color="white"
              x-small
              class="mr-2"
            >
              <v-icon left x-small>
                {{ $store.getters['permissions/hasPermissions'] ? 'mdi-check-circle' : 'mdi-alert-circle' }}
              </v-icon>
              {{ $store.getters['permissions/hasPermissions'] ? 'Permisos Cargados' : 'Sin Permisos' }}
            </v-chip>
            
            <v-chip
              :color="$store.getters['permissions/isAdmin'] ? 'primary' : 'grey'"
              text-color="white"
              x-small
            >
              <v-icon left x-small>
                {{ $store.getters['permissions/isAdmin'] ? 'mdi-shield-crown' : 'mdi-shield-account' }}
              </v-icon>
              {{ $store.getters['permissions/isAdmin'] ? 'Admin' : 'Usuario' }}
            </v-chip>
          </div>
        </div>-->
      </div>
             
       <v-btn color="error" dark @click="logoutAdmin">
         <v-icon left>mdi-logout</v-icon>
         Cerrar sesión
       </v-btn>
    </div>
         <!-- Solo mostrar tabs para administradores -->
     <div v-if="isAdminRole && currentAdmin && !loadingAdmin">
       <v-alert
         type="success"
         variant="tonal"
         class="mb-4"
         title="Panel de Administración Completo"
       >
         <p class="mb-0">Tienes acceso completo a todas las funciones de administración del sistema.</p>
       </v-alert>
       
       <v-tabs v-model="tab" color="deep-blue accent-4" class="my-5">
         <v-tab value="admins">Administradores</v-tab>
         <v-tab value="rols">Roles</v-tab>
         <v-tab value="permissions">Permisos</v-tab>
         <!-- <v-tab value="modules">Módulos</v-tab> -->
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
           <!-- <h1>Estamos trabajando en los permisos... ¿De verdad verdaita? Si sí, enserio.</h1> -->
           <Permissions @permissions-saved="onPermissionsSaved" />
         </v-tab-item>
         <!-- Módulos Tab -->
         <v-tab-item v-if="tab == 'modules'">
           <Modules />
         </v-tab-item>
       </v-tabs-items>
     </div>

     <!-- Mostrar dashboard específico según el rol para usuarios no administradores -->
     <div v-else-if="currentAdmin && !loadingAdmin">
       <v-alert
         type="info"
         variant="tonal"
         class="mb-4"
         :title="`Bienvenido ${getUserInfo()?.nombre || 'Usuario'}`"
       >
         <p class="mb-2">Tu rol actual es: <strong>{{ getRoleName(currentAdmin?.rolId) }}</strong></p>
         <p class="mb-0">Como usuario no administrador, solo puedes editar tu información personal (nombre y apellido). El correo electrónico y rol no se pueden modificar.</p>
       </v-alert>
       
       <!-- Panel de edición de perfil para usuarios no administradores -->
       <v-card class="mb-4">
         <v-card-title class="d-flex align-center">
           <v-icon color="primary" class="mr-2">mdi-account-edit</v-icon>
           Editar Mi Perfil
           <v-chip
             color="info"
             text-color="white"
             x-small
             class="ml-2"
           >
             Solo nombre y apellido
           </v-chip>
           <v-chip
             v-if="hasUnsavedChanges"
             color="warning"
             text-color="white"
             x-small
             class="ml-2"
           >
             Cambios pendientes
           </v-chip>
         </v-card-title>
         <v-card-text>
           <v-form ref="profileForm" v-model="profileFormValid">
             <v-row>
               <v-col cols="12" md="6">
                 <v-text-field
                   v-model="profileForm.nombre"
                   label="Nombre"
                   :rules="[rules.required, rules.minLength]"
                   variant="outlined"
                   prepend-icon="mdi-account"
                 />
               </v-col>
               <v-col cols="12" md="6">
                 <v-text-field
                   v-model="profileForm.apellido"
                   label="Apellido"
                   :rules="[rules.required, rules.minLength]"
                   variant="outlined"
                   prepend-icon="mdi-account"
                 />
               </v-col>
               <v-col cols="12" md="6">
                 <v-text-field
                   v-model="profileForm.correo"
                   label="Correo Electrónico"
                   type="email"
                   :rules="[rules.required, rules.email]"
                   variant="outlined"
                   prepend-icon="mdi-email"
                   readonly
                   disabled
                 />
               </v-col>
               <v-col cols="12" md="6">
                 <v-text-field
                   v-model="profileForm.rol"
                   label="Rol"
                   variant="outlined"
                   prepend-icon="mdi-shield-account"
                   readonly
                   disabled
                 />
               </v-col>
             </v-row>
           </v-form>
           
           <!-- Mensaje de ayuda -->
           <v-alert
             type="info"
             variant="tonal"
             class="mt-4"
             icon="mdi-information"
           >
             <div class="text-body-2">
               <strong>Información:</strong> Solo puedes editar tu nombre y apellido. 
               El correo electrónico y rol son campos de solo lectura por razones de seguridad.
             </div>
           </v-alert>
           
           <!-- Última actualización -->
           <v-alert
             v-if="currentAdmin.updatedAt"
             type="success"
             variant="tonal"
             class="mt-4"
             icon="mdi-clock-check"
           >
             <div class="text-body-2">
               <strong>Última Actualización:</strong> {{ formatDate(currentAdmin.updatedAt) }}
             </div>
           </v-alert>
         </v-card-text>
         <v-card-actions class="pa-4">
           <v-btn
             color="secondary"
             variant="outlined"
             @click="resetProfileForm"
             :disabled="savingProfile"
           >
             <v-icon left>mdi-refresh</v-icon>
             Restablecer
           </v-btn>
           <v-spacer />
           <v-btn
             color="primary"
             :loading="savingProfile"
             :disabled="!profileFormValid"
             @click="saveProfile"
           >
             <v-icon left>mdi-content-save</v-icon>
             Guardar Cambios
           </v-btn>
         </v-card-actions>
       </v-card>
       
       <!-- Información adicional del usuario -->
       <v-card>
         <v-card-title class="d-flex align-center">
           <v-icon color="info" class="mr-2">mdi-information</v-icon>
           Información de Mi Cuenta
         </v-card-title>
         <v-card-text>
           <v-row>
             <v-col cols="12" md="6">
               <div class="text-subtitle-2 text-grey-darken-1">ID de Usuario</div>
               <div class="text-body-1">{{ currentAdmin._id || 'N/A' }}</div>
             </v-col>
             <v-col cols="12" md="6">
               <div class="text-subtitle-2 text-grey-darken-1">Fecha de Registro</div>
               <div class="text-body-1">{{ formatDate(currentAdmin.createdAt) || 'N/A' }}</div>
             </v-col>
             <v-col cols="12" md="6">
               <div class="text-subtitle-2 text-grey-darken-1">Última Actualización</div>
               <div class="text-body-1">{{ formatDate(currentAdmin.updatedAt) || 'N/A' }}</div>
             </v-col>
             <v-col cols="12" md="6">
               <div class="text-subtitle-2 text-grey-darken-1">Estado de la Cuenta</div>
               <v-chip
                 :color="currentAdmin.activo ? 'success' : 'error'"
                 text-color="white"
                 x-small
               >
                 {{ currentAdmin.activo ? 'Activa' : 'Inactiva' }}
               </v-chip>
             </v-col>
           </v-row>
         </v-card-text>
       </v-card>
     </div>
     
     <!-- Diálogo de confirmación -->
     <v-dialog v-model="confirmDialog.show" max-width="500" persistent>
       <v-card>
         <v-card-title class="d-flex align-center">
           <v-icon color="primary" class="mr-2">mdi-help-circle</v-icon>
           {{ confirmDialog.title }}
         </v-card-title>
         <v-card-text>
           <p class="text-body-1">{{ confirmDialog.message }}</p>
         </v-card-text>
         <v-card-actions>
           <v-spacer />
           <v-btn
             color="secondary"
             variant="outlined"
             :disabled="confirmDialog.loading"
             @click="confirmDialog.show = false"
             >
             Cancelar
           </v-btn>
           <v-btn
             color="primary"
             :loading="confirmDialog.loading"
             @click="confirmProfileUpdate"
           >
             Confirmar
           </v-btn>
         </v-card-actions>
       </v-card>
     </v-dialog>
     
     <!-- Diálogo de éxito -->
     <v-dialog v-model="successDialog.show" max-width="600" persistent>
       <v-card>
         <v-card-title class="d-flex align-center">
           <v-icon color="success" class="mr-2">mdi-check-circle</v-icon>
           {{ successDialog.title }}
         </v-card-title>
         <v-card-text>
           <div class="text-body-1 mb-4">
             <strong>Cambios Realizados:</strong>
             <ul class="mt-2" style="padding-left: 40px;">
               <li><strong>Nombre:</strong> {{ successDialog.details.nombre }}</li>
               <li><strong>Apellido:</strong> {{ successDialog.details.apellido }}</li>
             </ul>
           </div>
           
           <div class="text-body-1 mb-4">
             <strong>Información del Cambio:</strong>
             <ul class="mt-2" style="padding-left: 40px;">
               <li><strong>Fecha y Hora:</strong> {{ successDialog.details.fecha }}</li>
               <li><strong>Usuario ID:</strong> {{ successDialog.details.userId }}</li>
               <li><strong>Correo:</strong> {{ successDialog.details.correo }}</li>
               <li><strong>Rol:</strong> {{ successDialog.details.rol }}</li>
             </ul>
           </div>
           
           <div class="text-caption text-grey-darken-1">
             Los cambios han sido guardados en la base de datos y están ahora disponibles en el sistema.
           </div>
         </v-card-text>
         <v-card-actions>
           <v-spacer />
           <v-btn
             color="success"
             @click="successDialog.show = false"
           >
             Entendido
           </v-btn>
         </v-card-actions>
       </v-card>
     </v-dialog>
  </v-container>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import SuperAdmin from '@/components/admin/SuperAdmin.vue';
import Rols from '@/components/admin/Rols.vue';
import Permissions from '@/components/admin/Permissions.vue';
import Modules from '@/components/admin/Modules.vue';
import UserDashboard from '@/components/admin/UserDashboard.vue';
import ModeratorDashboard from '@/components/admin/ModeratorDashboard.vue';
import SuperAdminDashboard from '@/components/admin/SuperAdminDashboard.vue';
import AdminDashboard from '@/components/admin/AdminDashboard.vue';

export default {
  components: {
    SuperAdmin,
    Rols,
    Permissions,
    Modules,
    UserDashboard,
    ModeratorDashboard,
    SuperAdminDashboard,
    AdminDashboard
  },
  data() {
    return {
      tab: null, // For managing the active tab
      adminSearch: '', // For filtering admin items
      profileSearch: '', // For filtering profile items
      currentAdmin: null, // Para almacenar la información del usuario actual
      loadingAdmin: false, // Para indicar si se está cargando la información del admin
      adminError: null, // Para mostrar errores al cargar la información del admin
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
      // Formulario de perfil para usuarios no administradores
      profileForm: {
        nombre: '',
        apellido: '',
        correo: '',
        rol: ''
      },
      profileFormValid: false,
      savingProfile: false,
      // Reglas de validación para el formulario
      rules: {
        required: v => !!v || 'Este campo es requerido',
        minLength: v => (v && v.length >= 2) || 'Mínimo 2 caracteres',
        email: v => /.+@.+\..+/.test(v) || 'Correo electrónico válido requerido'
      },
      // Diálogo de confirmación
      confirmDialog: {
        show: false,
        title: '',
        message: '',
        loading: false
      },
      // Diálogo de éxito
      successDialog: {
        show: false,
        title: '',
        message: '',
        details: {}
      }
    };
  },
  computed: {
    ...mapState({
      roles: state => state.admin.roles
    }),
    
    // Determinar si el usuario actual es administrador
    isAdminRole() {
      if (!this.currentAdmin || !this.currentAdmin.rolId) return false;
      const roleName = this.getRoleName(this.currentAdmin.rolId);
      return roleName && roleName.toLowerCase() === 'administrador';
    },
    
    // Obtener el nombre del rol actual
    currentRoleName() {
      if (!this.currentAdmin || !this.currentAdmin.rolId) return null;
      const roleName = this.getRoleName(this.currentAdmin.rolId);
      return roleName ? roleName.toLowerCase().replace(/\s+/g, '_') : null;
    },
    
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
  mounted() {
     // Cargar roles desde el store
     this.loadRoles();
     // Cargar información del usuario admin desde localStorage
     this.loadCurrentAdmin();
     // Solo establecer tab por defecto si es administrador
     this.$nextTick(() => {
       if (this.isAdminRole) {
         this.tab = 'admins';
       }
     });
   },
  watch: {
     // Observar cambios en el estado de permisos
     '$store.state.permissions.userPermissions': {
       handler(newPermissions) {
         if (newPermissions) {
           console.log('🔄 Permisos actualizados en dashboard:', newPermissions);
           this.checkPermissionsStatus();
         }
       },
       deep: true
     },
     
     // Observar cambios en el rol del usuario
     '$store.state.permissions.userRole': {
       handler(newRole) {
         if (newRole) {
           console.log('🔄 Rol actualizado en dashboard:', newRole);
         }
       }
     },
     
     // Observar cambios en el rol del usuario actual
     currentRoleName: {
       handler(newRoleName) {
         console.log('🔄 Rol del usuario cambiado a:', newRoleName);
         // Si no es administrador, limpiar el tab
         if (!this.isAdminRole) {
           this.tab = null;
         }
       },
       immediate: true
     },
     
     // Observar cambios en el usuario admin actual
     currentAdmin: {
       handler(newAdmin) {
         if (newAdmin) {
           console.log('🔄 Usuario admin actualizado, inicializando formulario...');
           this.initializeProfileForm();
         }
       },
       deep: true
     }
   },
  computed: {
    // Determinar si el usuario actual es administrador
    isAdminRole() {
      if (!this.currentAdmin || !this.currentAdmin.rolId) return false;
      const roleName = this.getRoleName(this.currentAdmin.rolId);
      return roleName && roleName.toLowerCase() === 'administrador';
    },
    
    // Obtener el nombre del rol actual
    currentRoleName() {
      if (!this.currentAdmin || !this.currentAdmin.rolId) return null;
      const roleName = this.getRoleName(this.currentAdmin.rolId);
      return roleName ? roleName.toLowerCase().replace(/\s+/g, '_') : null;
    },
    
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
    ...mapActions('admin', ['getAllRoles']),
    
    // Cargar roles desde el store
    async loadRoles() {
      try {
        console.log('🔄 Cargando roles...');
        if (this.getAllRoles) {
          await this.getAllRoles();
          console.log('✅ Roles cargados:', this.roles);
        } else {
          console.warn('⚠️ getAllRoles no está disponible');
        }
      } catch (error) {
        console.error('❌ Error cargando roles:', error);
      }
    },
    
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
    logoutAdmin() {
      // Limpiar datos del admin
      localStorage.removeItem('admin');
      
      // Limpiar permisos del usuario
      this.$store.dispatch('permissions/clearUserPermissions');
      
      // Limpiar estado local
      this.currentAdmin = null;
      this.loadingAdmin = false;
      this.adminError = null;
      
      console.log('🚪 Sesión de admin cerrada, permisos limpiados');
      
      // Redirigir al login
      this.$router.push('/admin/login');
    },
    
    // Cargar información del usuario admin actual
    async loadCurrentAdmin() {
      this.loadingAdmin = true;
      this.adminError = null;
      
      try {
        const adminData = localStorage.getItem('admin');
        if (adminData) {
          this.currentAdmin = JSON.parse(adminData);
          console.log('🔐 Usuario admin cargado:', this.currentAdmin);
          
          // Inicializar formulario de perfil
          this.initializeProfileForm();
          
          // Establecer el rol del usuario en el módulo de permisos
          if (this.currentAdmin.rolId) {
            try {
              console.log('🔐 Estableciendo rol en módulo de permisos:', this.currentAdmin.rolId);
              await this.$store.dispatch('permissions/setUserRole', this.currentAdmin.rolId);
              console.log('✅ Rol establecido en permisos:', this.currentAdmin.rolId);
            } catch (permError) {
              console.warn('⚠️ No se pudieron cargar los permisos del rol:', permError);
              this.adminError = 'Error al cargar permisos del rol';
            }
          } else {
            console.warn('⚠️ El usuario admin no tiene rolId definido');
            this.adminError = 'Usuario sin rol definido';
          }
        } else {
          console.warn('⚠️ No hay datos de admin en localStorage');
          this.adminError = 'No se encontraron datos de sesión';
          // Si no hay datos, redirigir al login después de un delay
          setTimeout(() => {
            this.$router.push('/admin/login');
          }, 3000);
        }
      } catch (error) {
        console.error('❌ Error al cargar datos del admin:', error);
        this.adminError = 'Error al cargar información del usuario';
        // Redirigir al login después de un delay
        setTimeout(() => {
          this.$router.push('/admin/login');
        }, 3000);
      } finally {
        this.loadingAdmin = false;
      }
    },
    
    // Obtener color del rol para el chip
    getRoleColor(rolId) {
      // Si no hay rolId, retornar color por defecto
      if (!rolId) return 'secondary';
      
      // Primero intentar obtener el nombre del rol
      const roleName = this.getRoleName(rolId);
      
      const roleColors = {
        'administrador': 'primary',
        'super_admin': 'success',
        'admin': 'info',
        'moderator': 'warning',
        'user': 'grey'
      };
      
      // Usar el nombre del rol para obtener el color, o el ID como fallback
      return roleColors[roleName.toLowerCase()] || roleColors[rolId] || 'secondary';
    },
    
    // Obtener nombre del rol
    getRoleName(rolId) {
      // Si no hay rolId, retornar mensaje por defecto
      if (!rolId) return 'Sin Rol';
      
      // Buscar el nombre del rol en el store
      const roles = this.$store.state.admin.roles;
      
      // Si no hay roles cargados, mostrar mensaje de carga
      if (!roles || roles.length === 0) {
        console.log('🔄 No hay roles cargados aún');
        return 'Cargando...';
      }
      
      const role = roles.find(r => r._id === rolId);
      console.log('🔍 Buscando rol con ID:', rolId, 'en roles:', roles, 'Resultado:', role);
      
      if (role) {
        console.log('✅ Rol encontrado:', role.nombreRol);
        return role.nombreRol;
      } else {
        console.warn('⚠️ Rol no encontrado para ID:', rolId);
        return `Rol ID: ${rolId}`;
      }
    },
    

    
    // Verificar estado de permisos del usuario
    checkPermissionsStatus() {
      const permissionsState = this.$store.state.permissions;
      console.log('🔍 Estado actual de permisos:', {
        userRole: permissionsState.userRole,
        userPermissions: permissionsState.userPermissions,
        loading: permissionsState.loading,
        error: permissionsState.error,
        hasPermissions: this.$store.getters['permissions/hasPermissions'],
        isAdmin: this.$store.getters['permissions/isAdmin']
      });
      
      // Mostrar permisos específicos si existen
      if (permissionsState.userPermissions) {
        console.log('📋 Permisos del usuario:');
        permissionsState.userPermissions.forEach(perm => {
          console.log(`  - ${perm.menuName}:`, perm.permissions);
        });
      }
    },
    
    // Refrescar permisos del usuario actual
    async refreshUserPermissions() {
      if (this.currentAdmin && this.currentAdmin.rolId) {
        try {
          console.log('🔄 Refrescando permisos del usuario...');
          
          // Recargar permisos desde el store
          await this.$store.dispatch('permissions/setUserRole', this.currentAdmin.rolId);
          
          // Forzar actualización del componente
          this.$forceUpdate();
          
          // Emitir evento para que App.vue sepa que debe refrescar el menú
          this.$emit('permissions-updated');
          
          // También disparar un evento personalizado para que App.vue lo escuche
          window.dispatchEvent(new CustomEvent('permissions-updated', {
            detail: { rolId: this.currentAdmin.rolId }
          }));
          
          // Evento adicional para forzar actualización del menú
          window.dispatchEvent(new CustomEvent('force-menu-update', {
            detail: { roleId: this.currentAdmin.rolId }
          }));
          
          console.log('✅ Permisos refrescados exitosamente y menú actualizado');
          
        } catch (error) {
          console.error('❌ Error refrescando permisos:', error);
        }
      }
    },
    
         // Manejar cuando se guardan permisos
     async onPermissionsSaved(permissionsData) {
       console.log('🔄 Permisos guardados, actualizando menú...', permissionsData);
       
       // Si el rol actual es el mismo que se modificó, refrescar permisos INMEDIATAMENTE
       if (this.currentAdmin && this.currentAdmin.rolId === permissionsData.rolId) {
         console.log('🔄 Rol actual modificado, refrescando permisos INMEDIATAMENTE...');
         
         // Forzar actualización inmediata del store de permisos
         await this.$store.dispatch('permissions/setUserRole', this.currentAdmin.rolId);
         
         // También refrescar permisos del usuario
         await this.refreshUserPermissions();
         
         console.log('✅ Permisos actualizados INMEDIATAMENTE en el store');
       }
       
       // Disparar evento global para que App.vue actualice el menú
       window.dispatchEvent(new CustomEvent('menu-permissions-updated', {
         detail: permissionsData
       }));
       
       // Forzar re-render del menú
       this.$forceUpdate();
       
                // Mostrar mensaje de confirmación
         this.$store.commit('admin/SET_SUCCESS', 'Permisos actualizados exitosamente. El menú se ha refrescado.');
         
         // Forzar actualización adicional después de un breve delay
         setTimeout(() => {
           this.forceMenuUpdate();
         }, 100);
       },
       
       // Método para forzar actualización del menú
       forceMenuUpdate() {
         console.log('🔄 Forzando actualización adicional del menú...');
         
         // Disparar evento para forzar actualización
         window.dispatchEvent(new CustomEvent('force-menu-update', {
           detail: { roleId: this.currentAdmin.rolId }
         }));
         
         // También forzar actualización del store
         this.$store.dispatch('permissions/forceUpdatePermissions');
         
         console.log('✅ Actualización adicional del menú ejecutada');
       },
     
     // Obtener información del usuario para los dashboards de ejemplo
     getUserInfo() {
       if (!this.currentAdmin) return null;
       
       return {
         nombre: this.currentAdmin.nombre || this.currentAdmin.correo?.split('@')[0] || 'Usuario',
         email: this.currentAdmin.correo || 'usuario@ejemplo.com',
         rol: this.getRoleName(this.currentAdmin.rolId) || 'Usuario'
       };
     },
     
     // Inicializar formulario de perfil con datos del usuario actual
     initializeProfileForm() {
       if (this.currentAdmin) {
         this.profileForm = {
           nombre: this.currentAdmin.nombre || '',
           apellido: this.currentAdmin.apellido || '',
           correo: this.currentAdmin.correo || '',
           rol: this.getRoleName(this.currentAdmin.rolId) || ''
         };
       }
     },
     
     // Restablecer formulario de perfil a los valores originales
     resetProfileForm() {
       this.initializeProfileForm();
       if (this.$refs.profileForm) {
         this.$refs.profileForm.resetValidation();
       }
     },
     
     // Guardar cambios del perfil
     async saveProfile() {
       if (!this.$refs.profileForm.validate()) return;
       
       // Mostrar diálogo de confirmación
       this.confirmDialog = {
         show: true,
         title: 'Confirmar Cambios',
         message: '¿Estás seguro de que quieres guardar los cambios en tu perfil?',
         loading: false
       };
     },
     
     // Confirmar y ejecutar la actualización del perfil
     async confirmProfileUpdate() {
       this.confirmDialog.loading = true;
       
       try {
         // Preparar datos para enviar a la API
         const updateData = {
           _id: this.currentAdmin._id,
           nombre: this.profileForm.nombre,
           apellido: this.profileForm.apellido,
           correo: this.currentAdmin.correo, // Mantener el correo actual
           rolId: this.currentAdmin.rolId // Mantener el rol actual
         };
         
         // Llamar a la API para actualizar el perfil
         const response = await this.$store.dispatch('admin/editAdminAction', updateData);
         
         if (response.success) {
           // Actualizar el estado local con los datos de la respuesta
           this.currentAdmin = {
             ...this.currentAdmin,
             nombre: this.profileForm.nombre,
             apellido: this.profileForm.apellido,
             updatedAt: new Date().toISOString()
           };
           
           // Actualizar localStorage
           localStorage.setItem('admin', JSON.stringify(this.currentAdmin));
           
           // Cerrar diálogo de confirmación
           this.confirmDialog.show = false;
           
           // Mostrar alert de éxito con información del cambio
           this.showUpdateSuccessAlert();
           
           console.log('✅ Perfil actualizado en BD:', response);
         } else {
           throw new Error(response.message || 'Error al actualizar el perfil');
         }
         
       } catch (error) {
         console.error('❌ Error actualizando perfil:', error);
         
         // Mostrar mensaje de error
         this.$emit('show-snackbar', {
           text: `Error al actualizar el perfil: ${error.message}`,
           color: 'error'
         });
       } finally {
         this.confirmDialog.loading = false;
       }
     },
     
     // Formatear fecha para mostrar
     formatDate(dateString) {
       if (!dateString) return 'N/A';
       
       try {
         const date = new Date(dateString);
         return date.toLocaleDateString('es-ES', {
           year: 'numeric',
           month: 'long',
           day: 'numeric',
           hour: '2-digit',
           minute: '2-digit'
         });
       } catch (error) {
         return 'Fecha inválida';
       }
     },
     

     
     // Mostrar diálogo de éxito con información del cambio
     showUpdateSuccessAlert() {
       const now = new Date();
       const formattedDate = now.toLocaleDateString('es-ES', {
         year: 'numeric',
         month: 'long',
         day: 'numeric',
         hour: '2-digit',
         minute: '2-digit',
         second: '2-digit'
       });
       
       // Configurar diálogo de éxito
       this.successDialog = {
         show: true,
         title: '✅ Perfil Actualizado Exitosamente',
         message: 'Los cambios han sido guardados en la base de datos',
         details: {
           nombre: this.currentAdmin.nombre,
           apellido: this.currentAdmin.apellido,
           fecha: formattedDate,
           userId: this.currentAdmin._id,
           correo: this.currentAdmin.correo,
           rol: this.getRoleName(this.currentAdmin.rolId)
         }
       };
       
       // También mostrar snackbar de confirmación
       this.$emit('show-snackbar', {
         text: 'Perfil actualizado exitosamente en la base de datos',
         color: 'success'
       });
     }
  },
};
</script>

<style scoped>
/* Add any additional styles here */


</style>

