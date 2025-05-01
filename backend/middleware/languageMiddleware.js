const Language = require("../models/Language");

// Middleware para detectar y establecer el idioma
const languageMiddleware = (req, res, next) => {
  // Intentar obtener el idioma de la cabecera Accept-Language
  const acceptLanguage = req.headers["accept-language"];

  // Intentar obtener el idioma de la query
  const queryLang = req.query.lang;

  // Intentar obtener el idioma de la cookie
  const cookieLang = req.cookies && req.cookies.lang;

  // Prioridad: query > cookie > header
  let lang =
    queryLang ||
    cookieLang ||
    (acceptLanguage
      ? acceptLanguage.split(",")[0].split(";")[0].substring(0, 2)
      : null);

  // Verificar si el idioma existe y está activo
  const languages = Language.findAll();
  const languageExists = languages.find((l) => l.id === lang);

  // Si el idioma no existe o no está activo, usar el predeterminado
  if (!languageExists || !languageExists.active) {
    lang = Language.getDefaultLanguage().id;
  }

  // Establecer el idioma en la solicitud para uso posterior
  req.lang = lang;

  // Establecer una cookie con el idioma (dura 1 año)
  res.cookie("lang", lang, {
    maxAge: 365 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  });

  next();
};

module.exports = languageMiddleware;
