Basado en la exploración de directorios, aquí tienes un sitemap anidado detallado de tu proyecto MEVN:

# Sitemap del Proyecto MEVN

## 1. Backend

### 1.1. Configuración

- `.env` - Variables de entorno
- `config/` - Configuraciones de la aplicación
- `nodemon.json` - Configuración para desarrollo
- `package.json` - Dependencias y scripts
- `server.js` - Punto de entrada principal

### 1.2. Controladores

- `applicationController.js` - Gestión de solicitudes de trabajo
- `authController.js` - Autenticación y autorización
- `categoryController.js` - Categorías de trabajos
- `companyController.js` - Gestión de empresas
- `couponController.js` - Gestión de cupones
- `customFieldController.js` - Campos personalizados
- `invoiceController.js` - Facturas
- `jobController.js` - Ofertas de trabajo
- `localizationController.js` - Internacionalización
- `packageController.js` - Paquetes y planes
- `paymentController.js` - Procesamiento de pagos
- `postController.js` - Publicaciones del blog
- `reviewController.js` - Reseñas
- `testimonialController.js` - Testimonios
- `transactionController.js` - Transacciones
- `userController.js` - Gestión de usuarios

### 1.3. Modelos

- `careerLevel.js` - Niveles de carrera
- `Category.js` - Categorías
- `Comment.js` - Comentarios
- `company.js` - Empresas
- `Coupon.js` - Cupones
- `CustomField.js` - Campos personalizados
- `Education.js` - Educación
- `Experience.js` - Experiencia
- `Invoice.js` - Facturas
- `Job.js` - Trabajos
- `JobApplication.js` - Solicitudes de trabajo
- `jobCategory.js` - Categorías de trabajo
- `jobExperience.js` - Experiencia laboral
- `jobSkill.js` - Habilidades laborales
- `jobType.js` - Tipos de trabajo
- `Language.js` - Idiomas
- `location.js` - Ubicaciones
- `Package.js` - Paquetes
- `Payment.js` - Pagos
- `Post.js` - Publicaciones
- `Review.js` - Reseñas
- `tag.js` - Etiquetas
- `Testimonial.js` - Testimonios
- `Transaction.js` - Transacciones
- `user.js` - Usuarios
- `index.js` - Exportación de modelos

### 1.4. Rutas

- `applications.js` - Rutas de solicitudes
- `auth.js` - Rutas de autenticación
- `blog.js` - Rutas del blog
- `categories.js` - Rutas de categorías
- `companies.js` - Rutas de empresas
- `coupons.js` - Rutas de cupones
- `customFields.js` - Rutas de campos personalizados
- `invoices.js` - Rutas de facturas
- `jobs.js` - Rutas de trabajos
- `localization.js` - Rutas de internacionalización
- `packages.js` - Rutas de paquetes
- `payments.js` - Rutas de pagos
- `reviews.js` - Rutas de reseñas
- `testimonials.js` - Rutas de testimonios
- `transactions.js` - Rutas de transacciones
- `users.js` - Rutas de usuarios

### 1.5. Middleware

- `middleware/` - Funciones middleware

### 1.6. Utilidades

- `utils/` - Funciones auxiliares

### 1.7. Datos y Archivos

- `data/` - Datos estáticos
- `uploads/` - Archivos subidos

## 2. Frontend

### 2.1. Configuración

- `package.json` - Dependencias y scripts
- `vue.config.js` - Configuración de Vue
- `public/` - Archivos estáticos públicos

### 2.2. Código Fuente (src)

- `App.vue` - Componente raíz
- `main.js` - Punto de entrada principal
- `i18n.js` - Configuración de internacionalización

#### 2.2.1. Vistas

- `HomeView.vue` - Página de inicio
- `LoginView.vue` - Inicio de sesión
- `RegisterView.vue` - Registro
- `DashboardView.vue` - Panel de control
- `ProfileView.vue` - Perfil de usuario
- `ProfileEducationView.vue` - Educación del perfil
- `ProfileExperienceView.vue` - Experiencia del perfil
- `CompanyDetailView.vue` - Detalle de empresa
- `CompanyProfileView.vue` - Perfil de empresa
- `CompanyAnalyticsView.vue` - Análisis de empresa
- `CompaniesView.vue` - Lista de empresas
- `CheckoutView.vue` - Proceso de pago
- `PaymentSuccessView.vue` - Éxito de pago
- `InvoiceDetailView.vue` - Detalle de factura
- `TransactionsView.vue` - Transacciones
- `CustomFieldsView.vue` - Campos personalizados
- `LanguagesView.vue` - Idiomas
- `TestimonialsView.vue` - Testimonios

##### 2.2.1.1. Vistas Anidadas

- `admin/` - Vistas de administración
- `blog/` - Vistas del blog
- `companies/` - Vistas relacionadas con empresas
- `jobs/` - Vistas relacionadas con trabajos

#### 2.2.2. Componentes

- `blog/` - Componentes del blog
- `charts/` - Gráficos y visualizaciones
- `common/` - Componentes comunes
- `companies/` - Componentes de empresas
- `CustomFields/` - Componentes de campos personalizados
- `jobs/` - Componentes de trabajos
- `localization/` - Componentes de internacionalización
- `reviews/` - Componentes de reseñas
- `testimonials/` - Componentes de testimonios

#### 2.2.3. Enrutamiento

- `router/index.js` - Configuración de rutas

#### 2.2.4. Estado (Store)

- `store/index.js` - Configuración de Vuex

##### 2.2.4.1. Módulos de Store

- `blog.js` - Estado del blog
- `customFields.js` - Estado de campos personalizados
- `localization.js` - Estado de internacionalización
- `reviews.js` - Estado de reseñas
- `testimonials.js` - Estado de testimonios

#### 2.2.5. Otros

- `assets/` - Recursos estáticos
- `directives/` - Directivas personalizadas
- `i18n/` - Archivos de traducción
- `plugins/` - Plugins de Vue
- `utils/` - Funciones auxiliares

---

Este sitemap proporciona una visión general completa de la estructura de tu proyecto MEVN, mostrando la organización tanto del backend como del frontend. La estructura muestra un patrón claro de arquitectura MVC (Modelo-Vista-Controlador) en el backend y una organización modular en el frontend basada en componentes Vue.js.

El proyecto parece ser una aplicación de búsqueda de empleo con funcionalidades para empresas, candidatos, blog, testimonios, pagos y más. La estructura está bien organizada y sigue las mejores prácticas para un proyecto MEVN (MongoDB, Express, Vue.js, Node.js).
