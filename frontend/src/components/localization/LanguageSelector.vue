<template>
  <div>
    <v-menu :offset="[0, 10]">
      <template v-slot:activator="{ props }">
        <v-btn text v-bind="props" class="language-selector">
          <v-icon left>mdi-translate</v-icon>
          {{ currentLanguage ? currentLanguage.nativeName : "Idioma" }}
        </v-btn>
      </template>
      <v-list>
        <v-list-item
          v-for="language in languages"
          :key="language.id"
          @click="changeLanguage(language.id)"
          :class="{ 'v-list-item--active': language.id === $i18n.locale }"
        >
          <v-list-item-title>{{ language.nativeName }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";
import { loadLanguage } from "@/i18n";

export default {
  name: "LanguageSelector",
  computed: {
    ...mapState({
      languages: (state) => state.localization.languages,
    }),
    currentLanguage() {
      return this.languages.find((lang) => lang.id === this.$i18n.locale);
    },
  },
  created() {
    this.fetchLanguages();
  },
  methods: {
    ...mapActions({
      fetchLanguages: "localization/fetchLanguages",
    }),
    async changeLanguage(lang) {
      try {
        await loadLanguage(lang);
        this.$vuetify.lang.current = lang;
        this.$store.commit("localization/setCurrentLanguage", lang);
      } catch (error) {
        console.error("Error changing language:", error);
      }
    },
  },
};
</script>

<style scoped>
.language-selector {
  text-transform: none;
}
</style>