import { describe, it, expect, beforeEach, vi } from "vitest";
import { useOrderFilters } from "../useOrderFilters";

describe("useOrderFilters", () => {
  let filters;

  beforeEach(() => {
    filters = useOrderFilters();
  });

  it("should initialize with empty filters", () => {
    expect(filters.filters.value).toEqual({});
    expect(filters.dateFrom.value).toBeNull();
    expect(filters.dateTo.value).toBeNull();
  });

  it("should filter orders by date range", () => {
    const orders = [
      { date: "2024-01-01" },
      { date: "2024-02-01" },
      { date: "2024-03-01" },
    ];

    filters.dateFrom.value = "2024-02-01";
    filters.dateTo.value = "2024-03-01";

    const result = filters.applyFilters(orders);
    expect(result).toHaveLength(2);
    expect(result[0].date).toBe("2024-02-01");
    expect(result[1].date).toBe("2024-03-01");
  });

  it("should filter orders by status", () => {
    const orders = [
      { status: "Pending" },
      { status: "Completed" },
      { status: "Pending" },
    ];

    filters.filters.value = { status: "Pending" };

    const result = filters.applyFilters(orders);
    expect(result).toHaveLength(2);
    expect(result.every((order) => order.status === "Pending")).toBe(true);
  });

  it("should debounce filter changes", async () => {
    vi.useFakeTimers();
    const orders = [{ id: 1 }, { id: 2 }];
    const callback = vi.fn();

    filters.onFilterChange(orders, callback);
    expect(callback).not.toHaveBeenCalled();

    await vi.runAllTimersAsync();
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(orders);
  });
});
