import React, { useEffect, useState } from "react";
import { Image, Modal, Pressable, Text, View } from "react-native";
import { imagePreview, type ChatAttachment } from "../client/image-attachments";
import { useChatWidget } from "../provider/ChatWidgetProvider";

function Attachment({ image }: { image: ChatAttachment }) {
  const { agentUrl, apiKey, colorScheme } = useChatWidget();
  const [full, setFull] = useState("");
  const [url, setUrl] = useState(""); const [error, setError] = useState(""); const [open, setOpen] = useState(false);
  const foreground = colorScheme === "dark" ? "#fff" : "#18181b";
  useEffect(() => {
    let active = true;
    const refresh = () => imagePreview(agentUrl, apiKey, image).then(u => { if (active) { setUrl(u); setError(""); } }).catch(e => { if (active) { setError(e.message); setUrl(""); } });
    void refresh(); const timer = setInterval(() => void refresh(), 240000);
    return () => { active = false; clearInterval(timer); };
  }, [image.id, image.expires_at, apiKey, agentUrl]);
  const expand = async () => {
    setOpen(true); setFull("");
    try { setFull(await imagePreview(agentUrl, apiKey, image, false)); }
    catch (e) { setError(e instanceof Error ? e.message : "Image unavailable"); }
  };
  return <>
    <Pressable accessibilityLabel={`View ${image.filename}`} onPress={() => void expand()} disabled={!url} style={{ padding: 4 }}>
      {url ? <Image source={{ uri: url }} accessibilityLabel={image.filename} style={{ width: 150, height: 120, borderRadius: 12 }} resizeMode="cover" /> : <Text style={{ color: foreground }}>{error || "Loading image…"}</Text>}
    </Pressable>
    <Modal visible={open} transparent onRequestClose={() => setOpen(false)}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,.92)", padding: 24, justifyContent: "center" }}>
        <Pressable accessibilityLabel="Close image" onPress={() => setOpen(false)} style={{ padding: 20 }}><Text style={{ color: "white" }}>Close</Text></Pressable>
        {full ? <Image source={{ uri: full }} style={{ width: "100%", height: "70%" }} resizeMode="contain" accessibilityLabel={image.filename} /> : <Text style={{ color: "white" }}>{error || "Loading image…"}</Text>}
      </View>
    </Modal>
  </>;
}
export function ImageAttachments({ images = [] }: { images?: ChatAttachment[] }) {
  return <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "flex-end" }}>{images.map(a => <Attachment key={a.id} image={a} />)}</View>;
}
