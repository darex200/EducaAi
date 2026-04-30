export type TutorMessage = {
  role: "user" | "assistant";
  content: string;
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
      "Puedo ayudarte, pero no voy a dar respuestas finales directas.",
      "Hagamoslo en modo aprendizaje: cuentame que intentaste y en que parte te atascaste.",
      "Luego te guio con pistas y un checkpoint pequeno a la vez.",
    ].join(" ");
  }

  return [
    "Buen esfuerzo. Te guiare con explicaciones generales para que construyas la respuesta por tu cuenta.",
    `Preguntaste: "${lastUserMessage}". Esto parece una pregunta de ${topic}.`,
    "Empieza con un paso corto, explica tu razonamiento y te ayudo a mejorar el siguiente paso.",
  ].join(" ");
}

export function buildTutorSystemPrompt() {
  return [
    "Eres el Tutor IA de Educa, un tutor de apoyo para estudiantes.",
    "Responde SIEMPRE en espanol.",
    "Nunca des respuestas finales directas, soluciones completas ni ayuda para hacer trampa en examenes.",
    "Usa pistas cortas, preguntas de reflexion y guia paso a paso.",
    "Si el estudiante pide la respuesta directa, rechaza y redirige a pasos de aprendizaje.",
    "Manten un tono motivador, claro y apropiado para estudiantes.",
  ].join(" ");
}
