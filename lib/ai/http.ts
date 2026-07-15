import "server-only";

const OPENAI_INSECURE_SSL =
  process.env.NODE_ENV === "development" && process.env.OPENAI_INSECURE_SSL === "true";

if (OPENAI_INSECURE_SSL) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

/** Fetch para APIs externas en el servidor (OpenAI). */
export function externalFetch(url: string, init: RequestInit = {}) {
  return fetch(url, init);
}
