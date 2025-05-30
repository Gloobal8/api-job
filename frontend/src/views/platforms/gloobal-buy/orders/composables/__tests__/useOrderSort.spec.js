import { describe, it, expect, beforeEach } from "vitest";
import { useOrderSort } from "../useOrderSort";

describe("useOrderSort", () => {
  let sort;

  beforeEach(() => {
    sort = useOrderSort();
  });

  it("should initialize with empty sort state", () => {
    expect(sort.sortBy.value).toBe("");
    expect(sort.sortOrder.value).toBe("none");
  });

  it("should return correct sort icon", () => {
    expect(sort.getSortIcon("column1")).toBe("mdi-unfold-more-horizontal");

    sort.sortBy.value = "column1";
    sort.sortOrder.value = "asc";
    expect(sort.getSortIcon("column1")).toBe("mdi-chevron-up");

    sort.sortOrder.value = "desc";
    expect(sort.getSortIcon("column1")).toBe("mdi-chevron-down");
  });

  it("should toggle sort order correctly", () => {
    const orders = [{ id: 2 }, { id: 1 }, { id: 3 }];

    // Primera vez: ascendente
    sort.toggleSort("id", orders);
    expect(sort.sortBy.value).toBe("id");
    expect(sort.sortOrder.value).toBe("asc");

    // Segunda vez: descendente
    sort.toggleSort("id", orders);
    expect(sort.sortBy.value).toBe("id");
    expect(sort.sortOrder.value).toBe("desc");
  });

  it("should sort numbers correctly", () => {
    const orders = [{ id: 2 }, { id: 1 }, { id: 3 }];

    sort.sortBy.value = "id";
    sort.sortOrder.value = "asc";
    const ascResult = sort.applySort(orders);
    expect(ascResult.map((o) => o.id)).toEqual([1, 2, 3]);

    sort.sortOrder.value = "desc";
    const descResult = sort.applySort(orders);
    expect(descResult.map((o) => o.id)).toEqual([3, 2, 1]);
  });

  it("should sort strings correctly", () => {
    const orders = [{ name: "Charlie" }, { name: "Alpha" }, { name: "Bravo" }];

    sort.sortBy.value = "name";
    sort.sortOrder.value = "asc";
    const ascResult = sort.applySort(orders);
    expect(ascResult.map((o) => o.name)).toEqual(["Alpha", "Bravo", "Charlie"]);

    sort.sortOrder.value = "desc";
    const descResult = sort.applySort(orders);
    expect(descResult.map((o) => o.name)).toEqual([
      "Charlie",
      "Bravo",
      "Alpha",
    ]);
  });
});
