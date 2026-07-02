# Chatropic React Native SDK

Add a Chatropic support widget to React Native iOS and Android apps.

The SDK loads your deployed widget configuration from Chatropic, renders chat UI, streams agent replies, supports optional local chat history, and can open app routes from agent-provided navigation cards.

## Install

```bash
npm install @chatropic/react-native
```

Peer dependencies:

- `react >= 18`
- `react-native >= 0.73`

Optional packages:

- `@react-native-async-storage/async-storage` for local chat history
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

## API Host

The SDK includes the Chatropic production host. You do not need to configure an API host in your app.

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

## Voice

Voice is optional and requires compatible native audio modules. Install the optional voice dependencies and ensure microphone permissions are configured in your iOS and Android app.

```bash
npm install expo-audio expo-file-system
```

## Legacy Tenant ID Support

Older integrations may still pass `tenantId`. New mobile apps should use `publishableKey` so the SDK does not expose workspace identifiers in app code.

## License

MIT
