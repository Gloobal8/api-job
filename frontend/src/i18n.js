import { createI18n } from "vue-i18n";
import axios from "axios";
import moment from "moment";

// Importar traducciones locales
import esMessages from "./i18n/es";
import enMessages from "./i18n/en";

// Mensajes predeterminados (combinación de locales y los que se cargarán desde el servidor)
const messages = {
  es: esMessages,
  en: enMessages,
};

// Crear instancia de i18n
const i18n = createI18n({
  legacy: false, // Usar la API de composición para Vue 3
  locale: "es", // idioma por defecto
  fallbackLocale: "es",
  messages,
  missingWarn: false, // Desactivar advertencias de claves faltantes
  fallbackWarn: false, // Desactivar advertencias de fallback
});

// Función para cargar traducciones desde el servidor
export const loadLanguage = async (lang) => {
  try {
    // Asegurarse de que usamos un idioma válido
    const validLang = ["es", "en"].includes(lang) ? lang : "es";

    // Cargar traducciones desde el servidor
    let translations = {};
    try {
      const response = await axios.get(
        `http://localhost:5000/api/localization/translations/${validLang}`
      );
      translations = response.data || {};
    } catch (error) {
      console.warn(
        `No se pudieron cargar las traducciones desde el servidor para ${validLang}:`,
        error
      );
      // Si hay error, usamos las traducciones locales
    }

    // Cargar información del idioma
    let language = { id: validLang };
    try {
      const response = await axios.get(
        `http://localhost:5000/api/localization/languages/${validLang}`
      );
      language = response.data || { id: validLang };
    } catch (error) {
      console.warn(
        `No se pudo cargar la información del idioma ${validLang}:`,
        error
      );
    }

    // Configurar moment.js para este idioma
    moment.locale(validLang);

    // Obtener las traducciones locales para el idioma
    const localMessages = validLang === "es" ? esMessages : enMessages;

    // Combinar traducciones locales con las del servidor (las locales tienen prioridad)
    const mergedTranslations = {
      ...translations, // Traducciones del servidor (base)
      ...localMessages, // Traducciones locales (tienen prioridad)
    };

    // Verificar si existe la clave common.appName
    if (!mergedTranslations.common || !mergedTranslations.common.appName) {
      console.warn(
        `La clave 'common.appName' no está definida para el idioma ${validLang}`
      );

      // Asegurarse de que existe la estructura y la clave
      if (!mergedTranslations.common) {
        mergedTranslations.common = {};
      }

      // Usar un valor predeterminado si no existe
      mergedTranslations.common.appName =
        validLang === "es" ? "Portal de Empleo" : "Job Portal";
    }

    // Guardar traducciones en i18n
    i18n.global.setLocaleMessage(validLang, mergedTranslations);

    // Cambiar el idioma actual
    i18n.global.locale.value = validLang;

    // Guardar el idioma en localStorage para futuras sesiones
    localStorage.setItem("userLanguage", validLang);

    // Enviar el idioma al servidor a través de una cookie
    document.cookie = `lang=${validLang}; path=/; max-age=${
      60 * 60 * 24 * 365
    }`;

    return mergedTranslations;
  } catch (error) {
    console.error("Error loading language:", error);

    // En caso de error, usar las traducciones locales
    const fallbackLang = "es";
    const localMessages = fallbackLang === "es" ? esMessages : enMessages;

    // Asegurarse de que existe la estructura y la clave common.appName
    if (!localMessages.common || !localMessages.common.appName) {
      if (!localMessages.common) {
        localMessages.common = {};
      }
      localMessages.common.appName =
        fallbackLang === "es" ? "Portal de Empleo" : "Job Portal";
    }

    i18n.global.setLocaleMessage(fallbackLang, localMessages);
    i18n.global.locale.value = fallbackLang;

    return localMessages;
  }
};

// Filtros globales para fechas (en Vue 3 se usan como funciones)
export const formatDate = (value, format) => {
  if (!value) return "";
  return moment(value).format(format || "DD/MM/YYYY");
};

export const formatTime = (value, format) => {
  if (!value) return "";
  return moment(value).format(format || "HH:mm");
};

export const formatDateTime = (value, format) => {
  if (!value) return "";
  return moment(value).format(format || "DD/MM/YYYY HH:mm");
};

export const fromNow = (value) => {
  if (!value) return "";
  return moment(value).fromNow();
};

// Cargar el idioma guardado o el predeterminado
const savedLanguage = localStorage.getItem("userLanguage") || "es";
loadLanguage(savedLanguage);

export default i18n;
