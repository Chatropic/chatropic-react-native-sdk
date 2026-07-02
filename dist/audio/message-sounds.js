import { loadExpoAudio, loadExpoFileSystem } from "./expo-audio-runtime";
import { bytesToBase64 } from "../utils/base64";
// Write raw PCM samples into a minimal WAV Uint8Array
function buildWav(samples, sampleRate) {
    const numSamples = samples.length;
    const dataBytes = numSamples * 2; // 16-bit mono
    const buf = new ArrayBuffer(44 + dataBytes);
    const view = new DataView(buf);
    const writeStr = (offset, str) => {
        for (let i = 0; i < str.length; i++)
            view.setUint8(offset + i, str.charCodeAt(i));
    };
    writeStr(0, "RIFF");
    view.setUint32(4, 36 + dataBytes, true);
    writeStr(8, "WAVE");
    writeStr(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, 1, true); // mono
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeStr(36, "data");
    view.setUint32(40, dataBytes, true);
    for (let i = 0; i < numSamples; i++) {
        const s = Math.max(-1, Math.min(1, samples[i]));
        view.setInt16(44 + i * 2, Math.round(s * 32767), true);
    }
    return new Uint8Array(buf);
}
// Short bright pop (sent)
function generateSentSamples(sampleRate) {
    const dur = 0.1;
    const n = Math.floor(sampleRate * dur);
    const out = new Float32Array(n);
    for (let i = 0; i < n; i++) {
        const t = i / sampleRate;
        const freq = 900 - 300 * (t / dur); // sweep 900→600 Hz
        const amp = 0.12 * Math.exp(-t * 28);
        out[i] = amp * Math.sin(2 * Math.PI * freq * t);
    }
    return out;
}
// Two-tone ding (received)
function generateReceivedSamples(sampleRate) {
    const dur = 0.26;
    const n = Math.floor(sampleRate * dur);
    const out = new Float32Array(n);
    const note = (freq, start, vol) => {
        for (let i = 0; i < n; i++) {
            const t = i / sampleRate - start;
            if (t < 0)
                continue;
            const amp = vol * Math.exp(-t * 18);
            out[i] += amp * Math.sin(2 * Math.PI * freq * t);
        }
    };
    note(988, 0, 0.1); // B5
    note(880, 0.065, 0.085); // A5
    return out;
}
const SAMPLE_RATE = 22050;
const wavCache = {};
async function getWavUri(type) {
    if (wavCache[type])
        return wavCache[type];
    const [fs] = await Promise.all([loadExpoFileSystem()]);
    const cacheDir = fs.cacheDirectory ?? "";
    const uri = `${cacheDir}chatropic-${type}.wav`;
    const samples = type === "sent"
        ? generateSentSamples(SAMPLE_RATE)
        : generateReceivedSamples(SAMPLE_RATE);
    const wav = buildWav(samples, SAMPLE_RATE);
    await fs.writeAsStringAsync(uri, bytesToBase64(wav), {
        encoding: fs.EncodingType.Base64,
    });
    wavCache[type] = uri;
    return uri;
}
async function playSound(type) {
    const [audio, uri] = await Promise.all([loadExpoAudio(), getWavUri(type)]);
    const player = audio.createAudioPlayer(uri, { keepAudioSessionActive: false });
    player.play();
    player.addListener("playbackStatusUpdate", (status) => {
        if (status.didJustFinish)
            player.remove();
    });
}
export function playSentSound() {
    void playSound("sent").catch(() => { });
}
export function playReceivedSound() {
    void playSound("received").catch(() => { });
}
