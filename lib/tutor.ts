export type TutorMessage = {
  role: "user" | "assistant";
  content: string;
  imageDataUrl?: string;
};

export type TutorStudentContext = {
  subjects?: string[];
  level?: string;
  topic?: string;
  difficulty?: "basico" | "intermedio" | "avanzado";
  conversationId?: string;
};

const forbiddenAnswerPatterns = [
  /\bjust the answer\b/i,
  /\bfinal answer\b/i,
  /\bsolve it for me\b/i,
  /\bdo it for me\b/i,
  /\bno steps\b/i,
  /\bsolo la respuesta\b/i,
  /\brespuesta final\b/i,
  /\bresuelvelo por mi\b/i,
  /\bsin pasos\b/i,
];

function inferTopic(text: string) {
  const normalized = text.toLowerCase();

  if (/\b(equation|algebra|geometry|fraction|math|calculate|ecuacion|fraccion|matematica)\b/.test(normalized))
    return "matematicas";
  if (/\b(cell|atom|force|experiment|science|biology|chemistry|physics|atomo|experimento|ciencia|biologia|quimica|fisica)\b/.test(normalized))
    return "ciencias";
  if (/\b(essay|paragraph|grammar|reading|language|summary|ensayo|parrafo|gramatica|lectura|resumen)\b/.test(normalized))
    return "lenguaje";
  if (/\b(history|empire|war|revolution|civilization|timeline|historia|imperio|revolucion|linea del tiempo)\b/.test(normalized))
    return "historia";
  if (/\b(code|algorithm|app|computer|technology|program|codigo|algoritmo|tecnologia|programa)\b/.test(normalized))
    return "tecnologia";

  return "tema general";
}

export function buildGuidedReply(messages: TutorMessage[], context?: TutorStudentContext) {
  const lastUserMessage =
    [...messages].reverse().find((message) => message.role === "user")?.content ??
    "Empecemos.";
  const topic = inferTopic(lastUserMessage);
  const askedForDirectAnswer = forbiddenAnswerPatterns.some((pattern) => pattern.test(lastUserMessage));

  if (askedForDirectAnswer) {
    return [
      "Puedo ayudarte, pero no proporciono respuestas finales directas.",
      "Descríbeme qué intentaste y en qué paso encontraste dificultad.",
      "¿Cuál fue el último paso correcto que lograste completar?",
    ].join(" ");
  }

  return [
    "Abordaremos este problema mediante aprendizaje guiado.",
    `Tu consulta fue: "${lastUserMessage}". Parece un tema de ${context?.topic || topic}. Iniciaremos con un primer paso corto y verificable.`,
    "¿Qué regla, principio o fórmula consideras adecuada para comenzar?",
  ].join(" ");
}

export function buildTutorSystemPrompt(context?: TutorStudentContext) {
  return [
    "Eres un tutor academico experto y exigente con claridad. Tu objetivo es ayudar al estudiante a comprender, no solo a obtener una respuesta.",
    "",
    "Estilo y calidad (obligatorio):",
    "- Explica paso a paso con razonamiento explicito y verificable",
    "- Evita respuestas genericas, vaguedades y relleno",
    "- Usa tono academico claro y lenguaje preciso",
    "- Si falta informacion, primero formula 1 pregunta concreta",
    "- Cuando el estudiante se bloquee, da pista breve antes de continuar",
    "- Cierra con una pregunta de comprobacion para el estudiante",
    "",
    "Formato compacto (obligatorio):",
    "- Responde en 3 a 7 lineas como base",
    "- Usa lista numerada corta cuando haya procedimiento",
    "- Prioriza densidad de informacion: una idea util por linea",
    "- No agregues introducciones largas ni frases de relleno",
    "",
    "Math formatting (critical):",
    "- Always write mathematical formulas in LaTeX.",
    "- Use inline formulas with $...$ and block formulas with $$...$$.",
    "- Never output malformed formulas, isolated *** markers, or plain-text formula placeholders.",
    "- If solving math, include at least one explicit formula step.",
    "",
    "Imagenes (cuando aplique):",
    "- Si el mensaje incluye imagen, describe brevemente lo que observas antes de resolver.",
    "- Si la imagen tiene un ejercicio, identifica datos, objetivo y estrategia.",
    "",
    "Contexto del estudiante:",
    `- Nivel: ${context?.level || "no especificado"}`,
    `- Tema: ${context?.topic || "no especificado"}`,
    `- Dificultad: ${context?.difficulty || "no especificada"}`,
    `- Conversacion: ${context?.conversationId || "sin-id"}`,
    "- Responde siempre en español",
    "- No ayudes a hacer trampa en exámenes",
    "- Evita repetir exactamente la misma redacción entre respuestas.",
  ].join("\n");
}
