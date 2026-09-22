import { resolveWidgetBranding } from "../src/utils/branding";
import { emptyWidgetConfig, PLATFORM_AGENT_DISPLAY_NAME } from "../src/utils/defaults";

describe("resolveWidgetBranding", () => {
  it("uses the channel name even when the management flag is absent", () => {
    const branding = resolveWidgetBranding({
      ...emptyWidgetConfig(),
      displayName: "Pricepally",
      logoUrl: "https://example.com/logo.png",
    });

    expect(branding.displayName).toBe("Pricepally");
    expect(branding.usePlatformLogo).toBe(true);
  });

  it("uses the configured name when the management flag is false", () => {
    expect(resolveWidgetBranding({
      ...emptyWidgetConfig(),
      displayName: "  Support assistant  ",
      displayNameManaged: false,
    }).displayName).toBe("Support assistant");
  });

  it.each(["", "   "])("falls back to Chatropic for an empty name (%j)", displayName => {
    expect(resolveWidgetBranding({
      ...emptyWidgetConfig(), displayName,
    }).displayName).toBe(PLATFORM_AGENT_DISPLAY_NAME);
  });

  it("allows premium custom branding when managed", () => {
    const branding = resolveWidgetBranding({
      ...emptyWidgetConfig(),
      displayName: "Acme Support",
      displayNameManaged: true,
      logoUrl: "https://example.com/acme.png",
      logoUrlManaged: true,
    });

    expect(branding.displayName).toBe("Acme Support");
    expect(branding.logoUrl).toBe("https://example.com/acme.png");
    expect(branding.usePlatformLogo).toBe(false);
  });
});
