import { NextResponse } from "next/server";
import { z } from "zod";
import {
  buildEducationalImagePrompt,
  generateEducationalImage,
} from "@/lib/ai/images";
import { hasOpenAIKey } from "@/lib/ai/openai";

const bodySchema = z.object({
  prompt: z.string().trim().min(3, "Describe qué imagen quieres generar."),
  topic: z.string().trim().max(120).optional(),
  size: z.enum(["1024x1024", "1792x1024", "1024x1792"]).optional(),
  quality: z.enum(["standard", "hd"]).optional(),
});

export async function POST(request: Request) {
  if (!hasOpenAIKey()) {
    return NextResponse.json(
      { error: "Configura OPENAI_API_KEY para generar imágenes." },
      { status: 503 },
    );
  }

  try {
    const body = await request.json();
    const parsed = bodySchema.safeParse(body);

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Solicitud inválida.";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const { prompt, topic, size, quality } = parsed.data;
    const imagePrompt = buildEducationalImagePrompt(prompt, topic);
    const result = await generateEducationalImage(imagePrompt, { size, quality });

    if (!result) {
      return NextResponse.json(
        { error: "No se pudo generar la imagen. Intenta con otra descripción." },
        { status: 502 },
      );
    }

    return NextResponse.json({
      imageUrl: result.url,
      revisedPrompt: result.revisedPrompt,
      prompt: imagePrompt,
    });
  } catch (error) {
    console.error("[images] error:", error);
    return NextResponse.json(
      { error: "Error al generar la imagen." },
      { status: 500 },
    );
  }
}
