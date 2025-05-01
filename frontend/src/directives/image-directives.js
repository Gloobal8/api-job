import { imageUtils } from "@/utils/imageUtils";

export const imageDirectives = {
  imgLazy: {
    mounted(el, binding) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target;
              img.src = img.dataset.src;
              observer.unobserve(img);
            }
          });
        },
        { rootMargin: "50px" }
      );

      el.dataset.src = el.getAttribute("src");
      el.removeAttribute("src");
      observer.observe(el);
    },
  },
  /**
   * Directiva para manejar imágenes con fallback
   * Uso: v-img-fallback:company
   */
  imgFallback: {
    mounted(el, binding) {
      const type = binding.arg || "default";

      // Guardar la src original
      const originalSrc = el.getAttribute("src");

      // Establecer src procesada
      el.setAttribute("src", imageUtils.getImageUrl(originalSrc, type));

      // Manejar errores
      el.addEventListener("error", (event) => {
        imageUtils.handleImageError(event, type);
      });
    },
  },

  /**
   * Directiva para carga perezosa de imágenes
   * Uso: v-img-lazy
   */
  imgLazy: {
    mounted(el, binding) {
      const type = binding.arg || "default";
      let retryCount = 0;
      const MAX_RETRIES = 3;

      // Guardar la src original
      const originalSrc = el.getAttribute("src");
      el.dataset.originalSrc = originalSrc;

      // Establecer src procesada
      el.setAttribute("src", imageUtils.getImageUrl(originalSrc, type));

      // Manejar eventos de carga
      el.addEventListener("load", (event) => {
        el.dispatchEvent(
          new CustomEvent("image-loaded", { detail: { src: el.src } })
        );
      });

      // Manejar errores
      el.addEventListener("error", (event) => {
        imageUtils.handleImageError(event, type);
        el.dispatchEvent(
          new CustomEvent("image-error", { detail: { src: el.src } })
        );
      });
    },
  },
};

export default imageDirectives;
