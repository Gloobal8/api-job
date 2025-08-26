<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>{{ $t("common.appName") }}</v-toolbar-title>
      <v-spacer></v-spacer>

      <!-- Selector de idioma -->
      <language-selector></language-selector>
      <div v-if="isLoggedIn">
        <v-btn text @click="logout">
          <v-icon left>mdi-logout</v-icon>
          Logout
        </v-btn>
      </div>
      <div v-else>
        <v-btn text to="/login">
          <v-icon left>mdi-login</v-icon>
          Login
        </v-btn>
        <v-btn text to="/register">
          <v-icon left>mdi-account-plus</v-icon>
          Register
        </v-btn>
      </div>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" app temporary>
      <v-list-item class="pt-5">
        <v-list-item-title class="text-h6"> Job Board </v-list-item-title>
        <v-list-item-subtitle> Find your dream job </v-list-item-subtitle>
      </v-list-item>

      <v-divider></v-divider>

      <v-list dense nav class="custom-nav-list">
         <!-- Dashboard Link - Siempre visible -->
        <v-list-item to="/admin" link class="dashboard-menu-item">
          <template v-slot:prepend>
            <v-icon color="primary">mdi-view-dashboard</v-icon>
          </template>
          <v-list-item-title class="font-weight-medium">Dashboard</v-list-item-title>
        </v-list-item>
        <!-- Work Platform -->
        <v-list-group v-if="isWorkPlatformVisible" @click="debugWorkPlatformPermissions">
          <template v-slot:activator="{ props }">
            <v-list-item v-bind="props">
              <v-list-item-title>Work Platform</v-list-item-title>
            </v-list-item>
          </template>
          
          <v-list-item v-if="canView('Home')" to="/" link>
            <template v-slot:prepend>
              <v-icon>mdi-home</v-icon>
            </template>
            <v-list-item-title>Home</v-list-item-title>
          </v-list-item>

          <v-list-item v-if="canView('Dashboard') && isLoggedIn" to="/dashboard" link>
            <template v-slot:prepend>
              <v-icon>mdi-view-dashboard-outline</v-icon>
            </template>
            <v-list-item-title>Dashboard</v-list-item-title>
          </v-list-item>

          <v-list-item v-if="canView('Jobs')" to="/jobs" link>
            <template v-slot:prepend>
              <v-icon>mdi-briefcase-outline</v-icon>
            </template>
            <v-list-item-title>Jobs</v-list-item-title>
          </v-list-item>

          <v-list-item v-if="canView('Companies')" to="/companies" link>
            <template v-slot:prepend>
              <v-icon>mdi-domain</v-icon>
            </template>
            <v-list-item-title>Companies</v-list-item-title>
          </v-list-item>
          
          <v-list-item v-if="canView('My Profile') && isLoggedIn" to="/profile" link>
            <template v-slot:prepend>
              <v-icon>mdi-account</v-icon>
            </template>
            <v-list-item-title>My Profile</v-list-item-title>
          </v-list-item>

          <v-list-item v-if="canView('Messages') && isLoggedIn" to="/messages" link>
            <template v-slot:prepend>
              <v-icon>mdi-message</v-icon>
            </template>
            <v-list-item-title>Messages</v-list-item-title>
          </v-list-item>

          <!-- Blog Subsection -->
          <v-list-group v-if="isBlogVisible" value="false" prepend-icon="mdi-post-outline">
            <template v-slot:activator="{ props }">
              <v-list-item v-bind="props" title="Blog"></v-list-item>
            </template>

            <!-- Subelementos del blog -->
            <v-list-item v-if="canView('All Articles')" to="/blog" link>
              <template v-slot:prepend>
                <v-icon>mdi-view-list</v-icon>
              </template>
              <v-list-item-title>All Articles</v-list-item-title>
            </v-list-item>

            <v-list-item v-if="canView('Categories')" to="/blog/categories" link>
              <template v-slot:prepend>
                <v-icon>mdi-tag-multiple</v-icon>
              </template>
              <v-list-item-title>Categories</v-list-item-title>
            </v-list-item>

            <v-list-item v-if="canView('Write Article')" to="/blog/create" link>
              <template v-slot:prepend>
                <v-icon>mdi-pencil</v-icon>
              </template>
              <v-list-item-title>Write Article</v-list-item-title>
            </v-list-item>

            <v-list-item v-if="canView('My Posts')" to="/blog/my-posts" link>
              <template v-slot:prepend>
                <v-icon>mdi-account-edit</v-icon>
              </template>
              <v-list-item-title>My Posts</v-list-item-title>
            </v-list-item>
          </v-list-group>
        </v-list-group>

        <!-- Sell Platform -->
        <v-list-group v-if="isSellPlatformVisible">
          <template v-slot:activator="{ props }">
            <v-list-item v-bind="props">
              <v-list-item-title>Sell</v-list-item-title>
            </v-list-item>
          </template>
          
          <v-list-item v-if="canView('Orders')" to="/orders" link>
            <v-list-item-prepend>
              <v-icon>mdi-cart</v-icon>
            </v-list-item-prepend>
            <v-list-item-title>Orders</v-list-item-title>
          </v-list-item>
          
          <v-list-item v-if="canView('Order Detail')" to="/order-detail" link>
            <v-list-item-prepend>
              <v-icon>mdi-file-document-outline</v-icon>
            </v-list-item-prepend>
            <v-list-item-title>Order detail</v-list-item-title>
          </v-list-item>
        </v-list-group>

        <v-list-item v-if="canView('Sitemap')" to="/site-map" link>
          <template v-slot:prepend>
            <v-icon>mdi-sitemap</v-icon>
          </template>
          <v-list-item-title>Sitemap</v-list-item-title>
        </v-list-item>

       

        <!-- Admin Panel Link -->
        <v-list-item v-if="canView('Admin Panel')" to="/admin" link>
          <template v-slot:prepend>
            <v-icon>mdi-shield-account</v-icon>
          </template>
          <v-list-item-title>Admin Panel</v-list-item-title>
        </v-list-item>

        <!-- Indicador de carga -->
        <v-list-item v-if="isLoading" class="loading-indicator">
          <template v-slot:prepend>
            <v-progress-circular indeterminate size="20" color="primary"></v-progress-circular>
          </template>
          <v-list-item-title class="text-caption text-grey">
            Cargando permisos...
          </v-list-item-title>
        </v-list-item>
        
        <!-- Indicador de actualización de permisos -->
        <v-list-item v-if="updatingPermissions" class="updating-permissions-indicator">
          <template v-slot:prepend>
            <v-progress-circular indeterminate size="20" color="success"></v-progress-circular>
          </template>
          <v-list-item-title class="text-caption text-success">
            Actualizando permisos...
          </v-list-item-title>
        </v-list-item>      
        
        <!-- Botón de debug para permisos 
        <v-list-item v-if="hasAnyUserLoggedIn" class="debug-permissions">
          <template v-slot:prepend>
            <v-icon color="warning">mdi-bug</v-icon>
          </template>
          <v-list-item-title 
            class="text-caption text-warning"
            @click="debugAllPermissions"
            style="cursor: pointer;"
          >
            Debug Permisos (Click aquí)
          </v-list-item-title>
        </v-list-item>-->

        <!-- Mensaje cuando no hay elementos visibles -->
        <v-list-item v-if="!hasPermissions && !isLoading" class="no-permissions-message">
          <template v-slot:prepend>
            <v-icon color="grey lighten-1">mdi-lock</v-icon>
          </template>
          <v-list-item-title class="text-caption text-grey">
            No tienes permisos para ver ningún elemento del menú
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main style="background: aliceblue">
      <v-container fluid class="nopad">
        <router-view></router-view>
      </v-container>
    </v-main>

    <!-- Snackbar global -->
    <snackbar />

    <v-footer app>
      <span>&copy; {{ new Date().getFullYear() }} - Job Board</span>
    </v-footer>
  </v-app>
</template>

<script>
import LanguageSelector from "@/components/localization/LanguageSelector.vue";
import Snackbar from "@/components/common/Snackbar.vue";
import { mapGetters, mapActions } from 'vuex';

export default {
  name: "App",
  components: {
    LanguageSelector,
    Snackbar,
  },
  data: () => ({
    drawer: false,
    previousAdminData: null, // Para detectar cambios en localStorage
    localStorageCheckInterval: null, // Para el intervalo de verificación
    updatingPermissions: false, // Para mostrar cuando se están actualizando permisos
  }),
  computed: {
    ...mapGetters('permissions', [
      'canView',
      'hasPermissions',
      'isAdmin',
      'isLoading',
      'getError',
      'isWorkPlatformVisible',
      'isBlogVisible',
      'isSellPlatformVisible',
      'getUserPermissions'
    ]),
    
    isLoggedIn() {
      // Verificar si hay un usuario regular autenticado
      return this.$store.getters.isAuthenticated;
    },
    
    // Verificar si hay un admin logueado
    isAdminLoggedIn() {
      const adminData = localStorage.getItem('admin');
      return adminData !== null;
    },
    
    // Verificar si hay algún tipo de usuario logueado (admin o regular)
    hasAnyUserLoggedIn() {
      return this.isLoggedIn || this.isAdminLoggedIn;
    },
  },
  
  async mounted() {
    await this.initializePermissions();
    
    // Escuchar eventos de actualización de permisos
    this.setupPermissionsListeners();
  },
  
  methods: {
    ...mapActions('permissions', ['setUserRole', 'clearUserPermissions']),
    
    logout() {
      this.$store.dispatch("logout").then(() => {
        this.clearUserPermissions();
        this.$router.push("/login");
      });
    },
    
    async initializePermissions() {
      try {
        // Verificar si hay un usuario admin o un usuario regular autenticado
        const adminData = localStorage.getItem('admin');
        const hasRegularUser = this.isLoggedIn;
        
        console.log('🔍 Verificando autenticación:');
        console.log('  - Admin en localStorage:', adminData ? 'SÍ' : 'NO');
        console.log('  - Usuario regular logueado:', hasRegularUser ? 'SÍ' : 'NO');
        
        if (!adminData && !hasRegularUser) {
          console.log('🔒 No hay usuario autenticado (ni admin ni regular), no se cargan permisos');
          return;
        }
        
        // Obtener el rol del usuario (admin o regular)
        const userRole = this.getUserRole();
        
        if (userRole) {
          console.log('🔐 Inicializando permisos para rol:', userRole);
          await this.setUserRole(userRole);
          console.log('✅ Permisos inicializados para el rol:', userRole);
        } else {
          console.log('⚠️ No se pudo determinar el rol del usuario');
        }
      } catch (error) {
        console.error('❌ Error al inicializar permisos:', error);
      }
    },
    
    getUserRole() {
      // Primero verificar si hay un usuario admin logueado
      const adminData = localStorage.getItem('admin');
      if (adminData) {
        try {
          const admin = JSON.parse(adminData);
          if (admin && admin.roleId) {
            console.log('👑 Rol del usuario admin desde localStorage:', admin.roleId);
            return admin.roleId;
          }
        } catch (error) {
          console.warn('⚠️ Error al parsear datos del admin:', error);
        }
      }
      
      // Si no hay admin, verificar usuario regular desde el store de autenticación
      if (this.$store.state.user && this.$store.state.user.roleId) {
        console.log('👤 Rol del usuario regular desde store:', this.$store.state.user.roleId);
        return this.$store.state.user.roleId;
      }
      
      // Si no hay usuario autenticado, no mostrar ningún menú
      console.log('👤 Usuario no autenticado, no se pueden cargar permisos');
      return null;
    },
    
    debugWorkPlatformPermissions() {
      console.log('🔍 Debugging Work Platform Permissions:');
      console.log('📊 User Permissions:', this.$store.state.permissions.userPermissions);
      console.log('🎭 User Role:', this.$store.state.permissions.userRole);
      console.log('🏠 Home:', this.canView('Home'));
      console.log('📊 Dashboard:', this.canView('Dashboard'));
      console.log('💼 Jobs:', this.canView('Jobs'));
      console.log('🏢 Companies:', this.canView('Companies'));
      console.log('👤 My Profile:', this.canView('My Profile'));
      console.log('💬 Messages:', this.canView('Messages'));
      console.log('📝 Blog:', this.canView('Blog'));
      
      const hasAnyPermission = this.canView('Home') || this.canView('Dashboard') || 
                              this.canView('Jobs') || this.canView('Companies') || 
                              this.canView('My Profile') || this.canView('Messages') || 
                              this.canView('Blog');
      
      console.log('✅ Work Platform Visible:', hasAnyPermission);
    },
    
    debugAllPermissions() {
      console.log('🔍 === DEBUG COMPLETO DE PERMISOS ===');
      
      // Estado de autenticación
      console.log('🔐 Estado de autenticación:');
      console.log('  - Usuario regular logueado:', this.isLoggedIn);
      console.log('  - Admin logueado:', this.isAdminLoggedIn);
      console.log('  - Algún usuario logueado:', this.hasAnyUserLoggedIn);
      
      // Estado del localStorage
      console.log('💾 Estado del localStorage:');
      const adminData = localStorage.getItem('admin');
      if (adminData) {
        try {
          const admin = JSON.parse(adminData);
          console.log('  - Admin data:', admin);
          console.log('  - Admin roleId:', admin.roleId);
        } catch (error) {
          console.log('  - Error al parsear admin data:', error);
        }
      } else {
        console.log('  - No hay datos de admin en localStorage');
      }
      
      // Estado del store de permisos
      console.log('📊 Estado del store de permisos:');
      console.log('  - userRole:', this.$store.state.permissions.userRole);
      console.log('  - userPermissions:', this.$store.state.permissions.userPermissions);
      console.log('  - loading:', this.$store.state.permissions.loading);
      console.log('  - error:', this.$store.state.permissions.error);
      
      // Getters de permisos
      console.log('🎯 Getters de permisos:');
      console.log('  - hasPermissions:', this.hasPermissions);
      console.log('  - isAdmin:', this.isAdmin);
      console.log('  - isLoading:', this.isLoading);
      
      // Verificar permisos específicos
      if (this.$store.state.permissions.userPermissions) {
        console.log('📋 Permisos específicos del usuario:');
        this.$store.state.permissions.userPermissions.forEach(perm => {
          console.log(`  - ${perm.menuName}:`, perm.permissions);
        });
      }
      
      // Verificar visibilidad de grupos
      console.log('👁️ Visibilidad de grupos:');
      console.log('  - Work Platform:', this.isWorkPlatformVisible);
      console.log('  - Blog:', this.isBlogVisible);
      console.log('  - Sell Platform:', this.isSellPlatformVisible);
      
      // Verificar permisos individuales
      console.log('🔑 Permisos individuales:');
      const menuItems = ['Home', 'Dashboard', 'Jobs', 'Companies', 'My Profile', 'Messages', 'Blog', 'Admin Panel'];
      menuItems.forEach(item => {
        console.log(`  - ${item}:`, this.canView(item));
      });
      
      console.log('🔍 === FIN DEBUG ===');
    },
    
    // Verificar cambios en localStorage
    checkLocalStorageChanges() {
      const currentAdminData = localStorage.getItem('admin');
      const previousAdminData = this.previousAdminData;
      
      // Si hay cambios en el localStorage del admin
      if (currentAdminData !== previousAdminData) {
        console.log('🔄 Cambio detectado en localStorage del admin');
        
        if (currentAdminData && !previousAdminData) {
          // Admin se acaba de loguear
          console.log('👑 Admin detectado en localStorage, cargando permisos...');
          this.initializePermissions();
        } else if (!currentAdminData && previousAdminData) {
          // Admin se acaba de desloguear
          console.log('🚪 Admin removido de localStorage, limpiando permisos...');
          this.clearUserPermissions();
        }
        
        // Actualizar el valor anterior
        this.previousAdminData = currentAdminData;
      }
    },
    
    // Configurar listeners para eventos de permisos
    setupPermissionsListeners() {
      // Crear métodos manejadores para los eventos
      this.handlePermissionsSaved = async (event) => {
        console.log('🔄 Evento de permisos guardados recibido:', event.detail);
        await this.refreshPermissionsForRole(event.detail.roleId);
      };
      
      this.handlePermissionsUpdated = async (event) => {
        console.log('🔄 Evento de permisos actualizados recibido:', event.detail);
        await this.refreshPermissionsForRole(event.detail.roleId);
      };
      
      this.handleMenuPermissionsUpdated = async (event) => {
        console.log('🔄 Evento de menú actualizado recibido:', event.detail);
        await this.refreshPermissionsForRole(event.detail.roleId);
      };
      
      this.handleForceMenuUpdate = async (event) => {
        console.log('🔄 Evento de forzar actualización del menú recibido:', event.detail);
        await this.forceUpdateMenu(event.detail.roleId);
      };
      
      this.handlePermissionsUpdatedImmediate = async (event) => {
        console.log('🔄 Evento de permisos actualizados INMEDIATAMENTE recibido:', event.detail);
        await this.updateMenuImmediately(event.detail);
      };
      
      // Escuchar eventos
      window.addEventListener('permissions-saved', this.handlePermissionsSaved);
      window.addEventListener('permissions-updated', this.handlePermissionsUpdated);
      window.addEventListener('menu-permissions-updated', this.handleMenuPermissionsUpdated);
      window.addEventListener('force-menu-update', this.handleForceMenuUpdate);
      window.addEventListener('permissions-updated-immediate', this.handlePermissionsUpdatedImmediate);
      
      console.log('✅ Listeners de permisos configurados');
    },
    
    // Refrescar permisos para un rol específico
    async refreshPermissionsForRole(roleId) {
      try {
        console.log('🔄 Refrescando permisos para rol:', roleId);
        
        // Obtener el rol actual del usuario
        const currentUserRole = this.getUserRole();
        
        // Si el rol actual es el mismo que se modificó, refrescar permisos
        if (currentUserRole === roleId) {
          console.log('🔄 Rol actual modificado, refrescando permisos...');
          await this.setUserRole(roleId);
          console.log('✅ Permisos refrescados para el rol:', roleId);
        } else {
          console.log('ℹ️ Rol modificado no es el actual, no se refrescan permisos');
        }
      } catch (error) {
        console.error('❌ Error refrescando permisos:', error);
      }
    },
    
    // Forzar actualización del menú
    async forceUpdateMenu(roleId) {
      try {
        console.log('🔄 Forzando actualización del menú para rol:', roleId);
        
        // Obtener el rol actual del usuario
        const currentUserRole = this.getUserRole();
        
        // Si el rol actual es el mismo que se modificó, forzar actualización
        if (currentUserRole === roleId) {
          console.log('🔄 Forzando actualización del menú...');
          
          // Forzar actualización del store de permisos
          await this.$store.dispatch('permissions/forceUpdatePermissions');
          
          // Forzar re-render del componente
          this.$forceUpdate();
          
          console.log('✅ Menú actualizado forzadamente');
        } else {
          console.log('ℹ️ Rol modificado no es el actual, no se actualiza el menú');
        }
      } catch (error) {
        console.error('❌ Error forzando actualización del menú:', error);
      }
    },
    
    // Actualización INMEDIATA del menú cuando se guardan permisos
    async updateMenuImmediately(permissionsData) {
      try {
        console.log('🚀 ACTUALIZACIÓN INMEDIATA del menú:', permissionsData);
        
        // Activar indicador de actualización
        this.updatingPermissions = true;
        
        // Obtener el rol actual del usuario
        const currentUserRole = this.getUserRole();
        
        // Si el rol actual es el mismo que se modificó, actualizar INMEDIATAMENTE
        if (currentUserRole === permissionsData.roleId) {
          console.log('🚀 Rol actual modificado, actualizando menú INMEDIATAMENTE...');
          
          // 1. SOLO actualizar permisos específicos en el store LOCAL (SIN llamar a la API)
          if (permissionsData.permissions) {
            console.log('🔄 Actualizando permisos en el store local:', permissionsData.permissions);
            // Usar la acción más eficiente que solo actualiza permisos de vista
            await this.$store.dispatch('permissions/updateViewPermissionsOnly', permissionsData.permissions);
          }
          
          // 2. Forzar re-render del componente INMEDIATAMENTE
          this.$forceUpdate();
          
          // 3. Actualización adicional después de un breve delay para asegurar sincronización
          setTimeout(() => {
            this.$forceUpdate();
            console.log('🔄 Re-render adicional ejecutado');
          }, 100);
          
          // 4. Una tercera actualización para garantizar que todo esté sincronizado
          setTimeout(() => {
            this.$forceUpdate();
            console.log('🔄 Tercer re-render para garantizar sincronización');
          }, 300);
          
          // 5. ACTUALIZACIÓN CRÍTICA: Forzar actualización del store completo
          setTimeout(async () => {
            console.log('🔄 Actualización crítica del store ejecutada');
            await this.$store.dispatch('permissions/forceUpdatePermissions');
            this.$forceUpdate();
          }, 500);
          
          // 6. ACTUALIZACIÓN FINAL: Forzar reactividad de todos los getters
          setTimeout(() => {
            console.log('🔄 Actualización final de reactividad ejecutada');
            // Forzar actualización de todos los getters
            this.$store.commit('permissions/FORCE_UPDATE_PERMISSIONS');
            this.$forceUpdate();
          }, 800);
          
          // 7. ACTUALIZACIÓN EXTREMA: Forzar actualización completa del menú
          setTimeout(() => {
            console.log('🔄 Actualización extrema del menú ejecutada');
            // Forzar actualización completa
            this.forceCompleteMenuUpdate();
          }, 1000);
          
          console.log('✅ Menú actualizado INMEDIATAMENTE con todos los cambios (SIN recargar página)');
        } else {
          console.log('ℹ️ Rol modificado no es el actual, no se actualiza el menú');
        }
      } catch (error) {
        console.error('❌ Error en actualización inmediata del menú:', error);
      } finally {
        // Desactivar indicador de actualización después de un breve delay
        setTimeout(() => {
          this.updatingPermissions = false;
        }, 2000);
      }
    },
    
    // Método para forzar actualización completa del menú
    forceCompleteMenuUpdate() {
      try {
        console.log('🚀 FORZANDO actualización COMPLETA del menú...');
        
        // 1. Forzar actualización del store
        this.$store.commit('permissions/FORCE_UPDATE_PERMISSIONS');
        
        // 2. Forzar re-render del componente
        this.$forceUpdate();
        
        // 3. Forzar actualización de todos los getters
        this.$nextTick(() => {
          this.$forceUpdate();
          console.log('🔄 Re-render en nextTick ejecutado');
        });
        
        // 4. Actualización final después de un delay
        setTimeout(() => {
          this.$forceUpdate();
          console.log('🔄 Actualización final del menú ejecutada');
        }, 200);
        
        // 5. ACTUALIZACIÓN EXTREMA: Forzar actualización de getters
        setTimeout(() => {
          console.log('🔄 Forzando actualización de getters...');
          // Forzar actualización de getters específicos
          this.forceGettersUpdate();
        }, 400);
        
        console.log('✅ Actualización completa del menú ejecutada');
      } catch (error) {
        console.error('❌ Error en actualización completa del menú:', error);
      }
    },
    
    // Método para forzar actualización de getters específicos
    forceGettersUpdate() {
      try {
        console.log('🚀 FORZANDO actualización de getters...');
        
        // 1. Forzar actualización del store una vez más
        this.$store.commit('permissions/FORCE_UPDATE_PERMISSIONS');
        
        // 2. Forzar re-render del componente
        this.$forceUpdate();
        
        // 3. Forzar actualización de getters específicos usando $nextTick
        this.$nextTick(() => {
          // Forzar actualización de getters específicos
          this.$forceUpdate();
          console.log('🔄 Getters actualizados en nextTick');
        });
        
        // 4. Actualización final con delay
        setTimeout(() => {
          this.$forceUpdate();
          console.log('🔄 Actualización final de getters ejecutada');
        }, 100);
        
        console.log('✅ Getters forzadamente actualizados');
      } catch (error) {
        console.error('❌ Error en actualización de getters:', error);
      }
    },
    
    // Método para configurar el listener del menú de navegación
    setupNavigationMenuListener() {
      try {
        console.log('🔧 Configurando listener del menú de navegación...');
        
        // Obtener el elemento del menú de navegación
        const navigationDrawer = this.$refs.navigationDrawer;
        
        if (navigationDrawer && this.isValidDOMElement(navigationDrawer)) {
          // Listener para cuando se abra el menú
          navigationDrawer.$on('update:modelValue', (isOpen) => {
            if (isOpen) {
              console.log('🚀 Menú de navegación abierto, actualizando permisos...');
              this.refreshMenuPermissionsOnOpen();
            }
          });
          
          console.log('✅ Listener del menú de navegación configurado');
        } else {
          console.log('⚠️ No se encontró el menú de navegación o no es válido, usando método alternativo');
          // Método alternativo usando MutationObserver
          this.setupMutationObserverForMenu();
        }
        
        // Agregar listener para el botón del menú (hamburger button)
        this.setupHamburgerButtonListener();
        
      } catch (error) {
        console.error('❌ Error configurando listener del menú:', error);
        // Método alternativo usando MutationObserver
        this.setupMutationObserverForMenu();
      }
    },
    
    // Método alternativo usando MutationObserver para detectar cambios en el menú
    setupMutationObserverForMenu() {
      try {
        console.log('🔧 Configurando MutationObserver para el menú...');
        
        // Crear un observer que detecte cambios en el menú
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
              const target = mutation.target;
              
              // Verificar que target sea un elemento DOM válido
              if (this.isValidDOMElement(target) && target.classList) {
                if (target.classList.contains('v-navigation-drawer--open') || 
                    target.classList.contains('v-navigation-drawer--active')) {
                  console.log('🚀 Menú de navegación detectado como abierto, actualizando permisos...');
                  this.refreshMenuPermissionsOnOpen();
                  // Solo ejecutar una vez por apertura
                  observer.disconnect();
                  // Reconfigurar después de un delay
                  setTimeout(() => {
                    this.setupMutationObserverForMenu();
                  }, 1000);
                }
              }
            }
          });
        });
        
        // Observar cambios en el body para detectar cuando se abre el menú
        observer.observe(document.body, {
          attributes: true,
          subtree: true,
          attributeFilter: ['class']
        });
        
        console.log('✅ MutationObserver configurado para el menú');
      } catch (error) {
        console.error('❌ Error configurando MutationObserver:', error);
      }
    },
    
    // Método para refrescar permisos cuando se abre el menú
    async refreshMenuPermissionsOnOpen() {
      try {
        console.log('🔄 Refrescando permisos del menú al abrirse...');
        
        // Activar indicador de actualización
        this.updatingPermissions = true;
        
        // Obtener el rol actual del usuario
        const currentUserRole = this.getUserRole();
        
        if (currentUserRole) {
          console.log('🔄 Rol actual detectado:', currentUserRole);
          
          // 1. Recargar permisos desde el store
          await this.$store.dispatch('permissions/forceUpdatePermissions');
          
          // 2. Forzar re-render del componente
          this.$forceUpdate();
          
          // 3. Actualización adicional después de un breve delay
          setTimeout(() => {
            this.$forceUpdate();
            console.log('🔄 Re-render adicional del menú ejecutado');
          }, 100);
          
          // 4. Actualización final para garantizar sincronización
          setTimeout(() => {
            this.$forceUpdate();
            console.log('🔄 Actualización final del menú ejecutada');
          }, 300);
          
          console.log('✅ Permisos del menú refrescados exitosamente');
        } else {
          console.log('⚠️ No hay rol de usuario, no se pueden refrescar permisos');
        }
      } catch (error) {
        console.error('❌ Error refrescando permisos del menú:', error);
      } finally {
        // Desactivar indicador de actualización después de un delay
        setTimeout(() => {
          this.updatingPermissions = false;
        }, 1000);
      }
    },
    
    // Método para configurar el listener del botón hamburger
    setupHamburgerButtonListener() {
      try {
        console.log('🔧 Configurando listener del botón hamburger...');
        
        // Buscar el botón del menú por diferentes selectores
        const hamburgerButton = document.querySelector('.v-app-bar__nav-icon') || 
                               document.querySelector('[data-testid="navigation-toggle"]') ||
                               document.querySelector('.v-btn--icon');
        
        if (hamburgerButton && this.isValidDOMElement(hamburgerButton)) {
          // Listener para cuando se haga clic en el botón
          hamburgerButton.addEventListener('click', () => {
            console.log('🚀 Botón del menú clickeado, preparando actualización de permisos...');
            // Pequeño delay para que el menú se abra primero
            setTimeout(() => {
              this.refreshMenuPermissionsOnOpen();
            }, 100);
          });
          
          console.log('✅ Listener del botón hamburger configurado');
        } else {
          console.log('⚠️ No se encontró el botón hamburger o no es válido, usando método alternativo');
          // Método alternativo: detectar clics en cualquier botón que pueda abrir el menú
          this.setupGlobalClickListener();
        }
      } catch (error) {
        console.error('❌ Error configurando listener del botón hamburger:', error);
        // Método alternativo
        this.setupGlobalClickListener();
      }
    },
    
    // Método alternativo: detectar clics globales que puedan abrir el menú
    setupGlobalClickListener() {
      try {
        console.log('🔧 Configurando listener global de clics...');
        
        // Listener global para detectar clics que puedan abrir el menú
        document.addEventListener('click', (event) => {
          const target = event.target;
          
          // Verificar que target sea un elemento DOM válido usando el método helper
          if (this.isValidDOMElement(target)) {
            // Verificar si el clic fue en un botón que podría abrir el menú
            if (this.hasMenuClass(target, '.v-app-bar__nav-icon') || 
                this.hasMenuClass(target, '.v-btn--icon')) {
              
              console.log('🚀 Clic detectado en botón del menú, preparando actualización...');
              // Pequeño delay para que el menú se abra primero
              setTimeout(() => {
                this.refreshMenuPermissionsOnOpen();
              }, 150);
            }
          }
        });
        
        console.log('✅ Listener global de clics configurado');
      } catch (error) {
        console.error('❌ Error configurando listener global de clics:', error);
      }
    },
    
    // Método para configurar el listener de cambios de ruta
    setupRouteChangeListener() {
      try {
        console.log('🔧 Configurando listener de cambios de ruta...');
        
        // Listener para cambios de ruta
        this.$router.beforeEach((to, from, next) => {
          if (from.path !== to.path) {
            console.log('🚀 Cambio de ruta detectado:', from.path, '→', to.path);
            // Pequeño delay para que la navegación se complete
            setTimeout(() => {
              this.refreshMenuPermissionsOnRouteChange();
            }, 200);
          }
          next();
        });
        
        console.log('✅ Listener de cambios de ruta configurado');
      } catch (error) {
        console.error('❌ Error configurando listener de cambios de ruta:', error);
      }
    },
    
    // Método para refrescar permisos cuando cambie la ruta
    async refreshMenuPermissionsOnRouteChange() {
      try {
        console.log('🔄 Refrescando permisos del menú por cambio de ruta...');
        
        // Obtener el rol actual del usuario
        const currentUserRole = this.getUserRole();
        
        if (currentUserRole) {
          console.log('🔄 Rol actual detectado:', currentUserRole);
          
          // 1. Forzar actualización del store
          this.$store.commit('permissions/FORCE_UPDATE_PERMISSIONS');
          
          // 2. Forzar re-render del componente
          this.$forceUpdate();
          
          // 3. Actualización adicional después de un breve delay
          setTimeout(() => {
            this.$forceUpdate();
            console.log('🔄 Re-render adicional por cambio de ruta ejecutado');
          }, 100);
          
          console.log('✅ Permisos del menú refrescados por cambio de ruta');
        } else {
          console.log('⚠️ No hay rol de usuario, no se pueden refrescar permisos');
        }
      } catch (error) {
        console.error('❌ Error refrescando permisos por cambio de ruta:', error);
      }
    },
    
    // Método para configurar el listener de focus de la ventana
    setupWindowFocusListener() {
      try {
        console.log('🔧 Configurando listener de focus de la ventana...');
        
        // Listener para cuando la ventana reciba focus
        window.addEventListener('focus', () => {
          console.log('🚀 Ventana recibió focus, verificando permisos del menú...');
          // Pequeño delay para que la ventana se estabilice
          setTimeout(() => {
            this.refreshMenuPermissionsOnWindowFocus();
          }, 300);
        });
        
        // Listener para cuando la ventana se vuelva visible (pestaña activa)
        document.addEventListener('visibilitychange', () => {
          if (!document.hidden) {
            console.log('🚀 Pestaña se volvió visible, verificando permisos del menú...');
            // Pequeño delay para que la pestaña se estabilice
            setTimeout(() => {
              this.refreshMenuPermissionsOnWindowFocus();
            }, 300);
          }
        });
        
        console.log('✅ Listener de focus de la ventana configurado');
      } catch (error) {
        console.error('❌ Error configurando listener de focus de la ventana:', error);
      }
    },
    
    // Método para refrescar permisos cuando la ventana reciba focus
    async refreshMenuPermissionsOnWindowFocus() {
      try {
        console.log('🔄 Refrescando permisos del menú por focus de ventana...');
        
        // Obtener el rol actual del usuario
        const currentUserRole = this.getUserRole();
        
        if (currentUserRole) {
          console.log('🔄 Rol actual detectado:', currentUserRole);
          
          // 1. Forzar actualización del store
          this.$store.commit('permissions/FORCE_UPDATE_PERMISSIONS');
          
          // 2. Forzar re-render del componente
          this.$forceUpdate();
          
          console.log('✅ Permisos del menú refrescados por focus de ventana');
        } else {
          console.log('⚠️ No hay rol de usuario, no se pueden refrescar permisos');
        }
      } catch (error) {
        console.error('❌ Error refrescando permisos por focus de ventana:', error);
      }
    },
    
    // Método para configurar el listener de interacciones con el menú
    setupMenuInteractionListener() {
      try {
        console.log('🔧 Configurando listener de interacciones con el menú...');
        
        // Listener para clics en elementos del menú
        document.addEventListener('click', (event) => {
          const target = event.target;
          
          // Verificar que target sea un elemento DOM válido usando el método helper
          if (this.isValidDOMElement(target)) {
            // Verificar si el clic fue en un elemento del menú de navegación
            if (this.hasMenuClass(target, '.v-navigation-drawer') || 
                this.hasMenuClass(target, '.custom-nav-list') ||
                this.hasMenuClass(target, '.v-list-item')) {
              
              console.log('🚀 Interacción detectada con el menú, verificando permisos...');
              // Pequeño delay para que la interacción se complete
              setTimeout(() => {
                this.refreshMenuPermissionsOnInteraction();
              }, 100);
            }
          }
        });
        
        // Listener para hover en elementos del menú
        document.addEventListener('mouseenter', (event) => {
          const target = event.target;
          
          // Verificar que target sea un elemento DOM válido usando el método helper
          if (this.isValidDOMElement(target)) {
            // Verificar si el hover fue en un elemento del menú
            if (this.hasMenuClass(target, '.v-navigation-drawer') || 
                this.hasMenuClass(target, '.custom-nav-list') ||
                this.hasMenuClass(target, '.v-list-item')) {
              
              console.log('🚀 Hover detectado en el menú, verificando permisos...');
              // Pequeño delay para que el hover se estabilice
              setTimeout(() => {
                this.refreshMenuPermissionsOnInteraction();
              }, 200);
            }
          }
        });
        
        console.log('✅ Listener de interacciones con el menú configurado');
      } catch (error) {
        console.error('❌ Error configurando listener de interacciones con el menú:', error);
      }
    },
    
    // Método helper para verificar si un elemento DOM es válido
    isValidDOMElement(element) {
      try {
        return element && 
               element.nodeType === Node.ELEMENT_NODE && 
               element.closest && 
               typeof element.closest === 'function' &&
               element.classList &&
               typeof element.classList.contains === 'function';
      } catch (error) {
        console.error('❌ Error verificando elemento DOM:', error);
        return false;
      }
    },
    
    // Método helper para verificar si un elemento tiene una clase específica
    hasMenuClass(element, className) {
      try {
        if (!this.isValidDOMElement(element)) {
          return false;
        }
        
        // Remover el punto del selector de clase
        const classWithoutDot = className.replace('.', '');
        
        // Verificar si el elemento tiene la clase directa
        const hasDirectClass = element.classList.contains(classWithoutDot);
        
        // Verificar si algún ancestro tiene la clase (solo si closest está disponible)
        if (element.closest && typeof element.closest === 'function') {
          try {
            const hasAncestorClass = element.closest(className) !== null;
            return hasDirectClass || hasAncestorClass;
          } catch (closestError) {
            console.log('⚠️ closest falló, usando solo verificación directa de clase');
            return hasDirectClass;
          }
        } else {
          // Si closest no está disponible, usar solo verificación directa
          console.log('⚠️ closest no está disponible, usando solo verificación directa de clase');
          return hasDirectClass;
        }
      } catch (error) {
        console.error('❌ Error verificando clase del menú:', error);
        return false;
      }
    },
    
    // Método alternativo que no usa closest (para navegadores que no lo soporten)
    hasMenuClassAlternative(element, className) {
      try {
        if (!this.isValidDOMElement(element)) {
          return false;
        }
        
        // Remover el punto del selector de clase
        const classWithoutDot = className.replace('.', '');
        
        // Solo verificar la clase directa del elemento
        return element.classList.contains(classWithoutDot);
      } catch (error) {
        console.error('❌ Error en método alternativo de verificación de clase:', error);
        return false;
      }
    },
    
    // Método para refrescar permisos cuando se interactúe con el menú
    async refreshMenuPermissionsOnInteraction() {
      try {
        console.log('🔄 Refrescando permisos del menú por interacción...');
        
        // Obtener el rol actual del usuario
        const currentUserRole = this.getUserRole();
        
        if (currentUserRole) {
          console.log('🔄 Rol actual detectado:', currentUserRole);
          
          // 1. Forzar actualización del store
          this.$store.commit('permissions/FORCE_UPDATE_PERMISSIONS');
          
          // 2. Forzar re-render del componente
          this.$forceUpdate();
          
          console.log('✅ Permisos del menú refrescados por interacción');
        } else {
          console.log('⚠️ No hay rol de usuario, no se pueden refrescar permisos');
        }
      } catch (error) {
        console.error('❌ Error refrescando permisos por interacción:', error);
      }
    }
  },
  
  watch: {
    // Observar cambios en el estado de autenticación
    isLoggedIn(newValue, oldValue) {
      if (newValue && !oldValue) {
        // Usuario regular se acaba de loguear, cargar permisos
        this.initializePermissions();
      } else if (!newValue && oldValue) {
        // Usuario regular se acaba de desloguear, limpiar permisos
        this.clearUserPermissions();
      }
    },
    
    // Observar cambios en el estado del admin
    isAdminLoggedIn(newValue, oldValue) {
      if (newValue && !oldValue) {
        // Admin se acaba de loguear, cargar permisos
        this.initializePermissions();
      } else if (!newValue && oldValue) {
        // Admin se acaba de desloguear, limpiar permisos
        this.clearUserPermissions();
      }
    },
    
    // Observar cambios en el store de permisos para forzar actualización del menú
    '$store.state.permissions.userPermissions': {
      handler(newPermissions, oldPermissions) {
        if (newPermissions !== oldPermissions) {
          console.log('🔄 Cambio detectado en permisos del store, forzando actualización del menú...');
          this.$forceUpdate();
        }
      },
      deep: true
    }
  },
  
  // Método para verificar cambios en localStorage (se ejecuta periódicamente)
  mounted() {
    // Inicializar el valor anterior del localStorage
    this.previousAdminData = localStorage.getItem('admin');
    
    this.initializePermissions();
    
    // Verificar cambios en localStorage cada 2 segundos
    this.localStorageCheckInterval = setInterval(() => {
      this.checkLocalStorageChanges();
    }, 2000);
    
            // Agregar listener para cuando se abra el menú de navegación
        this.setupNavigationMenuListener();
        
        // Agregar listener para cambios de ruta
        this.setupRouteChangeListener();
        
        // Agregar listener para cuando la ventana reciba focus
        this.setupWindowFocusListener();
        
        // Agregar listener para interacciones con el menú
        this.setupMenuInteractionListener();
      },
  
  beforeUnmount() {
    // Limpiar el intervalo cuando se desmonte el componente
    if (this.localStorageCheckInterval) {
      clearInterval(this.localStorageCheckInterval);
    }
    
    // Limpiar listeners de permisos
    window.removeEventListener('permissions-saved', this.handlePermissionsSaved);
    window.removeEventListener('permissions-updated', this.handlePermissionsUpdated);
    window.removeEventListener('menu-permissions-updated', this.handleMenuPermissionsUpdated);
    window.removeEventListener('force-menu-update', this.handleForceMenuUpdate);
    window.removeEventListener('permissions-updated-immediate', this.handlePermissionsUpdatedImmediate);
  }
};
</script>

<style>
.v-container.nopad {
  padding: 0 !important;
}
.v-navigation-drawer .custom-nav-list .v-list-item {
  padding-inline-start: 8px !important;
}

.v-navigation-drawer .v-list-group__items {
  background: whitesmoke;
}

.custom-nav-list .v-list-item {
  background: whitesmoke;
}

.custom-nav-list .v-list-item__prepend {
  margin-inline-end: 8px !important;
  max-width: 24px;
}

/* Estilos para mensajes de permisos */
.no-permissions-message .v-list-item-title {
  font-size: 12px !important;
  line-height: 1.2 !important;
  text-align: center;
}

.loading-indicator .v-list-item-title {
  font-size: 12px !important;
  line-height: 1.2 !important;
}

.debug-info .v-list-item-title {
  font-size: 12px !important;
  line-height: 1.2 !important;
  color: #1976d2 !important;
}

.debug-permissions .v-list-item-title {
  font-size: 12px !important;
  line-height: 1.2 !important;
  color: #ff9800 !important;
}

.debug-permissions .v-list-item-title:hover {
  color: #f57c00 !important;
  text-decoration: underline;
}

/* Estilos especiales para el enlace Dashboard */
.dashboard-menu-item {
  background-color: rgba(25, 118, 210, 0.05) !important;
  border: 1px solid rgba(25, 118, 210, 0.2) !important;
  margin: 8px !important;
}

.dashboard-menu-item:hover {
  background-color: rgba(25, 118, 210, 0.15) !important;
  border-color: rgba(25, 118, 210, 0.4) !important;
  transform: translateX(4px) scale(1.02) !important;
}

.dashboard-menu-item .v-list-item-title {
  color: #1976d2 !important;
  font-weight: 600 !important;
}
</style>
