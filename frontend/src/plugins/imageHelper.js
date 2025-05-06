// URL base de la API
const apiUrl = process.env.VUE_APP_API_URL || "http://localhost:5000";

export default {
  install(app) {
    // Añadir un método global para obtener URLs de imágenes
    app.config.globalProperties.$getImageUrl = function (
      imagePath,
      type = "default"
    ) {
      if (!imagePath) {
        // Devolver imagen por defecto según el tipo
        switch (type) {
          case "company":
            return require("@/assets/default-company-logo.png");
          case "user":
            return require("@/assets/default-user-avatar.png");
          case "job":
            return require("@/assets/default-job-image.png");
          case "post":
            return require("@/assets/default-featured-image.png");
          default:
            return require("@/assets/default-image.png");
        }
      }

      // Si ya es una URL completa (como un placeholder o URL externa)
      if (imagePath.startsWith("http")) {
        return imagePath;
      }

      // Evitar duplicación de 'uploads' en la ruta
      if (imagePath.startsWith("uploads/")) {
        return `${apiUrl}/${imagePath}`;
      }

      // Construir la URL completa para imágenes de la carpeta upload
      return `${apiUrl}/uploads/${imagePath}`;
    };

    // También puedes añadir directivas personalizadas para imágenes
    app.directive("img-src", {
      mounted(el, binding) {
        const type = binding.arg || "default";
        const value = binding.value;

        // Configurar src con manejo de errores
        el.src = app.config.globalProperties.$getImageUrl(value, type);

        // Manejar errores de carga de imágenes
        el.onerror = function () {
          let defaultImage;
          switch (type) {
            case "company":
              defaultImage = require("@/assets/default-company-logo.png");
              break;
            case "user":
              defaultImage = require("@/assets/default-user-avatar.png");
              break;
            case "job":
              defaultImage = require("@/assets/default-job-image.png");
              break;
            default:
              defaultImage = require("@/assets/default-image.png");
          }
          el.src = defaultImage;
        };
      },
      updated(el, binding) {
        const type = binding.arg || "default";
        const value = binding.value;

        if (value !== binding.oldValue) {
          el.src = app.config.globalProperties.$getImageUrl(value, type);
        }
      },
    });
  },
};
