import { NextResponse } from "next/server";
import { buildGuidedReply, buildTutorSystemPrompt, type TutorMessage } from "@/lib/tutor";

type ChatRequestBody = {
  messages?: TutorMessage[];
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ChatRequestBody;
    const messages = body.messages ?? [];
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
            { role: "system", content: buildTutorSystemPrompt() },
            ...latestMessages.map((message) => ({
              role: message.role,
              content: message.content,
            })),
          ],
        }),
      });

      if (!response.ok) {
        const fallbackReply = buildGuidedReply(latestMessages);
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

      return NextResponse.json({
        reply: modelReply || buildGuidedReply(latestMessages),
        meta: {
          mode: "openai",
        },
      });
    }

    const reply = buildGuidedReply(latestMessages);

    return NextResponse.json({
      reply,
      meta: {
        mode: "guided",
        note: "Define OPENAI_API_KEY para habilitar respuestas IA en vivo.",
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
