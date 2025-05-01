<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex justify-space-between">
            <span>Administración de Campos Personalizados</span>
            <v-btn color="primary" @click="openCreateDialog">
              <v-icon left>mdi-plus</v-icon>
              Nuevo Campo
            </v-btn>
          </v-card-title>

          <v-card-text>
            <v-data-table
              :headers="headers"
              :items="customFields"
              :loading="loading"
              :search="search"
              sort-by="entity"
              class="elevation-1"
            >
              <template v-slot:top>
                <v-text-field
                  v-model="search"
                  label="Buscar"
                  prepend-icon="mdi-magnify"
                  single-line
                  hide-details
                  class="mb-4"
                ></v-text-field>
              </template>

              <template v-slot:item.type="{ item }">
                {{ getFieldTypeName(item.type) }}
              </template>

              <template v-slot:item.entity="{ item }">
                {{ getEntityName(item.entity) }}
              </template>

              <template v-slot:item.required="{ item }">
                <v-icon :color="item.required ? 'success' : 'grey'">
                  {{ item.required ? "mdi-check" : "mdi-close" }}
                </v-icon>
              </template>

              <template v-slot:item.active="{ item }">
                <v-icon :color="item.active ? 'success' : 'grey'">
                  {{ item.active ? "mdi-check" : "mdi-close" }}
                </v-icon>
              </template>

              <template v-slot:item.actions="{ item }">
                <v-btn icon small class="mr-2" @click="editField(item)">
                  <v-icon small>mdi-pencil</v-icon>
                </v-btn>
                <v-btn icon small color="error" @click="confirmDelete(item)">
                  <v-icon small>mdi-delete</v-icon>
                </v-btn>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Diálogo para crear/editar campo -->
    <v-dialog v-model="dialog" max-width="700px">
      <custom-field-builder
        :edit-field="editingField"
        @save="saveField"
        @cancel="closeDialog"
      />
    </v-dialog>

    <!-- Diálogo de confirmación para eliminar -->
    <v-dialog v-model="deleteDialog" max-width="500px">
      <v-card>
        <v-card-title>Confirmar eliminación</v-card-title>
        <v-card-text>
          ¿Está seguro de que desea eliminar el campo "{{
            deleteItem ? deleteItem.label : ""
          }}"?
          <br />
          <strong class="red--text">Esta acción no se puede deshacer.</strong>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey darken-1" text @click="deleteDialog = false"
            >Cancelar</v-btn
          >
          <v-btn color="error" text @click="deleteField">Eliminar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar para notificaciones -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
      {{ snackbar.text }}
      <template v-slot:action="{ attrs }">
        <v-btn text v-bind="attrs" @click="snackbar.show = false">
          Cerrar
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script>
import { mapState, mapActions } from "vuex";
import CustomFieldBuilder from "@/components/CustomFields/CustomFieldBuilder.vue";

export default {
  name: "CustomFieldsView",
  components: {
    CustomFieldBuilder,
  },
  data() {
    return {
      search: "",
      dialog: false,
      deleteDialog: false,
      deleteItem: null,
      editingField: null,
      snackbar: {
        show: false,
        text: "",
        color: "success",
      },
      headers: [
        { text: "Nombre", value: "name" },
        { text: "Etiqueta", value: "label" },
        { text: "Tipo", value: "type" },
        { text: "Entidad", value: "entity" },
        { text: "Obligatorio", value: "required", align: "center" },
        { text: "Activo", value: "active", align: "center" },
        { text: "Orden", value: "order", align: "center" },
        {
          text: "Acciones",
          value: "actions",
          sortable: false,
          align: "center",
        },
      ],
    };
  },
  computed: {
    ...mapState({
      customFields: (state) => state.customFields.customFields,
      loading: (state) => state.customFields.loading,
      error: (state) => state.customFields.error,
    }),
  },
  created() {
    this.fetchCustomFields();
  },
  methods: {
    ...mapActions({
      fetchCustomFields: "customFields/fetchCustomFields",
      createCustomField: "customFields/createCustomField",
      updateCustomField: "customFields/updateCustomField",
      deleteCustomField: "customFields/deleteCustomField",
    }),

    getFieldTypeName(type) {
      const types = {
        text: "Texto",
        number: "Número",
        date: "Fecha",
        select: "Selección",
        checkbox: "Casillas",
        radio: "Opción única",
        email: "Email",
        url: "URL",
        textarea: "Área de texto",
      };

      return types[type] || type;
    },

    getEntityName(entity) {
      const entities = {
        job: "Trabajo",
        company: "Empresa",
        user: "Usuario",
      };

      return entities[entity] || entity;
    },

    openCreateDialog() {
      this.editingField = null;
      this.dialog = true;
    },

    editField(item) {
      this.editingField = { ...item };
      this.dialog = true;
    },

    closeDialog() {
      this.dialog = false;
      this.editingField = null;
    },

    async saveField(field) {
      try {
        if (field.id) {
          // Actualizar campo existente
          await this.updateCustomField({ id: field.id, fieldData: field });
          this.showSnackbar("Campo actualizado correctamente", "success");
        } else {
          // Crear nuevo campo
          await this.createCustomField(field);
          this.showSnackbar("Campo creado correctamente", "success");
        }
        this.closeDialog();
      } catch (error) {
        this.showSnackbar(
          error.response?.data?.message || "Error al guardar el campo",
          "error"
        );
      }
    },

    confirmDelete(item) {
      this.deleteItem = item;
      this.deleteDialog = true;
    },

    async deleteField() {
      try {
        await this.deleteCustomField(this.deleteItem.id);
        this.showSnackbar("Campo eliminado correctamente", "success");
        this.deleteDialog = false;
        this.deleteItem = null;
      } catch (error) {
        this.showSnackbar(
          error.response?.data?.message || "Error al eliminar el campo",
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
