import { describe, it, expect, beforeEach } from "vitest";
import { useOrderSelection } from "../useOrderSelection";

describe("useOrderSelection", () => {
  let selection;

  beforeEach(() => {
    selection = useOrderSelection();
  });

  it("should initialize with empty selection", () => {
    expect(selection.selected.value).toEqual([]);
    expect(selection.selectAll.value).toBe(false);
    expect(selection.indeterminate.value).toBe(false);
  });

  it("should toggle select all correctly", () => {
    const orders = [{ id: 1 }, { id: 2 }, { id: 3 }];

    selection.toggleSelectAll(orders);
    expect(selection.selected.value).toEqual(orders);

    selection.toggleSelectAll(orders);
    expect(selection.selected.value).toEqual([]);
  });

  it("should select current page items", () => {
    const currentPage = [{ id: 1 }, { id: 2 }];

    selection.selectCurrentPage(currentPage);
    expect(selection.selected.value).toEqual(currentPage);

    // No debería duplicar items ya seleccionados
    selection.selectCurrentPage(currentPage);
    expect(selection.selected.value).toEqual(currentPage);
  });

  it("should deselect current page items", () => {
    const allOrders = [{ id: 1 }, { id: 2 }, { id: 3 }];
    const currentPage = [{ id: 1 }, { id: 2 }];

    selection.selectAllPages(allOrders);
    selection.deselectCurrentPage(currentPage);
    expect(selection.selected.value).toEqual([{ id: 3 }]);
  });

  it("should update selection state correctly", () => {
    const orders = [{ id: 1 }, { id: 2 }, { id: 3 }];

    // Sin selección
    selection.updateSelectionState(orders);
    expect(selection.selectAll.value).toBe(false);
    expect(selection.indeterminate.value).toBe(false);

    // Selección parcial
    selection.selected.value = [orders[0]];
    selection.updateSelectionState(orders);
    expect(selection.selectAll.value).toBe(false);
    expect(selection.indeterminate.value).toBe(true);

    // Selección completa
    selection.selected.value = [...orders];
    selection.updateSelectionState(orders);
    expect(selection.selectAll.value).toBe(true);
    expect(selection.indeterminate.value).toBe(false);
  });

  it("should compute hasSelectedItems correctly", () => {
    expect(selection.hasSelectedItems.value).toBe(false);

    selection.selected.value = [{ id: 1 }];
    expect(selection.hasSelectedItems.value).toBe(true);

    selection.selected.value = [];
    expect(selection.hasSelectedItems.value).toBe(false);
  });
});
