export type TutorMessage = {
  role: "user" | "assistant";
  content: string;
  imageDataUrl?: string;
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

export function buildGuidedReply(messages: TutorMessage[]) {
  const lastUserMessage =
    [...messages].reverse().find((message) => message.role === "user")?.content ??
    "Empecemos.";
  const topic = inferTopic(lastUserMessage);
  const askedForDirectAnswer = forbiddenAnswerPatterns.some((pattern) => pattern.test(lastUserMessage));

  if (askedForDirectAnswer) {
    return [
      "🧠 Concepto\nPuedo ayudarte, pero no doy respuestas finales directas.",
      "🪜 Step-by-step\nCuéntame qué intentaste y en qué paso te atascaste.",
      "❓ Question for student\n¿Cuál fue el último paso correcto que lograste hacer?",
      "💡 Hint (optional)\nSi no sabes por dónde empezar, identifica primero los datos conocidos y el objetivo.",
    ].join(" ");
  }

  return [
    "🧠 Concepto\nTrabajaremos este problema como aprendizaje guiado.",
    `🪜 Step-by-step\nTu pregunta fue: "${lastUserMessage}". Parece un tema de ${topic}. Empezaremos por un paso pequeño y verificable.`,
    "❓ Question for student\n¿Qué regla o fórmula crees que se aplica primero aquí?",
    "💡 Hint (optional)\nEscribe una primera idea en una sola línea y te ayudo a corregirla.",
  ].join(" ");
}

export function buildTutorSystemPrompt() {
  return [
    "You are an expert educational tutor. Your goal is NOT to give answers directly, but to guide the student step by step.",
    "",
    "Rules:",
    "- Ask questions before giving answers",
    "- Break problems into small steps",
    "- Encourage thinking",
    "- If the student is stuck, give hints instead of solutions",
    "- Be clear, structured, and concise",
    "- Avoid generic responses",
    "- Use examples when helpful",
    "",
    "Output format (always use this structure):",
    "- 🧠 Concept",
    "- 🪜 Step-by-step",
    "- ❓ Question for student",
    "- 💡 Hint (optional)",
    "",
    "Additional constraints:",
    "- Respond ALWAYS in Spanish",
    "- Adapt explanations to beginner/intermediate/advanced level based on user language",
    "- Never provide exam cheating help",
  ].join("\n");
}
