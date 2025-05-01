// src/utils/imageUtils.js
const apiBaseUrl = process.env.VUE_APP_API_URL || "http://localhost:5000";

export const imageUtils = {
  /**
   * Obtiene la URL completa de una imagen
   * @param {string} path - Ruta relativa de la imagen
   * @param {string} type - Tipo de imagen (company, user, job, etc.)
   * @returns {string} URL completa de la imagen o imagen por defecto
   */
  getImageUrl(path, type = "default") {
    // Si no hay ruta, devolver imagen por defecto según el tipo
    if (!path) {
      return this.getDefaultImage(type);
    }

    // Si la ruta ya es una URL completa, devolverla
    if (path.startsWith("http") || path.startsWith("https")) {
      return path;
    }

    // Si la ruta comienza con /uploads o es relativa
    if (path.startsWith("/uploads")) {
      return `${apiBaseUrl}${path}`;
    }
    return `${apiBaseUrl}/uploads/${path}`;
  },

  /**
   * Obtiene la imagen por defecto según el tipo
   * @param {string} type - Tipo de imagen
   * @returns {string} URL de la imagen por defecto
   */
  getDefaultImage(type) {
    const defaults = {
      company: `${apiBaseUrl}/uploads/companies/default-company-logo.png`,
      user: `${apiBaseUrl}/uploads/users/default-avatar.png`,
      job: `${apiBaseUrl}/uploads/jobs/default-job-image.png`,
      banner: `${apiBaseUrl}/uploads/banners/default-banner.png`,
      product: `${apiBaseUrl}/uploads/products/default-product.png`,
      category: `${apiBaseUrl}/uploads/categories/default-category.png`,
      blog: `${apiBaseUrl}/uploads/blog/default-post.png`,
      event: `${apiBaseUrl}/uploads/events/default-event.png`,
      default: `${apiBaseUrl}/uploads/default-image.png`,
    };

    return defaults[type] || defaults.default;
  },

  /**
   * Maneja errores de carga de imágenes
   * @param {Event} event - Evento de error
   * @param {string} type - Tipo de imagen para mostrar como respaldo
   */
  handleImageError(event, type = "default") {
    event.target.src = this.getDefaultImage(type);
    event.target.classList.add("image-error");
  },
  /**
   * Valida si una ruta de imagen es válida
   * @param {string} path - Ruta de la imagen a validar
   * @returns {boolean} - True si la ruta es válida
   */
  isValidImagePath(path) {
    if (!path) return false;
    const validExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
    return validExtensions.some((ext) => path.toLowerCase().endsWith(ext));
  },

  /**
   * Valida si un archivo es una imagen válida
   * @param {File} file - Archivo a validar
   * @returns {boolean} - True si el archivo es una imagen válida
   */
  isValidImageFile(file) {
    if (!file) return false;
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    return validTypes.includes(file.type);
  },
};

export default imageUtils;
