import { NextResponse } from "next/server";
import {
  buildGuidedReply,
  buildTutorSystemPrompt,
  type TutorMessage,
  type TutorStudentContext,
} from "@/lib/tutor";

type ChatRequestBody = {
  messages?: TutorMessage[];
  context?: TutorStudentContext;
};

type OpenAIMessage = {
  role: "user" | "assistant" | "system";
  content:
    | string
    | Array<
        | { type: "text"; text: string }
        | { type: "image_url"; image_url: { url: string } }
      >;
};

function mapToOpenAIMessages(messages: TutorMessage[]): OpenAIMessage[] {
  return messages.map((message) => {
    if (message.role === "assistant") {
      return { role: "assistant", content: message.content };
    }

    if (message.imageDataUrl) {
      return {
        role: "user",
        content: [
          { type: "text", text: message.content || "Analiza esta imagen y guíame como tutor." },
          { type: "image_url", image_url: { url: message.imageDataUrl } },
        ],
      };
    }

    return { role: "user", content: message.content };
  });
}

function normalizeMathFormatting(text: string) {
  return text
    .replace(/\\\(([\s\S]*?)\\\)/g, "$$$1$")
    .replace(/\\\[([\s\S]*?)\\\]/g, "$$$$1$$$$");
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ChatRequestBody;
    const messages = body.messages ?? [];
    const context = body.context;
    const latestMessages = messages.slice(-10);
    const apiKey = process.env.OPENAI_API_KEY;

    if (apiKey) {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          temperature: 0.6,
          messages: [
            { role: "system", content: buildTutorSystemPrompt(context) },
            ...mapToOpenAIMessages(latestMessages),
          ],
        }),
      });

      if (!response.ok) {
        const fallbackReply = buildGuidedReply(latestMessages, context);
        return NextResponse.json({
          reply: fallbackReply,
          meta: {
            mode: "guided-fallback",
            note: `La solicitud a OpenAI fallo con estado ${response.status}.`,
          },
        });
      }

      const data = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };

      const modelReply = data.choices?.[0]?.message?.content?.trim();
      const formattedReply = modelReply ? normalizeMathFormatting(modelReply) : undefined;

      return NextResponse.json({
        reply: formattedReply || buildGuidedReply(latestMessages, context),
        meta: {
          mode: "openai",
        },
      });
    }

    const reply = buildGuidedReply(latestMessages, context);

    return NextResponse.json({
      reply,
      meta: {
        mode: "guided",
        note: "Define OPENAI_API_KEY para habilitar respuestas IA en vivo con texto e imagen.",
      },
    });
  } catch {
    return NextResponse.json(
      {
        reply:
          "Tuve un problema temporal. Reenvia tu pregunta y te guiare paso a paso.",
        meta: {
          mode: "error",
        },
      },
      { status: 500 },
    );
  }
}
