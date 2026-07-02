const BASE64_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
export function bytesToBase64(bytes) {
    const nativeBtoa = globalThis.btoa;
    if (typeof nativeBtoa === "function") {
        let binary = "";
        for (let i = 0; i < bytes.length; i++) {
            binary += String.fromCharCode(bytes[i] ?? 0);
        }
        return nativeBtoa(binary);
    }
    let output = "";
    for (let i = 0; i < bytes.length; i += 3) {
        const a = bytes[i] ?? 0;
        const b = bytes[i + 1] ?? 0;
        const c = bytes[i + 2] ?? 0;
        const triplet = (a << 16) | (b << 8) | c;
        output += BASE64_ALPHABET[(triplet >> 18) & 0x3f];
        output += BASE64_ALPHABET[(triplet >> 12) & 0x3f];
        output += i + 1 < bytes.length ? BASE64_ALPHABET[(triplet >> 6) & 0x3f] : "=";
        output += i + 2 < bytes.length ? BASE64_ALPHABET[triplet & 0x3f] : "=";
    }
    return output;
}
export function base64ToBytes(value) {
    const nativeAtob = globalThis.atob;
    if (typeof nativeAtob === "function") {
        const binary = nativeAtob(value);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes;
    }
    const cleaned = value.replace(/[^A-Za-z0-9+/=]/g, "");
    const padding = cleaned.endsWith("==") ? 2 : cleaned.endsWith("=") ? 1 : 0;
    const byteLength = Math.floor((cleaned.length * 3) / 4) - padding;
    const bytes = new Uint8Array(Math.max(0, byteLength));
    let byteIndex = 0;
    for (let i = 0; i < cleaned.length; i += 4) {
        const a = BASE64_ALPHABET.indexOf(cleaned[i] ?? "A");
        const b = BASE64_ALPHABET.indexOf(cleaned[i + 1] ?? "A");
        const c = cleaned[i + 2] === "=" ? 0 : BASE64_ALPHABET.indexOf(cleaned[i + 2] ?? "A");
        const d = cleaned[i + 3] === "=" ? 0 : BASE64_ALPHABET.indexOf(cleaned[i + 3] ?? "A");
        const triplet = (a << 18) | (b << 12) | (c << 6) | d;
        if (byteIndex < bytes.length)
            bytes[byteIndex++] = (triplet >> 16) & 0xff;
        if (byteIndex < bytes.length)
            bytes[byteIndex++] = (triplet >> 8) & 0xff;
        if (byteIndex < bytes.length)
            bytes[byteIndex++] = triplet & 0xff;
    }
    return bytes;
}
