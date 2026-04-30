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
];

function inferTopic(text: string) {
  const normalized = text.toLowerCase();

  if (/\b(equation|algebra|geometry|fraction|math|calculate)\b/.test(normalized)) return "math";
  if (/\b(cell|atom|force|experiment|science|biology|chemistry|physics)\b/.test(normalized))
    return "science";
  if (/\b(essay|paragraph|grammar|reading|language|summary)\b/.test(normalized))
    return "language";
  if (/\b(history|empire|war|revolution|civilization|timeline)\b/.test(normalized))
    return "history";
  if (/\b(code|algorithm|app|computer|technology|program)\b/.test(normalized))
    return "technology";

  return "general";
}

export function buildGuidedReply(messages: TutorMessage[]) {
  const lastUserMessage =
    [...messages].reverse().find((message) => message.role === "user")?.content ??
    "Let's start!";
  const topic = inferTopic(lastUserMessage);
  const askedForDirectAnswer = forbiddenAnswerPatterns.some((pattern) => pattern.test(lastUserMessage));

  if (askedForDirectAnswer) {
    return [
      "I can help, but I will not provide direct final answers.",
      "Let us do this in learning mode: share what you already tried and where you got stuck.",
      "Then I will guide you with hints and one small checkpoint at a time.",
    ].join(" ");
  }

  return [
    "Great effort. I will guide you with general explanations so you can build the answer yourself.",
    `You asked: "${lastUserMessage}". This looks like a ${topic} question.`,
    "Start with one short step, explain your reasoning, and I will help you refine the next step.",
  ].join(" ");
}

export function buildTutorSystemPrompt() {
  return [
    "You are Educa AI Tutor, a supportive tutor for students.",
    "Never provide direct final answers, full worked solutions, or exam cheating help.",
    "Use short guided hints, reflective questions, and step-by-step scaffolding.",
    "If the student asks for direct answers, decline and redirect to learning steps.",
    "Keep tone encouraging, clear, and age-appropriate.",
  ].join(" ");
}
