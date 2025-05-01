const Testimonial = require("../models/Testimonial");

// Obtener todos los testimonios
exports.getAllTestimonials = async (req, res) => {
  try {
    const filters = {
      approved: req.query.approved === "true",
      featured: req.query.featured === "true",
      userId: req.query.userId,
      userRole: req.query.userRole,
    };

    // Si no es admin, solo mostrar testimonios aprobados
    if (!req.user || req.user.role !== "admin") {
      filters.approved = true;
    }

    const testimonials = Testimonial.findAll(filters);
    res.status(200).json(testimonials);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener testimonios", error: error.message });
  }
};

// Obtener un testimonio por ID
exports.getTestimonialById = async (req, res) => {
  try {
    const testimonial = Testimonial.findById(req.params.id);

    if (!testimonial) {
      return res.status(404).json({ message: "Testimonio no encontrado" });
    }

    // Si no es admin y el testimonio no está aprobado, no mostrarlo
    if ((!req.user || req.user.role !== "admin") && !testimonial.approved) {
      return res
        .status(403)
        .json({ message: "No tienes permiso para ver este testimonio" });
    }

    res.status(200).json(testimonial);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener testimonio", error: error.message });
  }
};

// Obtener testimonios destacados
exports.getFeaturedTestimonials = async (req, res) => {
  try {
    const testimonials = Testimonial.getFeatured();
    res.status(200).json(testimonials);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error al obtener testimonios destacados",
        error: error.message,
      });
  }
};

// Crear un nuevo testimonio
exports.createTestimonial = async (req, res) => {
  try {
    // Validar datos de entrada
    const { content, rating } = req.body;

    if (!content) {
      return res.status(400).json({ message: "El contenido es obligatorio" });
    }

    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return res
        .status(400)
        .json({ message: "La calificación debe estar entre 1 y 5" });
    }

    // Añadir datos del usuario
    const testimonialData = {
      ...req.body,
      userId: req.user.id,
      userName: `${req.user.firstName} ${req.user.lastName}`,
      userAvatar: req.user.avatar,
      userRole: req.user.role,
      // Por defecto, los testimonios no están aprobados hasta que un admin los revise
      approved: req.user.role === "admin" ? true : false,
    };

    const newTestimonial = Testimonial.create(testimonialData);

    res.status(201).json(newTestimonial);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al crear testimonio", error: error.message });
  }
};

// Actualizar un testimonio
exports.updateTestimonial = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que el testimonio existe
    const existingTestimonial = Testimonial.findById(id);
    if (!existingTestimonial) {
      return res.status(404).json({ message: "Testimonio no encontrado" });
    }

    // Verificar permiso (solo el propietario o admin puede actualizar)
    if (
      existingTestimonial.userId !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "No tienes permiso para actualizar este testimonio" });
    }

    // Si no es admin, no permitir cambiar el estado de aprobación o destacado
    let updateData = { ...req.body };
    if (req.user.role !== "admin") {
      delete updateData.approved;
      delete updateData.featured;
      // Cuando un usuario actualiza, el testimonio vuelve a necesitar aprobación
      updateData.approved = false;
    }

    const updatedTestimonial = Testimonial.update(id, updateData);

    res.status(200).json(updatedTestimonial);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error al actualizar testimonio",
        error: error.message,
      });
  }
};

// Eliminar un testimonio
exports.deleteTestimonial = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que el testimonio existe
    const existingTestimonial = Testimonial.findById(id);
    if (!existingTestimonial) {
      return res.status(404).json({ message: "Testimonio no encontrado" });
    }

    // Verificar permiso (solo el propietario o admin puede eliminar)
    if (
      existingTestimonial.userId !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "No tienes permiso para eliminar este testimonio" });
    }

    Testimonial.delete(id);

    res.status(200).json({ message: "Testimonio eliminado correctamente" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al eliminar testimonio", error: error.message });
  }
};

// Aprobar un testimonio (solo admin)
exports.approveTestimonial = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que el testimonio existe
    const existingTestimonial = Testimonial.findById(id);
    if (!existingTestimonial) {
      return res.status(404).json({ message: "Testimonio no encontrado" });
    }

    // Solo admin puede aprobar
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "No tienes permiso para aprobar testimonios" });
    }

    const updatedTestimonial = Testimonial.approve(id);

    res.status(200).json(updatedTestimonial);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al aprobar testimonio", error: error.message });
  }
};

// Destacar un testimonio (solo admin)
exports.featureTestimonial = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que el testimonio existe
    const existingTestimonial = Testimonial.findById(id);
    if (!existingTestimonial) {
      return res.status(404).json({ message: "Testimonio no encontrado" });
    }

    // Solo admin puede destacar
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "No tienes permiso para destacar testimonios" });
    }

    const updatedTestimonial = Testimonial.feature(id);

    res.status(200).json(updatedTestimonial);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al destacar testimonio", error: error.message });
  }
};

// Quitar destacado de un testimonio (solo admin)
exports.unfeatureTestimonial = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que el testimonio existe
    const existingTestimonial = Testimonial.findById(id);
    if (!existingTestimonial) {
      return res.status(404).json({ message: "Testimonio no encontrado" });
    }

    // Solo admin puede quitar destacado
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({
          message: "No tienes permiso para quitar destacado de testimonios",
        });
    }

    const updatedTestimonial = Testimonial.unfeature(id);

    res.status(200).json(updatedTestimonial);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error al quitar destacado de testimonio",
        error: error.message,
      });
  }
};
