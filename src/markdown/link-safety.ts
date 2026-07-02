const ALLOWED_LINK_PROTOCOLS = new Set(["http:", "https:"]);

export function isSafeExternalUrl(href: string): boolean {
  const trimmed = href.trim();
  if (!trimmed) return false;

  try {
    const parsed = new URL(trimmed);
    return ALLOWED_LINK_PROTOCOLS.has(parsed.protocol);
  } catch {
    return false;
  }
}
