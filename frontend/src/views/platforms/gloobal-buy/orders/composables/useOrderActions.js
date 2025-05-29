import { ref } from "vue";

export function useOrderActions() {
  const loading = ref(false);
  const actionInProgress = ref("");
  const snackbarVisible = ref(false);
  const snackbarText = ref("");
  const snackbarColor = ref("success");
  const snackbarTimeout = ref(3000);

  const showSuccessMessage = (message) => {
    snackbarText.value = message;
    snackbarColor.value = "success";
    snackbarTimeout.value = 3000;
    snackbarVisible.value = true;
  };

  const showErrorMessage = (message) => {
    snackbarText.value = message;
    snackbarColor.value = "error";
    snackbarTimeout.value = 5000;
    snackbarVisible.value = true;
  };

  const executeAction = async (actionName, action, successMessage) => {
    try {
      loading.value = true;
      actionInProgress.value = actionName;
      await action();
      showSuccessMessage(successMessage);
    } catch (error) {
      showErrorMessage(`Error al ${actionName}: ${error.message}`);
    } finally {
      loading.value = false;
      actionInProgress.value = "";
    }
  };

  const exportOrders = async (selectedOrders) => {
    await executeAction(
      "exportar órdenes",
      async () => {
        // Implementar lógica de exportación
        await new Promise((resolve) => setTimeout(resolve, 1000));
      },
      "Órdenes exportadas exitosamente"
    );
  };

  const importOrders = async (file) => {
    await executeAction(
      "importar órdenes",
      async () => {
        // Implementar lógica de importación
        await new Promise((resolve) => setTimeout(resolve, 1000));
      },
      "Órdenes importadas exitosamente"
    );
  };

  const refreshList = async () => {
    await executeAction(
      "refrescar lista",
      async () => {
        // Implementar lógica de actualización
        await new Promise((resolve) => setTimeout(resolve, 1000));
      },
      "Lista actualizada exitosamente"
    );
  };

  const updateOrderStatus = async (orders, newStatus) => {
    await executeAction(
      "actualizar estado",
      async () => {
        // Implementar lógica de actualización de estado
        await new Promise((resolve) => setTimeout(resolve, 1000));
      },
      "Estado actualizado exitosamente"
    );
  };

  return {
    loading,
    actionInProgress,
    snackbarVisible,
    snackbarText,
    snackbarColor,
    snackbarTimeout,
    exportOrders,
    importOrders,
    refreshList,
    updateOrderStatus,
  };
}
