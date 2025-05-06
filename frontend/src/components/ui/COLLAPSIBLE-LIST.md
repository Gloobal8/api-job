### Uso en tu Aplicación

Ahora puedes usar esta funcionalidad de tres formas diferentes:

# Opción 1: Usando el componente

<template>
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
</script>

# Opción 2: Usando la directiva

<template>
  <div>
    <h2 class="text-h6 mb-3">Requirements</h2>
    <div v-collapsible-list="{ maxItems: 5, collapsedHeight: 200 }" v-html="job.requirements"></div>
  </div>
</template>

# Opción 3: Usando solo clases CSS (requiere un poco de JavaScript)

<template>
  <div>
    <h2 class="text-h6 mb-3">Requirements</h2>
    <div class="collapsible-list collapsed" ref="requirementsList">
      <div v-html="job.requirements"></div>
      <div class="fade-overlay"></div>
      <button class="toggle-btn" @click="toggleList">
        <i class="mdi" :class="isListCollapsed ? 'mdi-chevron-down' : 'mdi-chevron-up'"></i>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  // ...resto del código
  data() {
    return {
      isListCollapsed: true
    }
  },
  methods: {
    toggleList() {
      this.isListCollapsed = !this.isListCollapsed;
      const list = this.$refs.requirementsList;
      if (this.isListCollapsed) {
        list.classList.add('collapsed');
      } else {
        list.classList.remove('collapsed');
      }
    }
  }
}
</script>
