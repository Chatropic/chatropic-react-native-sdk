import type { KeyValueStorage } from "../storage/types";
import { createMemoryKeyValueStorage } from "../storage/create-chat-storage";
import { getImageGrantStorage } from "../storage/internal-chat-storage";

export interface ChatAttachment { id: string; filename: string; mime_type: string; size_bytes: number; width: number; height: number; expires_at: string; status: string }
export interface AttachmentRef { id: string; grant: string }
export interface PickedImage { uri: string; name: string; type: string; size?: number }
export type ImagePicker = (source: "camera" | "library") => Promise<PickedImage[]>;
const fallback = createMemoryKeyValueStorage();
let grantStorage: KeyValueStorage | undefined;
export function configureImageGrantStorage(storage: KeyValueStorage) { grantStorage = storage; }
const store = () => grantStorage ?? getImageGrantStorage() ?? fallback;
export async function attachmentRefs(images: ChatAttachment[] = []): Promise<AttachmentRef[]> {
  const values = await Promise.all(images.map(async a => ({ id: a.id, grant: await store().getItem(`image-grant:${a.id}`) || "" })));
  return values.filter(a => a.grant);
}
export async function secureImageGrant(): Promise<string> {
  let bytes: Uint8Array;
  if (typeof crypto !== "undefined" && crypto.getRandomValues) bytes = crypto.getRandomValues(new Uint8Array(32));
  else {
    try { bytes = await require("expo-crypto").getRandomBytesAsync(32); }
    catch { throw new Error("Install expo-crypto or a secure crypto.getRandomValues polyfill to upload images."); }
  }
  return Array.from(bytes, b => b.toString(16).padStart(2, "0")).join("");
}
export const expoImagePicker: ImagePicker = async source => {
  let picker: any;
  try { picker = require("expo-image-picker"); }
  catch { throw new Error("Install expo-image-picker or provide an imagePicker adapter."); }
  if (source === "camera") {
    const permission = await picker.requestCameraPermissionsAsync();
    if (!permission.granted) throw new Error("Camera access is denied. Allow it in Settings or choose a photo.");
  }
  const options = { mediaTypes: ["images"], quality: 0.85, allowsMultipleSelection: source === "library", selectionLimit: 4 };
  const result = source === "camera" ? await picker.launchCameraAsync(options) : await picker.launchImageLibraryAsync(options);
  return pickedAssets(result);
};
function pickedAssets(result: any): PickedImage[] {
  return result?.canceled ? [] : (result?.assets ?? []).map((a: any) => ({ uri: a.uri, name: a.fileName || "Photo.jpg", type: a.mimeType || "image/jpeg", size: a.fileSize }));
}
export async function recoverPickedImages(): Promise<PickedImage[]> {
  try { return pickedAssets(await require("expo-image-picker").getPendingResultAsync()); } catch { return []; }
}
async function checked(response: Response) {
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || "Image request failed");
  return data;
}
export async function imageConfig(base: string, key?: string) {
  if (!key) return { enabled: false };
  return checked(await fetch(`${base}/attachments/config`, { headers: { Authorization: `Bearer ${key}` } }));
}
export function uploadImage(base: string, apiKey: string, sessionId: string, file: PickedImage, grant: string, key: string,
                            onProgress: (n: number) => void): { promise: Promise<ChatAttachment>; abort: () => void } {
  const xhr = new XMLHttpRequest();
  const promise = new Promise<ChatAttachment>((resolve, reject) => {
    if (file.size && file.size > 5 * 1024 * 1024) { reject(new Error("Images must be smaller than 5 MiB")); return; }
    xhr.open("POST", `${base}/attachments`); xhr.timeout = 60000;
    xhr.setRequestHeader("Authorization", `Bearer ${apiKey}`);
    xhr.setRequestHeader("X-Attachment-Grant", grant); xhr.setRequestHeader("Idempotency-Key", key);
    xhr.upload.onprogress = e => { if (e.lengthComputable) onProgress(Math.round(e.loaded / e.total * 95)); };
    xhr.onerror = xhr.ontimeout = xhr.onabort = () => reject(new Error("Upload interrupted. Retry or remove the image."));
    xhr.onload = async () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status < 200 || xhr.status >= 300) throw new Error(data.detail || "Upload failed");
        await store().setItem(`image-grant:${data.id}`, grant); resolve(data);
      } catch (e) { reject(e); }
    };
    const body = new FormData(); body.append("file", file as unknown as Blob);
    body.append("session_id", sessionId); body.append("product_id", "customer_support"); xhr.send(body);
  });
  return { promise, abort: () => xhr.abort() };
}
export async function imagePreview(base: string, key: string | undefined, image: ChatAttachment, thumbnail = true): Promise<string> {
  if (Date.parse(image.expires_at) <= Date.now()) throw new Error("Image expired");
  const grant = await store().getItem(`image-grant:${image.id}`) || "";
  const data = await checked(await fetch(`${base}/attachments/${image.id}/preview?thumbnail=${thumbnail}`, { headers: { Authorization: `Bearer ${key || ""}`, "X-Attachment-Grant": grant } }));
  return data.url;
}
export async function removeDraftImage(base: string, key: string | undefined, image: ChatAttachment) {
  const grant = await store().getItem(`image-grant:${image.id}`) || "";
  await fetch(`${base}/attachments/${image.id}`, { method: "DELETE", headers: { Authorization: `Bearer ${key || ""}`, "X-Attachment-Grant": grant } });
}
