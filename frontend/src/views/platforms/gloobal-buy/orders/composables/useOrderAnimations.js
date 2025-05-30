import { ref } from "vue";

export function useOrderAnimations() {
  const transitionDuration = ref(300);

  const getTransitionClasses = () => ({
    "v-enter-active": {
      transition: `all ${transitionDuration.value}ms cubic-bezier(0.4, 0, 0.2, 1)`,
    },
    "v-leave-active": {
      transition: `all ${transitionDuration.value}ms cubic-bezier(0.4, 0, 0.2, 1)`,
    },
    "v-enter-from": {
      opacity: 0,
      transform: "translateY(-15px)",
    },
    "v-leave-to": {
      opacity: 0,
      transform: "translateY(15px)",
    },
  });

  const getRowTransitionProps = () => ({
    name: "fade-slide",
    mode: "out-in",
    appear: true,
    duration: transitionDuration.value,
  });

  const getFilterTransitionProps = () => ({
    name: "fade",
    mode: "out-in",
    appear: true,
    duration: transitionDuration.value,
  });

  const getStatusTransitionProps = (status) => {
    const statusColors = {
      success: "#4CAF50",
      error: "#FF5252",
      warning: "#FFC107",
      info: "#2196F3",
    };

    return {
      "transition-property": "background-color",
      "transition-duration": `${transitionDuration.value}ms`,
      "transition-timing-function": "cubic-bezier(0.4, 0, 0.2, 1)",
      "background-color": statusColors[status] || "#757575",
    };
  };

  return {
    transitionDuration,
    getTransitionClasses,
    getRowTransitionProps,
    getFilterTransitionProps,
    getStatusTransitionProps,
  };
}
