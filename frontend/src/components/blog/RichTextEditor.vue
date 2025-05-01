<template>
  <div class="rich-text-editor">
    <editor
      :api-key="apiKey"
      :init="init"
      v-model="content"
      @input="updateContent"
    />
  </div>
</template>

<script>
import Editor from "@tinymce/tinymce-vue";

export default {
  name: "RichTextEditor",
  components: {
    Editor,
  },
  props: {
    value: {
      type: String,
      default: "",
    },
    apiKey: {
      type: String,
      required: true,
    },
    init: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      content: this.value,
    };
  },
  watch: {
    value(newValue) {
      if (newValue !== this.content) {
        this.content = newValue;
      }
    },
  },
  methods: {
    updateContent(value) {
      this.$emit("input", value);
    },
  },
};
</script>

<style scoped>
.rich-text-editor {
  margin-bottom: 16px;
}
</style>
