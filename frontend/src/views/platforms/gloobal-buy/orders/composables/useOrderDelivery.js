import { ref } from "vue";

export function useOrderDelivery() {
  console.log("[useOrderDelivery] Inicializando composable");
  const selectedDeliveries = ref([]);

  const deliveryOptions = [
    {
      title: "Europe",
      value: "Europe",
      type: "group",
    },
    { title: "Spain", value: "Spain", parent: "Europe" },
    { title: "France", value: "France", parent: "Europe" },
    { title: "Germany", value: "Germany", parent: "Europe" },
    { title: "Italy", value: "Italy", parent: "Europe" },
    { title: "Portugal", value: "Portugal", parent: "Europe" },
    { title: "Netherlands", value: "Netherlands", parent: "Europe" },
    { title: "Belgium", value: "Belgium", parent: "Europe" },
    { title: "Sweden", value: "Sweden", parent: "Europe" },
    { title: "Denmark", value: "Denmark", parent: "Europe" },
    { title: "Austria", value: "Austria", parent: "Europe" },
    { title: "Ireland", value: "Ireland", parent: "Europe" },
    { title: "Poland", value: "Poland", parent: "Europe" },
    { title: "Norway", value: "Norway", parent: "Europe" },
    { title: "Finland", value: "Finland", parent: "Europe" },
    { title: "Greece", value: "Greece", parent: "Europe" },
    { title: "Czech Republic", value: "Czech Republic", parent: "Europe" },
    { title: "Hungary", value: "Hungary", parent: "Europe" },
    { title: "Romania", value: "Romania", parent: "Europe" },
    { title: "Croatia", value: "Croatia", parent: "Europe" },
    { title: "Slovakia", value: "Slovakia", parent: "Europe" },
  ];

  const isEuropeSelected = () => {
    const result = selectedDeliveries.value.some((item) => {
      const value = typeof item === "object" ? item.value : item;
      return value === "Europe";
    });
    console.log("[useOrderDelivery] isEuropeSelected:", result);
    return result;
  };

  const handleDeliveryChange = (values, callback) => {
    console.log(
      "[useOrderDelivery] handleDeliveryChange - valores recibidos:",
      values
    );

    selectedDeliveries.value = values.map((value) => {
      if (typeof value === "object" && value.title && value.value) {
        console.log("[useOrderDelivery] Usando objeto existente:", value);
        return value;
      }
      const option = deliveryOptions.find((opt) => opt.value === value);
      console.log(
        "[useOrderDelivery] Buscando opción para valor:",
        value,
        "Encontrado:",
        option
      );
      return option || { title: value, value };
    });

    console.log(
      "[useOrderDelivery] Estado final de selectedDeliveries:",
      selectedDeliveries.value
    );
    if (callback) callback();
  };

  const toggleEurope = (callback) => {
    console.log("[useOrderDelivery] toggleEurope - Inicio");
    const europeOption = deliveryOptions.find((opt) => opt.type === "group");
    const countryOptions = deliveryOptions.filter(
      (opt) => opt.parent === "Europe"
    );

    if (isEuropeSelected()) {
      console.log(
        "[useOrderDelivery] Deseleccionando Europa y todos los países"
      );
      selectedDeliveries.value = [];
    } else {
      console.log("[useOrderDelivery] Seleccionando Europa y todos los países");
      selectedDeliveries.value = [europeOption, ...countryOptions];
    }
    console.log(
      "[useOrderDelivery] Estado final después de toggle:",
      selectedDeliveries.value
    );
    if (callback) callback();
  };

  const removeDelivery = (item, callback) => {
    console.log("[useOrderDelivery] removeDelivery - Item a remover:", item);
    if (!item) return;

    const valueToRemove = typeof item === "object" ? item.value : item;
    console.log("[useOrderDelivery] Valor a remover:", valueToRemove);

    if (valueToRemove === "Europe") {
      console.log("[useOrderDelivery] Removiendo Europa y todos los países");
      selectedDeliveries.value = [];
    } else {
      selectedDeliveries.value = selectedDeliveries.value.filter((selected) => {
        const selectedValue =
          typeof selected === "object" ? selected.value : selected;
        return selectedValue !== valueToRemove;
      });
    }
    console.log(
      "[useOrderDelivery] Estado final después de remover:",
      selectedDeliveries.value
    );
    if (callback) callback();
  };

  const isCountrySelected = (country) => {
    if (!country) return false;

    const countryValue = typeof country === "object" ? country.value : country;
    const result = selectedDeliveries.value.some((item) => {
      const itemValue = typeof item === "object" ? item.value : item;
      return itemValue === countryValue;
    });
    console.log(
      "[useOrderDelivery] isCountrySelected:",
      country,
      "Resultado:",
      result
    );
    return result;
  };

  const toggleCountry = (country, callback) => {
    console.log("[useOrderDelivery] toggleCountry - País:", country);
    if (!country) return;

    const countryValue = typeof country === "object" ? country.value : country;
    const index = selectedDeliveries.value.findIndex((item) => {
      const itemValue = typeof item === "object" ? item.value : item;
      return itemValue === countryValue;
    });

    if (index === -1) {
      const countryOption = deliveryOptions.find(
        (opt) => opt.value === countryValue
      );
      console.log(
        "[useOrderDelivery] Agregando país:",
        countryOption || country
      );
      selectedDeliveries.value.push(countryOption || country);
    } else {
      console.log("[useOrderDelivery] Removiendo país en índice:", index);
      selectedDeliveries.value.splice(index, 1);
    }
    console.log(
      "[useOrderDelivery] Estado final después de toggle país:",
      selectedDeliveries.value
    );
    if (callback) callback();
  };

  return {
    selectedDeliveries,
    deliveryOptions,
    isEuropeSelected,
    handleDeliveryChange,
    toggleEurope,
    removeDelivery,
    isCountrySelected,
    toggleCountry,
  };
}
