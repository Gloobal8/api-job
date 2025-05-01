<template>
  <v-card>
    <v-card-title>
      {{ editing ? "Editar Campo Personalizado" : "Crear Campo Personalizado" }}
    </v-card-title>
    <v-card-text>
      <v-form ref="form" v-model="valid">
        <v-text-field
          v-model="field.name"
          label="Nombre interno del campo"
          :rules="nameRules"
          required
        ></v-text-field>

        <v-text-field
          v-model="field.label"
          label="Etiqueta visible"
          :rules="labelRules"
          required
        ></v-text-field>

        <v-select
          v-model="field.type"
          label="Tipo de campo"
          :items="fieldTypes"
          :rules="typeRules"
          required
          @change="onTypeChange"
        ></v-select>

        <v-select
          v-model="field.entity"
          label="Entidad"
          :items="entityTypes"
          :rules="entityRules"
          required
        ></v-select>

        <v-text-field
          v-model="field.placeholder"
          label="Texto de ayuda"
        ></v-text-field>

        <v-switch v-model="field.required" label="Campo obligatorio"></v-switch>

        <v-text-field
          v-if="field.type === 'number'"
          v-model.number="field.validations.min"
          label="Valor mínimo"
          type="number"
        ></v-text-field>

        <v-text-field
          v-if="field.type === 'number'"
          v-model.number="field.validations.max"
          label="Valor máximo"
          type="number"
        ></v-text-field>

        <v-text-field
          v-if="['text', 'textarea'].includes(field.type)"
          v-model.number="field.validations.minLength"
          label="Longitud mínima"
          type="number"
        ></v-text-field>

        <v-text-field
          v-if="['text', 'textarea'].includes(field.type)"
          v-model.number="field.validations.maxLength"
          label="Longitud máxima"
          type="number"
        ></v-text-field>

        <div v-if="['select', 'checkbox', 'radio'].includes(field.type)">
          <v-card-subtitle>Opciones</v-card-subtitle>

          <div
            v-for="(option, index) in field.options"
            :key="index"
            class="d-flex align-center mb-2"
          >
            <v-text-field
              v-model="field.options[index]"
              label="Opción"
              :rules="optionRules"
              required
              class="mr-2"
            ></v-text-field>

            <v-btn icon color="error" @click="removeOption(index)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </div>

          <v-btn color="primary" text @click="addOption">
            <v-icon left>mdi-plus</v-icon>
            Añadir opción
          </v-btn>
        </div>

        <v-text-field
          v-model="field.defaultValue"
          label="Valor predeterminado"
        ></v-text-field>

        <v-text-field
          v-model.number="field.order"
          label="Orden"
          type="number"
          hint="Orden de aparición del campo"
        ></v-text-field>
      </v-form>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="error" text @click="$emit('cancel')">Cancelar</v-btn>
      <v-btn color="primary" :disabled="!valid" @click="saveField"
        >Guardar</v-btn
      >
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  name: "CustomFieldBuilder",
  props: {
    editField: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      valid: false,
      editing: false,
      field: {
        name: "",
        label: "",
        type: "text",
        entity: "job",
        placeholder: "",
        required: false,
        options: [],
        defaultValue: "",
        validations: {},
        order: 0,
        active: true,
      },
      fieldTypes: [
        { text: "Texto", value: "text" },
        { text: "Número", value: "number" },
        { text: "Fecha", value: "date" },
        { text: "Selección", value: "select" },
        { text: "Casillas", value: "checkbox" },
        { text: "Opción única", value: "radio" },
        { text: "Email", value: "email" },
        { text: "URL", value: "url" },
        { text: "Área de texto", value: "textarea" },
      ],
      entityTypes: [
        { text: "Trabajo", value: "job" },
        { text: "Empresa", value: "company" },
        { text: "Usuario", value: "user" },
      ],
      nameRules: [
        (v) => !!v || "El nombre es obligatorio",
        (v) =>
          /^[a-zA-Z0-9_]+$/.test(v) ||
          "El nombre solo puede contener letras, números y guiones bajos",
        (v) => v.length <= 50 || "El nombre debe tener máximo 50 caracteres",
      ],
      labelRules: [
        (v) => !!v || "La etiqueta es obligatoria",
        (v) =>
          v.length <= 100 || "La etiqueta debe tener máximo 100 caracteres",
      ],
      typeRules: [(v) => !!v || "El tipo es obligatorio"],
      entityRules: [(v) => !!v || "La entidad es obligatoria"],
      optionRules: [(v) => !!v || "La opción es obligatoria"],
    };
  },
  created() {
    if (this.editField) {
      this.field = { ...this.editField };
      this.editing = true;

      // Asegurarse de que validations es un objeto
      if (!this.field.validations) {
        this.field.validations = {};
      }

      // Asegurarse de que options es un array
      if (!this.field.options) {
        this.field.options = [];
      }
    }
  },
  methods: {
    onTypeChange() {
      // Reiniciar opciones si el tipo cambia a/desde select, checkbox, radio
      if (["select", "checkbox", "radio"].includes(this.field.type)) {
        if (!this.field.options || !this.field.options.length) {
          this.field.options = [""];
        }
      } else {
        this.field.options = [];
      }

      // Reiniciar validaciones específicas por tipo
      this.field.validations = {};
    },
    addOption() {
      this.field.options.push("");
    },
    removeOption(index) {
      this.field.options.splice(index, 1);
    },
    saveField() {
      if (this.$refs.form.validate()) {
        // Eliminar opciones vacías
        if (this.field.options && this.field.options.length) {
          this.field.options = this.field.options.filter(
            (option) => option.trim() !== ""
          );
        }

        this.$emit("save", this.field);
      }
    },
  },
};
</script>
