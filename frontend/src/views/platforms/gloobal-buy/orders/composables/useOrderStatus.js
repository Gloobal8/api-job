import { ref } from "vue";

export function useOrderStatus() {
  const getStatusColor = (status) => {
    const colors = {
      "Authorized. To be captured by merchant": "info",
      "Awaiting bank transfer payment": "warning",
      "Awaiting Cash On Delivery validation": "warning",
      "Awaiting check payment": "warning",
      Canceled: "error",
      Delivered: "success",
      "On backorder (not paid)": "warning",
      "On backorder (paid)": "info",
      "Partial refund": "warning",
      "Payment accepted": "success",
      "Payment error": "error",
      "Processing in progress": "info",
      Refunded: "warning",
      "Remote payment accepted": "success",
      Shipped: "primary",
      "Waiting capture": "warning",
      "Waiting for Credit Card Payment": "warning",
      "Waiting for Local Payment Method": "warning",
      "Waiting for PayPal payment": "warning",
      "Waiting for crypto": "warning",
    };
    return colors[status] || "grey";
  };

  return {
    getStatusColor,
  };
}
