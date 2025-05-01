const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

// Ruta al archivo JSON que almacenará los idiomas
const dataPath = path.join(__dirname, "../data/languages.json");

// Asegurarse de que el archivo existe
if (!fs.existsSync(dataPath)) {
  // Asegurarse de que el directorio data existe
  const dataDir = path.join(__dirname, "../data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  fs.writeFileSync(
    dataPath,
    JSON.stringify([
      {
        id: "es",
        name: "Español",
        nativeName: "Español",
        active: true,
        isDefault: true,
        dateFormat: "DD/MM/YYYY",
        timeFormat: "HH:mm",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "en",
        name: "English",
        nativeName: "English",
        active: true,
        isDefault: false,
        dateFormat: "MM/DD/YYYY",
        timeFormat: "hh:mm a",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ])
  );
}

class Language {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.name = data.name;
    this.nativeName = data.nativeName || data.name;
    this.active = data.active !== undefined ? data.active : true;
    this.isDefault = data.isDefault || false;
    this.dateFormat = data.dateFormat || "DD/MM/YYYY";
    this.timeFormat = data.timeFormat || "HH:mm";
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  // Obtener todos los idiomas
  static findAll(includeInactive = false) {
    const languages = JSON.parse(fs.readFileSync(dataPath));

    if (!includeInactive) {
      return languages.filter((lang) => lang.active);
    }

    return languages;
  }

  // Obtener un idioma por ID
  static findById(id) {
    const languages = JSON.parse(fs.readFileSync(dataPath));
    return languages.find((lang) => lang.id === id);
  }

  // Obtener el idioma predeterminado
  static getDefaultLanguage() {
    const languages = JSON.parse(fs.readFileSync(dataPath));
    return languages.find((lang) => lang.isDefault) || languages[0];
  }

  // Crear un nuevo idioma
  static create(data) {
    const languages = JSON.parse(fs.readFileSync(dataPath));

    // Si se marca como predeterminado, quitar la marca de otros idiomas
    if (data.isDefault) {
      languages.forEach((lang) => {
        lang.isDefault = false;
      });
    }

    const newLanguage = new Language(data);
    languages.push(newLanguage);

    fs.writeFileSync(dataPath, JSON.stringify(languages, null, 2));
    return newLanguage;
  }

  // Actualizar un idioma
  static update(id, data) {
    const languages = JSON.parse(fs.readFileSync(dataPath));
    const index = languages.findIndex((lang) => lang.id === id);

    if (index === -1) {
      throw new Error("Idioma no encontrado");
    }

    // Si se marca como predeterminado, quitar la marca de otros idiomas
    if (data.isDefault) {
      languages.forEach((lang) => {
        lang.isDefault = false;
      });
    }

    const updatedLanguage = {
      ...languages[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    languages[index] = updatedLanguage;
    fs.writeFileSync(dataPath, JSON.stringify(languages, null, 2));

    return updatedLanguage;
  }

  // Eliminar un idioma
  static delete(id) {
    const languages = JSON.parse(fs.readFileSync(dataPath));
    const index = languages.findIndex((lang) => lang.id === id);

    if (index === -1) {
      throw new Error("Idioma no encontrado");
    }

    // No permitir eliminar el idioma predeterminado
    if (languages[index].isDefault) {
      throw new Error("No se puede eliminar el idioma predeterminado");
    }

    languages.splice(index, 1);
    fs.writeFileSync(dataPath, JSON.stringify(languages, null, 2));

    return { success: true };
  }
}

module.exports = Language;
