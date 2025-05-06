### Como instalar SLUGIFY

Necesitas instalar slugify en el backend, ya que es donde estás procesando y creando los slugs para tus posts y categorías. El frontend no necesita esta dependencia porque simplemente mostrará los slugs que ya han sido generados por el backend.

Para instalar slugify en tu backend, sigue estos pasos:

Abre una terminal y navega al directorio de tu backend:

# Ponerse en el directorio del backend

cd MEVN/backend

# Instala slugify usando npm:

npm install slugify

# Instala slugify usando yarn:

yarn add slugify

---

Una vez instalado, puedes importarlo en tus archivos de modelos (como Post.js y Category.js) de la siguiente manera:

# Ejemplo de uso

const slugify = require('slugify');

Ahora puedes usar slugify para generar slugs a partir de títulos o nombres:

# Ejemplo de uso

const slug = slugify(title, { lower: true, strict: true });

# La opción lower: true

Convierte el slug a minúsculas, y strict: true elimina caracteres especiales que no son URL-friendly.

# NOTA

Después de instalar slugify, asegúrate de que tus modelos lo estén utilizando correctamente para generar slugs a partir de los títulos de los posts o nombres de las categorías.
