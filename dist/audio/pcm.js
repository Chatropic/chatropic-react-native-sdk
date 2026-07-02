/** PCM helpers for Gemini Live (16 kHz in, 24 kHz out). */
import { base64ToBytes as decodeBase64ToBytes, bytesToBase64 as encodeBytesToBase64, } from "../utils/base64";
export const INPUT_SAMPLE_RATE = 16000;
export const OUTPUT_SAMPLE_RATE = 24000;
export function floatTo16BitPCM(input) {
    const out = new Int16Array(input.length);
    for (let i = 0; i < input.length; i++) {
        const s = Math.max(-1, Math.min(1, input[i] ?? 0));
        out[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    return out;
}
export function downsampleBuffer(buffer, fromRate, toRate) {
    if (fromRate === toRate)
        return buffer;
    const ratio = fromRate / toRate;
    const newLength = Math.round(buffer.length / ratio);
    const result = new Float32Array(newLength);
    for (let i = 0; i < newLength; i++) {
        const idx = i * ratio;
        const i0 = Math.floor(idx);
        const i1 = Math.min(i0 + 1, buffer.length - 1);
        const frac = idx - i0;
        result[i] = (buffer[i0] ?? 0) * (1 - frac) + (buffer[i1] ?? 0) * frac;
    }
    return result;
}
export function downsampleInt16(buffer, fromRate, toRate) {
    if (fromRate === toRate)
        return buffer;
    const floats = int16ToFloat32(buffer);
    const downsampled = downsampleBuffer(floats, fromRate, toRate);
    return floatTo16BitPCM(downsampled);
}
export function int16ToFloat32(input) {
    const out = new Float32Array(input.length);
    for (let i = 0; i < input.length; i++) {
        out[i] = (input[i] ?? 0) / 0x8000;
    }
    return out;
}
export function base64ToBytes(b64) {
    return decodeBase64ToBytes(b64);
}
export function bytesToBase64(bytes) {
    return encodeBytesToBase64(bytes);
}
export function parseSampleRate(mimeType, fallback) {
    const match = mimeType.match(/rate=(\d+)/);
    return match ? parseInt(match[1] ?? String(fallback), 10) : fallback;
}
export function concatPcm(chunks) {
    const total = chunks.reduce((sum, chunk) => sum + chunk.byteLength, 0);
    const out = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) {
        out.set(chunk, offset);
        offset += chunk.byteLength;
    }
    return out;
}
export function pcm16ToWav(pcm, sampleRate, channels = 1) {
    const byteRate = sampleRate * channels * 2;
    const blockAlign = channels * 2;
    const dataSize = pcm.byteLength;
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);
    const writeString = (offset, value) => {
        for (let i = 0; i < value.length; i++) {
            view.setUint8(offset + i, value.charCodeAt(i));
        }
    };
    writeString(0, "RIFF");
    view.setUint32(4, 36 + dataSize, true);
    writeString(8, "WAVE");
    writeString(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, channels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, 16, true);
    writeString(36, "data");
    view.setUint32(40, dataSize, true);
    new Uint8Array(buffer, 44).set(pcm);
    return new Uint8Array(buffer);
}
