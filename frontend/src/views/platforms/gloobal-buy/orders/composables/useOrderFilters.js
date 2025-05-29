import { ref, computed } from "vue";

export function useOrderFilters() {
  const filters = ref({});
  const dateFrom = ref(null);
  const dateTo = ref(null);
  const loading = ref(false);
  let filterTimeout = null;

  const newClientOptions = [
    { title: "All", value: null },
    { title: "Yes", value: true },
    { title: "No", value: false },
  ];

  const statusOptions = [
    { title: "All", value: null },
    {
      title: "Authorized. To be captured by merchant",
      value: "Authorized. To be captured by merchant",
    },
    {
      title: "Awaiting bank transfer payment",
      value: "Awaiting bank transfer payment",
    },
    // ... otros estados
  ];

  const paymentOptions = [
    { title: "All", value: null },
    { title: "Credit Card", value: "Credit Card" },
    { title: "Bank transfer", value: "Bank transfer" },
    { title: "PayPal", value: "PayPal" },
    { title: "Crypto", value: "Crypto" },
  ];

  const applyFilters = (orders) => {
    loading.value = true;
    const filteredOrders = orders.filter((order) => {
      // Filtrar por rango de fechas
      if (dateFrom.value || dateTo.value) {
        const orderDate = new Date(order.date);
        if (dateFrom.value && new Date(dateFrom.value) > orderDate)
          return false;
        if (dateTo.value && new Date(dateTo.value) < orderDate) return false;
      }

      return Object.keys(filters.value).every((key) => {
        if (filters.value[key] === null || filters.value[key] === undefined)
          return true;

        if (key === "new") {
          return order[key] === filters.value[key];
        }

        if (key === "status") {
          return order[key] === filters.value[key];
        }

        if (key === "date") return true; // Skip date filter here as it's handled above

        return String(order[key])
          .toLowerCase()
          .includes(String(filters.value[key]).toLowerCase());
      });
    });

    setTimeout(() => {
      loading.value = false;
    }, 300);

    return filteredOrders;
  };

  const onFilterChange = (orders, callback) => {
    clearTimeout(filterTimeout);
    filterTimeout = setTimeout(() => {
      const filteredOrders = applyFilters(orders);
      callback(filteredOrders);
    }, 300);
  };

  return {
    filters,
    dateFrom,
    dateTo,
    loading,
    newClientOptions,
    statusOptions,
    paymentOptions,
    applyFilters,
    onFilterChange,
  };
}
