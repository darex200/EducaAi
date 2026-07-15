import type { AppLocale } from "@/lib/i18n/translations";
import { SUPPORTED_LOCALES } from "@/lib/i18n/translations";

const SPANISH_MARKERS =
  /\b(que|como|por|para|donde|cuando|porque|hola|gracias|ayuda|explica|explicame|genera|crea|diagrama|fotosintesis|matematicas|ciencias|hacer|tengo|puedes|podrias|necesito|quiero|respuesta|ejercicio|tema|estudiar|aprender|definicion|significa|cual|cuales|esto|esta|estoy|eres|soy|del|las|los|una|uno|con|sin|mas|muy|tambien|ademas|entonces|asi|aqui|ahi|donde|porqué|qué|cómo|cuál|cuáles|está|están|también|además|así|aquí|ahí|dónde)\b/gi;

const ENGLISH_MARKERS =
  /\b(the|what|how|why|when|where|hello|thanks|help|explain|generate|create|diagram|photosynthesis|math|science|can|could|need|want|answer|exercise|topic|study|learn|definition|mean|which|this|that|these|those|with|without|more|very|also|then|here|there|please|would|should|does|do|is|are|was|were|you|your|my|me|we|they)\b/gi;

const PORTUGUESE_MARKERS =
  /\b(voce|você|nao|não|obrigado|obrigada|ajuda|explica|explique|gera|gerar|cria|criar|diagrama|fotossintese|fotossíntese|matematica|matemática|ciencias|ciências|fazer|tenho|pode|poderia|preciso|quero|resposta|exercicio|exercício|tema|estudar|aprender|definicao|definição|significa|qual|quais|isto|esta|estou|sou|com|sem|mais|muito|tambem|também|alem|além|entao|então|assim|aqui|ali|onde|quando|porque|porquê|está|estão|uma|um|dos|das|pelo|pela|pra|pro|gostaria|consegue|fala|falar|ensina|ensinar|mostra|mostrar|diga|dizer)\b/gi;

const SPANISH_CHARS = /[áéíóúñ¿¡]/i;
const PORTUGUESE_CHARS = /[ãõç]/i;

type MessageLike = { role: string; content: string };

function countMatches(text: string, pattern: RegExp) {
  return text.match(pattern)?.length ?? 0;
}

/** Detecta el idioma predominante en los mensajes recientes del estudiante. */
export function detectLocaleFromMessages(
  messages: MessageLike[],
  fallback: AppLocale = "en",
): AppLocale {
  const userTexts = messages
    .filter((message) => message.role === "user")
    .map((message) => message.content.trim())
    .filter(Boolean)
    .slice(-4);

  if (userTexts.length === 0) return fallback;

  const combined = userTexts.join(" ");
  const scores: Record<AppLocale, number> = { en: 0, es: 0, pt: 0 };

  if (SPANISH_CHARS.test(combined)) scores.es += 3;
  if (PORTUGUESE_CHARS.test(combined)) scores.pt += 4;

  scores.es += countMatches(combined, SPANISH_MARKERS);
  scores.en += countMatches(combined, ENGLISH_MARKERS);
  scores.pt += countMatches(combined, PORTUGUESE_MARKERS);

  const maxScore = Math.max(scores.en, scores.es, scores.pt);
  if (maxScore === 0) return fallback;

  const winners = SUPPORTED_LOCALES.filter((locale) => scores[locale] === maxScore);
  if (winners.length !== 1) return fallback;
  return winners[0];
}

export function localeInstructionAdaptive(locale: AppLocale) {
  if (locale === "es") {
    return "IMPORTANTE: Responde SIEMPRE en español. El estudiante está escribiendo en español; adapta todo el tutor a ese idioma.";
  }
  if (locale === "pt") {
    return "IMPORTANTE: Responda SEMPRE em português. O estudante está escrevendo em português; adapte todo o tutor a esse idioma.";
  }
  return "IMPORTANT: Always respond in English. The student is writing in English; adapt the entire tutor reply to that language.";
}
