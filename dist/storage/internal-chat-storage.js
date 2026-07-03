import { NativeModules } from "react-native";
import { createChatStorage, createMemoryKeyValueStorage, createResilientKeyValueStorage, } from "./create-chat-storage";
let sharedStorage = null;
function nativeAsyncStorage() {
    const modules = NativeModules;
    const storage = modules.RNCAsyncStorage ?? modules.AsyncSQLiteDBStorage;
    if (storage &&
        typeof storage.multiGet === "function" &&
        typeof storage.multiSet === "function" &&
        typeof storage.multiRemove === "function") {
        return storage;
    }
    return null;
}
function createNativeAsyncStorage() {
    const storage = nativeAsyncStorage();
    if (!storage?.multiGet || !storage.multiSet || !storage.multiRemove)
        return null;
    return {
        getItem(key) {
            return new Promise((resolve, reject) => {
                storage.multiGet([key], (errors, result) => {
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
                storage.multiSet([[key, value]], (errors) => {
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
                storage.multiRemove([key], (errors) => {
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
export function getInternalChatStorage() {
    if (!sharedStorage) {
        const fallback = createMemoryKeyValueStorage();
        sharedStorage = createChatStorage(createResilientKeyValueStorage(createNativeAsyncStorage() ?? fallback, fallback));
    }
    return sharedStorage;
}
