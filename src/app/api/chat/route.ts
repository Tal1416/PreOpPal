import { google } from "@ai-sdk/google";
import { streamText, type ModelMessage } from "ai";
import { NextResponse } from "next/server";
import { buildPalSystemPrompt, type PalProfileContext } from "@/lib/pal-prompt";
import { parsePalActions } from "@/lib/pal-actions";
import { createClientForRequest } from "@/lib/supabase/server";

// Switched from edge → nodejs so we can use the Supabase cookie-bound client
// in onFinish() to persist messages without exposing service-role keys.
export const runtime = "nodejs";
export const maxDuration = 30;

type ChatBody = {
  messages: ModelMessage[];
  profile: PalProfileContext;
  voiceMode?: boolean;
};

/** Best-effort plain-text extraction from a ModelMessage's content. */
function messageText(m: ModelMessage | undefined): string {
  if (!m) return "";
  const c = m.content;
  if (typeof c === "string") return c;
  if (Array.isArray(c)) {
    return c
      .map((part) =>
        typeof part === "object" && part && "text" in part
          ? String((part as { text: unknown }).text ?? "")
          : "",
      )
      .join("")
      .trim();
  }
  return "";
}

/** Hydrate the Pal chat history for the current user. */
export async function GET() {
  const supabase = await createClientForRequest();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ messages: [] });
  }
  const { data, error } = await supabase
    .from("pal_messages")
    .select("id, role, text, actions, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(200);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ messages: data ?? [] });
}

export async function POST(req: Request) {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return NextResponse.json(
      {
        error:
          "GOOGLE_GENERATIVE_AI_API_KEY is not set. Add it to .env.local and restart the dev server.",
      },
      { status: 500 },
    );
  }

  let body: ChatBody;
  try {
    body = (await req.json()) as ChatBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { messages, profile, voiceMode } = body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "Missing messages" }, { status: 400 });
  }

  // Persistence only applies to signed-in users; unauthenticated demos can
  // still chat but history won't survive a refresh.
  const supabase = await createClientForRequest();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user?.id ?? null;

  const latestUserText = messageText(messages[messages.length - 1]);

  const result = streamText({
    model: google("gemini-3-flash-preview"),
    system: buildPalSystemPrompt(profile, { voiceMode: !!voiceMode }),
    messages,
    temperature: 0.6,
    maxOutputTokens: voiceMode ? 400 : 1500,
    onFinish: async ({ text }) => {
      if (!userId) return;
      try {
        const { strippedText, actions } = parsePalActions(text);
        await supabase.from("pal_messages").insert([
          {
            user_id: userId,
            role: "user",
            text: latestUserText,
          },
          {
            user_id: userId,
            role: "ai",
            text: strippedText,
            actions: actions.length > 0 ? actions : null,
          },
        ]);
      } catch (err) {
        console.warn("[chat] persist failed", err);
      }
    },
  });

  return result.toTextStreamResponse();
}
