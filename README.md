# Chatropic React Native SDK

Add a Chatropic support widget to React Native iOS and Android apps.

The SDK loads your deployed widget configuration from Chatropic, renders chat UI, streams agent replies, restores unresolved conversations locally, and can open app routes from agent-provided navigation cards.

## Install

```bash
npm install @chatropic/react-native
```

Peer dependencies:

- `react >= 18`
- `react-native >= 0.73`

Optional packages:

- `@react-native-async-storage/async-storage` for persistent local chat history
- `expo-audio` and `expo-file-system` for voice
- `expo-linear-gradient` for gradient accents
- `react-native-safe-area-context` for native safe area handling
- `react-native-svg` for the Chatropic mark and inline icons

## Basic Usage

Use the publishable key from your Chatropic mobile widget deployment.

```tsx
import { ChatWidgetLauncher } from "@chatropic/react-native";

export function App() {
  return (
    <>
      {/* Your app UI */}
      <ChatWidgetLauncher
        publishableKey="cpk_live_..."
        onNavigate={(path) => {
          // Connect to your navigation stack.
        }}
      />
    </>
  );
}
```

## Full-Screen Chat

```tsx
import { ChatWidgetScreen } from "@chatropic/react-native";

export function SupportScreen({ user }) {
  return (
    <ChatWidgetScreen
      publishableKey="cpk_live_..."
      endUserId={user.id}
      userName={user.name}
      userEmail={user.email}
      onBack={() => navigation.goBack()}
      onNavigate={(path) => navigation.navigate(path)}
    />
  );
}
```

## Configuration

| Prop | Required | Description |
|------|----------|-------------|
| `publishableKey` | Yes | Mobile/widget publishable key from Chatropic |
| `profile` | No | `"mobile"`, `"chat"`, or `"saas"` |
| `theme` | No | `"light"` or `"dark"` override |
| `onNavigate` | No | Called when an agent returns a navigation card |
| `onUserMessage` | No | Callback when the user sends a message |
| `onAgentDone` | No | Callback when the agent completes a turn |

## Local History

Unresolved conversations persist automatically after the user sends a message. You do not pass a storage adapter. When `@react-native-async-storage/async-storage` is linked, the SDK uses native storage; otherwise it falls back to in-memory history for the current runtime.

The header menu opens **Recent chats**, with conversation titles, dates, resume, and **Start a new chat**. The default storage keeps the latest 30 conversations, scoped by tenant, product, profile, and end user. Starting a new chat or resolving the active conversation clears the active-session pointer while retaining history. Resuming checks the server status before accepting new messages.

Custom `ChatStorage` adapters can implement optional `list(scope)` and `clearCurrent(scope)` methods. Existing adapters still work, showing their current cached conversation; `clear(scope)` on the built-in adapter removes both the current session and its history. Session navigation is available when the SDK owns session IDs or the host supplies `onSessionRotate` alongside a fixed `sessionId`.

Both native entry points use the Chat widget conversation UI: inline attachment/input/voice controls, image drafts above the privacy notice, and branding below the composer. The `profile` selects backend configuration; it does not switch the native interface to a SaaS welcome screen.

## API Host

The SDK does not include a default API host. Select a build environment and provide the matching generated URL before packaging the SDK.

For production packages:

```bash
CHATROPIC_SDK_PRODUCTION_AGENT_URL=https://app.chatropic.com npm run build:production
```

For SDK development builds:

```bash
CHATROPIC_GENERATED_DEVELOPMENT_AGENT_URL=https://dev-api.example.com npm run build:development
```

The development endpoint writer also accepts `CHATROPIC_SDK_DEVELOPMENT_AGENT_URL` for local SDK workflows.

## Signed-In Users

Signed-in apps can pass user context so Chatropic can associate conversations with known app users and forward the user id into configured action templates.

| Prop | Description |
|------|-------------|
| `endUserId` | Stable signed-in app user id |
| `userName` | Visitor display name for inbox/chat logs |
| `userEmail` | Visitor email for inbox/chat logs |

```tsx
<ChatWidgetScreen
  publishableKey="cpk_live_..."
  endUserId={user.id}
  userName={user.name}
  userEmail={user.email}
/>
```

## Navigation Cards

When the agent returns a navigation card, the SDK calls `onNavigate(path)`.

```tsx
<ChatWidgetLauncher
  publishableKey="cpk_live_..."
  onNavigate={(path) => {
    if (path.startsWith("/orders")) {
      navigation.navigate("Orders");
    }
  }}
/>
```

## Image uploads

The composer supports camera and photo-library images when the backend enables private R2 uploads. Install the matching Expo modules, configure camera/photo permission descriptions in the `expo-image-picker` plugin, and rebuild the native app:

```bash
npx expo install expo-image-picker expo-crypto
```

Send up to four images (5 MiB each), with or without text. Drafts show upload progress, retry and remove controls. Sent images support enlarged previews and follow-up questions for 30 days. Images are not added to the agent's knowledge base.

For a custom picker, pass `imagePicker` to `ChatWidgetScreen` or `ChatWidgetLauncher`. It receives `"camera"` or `"library"` and returns `{ uri, name, type, size? }[]`; return an empty array when cancelled. Secure random generation requires `expo-crypto` or `crypto.getRandomValues`. Attachment grants use separate native storage; `configureImageGrantStorage(storage)` allows a custom `KeyValueStorage`. Preserve grants for restored image history and never put them in analytics or transcripts.

## Voice

Voice is optional and requires compatible native audio modules. Install the optional voice dependencies and ensure microphone permissions are configured in your iOS and Android app.

```bash
npm install expo-audio expo-file-system
```

## Legacy Tenant ID Support

Older integrations may still pass `tenantId`. New mobile apps should use `publishableKey` so the SDK does not expose workspace identifiers in app code.

## License

MIT
