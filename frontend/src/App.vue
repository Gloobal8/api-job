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
      <v-list-item>
        <v-list-item-title class="text-h6"> Job Board </v-list-item-title>
        <v-list-item-subtitle> Find your dream job </v-list-item-subtitle>
      </v-list-item>

      <v-divider></v-divider>

      <v-list dense nav>
        <v-list-item to="/" link>
          <template v-slot:prepend>
            <v-icon>mdi-home</v-icon>
          </template>
          <v-list-item-title>Home</v-list-item-title>
        </v-list-item>

        <v-list-item to="/dashboard" link>
          <template v-slot:prepend>
            <v-icon>mdi-view-dashboard-outline</v-icon>
          </template>
          <v-list-item-title>Dashboard</v-list-item-title>
        </v-list-item>

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

        <v-list-item to="/profile" link>
          <template v-slot:prepend>
            <v-icon>mdi-account</v-icon>
          </template>
          <v-list-item-title>Profile</v-list-item-title>
        </v-list-item>

        <v-list-item to="/messages" link>
          <template v-slot:prepend>
            <v-icon>mdi-message</v-icon>
          </template>
          <v-list-item-title>Messages</v-list-item-title>
        </v-list-item>

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

        <v-list-item to="/site-map" link>
          <template v-slot:prepend>
            <v-icon>mdi-sitemap</v-icon>
          </template>
          <v-list-item-title>Sitemap</v-list-item-title>
        </v-list-item>

        <template v-if="isLoggedIn">
          <v-list-item to="/dashboard" link>
            <template v-slot:prepend>
              <v-icon>mdi-view-dashboard</v-icon>
            </template>
            <v-list-item-title>Dashboard</v-list-item-title>
          </v-list-item>

          <v-list-item to="/profile" link>
            <template v-slot:prepend>
              <v-icon>mdi-account</v-icon>
            </template>
            <v-list-item-title>My Profile</v-list-item-title>
          </v-list-item>
        </template>
      </v-list>
    </v-navigation-drawer>

    <v-main>
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
      return this.$store.getters.isLoggedIn;
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
</style>
