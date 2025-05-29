import { describe, it, expect } from "vitest";
import { useOrderAnimations } from "../useOrderAnimations";

describe("useOrderAnimations", () => {
  const animations = useOrderAnimations();

  it("should provide transition classes with correct duration", () => {
    const classes = animations.getTransitionClasses();

    expect(classes["v-enter-active"].transition).toContain("300ms");
    expect(classes["v-leave-active"].transition).toContain("300ms");
    expect(classes["v-enter-from"]).toEqual({
      opacity: 0,
      transform: "translateY(-15px)",
    });
    expect(classes["v-leave-to"]).toEqual({
      opacity: 0,
      transform: "translateY(15px)",
    });
  });

  it("should provide row transition props", () => {
    const props = animations.getRowTransitionProps();

    expect(props).toEqual({
      name: "fade-slide",
      mode: "out-in",
      appear: true,
      duration: 300,
    });
  });

  it("should provide filter transition props", () => {
    const props = animations.getFilterTransitionProps();

    expect(props).toEqual({
      name: "fade",
      mode: "out-in",
      appear: true,
      duration: 300,
    });
  });

  it("should provide status transition props with correct colors", () => {
    const successProps = animations.getStatusTransitionProps("success");
    const errorProps = animations.getStatusTransitionProps("error");
    const defaultProps = animations.getStatusTransitionProps("unknown");

    expect(successProps["background-color"]).toBe("#4CAF50");
    expect(errorProps["background-color"]).toBe("#FF5252");
    expect(defaultProps["background-color"]).toBe("#757575");

    expect(successProps["transition-duration"]).toBe("300ms");
    expect(successProps["transition-property"]).toBe("background-color");
    expect(successProps["transition-timing-function"]).toBe(
      "cubic-bezier(0.4, 0, 0.2, 1)"
    );
  });

  it("should allow customizing transition duration", () => {
    animations.transitionDuration.value = 500;
    const classes = animations.getTransitionClasses();
    const props = animations.getRowTransitionProps();

    expect(classes["v-enter-active"].transition).toContain("500ms");
    expect(props.duration).toBe(500);
  });
});
