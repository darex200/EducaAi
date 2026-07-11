import { hasOpenAIKey } from "@/lib/ai/openai";

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

function normalizeText(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function buildEducationalImagePrompt(userText: string, topic?: string) {
  const request = userText.trim();
  const topicHint = topic ? ` Tema de estudio: ${topic}.` : "";

  return [
    "Ilustración educativa clara y didáctica para estudiantes.",
    "Estilo: diagrama escolar limpio, colores suaves, fondo neutro, alta legibilidad.",
    "Sin marcas de agua, sin logos, sin texto ilegible o iletrado.",
    topicHint,
    `Solicitud del estudiante: ${request}`,
  ]
    .filter(Boolean)
    .join(" ");
}

/** Detecta si el estudiante pide crear una ilustración o diagrama. */
export function wantsImageGeneration(text: string) {
  const normalized = normalizeText(text);

  const nouns =
    /(imagen|imagenes|diagrama|diagramas|dibujo|dibujos|ilustracion|ilustraciones|esquema|esquemas|grafico|graficos|infografia|infografias|mapa conceptual|mapa mental)/;
  const actions =
    /(genera|generar|crea|crear|haz|hacer|dibuja|dibujar|ilustra|ilustrar|disena|disenar|muestrame|hazme|pinta|visualiza|representa|quiero|necesito|dame|podrias|puedes)/;
  const nounPhrase = /(imagen|diagrama|dibujo|ilustracion|esquema|grafico) de /;

  if (nounPhrase.test(normalized)) return true;
  if (nouns.test(normalized) && actions.test(normalized)) return true;

  return /(genera|crea|haz|dibuja|ilustra).{0,80}(imagen|diagrama|dibujo|ilustracion|esquema)/.test(
    normalized,
  );
}

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
    const response = await fetch(OPENAI_IMAGES_URL, {
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
