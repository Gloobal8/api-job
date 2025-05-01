const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

// Ruta al archivo JSON que almacenará las reseñas
const dataPath = path.join(__dirname, "../data/reviews.json");

// Asegurarse de que el archivo existe
if (!fs.existsSync(dataPath)) {
  // Asegurarse de que el directorio data existe
  const dataDir = path.join(__dirname, "../data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  fs.writeFileSync(dataPath, JSON.stringify([]));
}

class Review {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.userId = data.userId;
    this.userName = data.userName;
    this.userAvatar = data.userAvatar || null;
    this.entityType = data.entityType; // 'company' o 'job'
    this.entityId = data.entityId;
    this.title = data.title;
    this.content = data.content;
    this.rating = data.rating; // 1-5
    this.pros = data.pros || [];
    this.cons = data.cons || [];
    this.isAnonymous =
      data.isAnonymous !== undefined ? data.isAnonymous : false;
    this.approved = data.approved !== undefined ? data.approved : false;
    this.helpfulCount = data.helpfulCount || 0;
    this.reportCount = data.reportCount || 0;
    this.reports = data.reports || [];
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  // Obtener todas las reseñas
  static findAll(filters = {}) {
    const reviews = JSON.parse(fs.readFileSync(dataPath));

    // Aplicar filtros si existen
    return reviews.filter((review) => {
      let match = true;

      // Filtrar por tipo de entidad
      if (filters.entityType && review.entityType !== filters.entityType) {
        match = false;
      }

      // Filtrar por ID de entidad
      if (filters.entityId && review.entityId !== filters.entityId) {
        match = false;
      }

      // Filtrar por usuario
      if (filters.userId && review.userId !== filters.userId) {
        match = false;
      }

      // Filtrar por aprobado
      if (
        filters.approved !== undefined &&
        review.approved !== filters.approved
      ) {
        match = false;
      }

      // Filtrar por rango de calificación
      if (
        filters.minRating !== undefined &&
        review.rating < filters.minRating
      ) {
        match = false;
      }

      if (
        filters.maxRating !== undefined &&
        review.rating > filters.maxRating
      ) {
        match = false;
      }

      return match;
    });
  }

  // Obtener una reseña por ID
  static findById(id) {
    const reviews = JSON.parse(fs.readFileSync(dataPath));
    return reviews.find((review) => review.id === id);
  }

  // Obtener reseñas por entidad
  static getByEntity(entityType, entityId) {
    const reviews = JSON.parse(fs.readFileSync(dataPath));
    return reviews.filter(
      (review) =>
        review.entityType === entityType &&
        review.entityId === entityId &&
        review.approved
    );
  }

  // Crear una nueva reseña
  static create(data) {
    const reviews = JSON.parse(fs.readFileSync(dataPath));

    // Verificar si el usuario ya ha dejado una reseña para esta entidad
    const existingReview = reviews.find(
      (review) =>
        review.userId === data.userId &&
        review.entityType === data.entityType &&
        review.entityId === data.entityId
    );

    if (existingReview) {
      throw new Error("Ya has dejado una reseña para esta entidad");
    }

    const newReview = new Review(data);
    reviews.push(newReview);
    fs.writeFileSync(dataPath, JSON.stringify(reviews, null, 2));

    return newReview;
  }

  // Actualizar una reseña
  static update(id, data) {
    const reviews = JSON.parse(fs.readFileSync(dataPath));
    const index = reviews.findIndex((review) => review.id === id);

    if (index === -1) {
      throw new Error("Reseña no encontrada");
    }

    const updatedReview = {
      ...reviews[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    reviews[index] = updatedReview;
    fs.writeFileSync(dataPath, JSON.stringify(reviews, null, 2));

    return updatedReview;
  }

  // Eliminar una reseña
  static delete(id) {
    const reviews = JSON.parse(fs.readFileSync(dataPath));
    const index = reviews.findIndex((review) => review.id === id);

    if (index === -1) {
      throw new Error("Reseña no encontrada");
    }

    reviews.splice(index, 1);
    fs.writeFileSync(dataPath, JSON.stringify(reviews, null, 2));

    return { success: true };
  }

  // Aprobar una reseña
  static approve(id) {
    return this.update(id, { approved: true });
  }

  // Marcar una reseña como útil
  static markAsHelpful(id, userId) {
    const review = this.findById(id);
    if (!review) {
      throw new Error("Reseña no encontrada");
    }

    // Incrementar contador de útil
    return this.update(id, { helpfulCount: review.helpfulCount + 1 });
  }

  // Reportar una reseña
  static report(id, userId, reason) {
    const review = this.findById(id);
    if (!review) {
      throw new Error("Reseña no encontrada");
    }

    // Verificar si el usuario ya ha reportado esta reseña
    const alreadyReported = review.reports.some(
      (report) => report.userId === userId
    );
    if (alreadyReported) {
      throw new Error("Ya has reportado esta reseña");
    }

    // Añadir reporte
    const reports = [
      ...review.reports,
      { userId, reason, date: new Date().toISOString() },
    ];

    return this.update(id, {
      reports,
      reportCount: review.reportCount + 1,
    });
  }

  // Calcular calificación promedio para una entidad
  static getAverageRating(entityType, entityId) {
    const reviews = this.getByEntity(entityType, entityId);

    if (reviews.length === 0) {
      return 0;
    }

    const sum = reviews.reduce((total, review) => total + review.rating, 0);
    return sum / reviews.length;
  }

  // Obtener distribución de calificaciones para una entidad
  static getRatingDistribution(entityType, entityId) {
    const reviews = this.getByEntity(entityType, entityId);

    const distribution = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    reviews.forEach((review) => {
      distribution[review.rating]++;
    });

    return distribution;
  }
}

module.exports = Review;
