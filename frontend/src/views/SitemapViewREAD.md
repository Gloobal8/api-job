// Nodo para el componente CollapsibleList.vue
const collapsibleListComponent = {
id: "collapsible-list-component",
name: "ui/CollapsibleList.vue",
type: "frontend",
fileType: "vue",
description: "Componente reutilizable que permite colapsar y expandir listas HTML (<ul><li>) con un efecto de degradado y un botón para mostrar/ocultar.",
purpose: "Mejorar la experiencia de usuario al mostrar listas largas de manera más compacta, permitiendo al usuario expandirlas cuando sea necesario.",
functions: [
{
name: "toggleCollapse",
description: "Alterna entre el estado colapsado y expandido de la lista"
},
{
name: "checkListItems",
description: "Verifica si la lista tiene suficientes elementos para justificar el colapso"
}
],
relatedFiles: [
{
id: "collapsible-list-directive",
name: "collapsibleList.js (directiva)",
type: "frontend",
fileType: "js"
},
{
id: "job-detail-view",
name: "jobs/JobDetailView.vue",
type: "frontend",
fileType: "vue"
},
{
id: "main-js",
name: "main.js",
type: "frontend",
fileType: "js"
}
],
codeExamples: [
{
title: "Uso básico del componente",
code: `<template>

  <div>
    <h2 class="text-h6 mb-3">Requirements</h2>
    <CollapsibleList>
      <div v-html="job.requirements"></div>
    </CollapsibleList>
  </div>
</template>

<script>
import CollapsibleList from '@/components/ui/CollapsibleList.vue';

export default {
  components: {
    CollapsibleList
  }
  // ...resto del código
}
</script>`

    }

]
};

// Nodo para la directiva collapsibleList.js
const collapsibleListDirective = {
id: "collapsible-list-directive",
name: "collapsibleList.js",
type: "frontend",
fileType: "js",
description: "Directiva personalizada de Vue que añade funcionalidad de colapso a cualquier elemento que contenga listas (<ul><li>). Permite truncar listas largas con un efecto de degradado y un botón para expandir/colapsar.",
purpose: "Proporcionar una forma sencilla de aplicar la funcionalidad de colapso a cualquier lista en la aplicación sin necesidad de importar componentes adicionales.",
functions: [
{
name: "mounted",
description: "Configura la funcionalidad de colapso cuando el elemento se monta en el DOM"
},
{
name: "toggleCollapse",
description: "Función que alterna entre el estado colapsado y expandido"
}
],
relatedFiles: [
{
id: "collapsible-list-component",
name: "ui/CollapsibleList.vue",
type: "frontend",
fileType: "vue"
},
{
id: "main-js",
name: "main.js",
type: "frontend",
fileType: "js"
},
{
id: "job-detail-view",
name: "jobs/JobDetailView.vue",
type: "frontend",
fileType: "vue"
}
],
codeExamples: [
{
title: "Uso de la directiva",
code: `<template>

  <div>
    <h2 class="text-h6 mb-3">Requirements</h2>
    <div v-collapsible-list="{ maxItems: 5, collapsedHeight: 200 }" v-html="job.requirements"></div>
  </div>
</template>`
    },
    {
      title: "Registro de la directiva en main.js",
      code: `// src/main.js
import { createApp } from 'vue';
import App from './App.vue';
import collapsibleList from './directives/collapsibleList';

const app = createApp(App);
app.directive('collapsible-list', collapsibleList);
// ... resto de tu código
app.mount('#app');`
}
]
};
