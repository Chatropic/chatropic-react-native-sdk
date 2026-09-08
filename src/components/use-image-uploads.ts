import { useEffect, useRef, useState } from "react";
import { useChatWidget } from "../provider/ChatWidgetProvider";
import { expoImagePicker, imageConfig, recoverPickedImages, removeDraftImage, secureImageGrant, uploadImage,
  type ChatAttachment, type PickedImage } from "../client/image-attachments";
export interface NativeImageDraft { key: string; grant: string; file: PickedImage; progress: number; image?: ChatAttachment; error?: string }
export function useImageUploads() {
  const { agentUrl, apiKey, sessionId, imagePicker, sendMessage } = useChatWidget();
  const [drafts, setDrafts] = useState<NativeImageDraft[]>([]);
  const [enabled, setEnabled] = useState(false); const [error, setError] = useState(""); const [picking, setPicking] = useState(false);
  const aborts = useRef(new Map<string, () => void>());
  const session = useRef(sessionId); session.current = sessionId;
  const live = useRef(true);
  useEffect(() => {
    let active = true;
    imageConfig(agentUrl, apiKey).then(c => { if (active) setEnabled(c.enabled); }).catch(() => {});
    return () => { active = false; };
  }, [agentUrl, apiKey]);
  useEffect(() => {
    live.current = true; setDrafts([]);
    const running = aborts.current;
    return () => { live.current = false; running.forEach(abort => abort()); running.clear(); };
  }, [sessionId]);
  const upload = async (d: NativeImageDraft) => {
    const sid = sessionId;
    const patch = (p: Partial<NativeImageDraft>) => { if (live.current && session.current === sid) setDrafts(ds => ds.map(row => row.key === d.key ? { ...row, ...p } : row)); };
    patch({ error: undefined, progress: 0 });
    const op = uploadImage(agentUrl, apiKey || "", sid, d.file, d.grant, d.key, n => patch({ progress: n }));
    aborts.current.set(d.key, op.abort);
    try { patch({ image: await op.promise, progress: 100 }); }
    catch (e) { patch({ error: e instanceof Error ? e.message : "Upload failed" }); }
    finally { aborts.current.delete(d.key); }
  };
  const add = async (files: PickedImage[]) => {
    const sid = sessionId;
    if (files.length + drafts.length > 4) setError("Attach up to 4 images per message.");
    const rows: NativeImageDraft[] = [];
    for (const file of files.slice(0, Math.max(0, 4 - drafts.length))) {
      if (file.size && file.size > 5 * 1024 * 1024) { setError("Each image must be smaller than 5 MiB."); continue; }
      const grant = await secureImageGrant(); rows.push({ key: grant.slice(0, 32), grant, file, progress: 0 });
    }
    if (!live.current || session.current !== sid) return;
    setDrafts(ds => [...ds, ...rows]); rows.forEach(d => void upload(d));
  };
  useEffect(() => {
    if (enabled && !imagePicker) void recoverPickedImages().then(files => files.length ? add(files) : undefined).catch(() => {});
  }, [enabled]);
  return { drafts, enabled, error, picking, ready: drafts.every(d => d.image && !d.error),
    pick: async (source: "camera" | "library") => {
      if (picking || !enabled) return;
      setPicking(true); setError("");
      try { await add(await (imagePicker || expoImagePicker)(source)); }
      catch (e) { setError(e instanceof Error ? e.message : "Unable to open photos"); }
      finally { if (live.current) setPicking(false); }
    },
    retry: upload,
    remove: (d: NativeImageDraft) => { aborts.current.get(d.key)?.(); setDrafts(ds => ds.filter(row => row.key !== d.key)); if (d.image) void removeDraftImage(agentUrl, apiKey, d.image).catch(() => {}); },
    send: (text: string) => sendMessage(text, { attachments: drafts.flatMap(d => d.image ? [d.image] : []), onSuccess: () => { setDrafts([]); setError(""); } }),
  };
}
