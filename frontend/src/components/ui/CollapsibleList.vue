<template>
  <div class="collapsible-list-wrapper" ref="wrapper">
    <slot></slot>
    <div
      v-if="isCollapsed && hasEnoughItems"
      class="collapsible-fade-overlay"
    ></div>
    <div v-if="hasEnoughItems" class="text-center mt-2">
      <v-btn
        icon
        variant="text"
        color="primary"
        size="small"
        @click="toggleCollapse"
        class="toggle-list-btn"
      >
        <v-icon
          :icon="isCollapsed ? 'mdi-chevron-down' : 'mdi-chevron-up'"
        ></v-icon>
      </v-btn>
      <div class="text-caption text-primary">
        {{ isCollapsed ? "Show more" : "Show less" }}
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from "vue";

export default {
  name: "CollapsibleList",
  props: {
    maxItems: {
      type: Number,
      default: 5,
    },
    collapsedHeight: {
      type: Number,
      default: 200,
    },
  },
  setup(props) {
    const isCollapsed = ref(true);
    const hasEnoughItems = ref(false);
    const wrapper = ref(null);

    const toggleCollapse = () => {
      isCollapsed.value = !isCollapsed.value;
    };

    const checkListItems = () => {
      if (wrapper.value) {
        const list = wrapper.value.querySelector("ul");
        if (list) {
          const items = list.querySelectorAll("li");
          hasEnoughItems.value = items.length > props.maxItems;
        }
      }
    };

    onMounted(() => {
      checkListItems();
    });

    // Observar cambios en el DOM para recalcular si es necesario
    const observer = new MutationObserver(checkListItems);

    onMounted(() => {
      if (wrapper.value) {
        observer.observe(wrapper.value, {
          childList: true,
          subtree: true,
        });
      }
      checkListItems();
    });

    return {
      isCollapsed,
      hasEnoughItems,
      toggleCollapse,
      wrapper,
    };
  },
};
</script>
