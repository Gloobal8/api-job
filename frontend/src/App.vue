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
        <!-- Work Platform -->
        <v-list-group>
          <template v-slot:activator="{ props }">
            <v-list-item v-bind="props">
              <v-list-item-title>Work Platform</v-list-item-title>
            </v-list-item>
          </template>
          <v-list-item to="/" link>
            <template v-slot:prepend>
              <v-icon>mdi-home</v-icon>
            </template>
            <v-list-item-title>Home</v-list-item-title>
          </v-list-item>

<<<<<<< HEAD
          <v-list-item v-if="isLoggedIn" to="/dashboard" link>
            <template v-slot:prepend>
              <v-icon>mdi-view-dashboard-outline</v-icon>
            </template>
            <v-list-item-title>Dashboard</v-list-item-title>
          </v-list-item>
=======
        <v-list-item v-if="isLoggedIn" to="/dashboard" link>
          <template v-slot:prepend>
            <v-icon>mdi-view-dashboard-outline</v-icon>
          </template>
          <v-list-item-title>Dashboard</v-list-item-title>
        </v-list-item>
>>>>>>> develop

          <v-list-item to="/jobs" link>
            <template v-slot:prepend>
              <v-icon>mdi-briefcase-outline</v-icon>
            </template>
            <v-list-item-title>Jobs</v-list-item-title>
          </v-list-item>

          <v-list-item to="/companies" link>
            <template v-slot:prepend>
              <v-icon>mdi-domain</v-icon>
            </template>
            <v-list-item-title>Companies</v-list-item-title>
          </v-list-item>

<<<<<<< HEAD
          <v-list-item v-if="isLoggedIn" to="/profile" link>
            <template v-slot:prepend>
              <v-icon>mdi-account</v-icon>
            </template>
            <v-list-item-title>My Profile</v-list-item-title>
          </v-list-item>

          <v-list-item v-if="isLoggedIn" to="/messages" link>
            <template v-slot:prepend>
              <v-icon>mdi-message</v-icon>
            </template>
            <v-list-item-title>Messages</v-list-item-title>
          </v-list-item>
=======
        <v-list-item v-if="isLoggedIn" to="/profile" link>
          <template v-slot:prepend>
            <v-icon>mdi-account</v-icon>
          </template>
          <v-list-item-title>My Profile</v-list-item-title>
        </v-list-item>

        <v-list-item v-if="isLoggedIn" to="/messages" link>
          <template v-slot:prepend>
            <v-icon>mdi-message</v-icon>
          </template>
          <v-list-item-title>Messages</v-list-item-title>
        </v-list-item>
>>>>>>> develop

          <!--<v-list-item to="/notifications" link>
          <template v-slot:prepend>
            <v-icon>mdi-bell</v-icon>
          </template>
          <v-list-item-title>Notifications</v-list-item-title>
        </v-list-item>-->

          <v-list-group value="false" prepend-icon="mdi-post-outline">
            <template v-slot:activator="{ props }">
              <v-list-item v-bind="props" title="Blog"></v-list-item>
            </template>

            <!-- Subelementos del blog -->
            <v-list-item to="/blog" link>
              <template v-slot:prepend>
                <v-icon>mdi-view-list</v-icon>
              </template>
              <v-list-item-title>All Articles</v-list-item-title>
            </v-list-item>

            <v-list-item to="/blog/categories" link>
              <template v-slot:prepend>
                <v-icon>mdi-tag-multiple</v-icon>
              </template>
              <v-list-item-title>Categories</v-list-item-title>
            </v-list-item>

            <v-list-item to="/blog/create" link
              ><!--v-if="isLoggedIn"-->
              <template v-slot:prepend>
                <v-icon>mdi-pencil</v-icon>
              </template>
              <v-list-item-title>Write Article</v-list-item-title>
            </v-list-item>

            <v-list-item to="/blog/my-posts" link
              ><!--v-if="isLoggedIn"-->
              <template v-slot:prepend>
                <v-icon>mdi-account-edit</v-icon>
              </template>
              <v-list-item-title>My Posts</v-list-item-title>
            </v-list-item>
          </v-list-group>
        </v-list-group>

        <!-- Shopping Platform -->
        <v-list-group>
          <template v-slot:activator="{ props }">
            <v-list-item v-bind="props">
              <v-list-item-title>Sell</v-list-item-title>
            </v-list-item>
          </template>
          <v-list-item to="/orders" link>
            <v-list-item-prepend>
              <v-icon>mdi-cart</v-icon>
            </v-list-item-prepend>
            <v-list-item-title>Orders</v-list-item-title>
          </v-list-item>
          <v-list-item to="/order-detail" link>
            <v-list-item-prepend>
              <v-icon>mdi-file-document-outline</v-icon>
            </v-list-item-prepend>
            <v-list-item-title>Order detail</v-list-item-title>
          </v-list-item>
        </v-list-group>

        <v-list-item v-if="isLoggedIn" to="/site-map" link>
          <template v-slot:prepend>
            <v-icon>mdi-sitemap</v-icon>
          </template>
          <v-list-item-title>Sitemap</v-list-item-title>
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

export default {
  name: "App",
  components: {
    LanguageSelector,
    Snackbar,
  },
  data: () => ({
    drawer: false,
  }),
  computed: {
    isLoggedIn() {
      return this.$store.getters.isAuthenticated;
    },
  },
  methods: {
    logout() {
      this.$store.dispatch("logout").then(() => {
        this.$router.push("/login");
      });
    },
  },
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
</style>
