Configurar una solución global para manejar imágenes desde la carpeta upload del backend. Esto simplificará mucho tu código y evitará tener que repetir la lógica en cada componente. Vamos a implementarlo paso a paso:

1. Configurar el backend para servir archivos estáticos
   En tu archivo server.js o app.js del backend, agrega esta configuración:

// En server.js o app.js del backend
const express = require('express');
const path = require('path');
const app = express();

// Configurar la carpeta upload para ser accesible públicamente
app.use('/uploads', express.static(path.join(\_\_dirname, 'upload')));
Copy Codejavascript 2. Crear un plugin global en Vue para manejar imágenes
Crea un nuevo archivo en src/plugins/imageHelper.js en tu proyecto frontend:

// src/plugins/imageHelper.js

// URL base de la API
const apiUrl = process.env.VUE_APP_API_URL || 'http://localhost:3000';

export default {
install(app) {
// Añadir un método global para obtener URLs de imágenes
app.config.globalProperties.$getImageUrl = function(imagePath, type = 'default') {
if (!imagePath) {
// Devolver imagen por defecto según el tipo
switch (type) {
case 'company':
return require('@/assets/default-company-logo.png');
case 'user':
return require('@/assets/default-user-avatar.png');
case 'job':
return require('@/assets/default-job-image.png');
default:
return require('@/assets/default-image.png');
}
}

      // Si ya es una URL completa (como un placeholder o URL externa)
      if (imagePath.startsWith('http')) {
        return imagePath;
      }

      // Construir la URL completa para imágenes de la carpeta upload
      return `${apiUrl}/uploads/${imagePath}`;
    };

    // También puedes añadir directivas personalizadas para imágenes
    app.directive('img-src', {
      mounted(el, binding) {
        const type = binding.arg || 'default';
        const value = binding.value;

        // Configurar src con manejo de errores
        el.src = app.config.globalProperties.$getImageUrl(value, type);

        // Manejar errores de carga de imágenes
        el.onerror = function() {
          let defaultImage;
          switch (type) {
            case 'company':
              defaultImage = require('@/assets/default-company-logo.png');
              break;
            case 'user':
              defaultImage = require('@/assets/default-user-avatar.png');
              break;
            case 'job':
              defaultImage = require('@/assets/default-job-image.png');
              break;
            default:
              defaultImage = require('@/assets/default-image.png');
          }
          el.src = defaultImage;
        };
      },
      updated(el, binding) {
        const type = binding.arg || 'default';
        const value = binding.value;

        if (value !== binding.oldValue) {
          el.src = app.config.globalProperties.$getImageUrl(value, type);
        }
      }
    });

}
};
Copy Codejavascript 3. Registrar el plugin en tu aplicación Vue
Modifica tu archivo main.js para incluir este plugin:

// src/main.js
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import vuetify from './plugins/vuetify';
import imageHelper from './plugins/imageHelper';

const app = createApp(App);

app.use(router)
.use(store)
.use(vuetify)
.use(imageHelper)
.mount('#app');
Copy Codejavascript 4. Crear imágenes por defecto
Crea estas imágenes por defecto en tu carpeta src/assets:

default-company-logo.png
default-user-avatar.png
default-job-image.png
default-image.png (genérica) 5. Usar el helper en tus componentes
Ahora puedes usar el helper en tus componentes de tres formas diferentes:

Opción 1: Usar el método global
<v-img
:src="$getImageUrl(job.company?.logo, 'company')"
:alt="job.company?.name"

> </v-img>
> Copy Codehtml
> Opción 2: Usar la directiva personalizada
> <img v-img-src:company="job.company?.logo" :alt="job.company?.name">
> Copy Codehtml
> Opción 3: Usar el método en un componente específico
> methods: {
>   getCompanyLogo(logo) {

    return this.$getImageUrl(logo, 'company');

}
}
Copy Codejavascript
<v-img
:src="getCompanyLogo(job.company?.logo)"
:alt="job.company?.name"

> </v-img>
> Copy Codehtml
> Ejemplo de uso en JobDetailView.vue
> Simplificando tu componente JobDetailView.vue con este enfoque:

<!-- En lugar de -->

<v-img
:src="getImageUrl(job.company?.logo)"
:alt="job.company?.name"

> </v-img>

<!-- Usar esto -->

<v-img
:src="$getImageUrl(job.company?.logo, 'company')"
:alt="job.company?.name"

> </v-img>

<!-- O esto con la directiva -->
<img v-img-src:company="job.company?.logo" :alt="job.company?.name" class="v-img">
Copy Codehtml
Ventajas de este enfoque:
Centralización: Toda la lógica de manejo de imágenes está en un solo lugar
Consistencia: El mismo comportamiento en toda la aplicación
Mantenibilidad: Si cambias la estructura de carpetas o la URL base, solo necesitas actualizar un archivo
Manejo de errores: Automáticamente muestra imágenes por defecto si hay errores de carga
Tipado: Puedes tener diferentes imágenes por defecto según el tipo (usuario, empresa, trabajo, etc.)
Con esta configuración, solo necesitas preocuparte por proporcionar la ruta relativa de la imagen dentro de la carpeta upload en tus datos, y el sistema se encargará automáticamente de construir la URL completa y manejar los casos de error.
