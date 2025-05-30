import { describe, it, expect, vi, beforeEach } from "vitest";
import { useOrderActions } from "../useOrderActions";

// Mock de Vuetify useSnackbar
vi.mock("vuetify", () => ({
  useSnackbar: () => ({
    value: null,
  }),
}));

describe("useOrderActions", () => {
  let actions;

  beforeEach(() => {
    actions = useOrderActions();
    vi.clearAllMocks();
  });

  it("should handle successful export action", async () => {
    const selectedOrders = [{ id: 1 }, { id: 2 }];

    await actions.exportOrders(selectedOrders);

    expect(actions.loading.value).toBe(false);
    expect(actions.actionInProgress.value).toBe("");
  });

  it("should handle successful import action", async () => {
    const file = new File([""], "orders.csv");

    await actions.importOrders(file);

    expect(actions.loading.value).toBe(false);
    expect(actions.actionInProgress.value).toBe("");
  });

  it("should handle successful refresh action", async () => {
    await actions.refreshList();

    expect(actions.loading.value).toBe(false);
    expect(actions.actionInProgress.value).toBe("");
  });

  it("should handle successful status update", async () => {
    const orders = [{ id: 1 }, { id: 2 }];
    const newStatus = "completed";

    await actions.updateOrderStatus(orders, newStatus);

    expect(actions.loading.value).toBe(false);
    expect(actions.actionInProgress.value).toBe("");
  });

  it("should handle action errors", async () => {
    // Simular un error en la acción
    const error = new Error("Test error");
    const mockAction = vi.fn().mockRejectedValue(error);

    try {
      await actions.executeAction("test action", mockAction, "Success message");
    } catch (e) {
      expect(e).toBe(error);
    }

    expect(actions.loading.value).toBe(false);
    expect(actions.actionInProgress.value).toBe("");
  });

  it("should set loading state during action execution", async () => {
    const mockAction = vi.fn().mockImplementation(() => {
      expect(actions.loading.value).toBe(true);
      expect(actions.actionInProgress.value).toBe("test action");
      return Promise.resolve();
    });

    await actions.executeAction("test action", mockAction, "Success message");

    expect(mockAction).toHaveBeenCalled();
    expect(actions.loading.value).toBe(false);
    expect(actions.actionInProgress.value).toBe("");
  });
});
