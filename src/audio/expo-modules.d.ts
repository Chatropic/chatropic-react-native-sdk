declare module "expo-audio" {
  export function createAudioPlayer(source: string | null): {
    replace(source: string): void;
    play(): void;
    pause(): void;
    remove(): void;
  };
  export function requestRecordingPermissionsAsync(): Promise<{ granted: boolean }>;
  export function setAudioModeAsync(mode: {
    playsInSilentMode?: boolean;
    allowsRecording?: boolean;
    interruptionMode?: string;
    shouldRouteThroughEarpiece?: boolean;
  }): Promise<void>;
  export const AudioModule: {
    AudioStream: new (options: {
      sampleRate: number;
      channels: number;
      encoding: string;
    }) => {
      start(): Promise<void>;
      stop(): void;
      addListener(
        event: string,
        listener: (payload: unknown) => void,
      ): { remove(): void };
    };
  };
}

declare module "expo-file-system/legacy" {
  export const cacheDirectory: string | null;
  export enum EncodingType {
    Base64 = "base64",
  }
  export function writeAsStringAsync(
    fileUri: string,
    contents: string,
    options: { encoding: EncodingType | string },
  ): Promise<void>;
}
