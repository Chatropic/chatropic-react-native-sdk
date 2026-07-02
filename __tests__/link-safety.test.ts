import { isSafeExternalUrl } from "../src/markdown/link-safety";

describe("isSafeExternalUrl", () => {
  it("allows http and https links", () => {
    expect(isSafeExternalUrl("https://example.com/docs")).toBe(true);
    expect(isSafeExternalUrl("http://example.com/docs")).toBe(true);
    expect(isSafeExternalUrl("  https://example.com/docs  ")).toBe(true);
  });

  it("blocks unsafe or app-specific URL schemes", () => {
    expect(isSafeExternalUrl("javascript:alert(1)")).toBe(false);
    expect(isSafeExternalUrl("file:///etc/passwd")).toBe(false);
    expect(isSafeExternalUrl("intent://scan/#Intent;scheme=zxing;end")).toBe(false);
    expect(isSafeExternalUrl("tel:+15551234567")).toBe(false);
    expect(isSafeExternalUrl("/relative/path")).toBe(false);
    expect(isSafeExternalUrl("")).toBe(false);
  });
});
