const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const imageUtils = require("./utils/imageUtils");

// Load environment variables
dotenv.config();

// Ensure data directory exists
const fs = require("fs");
if (!fs.existsSync(path.join(__dirname, "data"))) {
  fs.mkdirSync(path.join(__dirname, "data"));
}
// Inicializar directorios de imágenes
const uploadsDir = path.join(__dirname, "uploads");
const avatarsDir = path.join(uploadsDir, "avatars");
const companiesDir = path.join(uploadsDir, "companies");
const jobsDir = path.join(uploadsDir, "jobs");

[uploadsDir, avatarsDir, companiesDir, jobsDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// JSON file storage configuration
const dataPath = path.join(__dirname, "data");
const userDataPath = path.join(dataPath, "users.json");

// Import routes
const authRoutes = require("./routes/auth");
const addressRoutes = require("./routes/address");
const userRoutes = require("./routes/users");
const jobRoutes = require("./routes/jobs");
const companiesRoutes = require("./routes/companies");
const applicationRoutes = require("./routes/applications");
const categoryRoutes = require("./routes/categories");
const transactionRoutes = require("./routes/transactions");
const customFieldRoutes = require("./routes/customFields");
const testimonialRoutes = require("./routes/testimonials");
const reviewRoutes = require("./routes/reviews");
const blogRoutes = require("./routes/blog");

// Import new payment and package routes
const packageRoutes = require("./routes/packages");
const paymentRoutes = require("./routes/payments");
const invoiceRoutes = require("./routes/invoices");
const couponRoutes = require("./routes/coupons");

// Importar middleware y rutas de localización
const languageMiddleware = require("./middleware/languageMiddleware");
const localizationRoutes = require("./routes/localization");
const cookieParser = require("cookie-parser");

// Create Express app
const app = express();
// Middleware
// Configuración CORS más específica
app.use(
  cors({
    origin: ["http://localhost:8080", "http://localhost:5000", "http://127.0.0.1:5500"], // Orígenes permitidos
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // Permite cookies en solicitudes cross-origin
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Usar cookie-parser para leer cookies
app.use(cookieParser());

// Usar middleware de idioma
app.use(languageMiddleware);

// Image handling system
// - /uploads/avatars: User profile pictures
// - /uploads/companies: Company logos and images
// - /uploads/jobs: Job-related images
// Images are processed and optimized before storage
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"), {
    maxAge: "1d",
    fallthrough: false,
    etag: true,
    lastModified: true,
  })
);
// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/auth", addressRoutes);
app.use("/api/users", userRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/companies", companiesRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/credits", transactionRoutes);
app.use("/api/custom-fields", customFieldRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/blog", blogRoutes);

// New package and payment routes
app.use("/api/packages", packageRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/coupons", couponRoutes);

// Usar rutas de localización
app.use("/api/localization", localizationRoutes);

// Default image route
app.get("/default-image/:type", (req, res) => {
  const defaultImages = {
    avatar: "default-avatar.png",
    company: "default-company.png",
    job: "default-job.png",
  };
  const imagePath = path.join(
    __dirname,
    "uploads",
    "defaults",
    defaultImages[req.params.type] || defaultImages.avatar
  );
  res.sendFile(imagePath);
});

// Base route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Job Board API" });
});

/*router.get("/test", (req, res) => {
  res.json({ message: "API is working!" });
});*/

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found",
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
