/**
 * Utilidades para gestión de imágenes en el backend
 */
const fs = require('fs');
const path = require('path');

// Configuración de directorios de imágenes
const imageUtils = {
  /**
   * Directorios de imágenes por tipo
   */
  directories: {
    company: 'uploads/companies',
    user: 'uploads/users',
    job: 'uploads/jobs',
    banner: 'uploads/banners',
    product: 'uploads/products',
    category: 'uploads/categories',
    post: 'uploads/posts',
    testimonial: 'uploads/testimonials',
    review: 'uploads/reviews',
    package: 'uploads/packages',
    default: 'uploads'
  },

  /**
   * Imágenes por defecto por tipo
   */
  defaultImages: {
    company: 'uploads/companies/default-company-logo.png',
    user: 'uploads/users/default-avatar.png',
    job: 'uploads/jobs/default-job-image.png',
    banner: 'uploads/banners/default-banner.png',
    product: 'uploads/products/default-product.png',
    category: 'uploads/categories/default-category.png',
    post: 'uploads/posts/default-post.png',
    testimonial: 'uploads/testimonials/default-testimonial.png',
    review: 'uploads/reviews/default-review.png',
    package: 'uploads/packages/default-package.png',
    default: 'uploads/default-image.png'
  },

  /**
   * Tipos de archivos permitidos
   */
  allowedTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml'
  ],

  /**
   * Tamaño máximo de imagen (5MB)
   */
  maxSize: 5 * 1024 * 1024,

  /**
   * Inicializa los directorios de imágenes
   */
  initDirectories() {
    // Crear directorios si no existen
    Object.values(this.directories).forEach(dir => {
      const dirPath = path.join(__dirname, '..', dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`Created directory: ${dirPath}`);
      }
    });
  },

  /**
   * Verifica si una imagen existe
   * @param {string} imagePath - Ruta de la imagen
   * @returns {boolean} - True si la imagen existe
   */
  imageExists(imagePath) {
    if (!imagePath) return false;
    
    const fullPath = path.join(__dirname, '..', imagePath);
    return fs.existsSync(fullPath);
  },

  /**
   * Obtiene la imagen por defecto para un tipo
   * @param {string} type - Tipo de imagen
   * @returns {string} - Ruta de la imagen por defecto
   */
  getDefaultImage(type = 'default') {
    return this.defaultImages[type] || this.defaultImages.default;
  },

  /**
   * Valida una imagen
   * @param {object} file - Archivo a validar
   * @returns {object} - Resultado de la validación
   */
  validateImage(file) {
    if (!file) {
      return { valid: false, error: 'No file provided' };
    }

    // Verificar tipo de archivo
    if (!this.allowedTypes.includes(file.mimetype)) {
      return { 
        valid: false, 
        error: `Invalid file type. Allowed types: ${this.allowedTypes.join(', ')}` 
      };
    }

    // Verificar tamaño
    if (file.size > this.maxSize) {
      return { 
        valid: false, 
        error: `File too large. Maximum size: ${this.maxSize / (1024 * 1024)}MB` 
      };
    }

    return { valid: true };
  },

  /**
   * Genera un nombre de archivo único
   * @param {string} originalName - Nombre original del archivo
   * @returns {string} - Nombre de archivo único
   */
  generateFileName(originalName) {
    const ext = path.extname(originalName);
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 10);
    return `${timestamp}-${randomString}${ext}`;
  },

  /**
   * Obtiene la ruta completa para guardar una imagen
   * @param {string} type - Tipo de imagen
   * @param {string} fileName - Nombre del archivo
   * @returns {string} - Ruta completa
   */
  getImagePath(type, fileName) {
    const directory = this.directories[type] || this.directories.default;
    return path.join(directory, fileName);
  },

  /**
   * Elimina una imagen
   * @param {string} imagePath - Ruta de la imagen a eliminar
   * @returns {boolean} - True si se eliminó correctamente
   */
  deleteImage(imagePath) {
    if (!imagePath) return false;
    
    // No eliminar imágenes por defecto
    if (Object.values(this.defaultImages).includes(imagePath)) {
      return false;
    }
    
    try {
      const fullPath = path.join(__dirname, '..', imagePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        return true;
      }
    } catch (error) {
      console.error('Error deleting image:', error);
    }
    
    return false;
  }
};

module.exports = imageUtils;