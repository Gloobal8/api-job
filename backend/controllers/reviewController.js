const Review = require("../models/Review");

// Obtener todas las reseñas
exports.getAllReviews = async (req, res) => {
  try {
    const filters = {
      entityType: req.query.entityType,
      entityId: req.query.entityId,
      userId: req.query.userId,
      approved: req.query.approved === "true",
      minRating: req.query.minRating
        ? parseInt(req.query.minRating)
        : undefined,
      maxRating: req.query.maxRating
        ? parseInt(req.query.maxRating)
        : undefined,
    };

    // Si no es admin, solo mostrar reseñas aprobadas
    if (!req.user || req.user.role !== "admin") {
      filters.approved = true;
    }

    const reviews = Review.findAll(filters);
    res.status(200).json(reviews);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener reseñas", error: error.message });
  }
};

// Obtener una reseña por ID
exports.getReviewById = async (req, res) => {
  try {
    const review = Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Reseña no encontrada" });
    }

    // Si no es admin y la reseña no está aprobada, no mostrarla
    if ((!req.user || req.user.role !== "admin") && !review.approved) {
      return res
        .status(403)
        .json({ message: "No tienes permiso para ver esta reseña" });
    }

    res.status(200).json(review);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener reseña", error: error.message });
  }
};

// Obtener reseñas por entidad
exports.getReviewsByEntity = async (req, res) => {
  try {
    const { entityType, entityId } = req.params;

    if (!entityType || !entityId) {
      return res
        .status(400)
        .json({ message: "El tipo de entidad y el ID son obligatorios" });
    }

    const reviews = Review.getByEntity(entityType, entityId);
    res.status(200).json(reviews);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error al obtener reseñas por entidad",
        error: error.message,
      });
  }
};

// Crear una nueva reseña
exports.createReview = async (req, res) => {
  try {
    // Validar datos de entrada
    const { entityType, entityId, title, content, rating } = req.body;

    if (
      !entityType ||
      !entityId ||
      !title ||
      !content ||
      rating === undefined
    ) {
      return res.status(400).json({ message: "Faltan campos requeridos" });
    }

    if (rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "La calificación debe estar entre 1 y 5" });
    }

    // Añadir datos del usuario
    const reviewData = {
      ...req.body,
      userId: req.user.id,
      userName: req.body.isAnonymous
        ? "Usuario anónimo"
        : `${req.user.firstName} ${req.user.lastName}`,
      userAvatar: req.body.isAnonymous ? null : req.user.avatar,
      // Por defecto, las reseñas no están aprobadas hasta que un admin las revise
      approved: req.user.role === "admin" ? true : false,
    };

    const newReview = Review.create(reviewData);

    res.status(201).json(newReview);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al crear reseña", error: error.message });
  }
};

// Actualizar una reseña
exports.updateReview = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que la reseña existe
    const existingReview = Review.findById(id);
    if (!existingReview) {
      return res.status(404).json({ message: "Reseña no encontrada" });
    }

    // Verificar permiso (solo el propietario o admin puede actualizar)
    if (existingReview.userId !== req.user.id && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "No tienes permiso para actualizar esta reseña" });
    }

    // Si no es admin, no permitir cambiar el estado de aprobación
    let updateData = { ...req.body };
    if (req.user.role !== "admin") {
      delete updateData.approved;
      delete updateData.helpfulCount;
      delete updateData.reportCount;
      delete updateData.reports;
      // Cuando un usuario actualiza, la reseña vuelve a necesitar aprobación
      updateData.approved = false;
    }

    const updatedReview = Review.update(id, updateData);

    res.status(200).json(updatedReview);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al actualizar reseña", error: error.message });
  }
};

// Eliminar una reseña
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que la reseña existe
    const existingReview = Review.findById(id);
    if (!existingReview) {
      return res.status(404).json({ message: "Reseña no encontrada" });
    }

    // Verificar permiso (solo el propietario o admin puede eliminar)
    if (existingReview.userId !== req.user.id && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "No tienes permiso para eliminar esta reseña" });
    }

    Review.delete(id);

    res.status(200).json({ message: "Reseña eliminada correctamente" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al eliminar reseña", error: error.message });
  }
};

// Aprobar una reseña (solo admin)
exports.approveReview = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que la reseña existe
    const existingReview = Review.findById(id);
    if (!existingReview) {
      return res.status(404).json({ message: "Reseña no encontrada" });
    }

    // Solo admin puede aprobar
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "No tienes permiso para aprobar reseñas" });
    }

    const updatedReview = Review.approve(id);

    res.status(200).json(updatedReview);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al aprobar reseña", error: error.message });
  }
};

// Marcar una reseña como útil
exports.markAsHelpful = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que la reseña existe
    const existingReview = Review.findById(id);
    if (!existingReview) {
      return res.status(404).json({ message: "Reseña no encontrada" });
    }

    const updatedReview = Review.markAsHelpful(id, req.user.id);

    res.status(200).json(updatedReview);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error al marcar reseña como útil",
        error: error.message,
      });
  }
};

// Reportar una reseña
exports.reportReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res
        .status(400)
        .json({ message: "El motivo del reporte es obligatorio" });
    }

    // Verificar que la reseña existe
    const existingReview = Review.findById(id);
    if (!existingReview) {
      return res.status(404).json({ message: "Reseña no encontrada" });
    }

    try {
      const updatedReview = Review.report(id, req.user.id, reason);
      res.status(200).json(updatedReview);
    } catch (error) {
      // Si el usuario ya ha reportado esta reseña
      if (error.message === "Ya has reportado esta reseña") {
        return res.status(400).json({ message: error.message });
      }
      throw error;
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al reportar reseña", error: error.message });
  }
};

// Obtener calificación promedio para una entidad
exports.getAverageRating = async (req, res) => {
  try {
    const { entityType, entityId } = req.params;

    if (!entityType || !entityId) {
      return res
        .status(400)
        .json({ message: "El tipo de entidad y el ID son obligatorios" });
    }

    const averageRating = Review.getAverageRating(entityType, entityId);
    res.status(200).json({ averageRating });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error al obtener calificación promedio",
        error: error.message,
      });
  }
};

// Obtener distribución de calificaciones para una entidad
exports.getRatingDistribution = async (req, res) => {
  try {
    const { entityType, entityId } = req.params;

    if (!entityType || !entityId) {
      return res
        .status(400)
        .json({ message: "El tipo de entidad y el ID son obligatorios" });
    }

    const distribution = Review.getRatingDistribution(entityType, entityId);
    res.status(200).json(distribution);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error al obtener distribución de calificaciones",
        error: error.message,
      });
  }
};
