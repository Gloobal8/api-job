<template>
  <div class="app-image-container" :class="cssClass">
    <img
      v-if="!isError"
      :src="computedSrc"
      :alt="alt"
      @load="handleLoad"
      @error="handleError"
    />
    <div v-if="isLoading" class="loading-overlay">
      <slot name="loading">
        <span class="loading-spinner"></span>
      </slot>
    </div>
    <div v-if="isError" class="error-overlay">
      <slot name="error">
        <span class="error-message">{{ errorMessage }}</span>
      </slot>
    </div>
  </div>
</template>

<script>
import { imageUtils } from "@/utils/imageUtils";

export default {
  name: "AppImage",
  data() {
    return {
      isLoading: true,
      isError: false,
      errorMessage: ''
    };
  },
  props: {
    src: {
      type: String,
      default: "",
    },
    alt: {
      type: String,
      default: "Image",
    },
    type: {
      type: String,
      default: "default",
    },
    cssClass: {
      type: String,
      default: "",
    },
    customErrorMessage: {
      type: String,
      default: ""
    },
    showLoadingSpinner: {
      type: Boolean,
      default: true
    },
    loadingTimeout: {
      type: Number,
      default: 30000
    },
    },
  computed: {
    computedSrc() {
      return imageUtils.getImageUrl(this.src, this.type);
    },
  },
  methods: {
    handleLoad() {
      this.isLoading = false;
      this.isError = false;
      this.$emit('load');
    },
    handleError(event) {
      this.isLoading = false;
      this.isError = true;
      this.errorMessage = this.customErrorMessage || 'Failed to load image';
      imageUtils.handleImageError(event, this.type);
      this.$emit('error', event);
    },
  },
};
</script>

<style scoped>
.app-image-container {
  position: relative;
  display: inline-block;
}

.loading-overlay,
.error-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.8);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.error-message {
  color: #e74c3c;
  text-align: center;
  padding: 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
