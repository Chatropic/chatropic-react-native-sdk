import { getDefaultAgentUrl } from "../config/environment";
function parseTimestamp(value) {
    if (!value)
        return Date.now();
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : Date.now();
}
function mapUi(raw) {
    if (!raw || typeof raw !== "object")
        return null;
    const component = String(raw.component ?? "").trim();
    if (!component)
        return null;
    const props = raw.props;
    return {
        component,
        props: props && typeof props === "object"
            ? props
            : {},
    };
}
export function serverMessagesToTurns(messages, welcomeMessage) {
    const welcome = welcomeMessage.trim();
    if (!messages.length) {
        return welcome
            ? [
                {
                    id: "welcome",
                    role: "agent",
                    text: welcome,
                    running: false,
                    createdAt: 0,
                },
            ]
            : [];
    }
    const turns = [];
    for (const message of messages) {
        const role = message.role === "user" ? "user" : "agent";
        const text = String(message.body ?? "").trim();
        const ui = mapUi(message.ui);
        const author = message.ui?.author === "human_agent" ? "human_agent" : undefined;
        if (!text && !ui)
            continue;
        turns.push({
            id: message.id,
            role,
            author,
            text,
            ui: ui ?? undefined,
            running: false,
            createdAt: parseTimestamp(message.created_at),
        });
    }
    return turns;
}
function turnContentKey(turn) {
    if (turn.running) {
        return `${turn.role}:running:${turn.id}`;
    }
    const text = (turn.text ?? "").trim().toLowerCase();
    const uiComponent = turn.ui?.component ?? "";
    return `${turn.role}:${text}:${uiComponent}`;
}
export function mergeServerTurns(local, server, welcomeMessage = "") {
    if (!server.length)
        return local;
    const welcome = welcomeMessage.trim();
    const isWelcomeTurn = (turn) => turn.id === "welcome" ||
        turn.id.startsWith("welcome-") ||
        (welcome &&
            turn.role === "agent" &&
            !turn.running &&
            turn.text?.trim() === welcome);
    const localHasWelcome = local.some(isWelcomeTurn);
    const serverTurns = localHasWelcome ? server.filter((turn) => !isWelcomeTurn(turn)) : server;
    if (!serverTurns.length)
        return local;
    // Build a positional index of server turns by role so we can match optimistic
    // local turns (which have locally-generated IDs that never match server IDs).
    // A local turn with localId is "optimistic" — it was created during sendMessage.
    const serverUserTurns = serverTurns.filter((t) => t.role === "user");
    const serverAgentTurns = serverTurns.filter((t) => t.role === "agent");
    // Count how many optimistic (localId) turns exist in local per role to detect
    // which server turns correspond to them by position.
    const localOptimisticUser = local.filter((t) => t.role === "user" && t.localId);
    const localOptimisticAgent = local.filter((t) => t.role === "agent" && t.localId && !t.running);
    // Build a set of server IDs that are already claimed by local turns
    const serverIdClaimed = new Set();
    // Map from localId → matched server turn
    const localIdToServer = new Map();
    // Match optimistic user turns to server user turns by position from the end
    for (let i = 0; i < localOptimisticUser.length; i++) {
        const serverIdx = serverUserTurns.length - localOptimisticUser.length + i;
        if (serverIdx >= 0 && serverIdx < serverUserTurns.length) {
            const serverTurn = serverUserTurns[serverIdx];
            localIdToServer.set(localOptimisticUser[i].localId, serverTurn);
            serverIdClaimed.add(serverTurn.id);
        }
    }
    // Match optimistic agent turns to server agent turns by position from the end
    for (let i = 0; i < localOptimisticAgent.length; i++) {
        const serverIdx = serverAgentTurns.length - localOptimisticAgent.length + i;
        if (serverIdx >= 0 && serverIdx < serverAgentTurns.length) {
            const serverTurn = serverAgentTurns[serverIdx];
            localIdToServer.set(localOptimisticAgent[i].localId, serverTurn);
            serverIdClaimed.add(serverTurn.id);
        }
    }
    const localById = new Map(local.map((turn) => [turn.id, turn]));
    // Build the merged array from server turns, preserving local running states.
    // For server turns matched to optimistic local turns, inherit the local createdAt
    // so the ordering the user already saw during streaming is preserved (avoids
    // server clock skew causing agent turn to sort before the user's message).
    const merged = serverTurns.map((turn) => {
        const existing = localById.get(turn.id);
        if (existing?.running)
            return existing;
        // Check if this server turn was matched to a local optimistic turn
        const matchedLocalId = [...localIdToServer.entries()].find(([, srv]) => srv.id === turn.id)?.[0];
        if (matchedLocalId) {
            const localTurn = local.find((t) => t.localId === matchedLocalId);
            if (localTurn?.createdAt !== undefined) {
                // Use local createdAt to preserve the ordering the user saw
                return { ...turn, createdAt: localTurn.createdAt };
            }
        }
        return turn;
    });
    const mergedIds = new Set(merged.map((t) => t.id));
    const mergedKeys = new Set(merged.filter((turn) => !turn.running).map((turn) => turnContentKey(turn)));
    for (const turn of local) {
        if (serverTurns.some((row) => row.id === turn.id))
            continue;
        // Optimistic turn matched to a server turn by position — discard the local copy
        if (turn.localId && localIdToServer.has(turn.localId)) {
            const matched = localIdToServer.get(turn.localId);
            if (mergedIds.has(matched.id))
                continue;
        }
        if (turn.running) {
            merged.push(turn);
            continue;
        }
        if (isWelcomeTurn(turn)) {
            if (!merged.some(isWelcomeTurn))
                merged.push(turn);
            continue;
        }
        const key = turnContentKey(turn);
        if (mergedKeys.has(key))
            continue;
        mergedKeys.add(key);
        merged.push(turn);
    }
    return merged.sort((a, b) => {
        const ta = a.createdAt ?? 0;
        const tb = b.createdAt ?? 0;
        if (ta !== tb)
            return ta - tb;
        // Tie-break: user before agent (preserves pair ordering when timestamps collide)
        if (a.role === "user" && b.role === "agent")
            return -1;
        if (a.role === "agent" && b.role === "user")
            return 1;
        return 0;
    });
}
/**
 * Signal to the backend that the user closed the chat widget.
 * Fire-and-forget — errors are swallowed intentionally.
 */
export function signalChatClosed(tenantId, sessionId, options) {
    if (!options?.apiKey?.trim() || !sessionId)
        return;
    const agentUrl = (options?.agentUrl ?? getDefaultAgentUrl()).replace(/\/$/, "");
    const productId = options?.productId ?? "customer_support";
    const url = `${agentUrl}/products/${productId}/sessions/${encodeURIComponent(sessionId)}/chat-closed`;
    const headers = {};
    headers.Authorization = `Bearer ${options.apiKey.trim()}`;
    void fetch(url, {
        method: "POST",
        headers,
    }).catch(() => undefined);
}
export async function fetchSessionConversationMessages(tenantId, sessionId, options) {
    const agentUrl = (options?.agentUrl ?? getDefaultAgentUrl()).replace(/\/$/, "");
    const productId = options?.productId ?? "customer_support";
    const limit = options?.limit ?? 120;
    const qs = new URLSearchParams({ limit: String(limit) });
    const headers = {};
    if (!options?.apiKey?.trim()) {
        throw new Error("Publishable key required to load conversation messages");
    }
    headers.Authorization = `Bearer ${options.apiKey.trim()}`;
    const res = await fetch(`${agentUrl}/products/${productId}/sessions/${encodeURIComponent(sessionId)}/conversation/messages?${qs}`, { headers });
    if (!res.ok) {
        const detail = await res.text();
        throw new Error(detail || `Failed to load conversation (${res.status})`);
    }
    const data = (await res.json());
    return {
        session_id: data.session_id ?? sessionId,
        status: data.status ?? "open",
        resolved: Boolean(data.resolved),
        messages: data.messages ?? [],
    };
}
