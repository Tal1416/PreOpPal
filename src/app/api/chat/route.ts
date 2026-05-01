import { google } from "@ai-sdk/google";
import { streamText, type ModelMessage } from "ai";
import { NextResponse } from "next/server";
import { buildPalSystemPrompt, type PalProfileContext } from "@/lib/pal-prompt";

export const runtime = "edge";
export const maxDuration = 30;

type ChatBody = {
  messages: ModelMessage[];
  profile: PalProfileContext;
};

export async function POST(req: Request) {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return NextResponse.json(
      {
        error:
          "GOOGLE_GENERATIVE_AI_API_KEY is not set. Add it to .env.local and restart the dev server.",
      },
      { status: 500 }
    );
  }

  let body: ChatBody;
  try {
    body = (await req.json()) as ChatBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { messages, profile } = body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "Missing messages" }, { status: 400 });
  }

  const result = streamText({
    model: google("gemini-3-flash-preview"),
    system: buildPalSystemPrompt(profile),
    messages,
    temperature: 0.6,
    maxOutputTokens: 1500,
  });

  return result.toTextStreamResponse();
}
