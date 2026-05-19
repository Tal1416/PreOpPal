import { google } from "@ai-sdk/google";
import { streamText, type ModelMessage } from "ai";
import { NextResponse } from "next/server";
import { buildCareSystemPrompt, type CareMember } from "@/lib/care-prompt";
import type { PalProfileContext } from "@/lib/pal-prompt";
import { createClientForRequest } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 30;

type CareChatBody = {
  messages: ModelMessage[];
  profile: PalProfileContext;
  member: CareMember;
};

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

/** Hydrate the care-team chat history for the current user. */
export async function GET() {
  const supabase = await createClientForRequest();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ messages: [] });
  }
  const { data, error } = await supabase
    .from("care_messages")
    .select("id, role, text, created_at")
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

  let body: CareChatBody;
  try {
    body = (await req.json()) as CareChatBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { messages, profile, member } = body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "Missing messages" }, { status: 400 });
  }
  if (!member?.name || !member?.role) {
    return NextResponse.json(
      { error: "Missing care team member" },
      { status: 400 },
    );
  }

  const supabase = await createClientForRequest();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user?.id ?? null;
  const latestUserText = messageText(messages[messages.length - 1]);

  const result = streamText({
    model: google("gemini-3-flash-preview"),
    system: buildCareSystemPrompt(member, profile),
    messages,
    temperature: 0.7,
    maxOutputTokens: 350,
    onFinish: async ({ text }) => {
      if (!userId) return;
      try {
        await supabase.from("care_messages").insert([
          { user_id: userId, role: "user", text: latestUserText },
          { user_id: userId, role: "nurse", text },
        ]);
      } catch (err) {
        console.warn("[care-chat] persist failed", err);
      }
    },
  });

  return result.toTextStreamResponse();
}
