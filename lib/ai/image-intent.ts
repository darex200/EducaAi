import type { AppLocale } from "@/lib/i18n/translations";

function normalizeText(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function buildEducationalImagePrompt(userText: string, topic?: string, locale: AppLocale = "en") {
  const request = userText.trim();

  if (locale === "es") {
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

  if (locale === "pt") {
    const topicHint = topic ? ` Tópico de estudo: ${topic}.` : "";
    return [
      "Ilustração educativa clara e didática para estudantes.",
      "Estilo: diagrama escolar limpo, cores suaves, fundo neutro, alta legibilidade.",
      "Sem marcas d'água, sem logos, sem texto ilegível ou com erros ortográficos.",
      topicHint,
      `Solicitação do estudante: ${request}`,
    ]
      .filter(Boolean)
      .join(" ");
  }

  const topicHint = topic ? ` Study topic: ${topic}.` : "";
  return [
    "Clear, didactic educational illustration for students.",
    "Style: clean school diagram, soft colors, neutral background, high readability.",
    "No watermarks, no logos, no illegible or misspelled text.",
    topicHint,
    `Student request: ${request}`,
  ]
    .filter(Boolean)
    .join(" ");
}

/** Detecta si el estudiante pide crear una ilustración o diagrama. */
export function wantsImageGeneration(text: string) {
  const normalized = normalizeText(text);

  const nouns =
    /(imagen|imagenes|diagrama|diagramas|dibujo|dibujos|ilustracion|ilustraciones|esquema|esquemas|grafico|graficos|infografia|infografias|mapa conceptual|mapa mental|imagem|imagens|desenho|desenhos|ilustracao|ilustracoes|esquema|esquemas|grafico|graficos|infografia|infografias|mapa conceitual|mapa mental)/;
  const actions =
    /(genera|generar|crea|crear|haz|hacer|dibuja|dibujar|ilustra|ilustrar|disena|disenar|muestrame|hazme|pinta|visualiza|representa|quiero|necesito|dame|podrias|puedes|gera|gerar|cria|criar|faz|fazer|desenha|desenhar|ilustra|ilustrar|mostra|mostrar|mostre|preciso|quero|pode|poderia)/;
  const nounPhrase =
    /(imagen|diagrama|dibujo|ilustracion|esquema|grafico|imagem|diagrama|desenho|ilustracao|esquema|grafico) de /;

  if (nounPhrase.test(normalized)) return true;
  if (nouns.test(normalized) && actions.test(normalized)) return true;

  return /(genera|crea|haz|dibuja|ilustra|gera|cria|faz|desenha|ilustra).{0,80}(imagen|diagrama|dibujo|ilustracion|esquema|imagem|diagrama|desenho|ilustracao|esquema)/.test(
    normalized,
  );
}
