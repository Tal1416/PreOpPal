import { google } from "@ai-sdk/google";
import { streamText, type ModelMessage } from "ai";
import { NextResponse } from "next/server";
import { buildCareSystemPrompt, type CareMember } from "@/lib/care-prompt";
import type { PalProfileContext } from "@/lib/pal-prompt";

export const runtime = "edge";
export const maxDuration = 30;

type CareChatBody = {
  messages: ModelMessage[];
  profile: PalProfileContext;
  member: CareMember;
};

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

  const result = streamText({
    model: google("gemini-3-flash-preview"),
    system: buildCareSystemPrompt(member, profile),
    messages,
    temperature: 0.7,
    maxOutputTokens: 350,
  });

  return result.toTextStreamResponse();
}
