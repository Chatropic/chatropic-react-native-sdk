import { resolveWidgetBranding } from "../src/utils/branding";
import { emptyWidgetConfig, PLATFORM_AGENT_DISPLAY_NAME } from "../src/utils/defaults";

describe("resolveWidgetBranding", () => {
  it("uses Chatropic defaults when branding is not managed", () => {
    const branding = resolveWidgetBranding({
      ...emptyWidgetConfig(),
      displayName: "Pricepally",
      logoUrl: "https://example.com/logo.png",
    });

    expect(branding.displayName).toBe(PLATFORM_AGENT_DISPLAY_NAME);
    expect(branding.usePlatformLogo).toBe(true);
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
