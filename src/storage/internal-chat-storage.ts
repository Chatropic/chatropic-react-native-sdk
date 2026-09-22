import { NativeModules } from "react-native";
import {
  createChatStorage,
  createMemoryKeyValueStorage,
  createResilientKeyValueStorage,
} from "./create-chat-storage";
import type { ChatStorage, KeyValueStorage } from "./types";

let sharedStorage: ChatStorage | null = null;

type AsyncStorageNativeModule = {
  multiGet?: (
    keys: string[],
    callback: (errors?: unknown, result?: Array<[string, string | null]>) => void,
  ) => void;
  multiSet?: (
    entries: Array<[string, string]>,
    callback: (errors?: unknown) => void,
  ) => void;
  multiRemove?: (keys: string[], callback: (errors?: unknown) => void) => void;
};

function nativeAsyncStorage(): AsyncStorageNativeModule | null {
  const modules = NativeModules as Record<string, AsyncStorageNativeModule | undefined>;
  const storage = modules.RNCAsyncStorage ?? modules.AsyncSQLiteDBStorage;
  if (
    storage &&
    typeof storage.multiGet === "function" &&
    typeof storage.multiSet === "function" &&
    typeof storage.multiRemove === "function"
  ) {
    return storage;
  }
  return null;
}

function createNativeAsyncStorage(): KeyValueStorage | null {
  const storage = nativeAsyncStorage();
  if (!storage?.multiGet || !storage.multiSet || !storage.multiRemove) return null;

  return {
    getItem(key) {
      return new Promise((resolve, reject) => {
        storage.multiGet!([key], (errors, result) => {
          if (errors) {
            reject(errors);
            return;
          }
          resolve(result?.[0]?.[1] ?? null);
        });
      });
    },
    setItem(key, value) {
      return new Promise((resolve, reject) => {
        storage.multiSet!([[key, value]], (errors) => {
          if (errors) {
            reject(errors);
            return;
          }
          resolve();
        });
      });
    },
    removeItem(key) {
      return new Promise((resolve, reject) => {
        storage.multiRemove!([key], (errors) => {
          if (errors) {
            reject(errors);
            return;
          }
          resolve();
        });
      });
    },
  };
}

export function getInternalChatStorage(): ChatStorage {
  if (!sharedStorage) {
    const fallback = createMemoryKeyValueStorage();
    sharedStorage = createChatStorage(
      createResilientKeyValueStorage(createNativeAsyncStorage() ?? fallback, fallback),
    );
  }
  return sharedStorage;
}

let imageGrantStorage: KeyValueStorage | undefined;
export function getImageGrantStorage(): KeyValueStorage {
  if (!imageGrantStorage) imageGrantStorage = createResilientKeyValueStorage(createNativeAsyncStorage() ?? createMemoryKeyValueStorage());
  return imageGrantStorage;
}
