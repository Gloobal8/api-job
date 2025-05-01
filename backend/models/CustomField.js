const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

// Ruta al archivo JSON que almacenará los campos personalizados
const dataPath = path.join(__dirname, "../data/customFields.json");

// Asegurarse de que el archivo existe
if (!fs.existsSync(dataPath)) {
  // Asegurarse de que el directorio data existe
  const dataDir = path.join(__dirname, "../data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  fs.writeFileSync(dataPath, JSON.stringify([]));
}

class CustomField {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.name = data.name;
    this.label = data.label;
    this.type = data.type; // text, number, date, select, checkbox, radio, etc.
    this.placeholder = data.placeholder || "";
    this.required = data.required || false;
    this.options = data.options || []; // Para tipos select, checkbox, radio
    this.defaultValue = data.defaultValue || "";
    this.entity = data.entity; // 'job', 'company', 'user', etc.
    this.validations = data.validations || {}; // min, max, pattern, etc.
    this.order = data.order || 0;
    this.active = data.active !== undefined ? data.active : true;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  // Guardar un nuevo campo personalizado
  static create(data) {
    const customField = new CustomField(data);
    const customFields = JSON.parse(fs.readFileSync(dataPath));
    customFields.push(customField);
    fs.writeFileSync(dataPath, JSON.stringify(customFields, null, 2));
    return customField;
  }

  // Obtener todos los campos personalizados
  static findAll(filters = {}) {
    const customFields = JSON.parse(fs.readFileSync(dataPath));

    // Aplicar filtros si existen
    return customFields.filter((field) => {
      let match = true;

      // Filtrar por entidad
      if (filters.entity && field.entity !== filters.entity) {
        match = false;
      }

      // Filtrar por activo
      if (filters.active !== undefined && field.active !== filters.active) {
        match = false;
      }

      return match;
    });
  }

  // Obtener un campo personalizado por ID
  static findById(id) {
    const customFields = JSON.parse(fs.readFileSync(dataPath));
    return customFields.find((field) => field.id === id);
  }

  // Actualizar un campo personalizado
  static update(id, data) {
    const customFields = JSON.parse(fs.readFileSync(dataPath));
    const index = customFields.findIndex((field) => field.id === id);

    if (index === -1) {
      throw new Error("Campo personalizado no encontrado");
    }

    // Mantener los valores existentes que no se actualizan
    const updatedField = {
      ...customFields[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    customFields[index] = updatedField;
    fs.writeFileSync(dataPath, JSON.stringify(customFields, null, 2));

    return updatedField;
  }

  // Eliminar un campo personalizado
  static delete(id) {
    const customFields = JSON.parse(fs.readFileSync(dataPath));
    const index = customFields.findIndex((field) => field.id === id);

    if (index === -1) {
      throw new Error("Campo personalizado no encontrado");
    }

    customFields.splice(index, 1);
    fs.writeFileSync(dataPath, JSON.stringify(customFields, null, 2));

    return { success: true };
  }

  // Obtener campos para una entidad específica
  static getFieldsForEntity(entity, activeOnly = true) {
    const filters = { entity };
    if (activeOnly) {
      filters.active = true;
    }

    return this.findAll(filters);
  }

  // Validar un valor para un campo específico
  static validateValue(field, value) {
    if (
      field.required &&
      (value === undefined || value === null || value === "")
    ) {
      return {
        valid: false,
        message: `El campo ${field.label} es obligatorio`,
      };
    }

    // Si no es requerido y no tiene valor, es válido
    if (
      !field.required &&
      (value === undefined || value === null || value === "")
    ) {
      return { valid: true };
    }

    // Validaciones específicas por tipo
    switch (field.type) {
      case "number":
        if (isNaN(Number(value))) {
          return {
            valid: false,
            message: `El campo ${field.label} debe ser un número`,
          };
        }

        // Validar mínimo y máximo si están definidos
        if (
          field.validations.min !== undefined &&
          Number(value) < field.validations.min
        ) {
          return {
            valid: false,
            message: `El campo ${field.label} debe ser mayor o igual a ${field.validations.min}`,
          };
        }

        if (
          field.validations.max !== undefined &&
          Number(value) > field.validations.max
        ) {
          return {
            valid: false,
            message: `El campo ${field.label} debe ser menor o igual a ${field.validations.max}`,
          };
        }
        break;

      case "date":
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          return {
            valid: false,
            message: `El campo ${field.label} debe ser una fecha válida`,
          };
        }
        break;

      case "select":
      case "radio":
        if (field.options.length > 0 && !field.options.includes(value)) {
          return {
            valid: false,
            message: `El valor seleccionado para ${field.label} no es válido`,
          };
        }
        break;

      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return {
            valid: false,
            message: `El campo ${field.label} debe ser un email válido`,
          };
        }
        break;

      case "url":
        try {
          new URL(value);
        } catch (e) {
          return {
            valid: false,
            message: `El campo ${field.label} debe ser una URL válida`,
          };
        }
        break;

      case "text":
      default:
        // Validar longitud mínima y máxima si están definidas
        if (
          field.validations.minLength !== undefined &&
          value.length < field.validations.minLength
        ) {
          return {
            valid: false,
            message: `El campo ${field.label} debe tener al menos ${field.validations.minLength} caracteres`,
          };
        }

        if (
          field.validations.maxLength !== undefined &&
          value.length > field.validations.maxLength
        ) {
          return {
            valid: false,
            message: `El campo ${field.label} debe tener como máximo ${field.validations.maxLength} caracteres`,
          };
        }

        // Validar patrón si está definido
        if (
          field.validations.pattern &&
          !new RegExp(field.validations.pattern).test(value)
        ) {
          return {
            valid: false,
            message:
              field.validations.patternMessage ||
              `El campo ${field.label} no tiene un formato válido`,
          };
        }
        break;
    }

    return { valid: true };
  }

  // Formatear un valor según el tipo de campo
  static formatValue(field, value) {
    if (value === undefined || value === null || value === "") {
      return "";
    }

    switch (field.type) {
      case "number":
        return Number(value);
      case "date":
        return new Date(value).toISOString();
      case "boolean":
        return Boolean(value);
      default:
        return String(value);
    }
  }
}

module.exports = CustomField;
