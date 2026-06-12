import { extractJsonPayload } from "@/lib/quiz";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const DEFAULT_MODEL = "gpt-4o-mini";

export type OpenAIContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };

export type OpenAIChatMessage = {
  role: "system" | "user" | "assistant";
  content: string | OpenAIContentPart[];
};

type ChatOptions = {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  json?: boolean;
};

export function hasOpenAIKey() {
  return Boolean(process.env.OPENAI_API_KEY);
}

/**
 * Llama a OpenAI y devuelve el texto de la respuesta, o null si falla
 * (sin lanzar) para que cada servicio aplique su propio fallback.
 */
export async function chatCompletion(
  messages: OpenAIChatMessage[],
  options: ChatOptions = {},
): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: options.model ?? DEFAULT_MODEL,
        temperature: options.temperature ?? 0.35,
        ...(options.maxTokens ? { max_tokens: options.maxTokens } : {}),
        ...(options.json ? { response_format: { type: "json_object" } } : {}),
        messages,
      }),
    });

    if (!response.ok) {
      console.error("[openai] estado", response.status, await response.text().catch(() => ""));
      return null;
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    return data.choices?.[0]?.message?.content?.trim() ?? null;
  } catch (error) {
    console.error("[openai] error de red:", error);
    return null;
  }
}

/** Igual que chatCompletion pero parsea la respuesta como JSON tipado. */
export async function chatJSON<T>(
  messages: OpenAIChatMessage[],
  options: Omit<ChatOptions, "json"> = {},
): Promise<T | null> {
  const raw = await chatCompletion(messages, { ...options, json: true });
  if (!raw) return null;
  try {
    return extractJsonPayload(raw) as T;
  } catch (error) {
    console.error("[openai] JSON inválido:", error);
    return null;
  }
}
