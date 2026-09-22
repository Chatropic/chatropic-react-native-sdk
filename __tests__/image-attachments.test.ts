jest.mock("react-native", () => ({ NativeModules: {} }), { virtual: true });
import { attachmentRefs, configureImageGrantStorage, imagePreview } from "../src/client/image-attachments";
import { createMemoryKeyValueStorage } from "../src/storage/create-chat-storage";
import { serverMessagesToTurns } from "../src/client/conversation-messages";
const image = { id: "a1", filename: "photo.jpg", mime_type: "image/jpeg", size_bytes: 10,
  width: 10, height: 10, status: "attached", expires_at: "2099-01-01" };

test("image-only history survives reload without serializing its grant", async () => {
  const storage = createMemoryKeyValueStorage();
  configureImageGrantStorage(storage);
  await storage.setItem("image-grant:a1", "secret");
  const turns = serverMessagesToTurns([{ id: "m1", role: "user", body: "", attachments: [image] }], "Welcome");
  expect(turns).toHaveLength(1);
  expect(JSON.stringify(turns)).not.toContain("secret");
  expect(await attachmentRefs(turns[0].attachments)).toEqual([{ id: "a1", grant: "secret" }]);
});

test("expired image does not request a preview URL", async () => {
  await expect(imagePreview("https://test", "pk_test", { ...image, expires_at: "2000-01-01" })).rejects.toThrow("expired");
});
