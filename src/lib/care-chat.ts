import type { ChatMessage } from "@/data/content";
import type { PalProfileContext } from "@/lib/pal-prompt";
import type { CareMember } from "@/lib/care-prompt";

/**
 * Streams a care-team reply from /api/care-chat.
 *
 * `onText` is called with the cumulative reply text on every chunk so the
 * caller can render it live into a chat bubble. Resolves with the final text.
 * Network/API failures resolve with a friendly fallback string instead of
 * throwing — the chat should never hard-crash.
 */
export async function streamCareReply(params: {
  history: ChatMessage[];
  profile: PalProfileContext;
  member: CareMember;
  onText: (text: string) => void;
}): Promise<string> {
  const { history, profile, member, onText } = params;

  const messages = history.map((m) => ({
    role: m.from === "user" ? ("user" as const) : ("assistant" as const),
    content: m.text,
  }));

  const FALLBACK =
    "I'm having trouble connecting right now — give me a moment and try again. If it's urgent, please call the clinic directly.";

  try {
    const res = await fetch("/api/care-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, profile, member }),
    });

    if (!res.ok || !res.body) {
      onText(FALLBACK);
      return FALLBACK;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let acc = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      acc += decoder.decode(value, { stream: true });
      onText(acc);
    }
    acc += decoder.decode();
    onText(acc);
    return acc.trim() || FALLBACK;
  } catch {
    onText(FALLBACK);
    return FALLBACK;
  }
}
