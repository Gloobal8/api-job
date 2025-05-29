import { ref, computed } from "vue";

export function useOrderSelection() {
  const selected = ref([]);
  const selectAll = ref(false);
  const indeterminate = ref(false);

  const hasSelectedItems = computed(() => selected.value.length > 0);

  const toggleSelectAll = (orders) => {
    if (!orders || !Array.isArray(orders)) {
      console.warn(
        "[useOrderSelection] toggleSelectAll: orders debe ser un array"
      );
      return;
    }

    if (selectAll.value || indeterminate.value) {
      selected.value = [];
      selectAll.value = false;
      indeterminate.value = false;
    } else {
      selected.value = [...orders];
      selectAll.value = true;
      indeterminate.value = false;
    }
    updateSelectionState(orders);
  };

  const selectCurrentPage = (currentPageItems) => {
    if (!currentPageItems || !Array.isArray(currentPageItems)) {
      console.warn(
        "[useOrderSelection] selectCurrentPage: currentPageItems debe ser un array"
      );
      return;
    }

    // Crear un nuevo array con los items actuales más los nuevos
    const newSelection = [...selected.value];
    currentPageItems.forEach((item) => {
      if (!newSelection.some((selected) => selected.id === item.id)) {
        newSelection.push(item);
      }
    });
    selected.value = newSelection;
  };

  const selectAllPages = (orders) => {
    if (!orders || !Array.isArray(orders)) {
      console.warn(
        "[useOrderSelection] selectAllPages: orders debe ser un array"
      );
      return;
    }
    selected.value = [...orders];
    selectAll.value = true;
    indeterminate.value = false;
  };

  const deselectCurrentPage = (currentPageItems) => {
    if (!currentPageItems || !Array.isArray(currentPageItems)) {
      console.warn(
        "[useOrderSelection] deselectCurrentPage: currentPageItems debe ser un array"
      );
      return;
    }

    selected.value = selected.value.filter(
      (item) => !currentPageItems.some((current) => current.id === item.id)
    );
  };

  const deselectAllPages = () => {
    selected.value = [];
    selectAll.value = false;
    indeterminate.value = false;
  };

  const updateSelectionState = (orders) => {
    if (!orders || !Array.isArray(orders)) {
      console.warn(
        "[useOrderSelection] updateSelectionState: orders debe ser un array"
      );
      return;
    }

    const selectedCount = selected.value.length;
    const totalCount = orders.length;

    selectAll.value = selectedCount === totalCount && totalCount > 0;
    indeterminate.value = selectedCount > 0 && selectedCount < totalCount;
  };

  return {
    selected,
    selectAll,
    indeterminate,
    hasSelectedItems,
    toggleSelectAll,
    selectCurrentPage,
    selectAllPages,
    deselectCurrentPage,
    deselectAllPages,
    updateSelectionState,
  };
}
