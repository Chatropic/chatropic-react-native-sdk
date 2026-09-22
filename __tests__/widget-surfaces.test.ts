import { emptyWidgetConfig } from "../src/utils/defaults";
import { applyThemeToWidgetConfig, resolveSaasInputBackground, resolveSaasThreadBackground } from "../src/theme/resolve-colors";

describe("Chat widget surface parity", () => {
  it("does not carry the default white header into dark mode", () => {
    for (const resolve of [resolveSaasInputBackground, resolveSaasThreadBackground]) {
      expect(resolve(emptyWidgetConfig(), "dark")).toBe("#121214");
      expect(resolve(emptyWidgetConfig(), "light")).toBe("#FFFFFF");
    }
  });
  it("preserves explicit input and thread colors", () => {
    const config = { ...emptyWidgetConfig(), saasInputBackground: "#FFFFFF", saasThreadBackground: "#334455" };
    expect(resolveSaasInputBackground(config, "dark")).toBe("#FFFFFF");
    expect(resolveSaasThreadBackground(config, "dark")).toBe("#334455");
  });
});

 it.each(["light", "dark"] as const)("uses neutral %s surfaces for legacy branded configs", scheme => {
   const config = applyThemeToWidgetConfig({ ...emptyWidgetConfig(), headerColor: "#FFFFFF", userBubbleColor: "#0891B2" }, scheme);
   expect(config.headerColor).toBe(scheme === "dark" ? "#121214" : "#FFFFFF");
   expect(config.userBubbleColor).toBe(scheme === "dark" ? "#FAFAFA" : "#18181B");
   expect(config.saasInputBackground).toBe(config.headerColor);
 });
