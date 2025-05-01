<template>
  <div class="tree-item">
    <div
      class="tree-item-header"
      @click="handleClick"
      :class="{ 'is-folder': item.type === 'folder' }"
    >
      <v-icon
        v-if="item.type === 'folder'"
        size="small"
        class="mr-2"
        :color="getIconColor(item.type)"
      >
        {{ isOpen ? "mdi-folder-open" : "mdi-folder" }}
      </v-icon>
      <v-icon v-else size="small" class="mr-2" :color="getIconColor(item.type)">
        {{ getIconForFile(item.type) }}
      </v-icon>
      <span>{{ item.name }}</span>
    </div>
    <div
      v-if="isOpen && item.children && item.children.length"
      class="tree-item-children"
    >
      <file-tree-item
        v-for="child in item.children"
        :key="child.id"
        :item="child"
        @node-click="$emit('node-click', $event)"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: "FileTreeItem",
  props: {
    item: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      isOpen: true,
    };
  },
  methods: {
    toggle() {
      this.isOpen = !this.isOpen;
    },
    handleClick() {
      if (this.item.type !== "folder") {
        this.$emit("node-click", this.item.id);
      } else {
        this.toggle();
      }
    },
    getIconForFile(type) {
      const icons = {
        folder: "mdi-folder",
        js: "mdi-language-javascript",
        vue: "mdi-vuejs",
        json: "mdi-code-json",
        config: "mdi-cog",
        backend: "mdi-server",
        frontend: "mdi-monitor",
      };
      return icons[type] || "mdi-file-document-outline";
    },
    getIconColor(type) {
      const colors = {
        folder: "amber",
        js: "green",
        vue: "green",
        json: "blue",
        config: "purple",
        backend: "indigo",
        frontend: "teal",
      };
      return colors[type] || "grey";
    },
  },
};
</script>

<style scoped>
.tree-item {
  margin-bottom: 4px;
}

.tree-item-header {
  display: flex;
  align-items: center;
  padding: 6px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.tree-item-header:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.tree-item-header.is-folder {
  font-weight: 500;
}

.tree-item-children {
  padding-left: 24px;
  margin-top: 4px;
}
</style>
