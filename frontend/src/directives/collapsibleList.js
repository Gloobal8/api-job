export default {
  mounted(el, binding) {
    // Valores predeterminados o valores del binding
    const maxItems = binding.value?.maxItems || 5;
    const collapsedHeight = binding.value?.collapsedHeight || 200;

    // Verificar si es una lista y tiene suficientes elementos
    const list = el.tagName === "UL" ? el : el.querySelector("ul");
    if (!list) return;

    const items = list.querySelectorAll("li");
    if (items.length <= maxItems) return;

    // Añadir clase para estilizar
    el.classList.add("collapsible-list-container");

    // Crear el contenedor y wrapper
    const wrapper = document.createElement("div");
    wrapper.className = "collapsible-list-wrapper collapsed";
    el.parentNode.insertBefore(wrapper, el);
    wrapper.appendChild(el);

    // Crear el overlay de degradado
    const overlay = document.createElement("div");
    overlay.className = "collapsible-fade-overlay";
    wrapper.appendChild(overlay);

    // Crear el botón de toggle
    const toggleBtnContainer = document.createElement("div");
    toggleBtnContainer.className = "text-center mt-2";

    const toggleBtn = document.createElement("button");
    toggleBtn.className =
      "v-btn v-btn--icon v-btn--text v-btn--size-small v-theme--light v-btn--density-default toggle-list-btn";
    toggleBtn.innerHTML =
      '<span class="v-btn__content"><i class="v-icon mdi mdi-chevron-down"></i></span>';

    const toggleText = document.createElement("div");
    toggleText.className = "text-caption text-primary";
    toggleText.textContent = "Show more";

    toggleBtnContainer.appendChild(toggleBtn);
    toggleBtnContainer.appendChild(toggleText);
    wrapper.appendChild(toggleBtnContainer);

    // Función para alternar colapso
    let isCollapsed = true;
    toggleBtn.addEventListener("click", () => {
      isCollapsed = !isCollapsed;

      if (isCollapsed) {
        wrapper.classList.add("collapsed");
        toggleBtn.innerHTML =
          '<span class="v-btn__content"><i class="v-icon mdi mdi-chevron-down"></i></span>';
        toggleText.textContent = "Show more";
      } else {
        wrapper.classList.remove("collapsed");
        toggleBtn.innerHTML =
          '<span class="v-btn__content"><i class="v-icon mdi mdi-chevron-up"></i></span>';
        toggleText.textContent = "Show less";
      }
    });

    // Aplicar estilos iniciales
    const style = document.createElement("style");
    style.textContent = `
      .collapsible-list-wrapper {
        position: relative;
      }
      
      .collapsible-list-wrapper.collapsed ul {
        max-height: ${collapsedHeight}px;
        overflow: hidden;
      }
      
      .collapsible-list-wrapper ul {
        transition: max-height 0.5s ease;
      }
      
      .collapsible-fade-overlay {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 80px;
        background: linear-gradient(to bottom, rgba(255, 255, 255, 0), rgba(255, 255, 255, 1));
        pointer-events: none;
        z-index: 1;
        display: none;
      }
      
      .collapsible-list-wrapper.collapsed .collapsible-fade-overlay {
        display: block;
      }
      
      .toggle-list-btn {
        margin-top: -20px;
        z-index: 2;
        background-color: white !important;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
        border-radius: 50% !important;
      }
    `;

    document.head.appendChild(style);
  },
};
