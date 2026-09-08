import { emptyWidgetConfig } from "../src/utils/defaults";
import { resolveSaasInputBackground, resolveSaasThreadBackground } from "../src/theme/resolve-colors";

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
