export type AudioStatusLike = {
  didJustFinish: boolean;
  error: string | null;
};

type AudioPlayerOptions = {
  updateInterval?: number;
  keepAudioSessionActive?: boolean;
};

type AudioPlayerLike = {
  replace(source: string): void;
  play(): void;
  pause(): void;
  remove(): void;
  addListener(
    event: string,
    listener: (status: AudioStatusLike) => void,
  ): { remove(): void };
};

type ExpoAudioModule = {
  createAudioPlayer: (
    source: string | null,
    options?: AudioPlayerOptions,
  ) => AudioPlayerLike;
  requestRecordingPermissionsAsync: () => Promise<{ granted: boolean }>;
  setAudioModeAsync: (mode: {
    playsInSilentMode?: boolean;
    allowsRecording?: boolean;
    interruptionMode?: string;
    shouldRouteThroughEarpiece?: boolean;
  }) => Promise<void>;
  AudioModule: {
    AudioStream: new (options: {
      sampleRate: number;
      channels: number;
      encoding: string;
    }) => {
      id: string;
      sampleRate: number;
      start(): Promise<void>;
      stop(): void;
      addListener(
        event: string,
        listener: (payload: unknown) => void,
      ): { remove(): void };
    };
  };
};

type ExpoFileSystemModule = {
  cacheDirectory: string | null;
  writeAsStringAsync: (
    fileUri: string,
    contents: string,
    options: { encoding: string },
  ) => Promise<void>;
  EncodingType: { Base64: string };
};

let expoAudioPromise: Promise<ExpoAudioModule> | null = null;
let expoFileSystemPromise: Promise<ExpoFileSystemModule> | null = null;

export async function loadExpoAudio(): Promise<ExpoAudioModule> {
  if (!expoAudioPromise) {
    expoAudioPromise = import("expo-audio") as unknown as Promise<ExpoAudioModule>;
  }
  return expoAudioPromise;
}

export async function loadExpoFileSystem(): Promise<ExpoFileSystemModule> {
  if (!expoFileSystemPromise) {
    expoFileSystemPromise = import(
      "expo-file-system/legacy"
    ) as Promise<ExpoFileSystemModule>;
  }
  return expoFileSystemPromise;
}

export type { AudioPlayerLike };
