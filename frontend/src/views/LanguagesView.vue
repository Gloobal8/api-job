<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex justify-space-between">
            <span>{{ $t("localization.languages") }}</span>
            <v-btn color="primary" @click="openCreateDialog">
              <v-icon left>mdi-plus</v-icon>
              {{ $t("localization.createLanguage") }}
            </v-btn>
          </v-card-title>

          <v-card-text>
            <v-data-table
              :headers="headers"
              :items="languages"
              :loading="loading"
              sort-by="id"
              class="elevation-1"
            >
              <template v-slot:item.nativeName="{ item }">
                <span>{{ item.nativeName }}</span>
              </template>

              <template v-slot:item.active="{ item }">
                <v-icon :color="item.active ? 'success' : 'grey'">
                  {{ item.active ? "mdi-check" : "mdi-close" }}
                </v-icon>
              </template>

              <template v-slot:item.isDefault="{ item }">
                <v-icon :color="item.isDefault ? 'success' : 'grey'">
                  {{ item.isDefault ? "mdi-check" : "mdi-close" }}
                </v-icon>
              </template>

              <template v-slot:item.actions="{ item }">
                <v-btn icon small class="mr-2" @click="editLanguage(item)">
                  <v-icon small>mdi-pencil</v-icon>
                </v-btn>
                <v-btn icon small class="mr-2" @click="editTranslations(item)">
                  <v-icon small>mdi-translate</v-icon>
                </v-btn>
                <v-btn
                  icon
                  small
                  color="error"
                  @click="confirmDelete(item)"
                  :disabled="item.isDefault"
                >
                  <v-icon small>mdi-delete</v-icon>
                </v-btn>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Diálogo para crear/editar idioma -->
    <v-dialog v-model="dialog" max-width="600px">
      <v-card>
        <v-card-title>
          {{
            editingLanguage
              ? $t("localization.editLanguage")
              : $t("localization.createLanguage")
          }}
        </v-card-title>
        <v-card-text>
          <v-form ref="form" v-model="valid">
            <v-text-field
              v-model="languageData.id"
              :label="$t('localization.languageId')"
              :rules="idRules"
              :disabled="!!editingLanguage"
              required
            ></v-text-field>

            <v-text-field
              v-model="languageData.name"
              :label="$t('localization.languageName')"
              :rules="nameRules"
              required
            ></v-text-field>

            <v-text-field
              v-model="languageData.nativeName"
              :label="$t('localization.languageNativeName')"
              :rules="nameRules"
              required
            ></v-text-field>

            <v-text-field
              v-model="languageData.dateFormat"
              :label="$t('localization.languageDateFormat')"
              hint="DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD, etc."
              persistent-hint
            ></v-text-field>

            <v-text-field
              v-model="languageData.timeFormat"
              :label="$t('localization.languageTimeFormat')"
              hint="HH:mm, hh:mm a, etc."
              persistent-hint
            ></v-text-field>

            <v-switch
              v-model="languageData.active"
              :label="$t('localization.languageActive')"
            ></v-switch>

            <v-switch
              v-model="languageData.isDefault"
              :label="$t('localization.languageDefault')"
            ></v-switch>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey darken-1" text @click="dialog = false">
            {{ $t("common.cancel") }}
          </v-btn>
          <v-btn color="primary" :disabled="!valid" @click="saveLanguage">
            {{ $t("common.save") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Diálogo para editar traducciones -->
    <v-dialog v-model="translationsDialog" fullscreen hide-overlay>
      <v-card>
        <v-toolbar dark color="primary">
          <v-btn icon dark @click="translationsDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>
            {{ $t("localization.editTranslations") }} -
            {{ currentEditingLanguage?.name }}
          </v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn dark text @click="saveTranslations">
              {{ $t("common.save") }}
            </v-btn>
          </v-toolbar-items>
        </v-toolbar>

        <v-card-text>
          <v-container fluid>
            <v-row>
              <v-col cols="12">
                <v-tabs v-model="activeTab">
                  <v-tab
                    v-for="section in Object.keys(translations)"
                    :key="section"
                  >
                    {{ section }}
                  </v-tab>

                  <v-tab-item
                    v-for="(section, sectionKey) in translations"
                    :key="sectionKey"
                  >
                    <v-card flat>
                      <v-card-text>
                        <v-text-field
                          v-for="(value, key) in section"
                          :key="key"
                          v-model="translations[sectionKey][key]"
                          :label="key"
                          outlined
                          dense
                        ></v-text-field>
                      </v-card-text>
                    </v-card>
                  </v-tab-item>
                </v-tabs>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Diálogo de confirmación para eliminar -->
    <v-dialog v-model="deleteDialog" max-width="500px">
      <v-card>
        <v-card-title>{{ $t("localization.confirmDelete") }}</v-card-title>
        <v-card-text>
          {{ $t("localization.confirmDelete") }} "{{ deleteItem?.name }}"?
          <br />
          <strong class="red--text"
            >{{ $t("common.warning") }}: {{ $t("common.irreversible") }}</strong
          >
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey darken-1" text @click="deleteDialog = false">
            {{ $t("common.cancel") }}
          </v-btn>
          <v-btn color="error" text @click="deleteLanguage">
            {{ $t("common.delete") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar para notificaciones -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
      {{ snackbar.text }}
      <template v-slot:action="{ attrs }">
        <v-btn text v-bind="attrs" @click="snackbar.show = false">
          {{ $t("common.close") }}
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script>
import { mapState, mapActions } from "vuex";

export default {
  name: "LanguagesView",
  data() {
    return {
      valid: false,
      dialog: false,
      translationsDialog: false,
      deleteDialog: false,
      activeTab: null,
      deleteItem: null,
      editingLanguage: null,
      currentEditingLanguage: null,
      translations: {},
      languageData: {
        id: "",
        name: "",
        nativeName: "",
        active: true,
        isDefault: false,
        dateFormat: "DD/MM/YYYY",
        timeFormat: "HH:mm",
      },
      snackbar: {
        show: false,
        text: "",
        color: "success",
      },
      idRules: [
        (v) => !!v || this.$t("common.required"),
        (v) =>
          /^[a-z]{2}(-[A-Z]{2})?$/.test(v) ||
          this.$t("localization.invalidLanguageId"),
      ],
      nameRules: [(v) => !!v || this.$t("common.required")],
    };
  },
  computed: {
    ...mapState({
      languages: (state) => state.localization.languages,
      loading: (state) => state.localization.loading,
      error: (state) => state.localization.error,
    }),
    headers() {
      return [
        { text: this.$t("localization.languageId"), value: "id" },
        { text: this.$t("localization.languageName"), value: "name" },
        {
          text: this.$t("localization.languageNativeName"),
          value: "nativeName",
        },
        {
          text: this.$t("localization.languageActive"),
          value: "active",
          align: "center",
        },
        {
          text: this.$t("localization.languageDefault"),
          value: "isDefault",
          align: "center",
        },
        {
          text: this.$t("common.actions"),
          value: "actions",
          sortable: false,
          align: "center",
        },
      ];
    },
  },
  created() {
    this.fetchLanguages();
  },
  methods: {
    ...mapActions({
      fetchLanguages: "localization/fetchLanguages",
      createLanguage: "localization/createLanguage",
      updateLanguage: "localization/updateLanguage",
      removeLanguage: "localization/deleteLanguage",
      fetchTranslations: "localization/fetchTranslations",
      updateTranslations: "localization/updateTranslations",
    }),

    openCreateDialog() {
      this.editingLanguage = null;
      this.languageData = {
        id: "",
        name: "",
        nativeName: "",
        active: true,
        isDefault: false,
        dateFormat: "DD/MM/YYYY",
        timeFormat: "HH:mm",
      };
      this.dialog = true;
    },

    editLanguage(item) {
      this.editingLanguage = item;
      this.languageData = { ...item };
      this.dialog = true;
    },

    async editTranslations(language) {
      try {
        this.currentEditingLanguage = language;
        this.translations = await this.fetchTranslations(language.id);
        this.translationsDialog = true;
      } catch (error) {
        console.error("Error fetching translations:", error);
        this.showSnackbar(
          this.$t("localization.errorFetchingTranslations"),
          "error"
        );
      }
    },

    async saveLanguage() {
      if (this.$refs.form.validate()) {
        try {
          if (this.editingLanguage) {
            // Actualizar idioma existente
            await this.updateLanguage({
              id: this.editingLanguage.id,
              languageData: this.languageData,
            });
            this.showSnackbar(
              this.$t("localization.languageUpdated"),
              "success"
            );
          } else {
            // Crear nuevo idioma
            await this.createLanguage(this.languageData);
            this.showSnackbar(
              this.$t("localization.languageCreated"),
              "success"
            );
          }
          this.dialog = false;
        } catch (error) {
          console.error("Error saving language:", error);
          this.showSnackbar(
            error.response?.data?.message || this.$t("common.error"),
            "error"
          );
        }
      }
    },

    async saveTranslations() {
      try {
        await this.updateTranslations({
          lang: this.currentEditingLanguage.id,
          translations: this.translations,
        });
        this.showSnackbar(
          this.$t("localization.translationsUpdated"),
          "success"
        );
        this.translationsDialog = false;
      } catch (error) {
        console.error("Error saving translations:", error);
        this.showSnackbar(
          error.response?.data?.message || this.$t("common.error"),
          "error"
        );
      }
    },

    confirmDelete(item) {
      if (item.isDefault) {
        this.showSnackbar(this.$t("localization.cannotDeleteDefault"), "error");
        return;
      }
      this.deleteItem = item;
      this.deleteDialog = true;
    },

    async deleteLanguage() {
      try {
        await this.removeLanguage(this.deleteItem.id);
        this.showSnackbar(this.$t("localization.languageDeleted"), "success");
        this.deleteDialog = false;
      } catch (error) {
        console.error("Error deleting language:", error);
        this.showSnackbar(
          error.response?.data?.message || this.$t("common.error"),
          "error"
        );
      }
    },

    showSnackbar(text, color = "success") {
      this.snackbar.text = text;
      this.snackbar.color = color;
      this.snackbar.show = true;
    },
  },
};
</script>
