const CustomField = require("../models/CustomField");

// Obtener todos los campos personalizados
exports.getAllCustomFields = async (req, res) => {
  try {
    const customFields = CustomField.findAll();
    res.status(200).json(customFields);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error al obtener campos personalizados",
        error: error.message,
      });
  }
};

// Obtener un campo personalizado por ID
exports.getCustomFieldById = async (req, res) => {
  try {
    const customField = CustomField.findById(req.params.id);

    if (!customField) {
      return res
        .status(404)
        .json({ message: "Campo personalizado no encontrado" });
    }

    res.status(200).json(customField);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error al obtener campo personalizado",
        error: error.message,
      });
  }
};

// Obtener campos personalizados por entidad
exports.getCustomFieldsByEntity = async (req, res) => {
  try {
    const { entity } = req.params;
    const customFields = CustomField.getFieldsForEntity(entity);

    res.status(200).json(customFields);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error al obtener campos personalizados",
        error: error.message,
      });
  }
};

// Crear un nuevo campo personalizado
exports.createCustomField = async (req, res) => {
  try {
    // Validar datos de entrada
    const { name, label, type, entity, required } = req.body;

    if (!name || !label || !type || !entity) {
      return res
        .status(400)
        .json({
          message: "Faltan campos requeridos: name, label, type, entity",
        });
    }

    // Validar que el tipo sea válido
    const validTypes = [
      "text",
      "number",
      "date",
      "select",
      "checkbox",
      "radio",
      "email",
      "url",
      "textarea",
    ];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ message: "Tipo de campo no válido" });
    }

    // Validar opciones para tipos select, checkbox, radio
    if (
      ["select", "checkbox", "radio"].includes(type) &&
      (!req.body.options ||
        !Array.isArray(req.body.options) ||
        req.body.options.length === 0)
    ) {
      return res
        .status(400)
        .json({
          message:
            "Se requieren opciones para campos de tipo select, checkbox o radio",
        });
    }

    const newCustomField = CustomField.create(req.body);

    res.status(201).json(newCustomField);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error al crear campo personalizado",
        error: error.message,
      });
  }
};

// Actualizar un campo personalizado
exports.updateCustomField = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que el campo existe
    const existingField = CustomField.findById(id);
    if (!existingField) {
      return res
        .status(404)
        .json({ message: "Campo personalizado no encontrado" });
    }

    // Validar tipo si se está actualizando
    if (req.body.type) {
      const validTypes = [
        "text",
        "number",
        "date",
        "select",
        "checkbox",
        "radio",
        "email",
        "url",
        "textarea",
      ];
      if (!validTypes.includes(req.body.type)) {
        return res.status(400).json({ message: "Tipo de campo no válido" });
      }

      // Validar opciones para tipos select, checkbox, radio
      if (
        ["select", "checkbox", "radio"].includes(req.body.type) &&
        (!req.body.options ||
          !Array.isArray(req.body.options) ||
          req.body.options.length === 0)
      ) {
        return res
          .status(400)
          .json({
            message:
              "Se requieren opciones para campos de tipo select, checkbox o radio",
          });
      }
    }

    const updatedField = CustomField.update(id, req.body);

    res.status(200).json(updatedField);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error al actualizar campo personalizado",
        error: error.message,
      });
  }
};

// Eliminar un campo personalizado
exports.deleteCustomField = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que el campo existe
    const existingField = CustomField.findById(id);
    if (!existingField) {
      return res
        .status(404)
        .json({ message: "Campo personalizado no encontrado" });
    }

    CustomField.delete(id);

    res
      .status(200)
      .json({ message: "Campo personalizado eliminado correctamente" });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error al eliminar campo personalizado",
        error: error.message,
      });
  }
};

// Validar valores de campos personalizados
exports.validateCustomFieldValues = (fields, values) => {
  const errors = [];

  fields.forEach((field) => {
    const value = values[field.name];
    const validation = CustomField.validateValue(field, value);

    if (!validation.valid) {
      errors.push(validation.message);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
};
