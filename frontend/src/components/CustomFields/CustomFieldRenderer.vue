<template>
  <div>
    <!-- Campo de texto -->
    <v-text-field
      v-if="
        field.type === 'text' || field.type === 'email' || field.type === 'url'
      "
      v-model="localValue"
      :label="field.label"
      :placeholder="field.placeholder"
      :required="field.required"
      :rules="rules"
      :type="
        field.type === 'email' ? 'email' : field.type === 'url' ? 'url' : 'text'
      "
      @input="updateValue"
    ></v-text-field>

    <!-- Campo numérico -->
    <v-text-field
      v-else-if="field.type === 'number'"
      v-model.number="localValue"
      :label="field.label"
      :placeholder="field.placeholder"
      :required="field.required"
      :rules="rules"
      type="number"
      :min="field.validations.min"
      :max="field.validations.max"
      @input="updateValue"
    ></v-text-field>

    <!-- Campo de fecha -->
    <v-menu
      v-else-if="field.type === 'date'"
      v-model="dateMenu"
      :close-on-content-click="false"
      transition="scale-transition"
      offset-y
      min-width="290px"
    >
      <template v-slot:activator="{ on, attrs }">
        <v-text-field
          v-model="formattedDate"
          :label="field.label"
          :placeholder="field.placeholder"
          :required="field.required"
          :rules="rules"
          readonly
          v-bind="attrs"
          v-on="on"
        ></v-text-field>
      </template>
      <v-date-picker
        v-model="localValue"
        @input="updateDateValue"
      ></v-date-picker>
    </v-menu>

    <!-- Campo de selección -->
    <v-select
      v-else-if="field.type === 'select'"
      v-model="localValue"
      :label="field.label"
      :placeholder="field.placeholder"
      :required="field.required"
      :rules="rules"
      :items="field.options"
      @input="updateValue"
    ></v-select>

    <!-- Campo de casillas de verificación -->
    <div v-else-if="field.type === 'checkbox'">
      <v-subheader
        >{{ field.label }}{{ field.required ? " *" : "" }}</v-subheader
      >
      <v-checkbox
        v-for="option in field.options"
        :key="option"
        v-model="checkboxValues"
        :label="option"
        :value="option"
        @change="updateCheckboxValue"
      ></v-checkbox>
      <v-messages
        v-if="field.required && checkboxValues.length === 0 && touched"
        color="error"
      >
        Este campo es obligatorio
      </v-messages>
    </div>

    <!-- Campo de opción única -->
    <div v-else-if="field.type === 'radio'">
      <v-subheader
        >{{ field.label }}{{ field.required ? " *" : "" }}</v-subheader
      >
      <v-radio-group v-model="localValue" :rules="rules" @change="updateValue">
        <v-radio
          v-for="option in field.options"
          :key="option"
          :label="option"
          :value="option"
        ></v-radio>
      </v-radio-group>
    </div>

    <!-- Área de texto -->
    <v-textarea
      v-else-if="field.type === 'textarea'"
      v-model="localValue"
      :label="field.label"
      :placeholder="field.placeholder"
      :required="field.required"
      :rules="rules"
      auto-grow
      @input="updateValue"
    ></v-textarea>
  </div>
</template>

<script>
export default {
  name: "CustomFieldRenderer",
  props: {
    field: {
      type: Object,
      required: true,
    },
    value: {
      type: [String, Number, Array, Boolean],
      default: null,
    },
  },
  data() {
    return {
      localValue: null,
      checkboxValues: [],
      dateMenu: false,
      touched: false,
    };
  },
  computed: {
    rules() {
      const rules = [];

      // Regla de campo requerido
      if (this.field.required) {
        rules.push((v) => !!v || "Este campo es obligatorio");
      }

      // Reglas específicas por tipo
      if (this.field.type === "number") {
        if (this.field.validations.min !== undefined) {
          rules.push(
            (v) =>
              v >= this.field.validations.min ||
              `El valor mínimo es ${this.field.validations.min}`
          );
        }
        if (this.field.validations.max !== undefined) {
          rules.push(
            (v) =>
              v <= this.field.validations.max ||
              `El valor máximo es ${this.field.validations.max}`
          );
        }
      } else if (this.field.type === "text" || this.field.type === "textarea") {
        if (this.field.validations.minLength) {
          rules.push(
            (v) =>
              !v ||
              v.length >= this.field.validations.minLength ||
              `La longitud mínima es ${this.field.validations.minLength} caracteres`
          );
        }
        if (this.field.validations.maxLength) {
          rules.push(
            (v) =>
              !v ||
              v.length <= this.field.validations.maxLength ||
              `La longitud máxima es ${this.field.validations.maxLength} caracteres`
          );
        }
      } else if (this.field.type === "email") {
        rules.push(
          (v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || "Email no válido"
        );
      } else if (this.field.type === "url") {
        rules.push((v) => {
          if (!v) return true;
          try {
            new URL(v);
            return true;
          } catch (e) {
            return "URL no válida";
          }
        });
      }

      return rules;
    },
    formattedDate() {
      if (!this.localValue) return "";

      // Formato de fecha local
      try {
        const date = new Date(this.localValue);
        return date.toLocaleDateString();
      } catch (e) {
        return this.localValue;
      }
    },
  },
  watch: {
    value: {
      immediate: true,
      handler(newVal) {
        if (this.field.type === "checkbox") {
          this.checkboxValues = Array.isArray(newVal)
            ? [...newVal]
            : newVal
            ? [newVal]
            : [];
        } else {
          this.localValue =
            newVal !== undefined ? newVal : this.field.defaultValue || null;
        }
      },
    },
  },
  methods: {
    updateValue() {
      this.touched = true;
      this.$emit("input", this.localValue);
    },
    updateCheckboxValue() {
      this.touched = true;
      this.$emit("input", this.checkboxValues);
    },
    updateDateValue() {
      this.dateMenu = false;
      this.updateValue();
    },
  },
};
</script>
