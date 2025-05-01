const Language = require("../models/Language");
const fs = require("fs");
const path = require("path");

// Ruta base para los archivos de traducción
const translationsPath = path.join(__dirname, "../data/translations");

// Asegurarse de que el directorio de traducciones existe
if (!fs.existsSync(translationsPath)) {
  fs.mkdirSync(translationsPath, { recursive: true });
}

// Obtener todos los idiomas
exports.getAllLanguages = async (req, res) => {
  try {
    const includeInactive = req.query.includeInactive === "true";
    const languages = Language.findAll(includeInactive);
    res.status(200).json(languages);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener idiomas", error: error.message });
  }
};

// Obtener un idioma por ID
exports.getLanguageById = async (req, res) => {
  try {
    const language = Language.findById(req.params.id);

    if (!language) {
      return res.status(404).json({ message: "Idioma no encontrado" });
    }

    res.status(200).json(language);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener idioma", error: error.message });
  }
};

// Obtener el idioma predeterminado
exports.getDefaultLanguage = async (req, res) => {
  try {
    const language = Language.getDefaultLanguage();
    res.status(200).json(language);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error al obtener idioma predeterminado",
        error: error.message,
      });
  }
};

// Crear un nuevo idioma
exports.createLanguage = async (req, res) => {
  try {
    const { id, name, nativeName, dateFormat, timeFormat } = req.body;

    if (!id || !name) {
      return res
        .status(400)
        .json({ message: "El ID y nombre del idioma son obligatorios" });
    }

    // Verificar que el ID no existe
    const existingLanguage = Language.findById(id);
    if (existingLanguage) {
      return res
        .status(400)
        .json({ message: "Ya existe un idioma con ese ID" });
    }

    const newLanguage = Language.create(req.body);

    // Crear archivo de traducciones vacío
    const translationFile = path.join(translationsPath, `${id}.json`);
    if (!fs.existsSync(translationFile)) {
      fs.writeFileSync(translationFile, JSON.stringify({}, null, 2));
    }

    res.status(201).json(newLanguage);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al crear idioma", error: error.message });
  }
};

// Actualizar un idioma
exports.updateLanguage = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que el idioma existe
    const existingLanguage = Language.findById(id);
    if (!existingLanguage) {
      return res.status(404).json({ message: "Idioma no encontrado" });
    }

    const updatedLanguage = Language.update(id, req.body);

    res.status(200).json(updatedLanguage);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al actualizar idioma", error: error.message });
  }
};

// Eliminar un idioma
exports.deleteLanguage = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que el idioma existe
    const existingLanguage = Language.findById(id);
    if (!existingLanguage) {
      return res.status(404).json({ message: "Idioma no encontrado" });
    }

    // Eliminar el idioma
    Language.delete(id);

    // Opcional: eliminar archivo de traducciones
    const translationFile = path.join(translationsPath, `${id}.json`);
    if (fs.existsSync(translationFile)) {
      fs.unlinkSync(translationFile);
    }

    res.status(200).json({ message: "Idioma eliminado correctamente" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al eliminar idioma", error: error.message });
  }
};

// Obtener traducciones para un idioma
exports.getTranslations = async (req, res) => {
  try {
    const { lang } = req.params;

    // Verificar que el idioma existe
    const language = Language.findById(lang);
    if (!language) {
      return res.status(404).json({ message: "Idioma no encontrado" });
    }

    // Obtener traducciones
    const translationFile = path.join(translationsPath, `${lang}.json`);

    let translations = {};
    if (fs.existsSync(translationFile)) {
      const data = fs.readFileSync(translationFile, "utf8");
      translations = JSON.parse(data);
    }

    res.status(200).json(translations);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener traducciones", error: error.message });
  }
};

// Actualizar traducciones para un idioma
exports.updateTranslations = async (req, res) => {
  try {
    const { lang } = req.params;
    const translations = req.body;

    // Verificar que el idioma existe
    const language = Language.findById(lang);
    if (!language) {
      return res.status(404).json({ message: "Idioma no encontrado" });
    }

    // Guardar traducciones
    const translationFile = path.join(translationsPath, `${lang}.json`);
    fs.writeFileSync(translationFile, JSON.stringify(translations, null, 2));

    res
      .status(200)
      .json({ message: "Traducciones actualizadas correctamente" });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error al actualizar traducciones",
        error: error.message,
      });
  }
};
