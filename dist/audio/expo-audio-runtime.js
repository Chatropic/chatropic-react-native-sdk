let expoAudioPromise = null;
let expoFileSystemPromise = null;
export async function loadExpoAudio() {
    if (!expoAudioPromise) {
        expoAudioPromise = import("expo-audio");
    }
    return expoAudioPromise;
}
export async function loadExpoFileSystem() {
    if (!expoFileSystemPromise) {
        expoFileSystemPromise = import("expo-file-system/legacy");
    }
    return expoFileSystemPromise;
}
