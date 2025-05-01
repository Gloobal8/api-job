import { createApp } from "vue";
import App from "./App.vue";
import { imageDirectives } from "./directives/image-directives";
import AppImage from "./components/common/AppImage.vue";
import router from "./router";
import store from "./store";
import vuetify from "./plugins/vuetify";
import i18n from "./i18n";
import moment from "moment";
import axios from "axios";

// Crear la aplicación
const app = createApp(App);

// Sistema de gestión de imágenes
// Incluye directivas personalizadas y componente reutilizable para optimización y lazy loading
Object.keys(imageDirectives).forEach((key) => {
  app.directive(key, imageDirectives[key]);
});

// Registrar componente global de imágenes
app.component("AppImage", AppImage);

// Funciones de formato de fecha
app.config.globalProperties.$filters = {
  formatDate: (value) => (value ? moment(value).format("DD/MM/YYYY") : ""),
  formatTime: (value) => (value ? moment(value).format("HH:mm") : ""),
  formatDateTime: (value) =>
    value ? moment(value).format("DD/MM/YYYY HH:mm") : "",
  fromNow: (value) => (value ? moment(value).fromNow() : ""),
};

// Set base URL for axios
axios.defaults.baseURL =
  process.env.VUE_APP_API_URL || "http://localhost:5000/api";

// Add token to requests if available
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Configuración global para el manejo de imágenes
app.config.globalProperties.$imageConfig = {
  defaultPlaceholder: "/assets/placeholder.png",
  cdnUrl: process.env.VUE_APP_CDN_URL || "",
  quality: 80,
};

// Exponer axios globalmente (opcional)
app.config.globalProperties.$axios = axios;

// Montar la aplicación después de configurar todo
app.use(router).use(store).use(vuetify).use(i18n).mount("#app");
