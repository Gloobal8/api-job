import { ref } from "vue";

export function useOrderSort() {
  const sortBy = ref("");
  const sortOrder = ref("none"); // none, asc, desc

  const getSortIcon = (columnKey) => {
    if (sortBy.value !== columnKey) return "mdi-unfold-more-horizontal";
    return sortOrder.value === "asc" ? "mdi-chevron-up" : "mdi-chevron-down";
  };

  const toggleSort = (columnKey, orders) => {
    if (sortBy.value === columnKey) {
      sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
    } else {
      if (sortBy.value) {
        sortOrder.value = "none";
      }
      sortBy.value = columnKey;
      sortOrder.value = "asc";
    }
    return applySort(orders);
  };

  const applySort = (orders) => {
    if (!sortBy.value || sortOrder.value === "none") return orders;

    return [...orders].sort((a, b) => {
      let valueA = a[sortBy.value];
      let valueB = b[sortBy.value];

      // Convertir a números si es posible
      if (!isNaN(valueA) && !isNaN(valueB)) {
        valueA = Number(valueA);
        valueB = Number(valueB);
      }

      if (sortOrder.value === "asc") {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });
  };

  return {
    sortBy,
    sortOrder,
    getSortIcon,
    toggleSort,
    applySort,
  };
}
