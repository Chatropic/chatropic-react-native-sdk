import { attachmentRefs, type ChatAttachment, type ImagePicker } from "../client/image-attachments";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  extractAgentDisplayText,
  fetchPublicAppConfig,
  mapUiRender,
  resolveTurnUiFromDoneData,
  streamChat,
  suggestedRepliesFromDoneData,
} from "../client/stream-chat";
import {
  VoiceClient,
  type VoiceAgentState,
  type VoiceTranscriptLine,
} from "../client/voice-client";
import { fetchSessionConversationMessages, serverMessagesToTurns } from "../client/conversation-messages";
import {
  playSentSound,
  playReceivedSound,
} from "../audio/message-sounds";
import type {
  AgentHistoryMessage,
  AgentStreamEvent,
  ChatWidgetProps,
  ColorScheme,
  Turn,
  TurnUI,
  WidgetConfig,
} from "../types";
import {
  applyThemeToWidgetConfig,
  resolveWidgetColorScheme,
} from "../theme/resolve-colors";
import {
  createChatSessionId,
  createTurnId,
  mergeWidgetConfig,
} from "../utils/session";
import { getDefaultAgentUrl } from "../config/environment";
import { getInternalChatStorage } from "../storage/internal-chat-storage";
import type { CachedChatSession, ChatHistoryScope } from "../storage/types";

function turnsToAgentHistory(turns: Turn[]): AgentHistoryMessage[] {
  const rows: AgentHistoryMessage[] = [];
  for (const turn of turns) {
    if (turn.id === "welcome" || turn.running) continue;
    const text = turn.text?.trim();
    if (!text) continue;
    if (turn.role === "user") rows.push({ role: "user", content: text });
    if (turn.role === "agent") rows.push({ role: "assistant", content: text });
  }
  return rows;
}

interface ChatWidgetContextValue {
  imagePicker?: ImagePicker;
  config: WidgetConfig;
  colorScheme: ColorScheme;
  turns: Turn[];
  input: string;
  setInput: (v: string) => void;
  sendMessage: (
    text?: string,
    options?: { displayText?: string; attachments?: ChatAttachment[]; onSuccess?: () => void },
  ) => void;
  resetChat: () => void;
  recentChats: CachedChatSession[];
  refreshRecentChats: () => Promise<void>;
  resumeChat: (chat: CachedChatSession, signal?: AbortSignal) => Promise<void>;
  canChangeSession: boolean;
  privacyDismissed: boolean;
  dismissPrivacy: () => void;
  inputLocked: boolean;
  loading: boolean;
  error: string | null;
  onNavigate?: (path: string) => void;
  voiceActive: boolean;
  voiceState: VoiceAgentState;
  voiceTranscript: VoiceTranscriptLine[];
  voiceError: string | null;
  toggleVoiceSession: () => void;
  endVoiceSession: () => void;
  sessionId: string;
  conversationResolved: boolean;
  sessionHandoffNotice: string | null;
  agentUrl: string;
  tenantId?: string;
  apiKey?: string;
  productId: string;
}

const ChatWidgetContext = createContext<ChatWidgetContextValue | null>(null);

export function useChatWidget(): ChatWidgetContextValue {
  const ctx = useContext(ChatWidgetContext);
  if (!ctx) {
    throw new Error("useChatWidget must be used within ChatWidgetProvider");
  }
  return ctx;
}

function welcomeTurn(welcome: string): Turn {
  return {
    id: createTurnId("a"),
    role: "agent",
    text: welcome,
    running: false,
    createdAt: Date.now(),
  };
}

const RESOLVED_SESSION_MESSAGE =
  "This conversation was closed. Send a new message to continue.";

function hasUserTurn(turns: Turn[]): boolean {
  return turns.some((turn) => turn.role === "user");
}

export interface ChatWidgetProviderProps extends ChatWidgetProps {
  children: ReactNode;
  presentation?: "launcher" | "fullscreen";
  sessionHandoffNotice?: string | null;
}

export function ChatWidgetProvider({
  children,
  imagePicker,
  tenantId,
  publishableKey,
  profile = "chat",
  sessionId: fixedSessionId,
  endUserId,
  userName,
  userEmail,
  storage,
  theme,
  onNavigate,
  onUserMessage,
  onAgentDone,
  onSessionRotate,
  sessionHandoffNotice = null,
}: ChatWidgetProviderProps) {
  const runtimeApiKey = publishableKey;
  const agentUrl = getDefaultAgentUrl();
  const productId = "customer_support";
  const [serverConfig, setServerConfig] = useState<Partial<WidgetConfig>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [recentChats, setRecentChats] = useState<CachedChatSession[]>([]);
  const [input, setInput] = useState("");
  const [privacyDismissed, setPrivacyDismissed] = useState(false);
  const [inputLocked, setInputLocked] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceAgentState>("idle");
  const [voiceTranscript, setVoiceTranscript] = useState<VoiceTranscriptLine[]>(
    [],
  );
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [conversationResolved, setConversationResolved] = useState(false);
  const [storageHydrated, setStorageHydrated] = useState(false);
  const sessionIdRef = useRef(fixedSessionId ?? createChatSessionId("rn"));
  const chatStorage = useMemo(() => storage ?? getInternalChatStorage(), [storage]);
  const abortRef = useRef<(() => void) | null>(null);
  const pendingSendTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const voiceClientRef = useRef<VoiceClient | null>(null);
  const voiceUserTurnRef = useRef<string | null>(null);
  const voiceAgentTurnRef = useRef<string | null>(null);
  const initializedRef = useRef(false);
  const welcomeMessageRef = useRef("");
  const inputLockedRef = useRef(false);
  const conversationResolvedRef = useRef(false);
  const lastLoadedScopeRef = useRef<string | null>(null);

  const storageScope = useMemo<ChatHistoryScope>(
    () => ({
      tenantId: tenantId?.trim() || runtimeApiKey?.trim() || "anonymous",
      productId,
      profile,
      endUserId,
    }),
    [tenantId, runtimeApiKey, productId, profile, endUserId],
  );

  const storageScopeKey = useMemo(
    () =>
      [
        storageScope.tenantId,
        storageScope.productId,
        storageScope.profile ?? "chat",
        storageScope.endUserId?.trim() || "anon",
      ].join("\u001f"),
    [storageScope],
  );

  const activeScopeRef = useRef(storageScopeKey);
  activeScopeRef.current = storageScopeKey;
  const canChangeSession = fixedSessionId === undefined || Boolean(onSessionRotate);
  const refreshRecentChats = useCallback(async () => {
    const scope = storageScopeKey;
    const rows = chatStorage.list
      ? await chatStorage.list(storageScope)
      : [await chatStorage.load(storageScope)].filter((row): row is CachedChatSession => Boolean(row));
    if (activeScopeRef.current === scope) setRecentChats(rows.filter(row => hasUserTurn(row.turns)));
  }, [chatStorage, storageScope, storageScopeKey]);

  useEffect(() => { setRecentChats([]); }, [storageScopeKey]);

  const rotateSession = useCallback(() => {
    const nextSessionId = createChatSessionId("rn");
    sessionIdRef.current = nextSessionId;
    onSessionRotate?.(nextSessionId);
    return nextSessionId;
  }, [onSessionRotate]);

  const beginFreshSession = useCallback(() => {
    const nextSessionId = rotateSession();
    setConversationResolved(false);
    setInputLocked(false);
    return nextSessionId;
  }, [rotateSession]);

  const handleResolvedSession = useCallback(() => {
    beginFreshSession();
    const welcomeMessage = welcomeMessageRef.current;
    setTurns(welcomeMessage ? [welcomeTurn(welcomeMessage)] : []);
    initializedRef.current = true;
  }, [beginFreshSession]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

      fetchPublicAppConfig(tenantId, agentUrl, profile, runtimeApiKey)
      .then((app) => {
        if (cancelled) return;
        setServerConfig(app.config);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setError(err.message || "Failed to load widget config");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [tenantId, agentUrl, profile, runtimeApiKey]);

  const baseConfig = useMemo(
    () =>
      mergeWidgetConfig({
        ...serverConfig,
        ...(endUserId ? { endUserId } : {}),
        ...(userName ? { userName } : {}),
        ...(userEmail ? { userEmail } : {}),
      }),
    [serverConfig, endUserId, userName, userEmail],
  );

  const colorScheme = useMemo(
    () => resolveWidgetColorScheme(baseConfig, theme),
    [baseConfig, theme],
  );

  const config = useMemo(
    () => applyThemeToWidgetConfig(baseConfig, colorScheme),
    [baseConfig, colorScheme],
  );

  welcomeMessageRef.current = config.welcomeMessage;
  inputLockedRef.current = inputLocked;
  conversationResolvedRef.current = conversationResolved;

  useEffect(() => {
    return () => {
      if (pendingSendTimerRef.current) {
        clearTimeout(pendingSendTimerRef.current);
        pendingSendTimerRef.current = null;
      }
      abortRef.current?.();
      abortRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (fixedSessionId) {
      sessionIdRef.current = fixedSessionId;
      setConversationResolved(false);
    }
  }, [fixedSessionId]);

  useEffect(() => {
    let cancelled = false;
    setStorageHydrated(false);
    setConversationResolved(false);

    chatStorage
      .load(storageScope)
      .then(async (cached) => {
        if (cancelled) return;
        const canRestoreSession =
          !fixedSessionId || cached?.sessionId === fixedSessionId;

        if (cached && canRestoreSession) {
          if (runtimeApiKey?.trim()) {
            try {
              const server = await fetchSessionConversationMessages(
                tenantId,
                cached.sessionId,
                {
                  agentUrl,
                  productId,
                  apiKey: runtimeApiKey,
                  limit: 1,
                },
              );
              if (cancelled) return;
              if (server.resolved) {
                await (chatStorage.clearCurrent ?? chatStorage.clear).call(chatStorage, storageScope);
                if (fixedSessionId) {
                  setConversationResolved(true);
                  setTurns([]);
                  initializedRef.current = false;
                } else {
                  const nextSessionId = createChatSessionId("rn");
                  sessionIdRef.current = nextSessionId;
                  onSessionRotate?.(nextSessionId);
                  setTurns([]);
                  initializedRef.current = false;
                }
                lastLoadedScopeRef.current = storageScopeKey;
                return;
              }
            } catch {
              // Offline or transient status checks should not erase local chat history.
            }
          }
          sessionIdRef.current = cached.sessionId;
          onSessionRotate?.(cached.sessionId);
          setTurns(cached.turns);
          initializedRef.current = cached.turns.length > 0;
        } else {
          const scopeChanged =
            lastLoadedScopeRef.current !== null &&
            lastLoadedScopeRef.current !== storageScopeKey;
          if (fixedSessionId) {
            sessionIdRef.current = fixedSessionId;
          } else if (scopeChanged) {
            const nextSessionId = createChatSessionId("rn");
            sessionIdRef.current = nextSessionId;
            onSessionRotate?.(nextSessionId);
          }
          setTurns([]);
          initializedRef.current = false;
        }

        lastLoadedScopeRef.current = storageScopeKey;
      })
      .catch(() => {
        if (cancelled) return;
        initializedRef.current = false;
      })
      .finally(() => {
        if (!cancelled) setStorageHydrated(true);
      });

    return () => {
      cancelled = true;
    };
  }, [
    fixedSessionId,
    onSessionRotate,
    storageScope,
    storageScopeKey,
    runtimeApiKey,
    tenantId,
    agentUrl,
    productId,
    chatStorage,
  ]);

  useEffect(() => {
    if (loading || !storageHydrated || initializedRef.current) return;
    if (config.welcomeMessage) {
      setTurns([welcomeTurn(config.welcomeMessage)]);
      initializedRef.current = true;
    }
  }, [loading, storageHydrated, config.welcomeMessage]);

  useEffect(() => {
    if (!storageHydrated || lastLoadedScopeRef.current !== storageScopeKey) return;
    if (conversationResolved) {
      void (chatStorage.clearCurrent ?? chatStorage.clear).call(chatStorage, storageScope);
      return;
    }
    if (!hasUserTurn(turns)) return;
    void chatStorage.save(storageScope, {
      sessionId: sessionIdRef.current,
      turns,
      updatedAt: Date.now(),
    }).catch(() => {});
  }, [storageHydrated, conversationResolved, storageScope, storageScopeKey, turns, chatStorage]);

  const appendSingleTurn = useCallback((turn: Turn) => {
    setTurns((prev) => [...prev, turn]);
  }, []);

  const patchTurn = useCallback((turnId: string, patch: (turn: Turn) => Turn) => {
    setTurns((prev) =>
      prev.map((turn) => (turn.id === turnId ? patch(turn) : turn)),
    );
  }, []);

  const endVoiceSession = useCallback(() => {
    void voiceClientRef.current?.disconnect();
    voiceClientRef.current = null;
    voiceAgentTurnRef.current = null;
    voiceUserTurnRef.current = null;
    setVoiceActive(false);
    setVoiceState("idle");
    setVoiceTranscript([]);
    setVoiceError(null);
  }, []);

  const toggleVoiceSession = useCallback(() => {
    if (voiceActive) {
      endVoiceSession();
      return;
    }
    if (!config.showVoice) return;

    setVoiceError(null);
    setVoiceTranscript([]);
    setVoiceActive(true);
    setVoiceState("connecting");

    const finalizeVoiceAgentTurn = (text?: string) => {
      const agentId = voiceAgentTurnRef.current;
      if (!agentId) return;
      patchTurn(agentId, (turn) => ({
        ...turn,
        text: text?.trim() || turn.text || "",
        running: false,
        createdAt: turn.createdAt ?? Date.now(),
      }));
      voiceAgentTurnRef.current = null;
    };

    const client = new VoiceClient({
      onState: (state) => {
        setVoiceState(state);
      },
      onReady: () => setVoiceError(null),
      onError: (message) => {
        setVoiceError(message);
        setVoiceState("error");
      },
      onTranscript: (line) => {
        setVoiceTranscript((prev) => {
          const next = [...prev];
          const idx = next.findIndex((row) => row.role === line.role && !row.final);
          if (idx >= 0) next[idx] = line;
          else next.push(line);
          return next;
        });

        if (line.role === "user") {
          const userTurnId = voiceUserTurnRef.current;
          if (!userTurnId) {
            const newUserId = createTurnId("u");
            voiceUserTurnRef.current = newUserId;
            appendSingleTurn({
              id: newUserId,
              role: "user",
              text: line.text,
              createdAt: Date.now(),
            });
          } else {
            patchTurn(userTurnId, (turn) => ({ ...turn, text: line.text }));
          }
          if (line.final) voiceUserTurnRef.current = null;
          return;
        }

        const agentTurnId = voiceAgentTurnRef.current;
        if (!agentTurnId) {
          const agentId = createTurnId("a");
          voiceAgentTurnRef.current = agentId;
          appendSingleTurn({
            id: agentId,
            role: "agent",
            text: line.text,
            running: !line.final,
            createdAt: Date.now(),
          });
        } else {
          patchTurn(agentTurnId, (turn) => ({
            ...turn,
            text: line.text,
            running: !line.final,
          }));
        }
        if (line.final) finalizeVoiceAgentTurn(line.text);
      },
      onTurnComplete: (text) => finalizeVoiceAgentTurn(text),
      onUiRender: (component, props) => {
        const turnUi = mapUiRender(component, props);
        const agentTurnId = voiceAgentTurnRef.current;
        if (!agentTurnId) {
          const agentId = createTurnId("a");
          voiceAgentTurnRef.current = agentId;
          appendSingleTurn({
            id: agentId,
            role: "agent",
            text: "",
            running: true,
            ui: turnUi,
            createdAt: Date.now(),
          });
        } else {
          patchTurn(agentTurnId, (turn) => ({
            ...turn,
            ui: turnUi,
            running: true,
          }));
        }
      },
    });

    voiceClientRef.current = client;
    void client
      .connect(agentUrl, sessionIdRef.current, tenantId ?? "", {
        publishableKey: runtimeApiKey,
      })
      .catch((err: Error) => {
        setVoiceError(err.message || "Could not start voice session.");
        setVoiceState("error");
        voiceClientRef.current = null;
      });
  }, [
    agentUrl,
    appendSingleTurn,
    config.showVoice,
    endVoiceSession,
    patchTurn,
    tenantId,
    runtimeApiKey,
    voiceActive,
  ]);

  const resetChat = useCallback(() => {
    endVoiceSession();
    if (pendingSendTimerRef.current) {
      clearTimeout(pendingSendTimerRef.current);
      pendingSendTimerRef.current = null;
    }
    abortRef.current?.();
    abortRef.current = null;
    if (fixedSessionId === undefined || onSessionRotate) {
      rotateSession();
    }
    initializedRef.current = false;
    setInput("");
    inputLockedRef.current = false;
    setInputLocked(false);
    setConversationResolved(false);
    setTurns(config.welcomeMessage ? [welcomeTurn(config.welcomeMessage)] : []);
    void (chatStorage.clearCurrent ?? chatStorage.clear).call(chatStorage, storageScope).catch(() => {});
    initializedRef.current = true;
  }, [
    fixedSessionId,
    onSessionRotate,
    rotateSession,
    chatStorage,
    storageScope,
    config.welcomeMessage,
    endVoiceSession,
  ]);

  const resumeChat = useCallback(async (chat: CachedChatSession, signal?: AbortSignal) => {
    if (!canChangeSession || inputLockedRef.current) return;
    const scope = storageScopeKey;
    let restoredTurns = chat.turns;
    let resolved = false;
    if (runtimeApiKey) {
      // Verify status before allowing a cached conversation to accept new messages.
      const server = await fetchSessionConversationMessages(tenantId, chat.sessionId, {
        agentUrl, productId, apiKey: runtimeApiKey,
      });
      resolved = server.resolved;
      if (server.messages.length) restoredTurns = serverMessagesToTurns(server.messages, config.welcomeMessage);
    }
    if (signal?.aborted || activeScopeRef.current !== scope || inputLockedRef.current) return;
    endVoiceSession();
    abortRef.current?.();
    abortRef.current = null;
    if (pendingSendTimerRef.current) clearTimeout(pendingSendTimerRef.current);
    pendingSendTimerRef.current = null;
    sessionIdRef.current = chat.sessionId;
    initializedRef.current = true;
    setInput("");
    setVoiceError(null);
    conversationResolvedRef.current = resolved;
    setConversationResolved(resolved);
    setTurns(restoredTurns);
    onSessionRotate?.(chat.sessionId);
  }, [canChangeSession, storageScopeKey, runtimeApiKey, tenantId, agentUrl, productId, endVoiceSession, onSessionRotate, config.welcomeMessage]);

  const sendMessage = useCallback(
    (text?: string, options?: { displayText?: string; attachments?: ChatAttachment[]; onSuccess?: () => void }) => {
      const message = (text ?? input).trim();
      if ((!message && !options?.attachments?.length) || inputLockedRef.current) return;
      const displayMessage = (options?.displayText ?? message).trim() || message;

      if (conversationResolvedRef.current && !options?.attachments?.length) {
        beginFreshSession();
        const welcomeMessage = welcomeMessageRef.current;
        setTurns(welcomeMessage ? [welcomeTurn(welcomeMessage)] : []);
        initializedRef.current = true;
      }

      if (!options?.attachments?.length) setInput("");
      playSentSound();
      onUserMessage?.(displayMessage);

      const userTurnId = options?.attachments?.length ? `image-${options.attachments[0].id}` : createTurnId("u");
      const userTurnAt = Date.now();
      const userTurn: Turn = {
        id: userTurnId,
        role: "user",
        text: displayMessage,
        attachments: options?.attachments,
        createdAt: userTurnAt,
        localId: userTurnId,
      };

      const agentTurnId = createTurnId("a");
      const agentTurn: Turn = {
        id: agentTurnId,
        role: "agent",
        text: "",
        running: true,
        // +1 ensures agent turn always sorts after the paired user turn regardless of clock skew
        createdAt: userTurnAt + 1,
        localId: agentTurnId,
      };

      setTurns((prev) => [...prev.filter(t => t.id !== userTurn.id), userTurn, agentTurn]);
      inputLockedRef.current = true;
      setInputLocked(true);

      let failed = false;
      let accumulated = "";
      let turnUi: TurnUI | null = null;

      const updateAgentTurn = (patch: Partial<Turn>) => {
        setTurns((prev) =>
          prev.map((t) => (t.id === agentTurnId ? { ...t, ...patch } : t)),
        );
      };

      const handleEvent = (ev: AgentStreamEvent) => {
        switch (ev.event) {
          case "agent:typing": {
            const delta = String(ev.data.delta ?? ev.data.text ?? "");
            if (delta) {
              accumulated += delta;
              const preview = extractAgentDisplayText(accumulated);
              if (preview) {
                updateAgentTurn({ text: preview, running: true });
              }
            }
            break;
          }
          case "ui:render": {
            turnUi = mapUiRender(
              String(ev.data.component ?? ""),
              (ev.data.props as Record<string, unknown>) ?? {},
            );
            updateAgentTurn({ ui: turnUi });
            break;
          }
          case "agent:done": {
            if (!failed) { options?.onSuccess?.(); if (options?.attachments?.length) setInput(""); }
            const resolvedClosed = Boolean(ev.data.conversation_resolved);
            const finalText =
              extractAgentDisplayText(
                String(ev.data.full_text ?? accumulated),
              ) || extractAgentDisplayText(accumulated);
            const displayText =
              finalText ||
              (resolvedClosed ? RESOLVED_SESSION_MESSAGE : "");
            const resolvedUi = resolveTurnUiFromDoneData(turnUi, ev.data);
            const suggestedReplies = suggestedRepliesFromDoneData(ev.data);
            const doneServerTurnId =
              typeof ev.data.turn_id === "string" ? ev.data.turn_id :
              typeof ev.data.message_id === "string" ? ev.data.message_id : undefined;
            updateAgentTurn({
              text: displayText,
              ui: resolvedUi ?? undefined,
              suggestedReplies,
              running: false,
              turnId: doneServerTurnId,
            });
            if (resolvedClosed) {
              setConversationResolved(true);
            }
            playReceivedSound();
            onAgentDone?.(displayText);
            break;
          }
          case "agent:error": {
            failed = true;
            const errMsg = String(ev.data.message ?? "Something went wrong");
            updateAgentTurn({
              text: errMsg,
              running: false,
            });
            break;
          }
          default:
            break;
        }
      };

      pendingSendTimerRef.current = setTimeout(async () => {
        pendingSendTimerRef.current = null;
        abortRef.current?.();
        let stream: ReturnType<typeof streamChat>;
        try {
          stream = streamChat(
            agentUrl,
            sessionIdRef.current,
            tenantId,
            message,
            handleEvent,
            {
              productId,
              endUserId,
              publishableKey: runtimeApiKey,
              serverAgentConfig: true,
              inboxChannel: profile,
              userName: baseConfig.userName,
              userEmail: baseConfig.userEmail,
              history: turnsToAgentHistory(turns),
              attachments: await attachmentRefs(options?.attachments),
              historyAttachments: (await attachmentRefs(turns.flatMap(t => t.attachments ?? []))).slice(-80),
              clientMessageId: userTurnId,
            },
          );
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "Failed to reach agent";
          updateAgentTurn({ text: message, running: false });
          inputLockedRef.current = false;
          setInputLocked(false);
          abortRef.current = null;
          return;
        }

        const { abort, promise } = stream;
        abortRef.current = abort;

        promise
          .catch((err: Error) => {
            updateAgentTurn({
              text: err.message || "Failed to reach agent",
              running: false,
            });
          })
          .finally(() => {
            inputLockedRef.current = false;
            setInputLocked(false);
            abortRef.current = null;
          });
      }, 0);
    },
    [
      input,
      turns,
      agentUrl,
      tenantId,
      runtimeApiKey,
      productId,
      endUserId,
      profile,
      baseConfig.userName,
      baseConfig.userEmail,
      beginFreshSession,
      onUserMessage,
      onAgentDone,
    ],
  );

  const value = useMemo<ChatWidgetContextValue>(
    () => ({
      imagePicker,
      config,
      colorScheme,
      turns,
      input,
      setInput,
      sendMessage,
      resetChat,
      recentChats,
      refreshRecentChats,
      resumeChat,
      canChangeSession,
      privacyDismissed,
      dismissPrivacy: () => setPrivacyDismissed(true),
      inputLocked,
      loading,
      error,
      onNavigate,
      voiceActive,
      voiceState,
      voiceTranscript,
      voiceError,
      toggleVoiceSession,
      endVoiceSession,
      sessionId: sessionIdRef.current,
      conversationResolved,
      sessionHandoffNotice,
      agentUrl,
      tenantId,
      apiKey: runtimeApiKey,
      productId,
    }),
    [
      imagePicker,
      config,
      colorScheme,
      turns,
      input,
      sendMessage,
      resetChat,
      recentChats,
      refreshRecentChats,
      resumeChat,
      canChangeSession,
      privacyDismissed,
      inputLocked,
      loading,
      error,
      onNavigate,
      voiceActive,
      voiceState,
      voiceTranscript,
      voiceError,
      toggleVoiceSession,
      endVoiceSession,
      conversationResolved,
      sessionHandoffNotice,
      agentUrl,
      tenantId,
      runtimeApiKey,
      productId,
    ],
  );

  return (
    <ChatWidgetContext.Provider value={value}>
      {children}
    </ChatWidgetContext.Provider>
  );
}
