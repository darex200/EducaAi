import "server-only";

import { hasOpenAIKey } from "@/lib/ai/openai";
import { externalFetch } from "@/lib/ai/http";

export { buildEducationalImagePrompt, wantsImageGeneration } from "@/lib/ai/image-intent";

const OPENAI_IMAGES_URL = "https://api.openai.com/v1/images/generations";

export type GenerateImageOptions = {
  size?: "1024x1024" | "1792x1024" | "1024x1792";
  quality?: "standard" | "hd";
  model?: "dall-e-3" | "dall-e-2";
};

export type GenerateImageResult = {
  url: string;
  revisedPrompt?: string;
  model: string;
};

async function requestImage(
  prompt: string,
  model: "dall-e-3" | "dall-e-2",
  options: GenerateImageOptions,
): Promise<GenerateImageResult | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const body: Record<string, unknown> = {
    model,
    prompt: prompt.slice(0, 4000),
    n: 1,
    size: options.size ?? "1024x1024",
    response_format: "url",
  };

  if (model === "dall-e-3") {
    body.quality = options.quality ?? "standard";
  }

  try {
    const response = await externalFetch(OPENAI_IMAGES_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.error(`[images:${model}] estado`, response.status, await response.text().catch(() => ""));
      return null;
    }

    const data = (await response.json()) as {
      data?: Array<{ url?: string; revised_prompt?: string }>;
    };

    const first = data.data?.[0];
    if (!first?.url) return null;

    return {
      url: first.url,
      revisedPrompt: first.revised_prompt,
      model,
    };
  } catch (error) {
    console.error(`[images:${model}] error de red:`, error);
    return null;
  }
}

export async function generateEducationalImage(
  prompt: string,
  options: GenerateImageOptions = {},
): Promise<GenerateImageResult | null> {
  if (!hasOpenAIKey()) return null;

  const preferredModel = options.model ?? "dall-e-3";
  const primary = await requestImage(prompt, preferredModel, options);
  if (primary) return primary;

  if (preferredModel === "dall-e-3") {
    return requestImage(prompt, "dall-e-2", { ...options, size: "1024x1024" });
  }

  return null;
}

export function imageGenerationUnavailableMessage() {
  return [
    "No pude generar la ilustración en este intento.",
    "Verifica que tu `OPENAI_API_KEY` tenga acceso a generación de imágenes (DALL·E).",
    "Puedes intentar de nuevo con una frase clara, por ejemplo: **Genera un diagrama de la fotosíntesis**.",
  ].join(" ");
}
