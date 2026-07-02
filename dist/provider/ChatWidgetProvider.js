import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, } from "react";
import { extractAgentDisplayText, fetchPublicAppConfig, mapUiRender, resolveTurnUiFromDoneData, streamChat, suggestedRepliesFromDoneData, } from "../client/stream-chat";
import { VoiceClient, } from "../client/voice-client";
import { playSentSound, playReceivedSound, } from "../audio/message-sounds";
import { applyThemeToWidgetConfig, resolveWidgetColorScheme, } from "../theme/resolve-colors";
import { createChatSessionId, createTurnId, mergeWidgetConfig, } from "../utils/session";
import { getDefaultAgentUrl } from "../config/environment";
function turnsToAgentHistory(turns) {
    const rows = [];
    for (const turn of turns) {
        if (turn.id === "welcome" || turn.running)
            continue;
        const text = turn.text?.trim();
        if (!text)
            continue;
        if (turn.role === "user")
            rows.push({ role: "user", content: text });
        if (turn.role === "agent")
            rows.push({ role: "assistant", content: text });
    }
    return rows;
}
const ChatWidgetContext = createContext(null);
export function useChatWidget() {
    const ctx = useContext(ChatWidgetContext);
    if (!ctx) {
        throw new Error("useChatWidget must be used within ChatWidgetProvider");
    }
    return ctx;
}
function welcomeTurn(welcome) {
    return {
        id: createTurnId("a"),
        role: "agent",
        text: welcome,
        running: false,
        createdAt: Date.now(),
    };
}
const RESOLVED_SESSION_MESSAGE = "This conversation was closed. Send a new message to continue.";
export function ChatWidgetProvider({ children, tenantId, publishableKey, profile = "chat", sessionId: fixedSessionId, endUserId, userName, userEmail, theme, onNavigate, onUserMessage, onAgentDone, onSessionRotate, sessionHandoffNotice = null, }) {
    const runtimeApiKey = publishableKey;
    const agentUrl = getDefaultAgentUrl();
    const productId = "customer_support";
    const [serverConfig, setServerConfig] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [turns, setTurns] = useState([]);
    const [input, setInput] = useState("");
    const [privacyDismissed, setPrivacyDismissed] = useState(false);
    const [inputLocked, setInputLocked] = useState(false);
    const [voiceActive, setVoiceActive] = useState(false);
    const [voiceState, setVoiceState] = useState("idle");
    const [voiceTranscript, setVoiceTranscript] = useState([]);
    const [voiceError, setVoiceError] = useState(null);
    const [conversationResolved, setConversationResolved] = useState(false);
    const sessionIdRef = useRef(fixedSessionId ?? createChatSessionId("rn"));
    const abortRef = useRef(null);
    const pendingSendTimerRef = useRef(null);
    const voiceClientRef = useRef(null);
    const voiceUserTurnRef = useRef(null);
    const voiceAgentTurnRef = useRef(null);
    const initializedRef = useRef(false);
    const welcomeMessageRef = useRef("");
    const inputLockedRef = useRef(false);
    const conversationResolvedRef = useRef(false);
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
            if (cancelled)
                return;
            setServerConfig(app.config);
        })
            .catch((err) => {
            if (cancelled)
                return;
            setError(err.message || "Failed to load widget config");
        })
            .finally(() => {
            if (!cancelled)
                setLoading(false);
        });
        return () => {
            cancelled = true;
        };
    }, [tenantId, agentUrl, profile, runtimeApiKey]);
    const baseConfig = useMemo(() => mergeWidgetConfig({
        ...serverConfig,
        ...(endUserId ? { endUserId } : {}),
        ...(userName ? { userName } : {}),
        ...(userEmail ? { userEmail } : {}),
    }), [serverConfig, endUserId, userName, userEmail]);
    const colorScheme = useMemo(() => resolveWidgetColorScheme(baseConfig, theme), [baseConfig, theme]);
    const config = useMemo(() => applyThemeToWidgetConfig(baseConfig, colorScheme), [baseConfig, colorScheme]);
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
        if (loading || initializedRef.current)
            return;
        if (config.welcomeMessage) {
            setTurns([welcomeTurn(config.welcomeMessage)]);
            initializedRef.current = true;
        }
    }, [loading, config.welcomeMessage]);
    const appendSingleTurn = useCallback((turn) => {
        setTurns((prev) => [...prev, turn]);
    }, []);
    const patchTurn = useCallback((turnId, patch) => {
        setTurns((prev) => prev.map((turn) => (turn.id === turnId ? patch(turn) : turn)));
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
        if (!config.showVoice)
            return;
        setVoiceError(null);
        setVoiceTranscript([]);
        setVoiceActive(true);
        setVoiceState("connecting");
        const finalizeVoiceAgentTurn = (text) => {
            const agentId = voiceAgentTurnRef.current;
            if (!agentId)
                return;
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
                    if (idx >= 0)
                        next[idx] = line;
                    else
                        next.push(line);
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
                    }
                    else {
                        patchTurn(userTurnId, (turn) => ({ ...turn, text: line.text }));
                    }
                    if (line.final)
                        voiceUserTurnRef.current = null;
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
                }
                else {
                    patchTurn(agentTurnId, (turn) => ({
                        ...turn,
                        text: line.text,
                        running: !line.final,
                    }));
                }
                if (line.final)
                    finalizeVoiceAgentTurn(line.text);
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
                }
                else {
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
            .catch((err) => {
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
        initializedRef.current = true;
    }, [
        fixedSessionId,
        onSessionRotate,
        rotateSession,
        config.welcomeMessage,
        endVoiceSession,
    ]);
    const sendMessage = useCallback((text, options) => {
        const message = (text ?? input).trim();
        if (!message || inputLockedRef.current)
            return;
        const displayMessage = (options?.displayText ?? message).trim() || message;
        if (conversationResolvedRef.current) {
            beginFreshSession();
            const welcomeMessage = welcomeMessageRef.current;
            setTurns(welcomeMessage ? [welcomeTurn(welcomeMessage)] : []);
            initializedRef.current = true;
        }
        setInput("");
        playSentSound();
        onUserMessage?.(displayMessage);
        const userTurnId = createTurnId("u");
        const userTurnAt = Date.now();
        const userTurn = {
            id: userTurnId,
            role: "user",
            text: displayMessage,
            createdAt: userTurnAt,
            localId: userTurnId,
        };
        const agentTurnId = createTurnId("a");
        const agentTurn = {
            id: agentTurnId,
            role: "agent",
            text: "",
            running: true,
            // +1 ensures agent turn always sorts after the paired user turn regardless of clock skew
            createdAt: userTurnAt + 1,
            localId: agentTurnId,
        };
        setTurns((prev) => [...prev, userTurn, agentTurn]);
        inputLockedRef.current = true;
        setInputLocked(true);
        let accumulated = "";
        let turnUi = null;
        const updateAgentTurn = (patch) => {
            setTurns((prev) => prev.map((t) => (t.id === agentTurnId ? { ...t, ...patch } : t)));
        };
        const handleEvent = (ev) => {
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
                    turnUi = mapUiRender(String(ev.data.component ?? ""), ev.data.props ?? {});
                    updateAgentTurn({ ui: turnUi });
                    break;
                }
                case "agent:done": {
                    const resolvedClosed = Boolean(ev.data.conversation_resolved);
                    const finalText = extractAgentDisplayText(String(ev.data.full_text ?? accumulated)) || extractAgentDisplayText(accumulated);
                    const displayText = finalText ||
                        (resolvedClosed ? RESOLVED_SESSION_MESSAGE : "");
                    const resolvedUi = resolveTurnUiFromDoneData(turnUi, ev.data);
                    const suggestedReplies = suggestedRepliesFromDoneData(ev.data);
                    const doneServerTurnId = typeof ev.data.turn_id === "string" ? ev.data.turn_id :
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
        pendingSendTimerRef.current = setTimeout(() => {
            pendingSendTimerRef.current = null;
            abortRef.current?.();
            let stream;
            try {
                stream = streamChat(agentUrl, sessionIdRef.current, tenantId, message, handleEvent, {
                    productId,
                    endUserId,
                    publishableKey: runtimeApiKey,
                    serverAgentConfig: true,
                    inboxChannel: profile,
                    userName: baseConfig.userName,
                    userEmail: baseConfig.userEmail,
                    history: turnsToAgentHistory(turns),
                });
            }
            catch (err) {
                const message = err instanceof Error ? err.message : "Failed to reach agent";
                updateAgentTurn({ text: message, running: false });
                inputLockedRef.current = false;
                setInputLocked(false);
                abortRef.current = null;
                return;
            }
            const { abort, promise } = stream;
            abortRef.current = abort;
            promise
                .catch((err) => {
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
    }, [
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
    ]);
    const value = useMemo(() => ({
        config,
        colorScheme,
        turns,
        input,
        setInput,
        sendMessage,
        resetChat,
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
    }), [
        config,
        colorScheme,
        turns,
        input,
        sendMessage,
        resetChat,
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
    ]);
    return (_jsx(ChatWidgetContext.Provider, { value: value, children: children }));
}
