const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

// Ruta al archivo JSON que almacenará los testimonios
const dataPath = path.join(__dirname, "../data/testimonials.json");

// Asegurarse de que el archivo existe
if (!fs.existsSync(dataPath)) {
  // Asegurarse de que el directorio data existe
  const dataDir = path.join(__dirname, "../data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  fs.writeFileSync(dataPath, JSON.stringify([]));
}

class Testimonial {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.userId = data.userId;
    this.userName = data.userName;
    this.userAvatar = data.userAvatar || null;
    this.userRole = data.userRole || "user"; // user, employer, candidate
    this.content = data.content;
    this.rating = data.rating || 5; // 1-5
    this.position = data.position || null; // Puesto de trabajo del usuario
    this.company = data.company || null; // Empresa del usuario
    this.approved = data.approved !== undefined ? data.approved : false;
    this.featured = data.featured !== undefined ? data.featured : false;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  // Obtener todos los testimonios
  static findAll(filters = {}) {
    const testimonials = JSON.parse(fs.readFileSync(dataPath));

    // Aplicar filtros si existen
    return testimonials.filter((testimonial) => {
      let match = true;

      // Filtrar por aprobado
      if (
        filters.approved !== undefined &&
        testimonial.approved !== filters.approved
      ) {
        match = false;
      }

      // Filtrar por destacado
      if (
        filters.featured !== undefined &&
        testimonial.featured !== filters.featured
      ) {
        match = false;
      }

      // Filtrar por usuario
      if (filters.userId && testimonial.userId !== filters.userId) {
        match = false;
      }

      // Filtrar por rol de usuario
      if (filters.userRole && testimonial.userRole !== filters.userRole) {
        match = false;
      }

      return match;
    });
  }

  // Obtener un testimonio por ID
  static findById(id) {
    const testimonials = JSON.parse(fs.readFileSync(dataPath));
    return testimonials.find((testimonial) => testimonial.id === id);
  }

  // Obtener testimonios destacados
  static getFeatured() {
    const testimonials = JSON.parse(fs.readFileSync(dataPath));
    return testimonials.filter(
      (testimonial) => testimonial.approved && testimonial.featured
    );
  }

  // Crear un nuevo testimonio
  static create(data) {
    const testimonials = JSON.parse(fs.readFileSync(dataPath));
    const newTestimonial = new Testimonial(data);
    testimonials.push(newTestimonial);
    fs.writeFileSync(dataPath, JSON.stringify(testimonials, null, 2));
    return newTestimonial;
  }

  // Actualizar un testimonio
  static update(id, data) {
    const testimonials = JSON.parse(fs.readFileSync(dataPath));
    const index = testimonials.findIndex(
      (testimonial) => testimonial.id === id
    );

    if (index === -1) {
      throw new Error("Testimonio no encontrado");
    }

    const updatedTestimonial = {
      ...testimonials[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    testimonials[index] = updatedTestimonial;
    fs.writeFileSync(dataPath, JSON.stringify(testimonials, null, 2));

    return updatedTestimonial;
  }

  // Eliminar un testimonio
  static delete(id) {
    const testimonials = JSON.parse(fs.readFileSync(dataPath));
    const index = testimonials.findIndex(
      (testimonial) => testimonial.id === id
    );

    if (index === -1) {
      throw new Error("Testimonio no encontrado");
    }

    testimonials.splice(index, 1);
    fs.writeFileSync(dataPath, JSON.stringify(testimonials, null, 2));

    return { success: true };
  }

  // Aprobar un testimonio
  static approve(id) {
    return this.update(id, { approved: true });
  }

  // Destacar un testimonio
  static feature(id) {
    return this.update(id, { featured: true });
  }

  // Quitar destacado de un testimonio
  static unfeature(id) {
    return this.update(id, { featured: false });
  }
}

module.exports = Testimonial;
