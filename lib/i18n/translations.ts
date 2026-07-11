export type AppLocale = "en" | "es";

export const DEFAULT_LOCALE: AppLocale = "en";

export const translations = {
  en: {
    assistantTitle: "Guided learning assistant",
    guidedTutor: "Guided academic tutor",
    typing: "Tutor is typing…",
    emptyChat: "Type your question to get started.",
    emptyChatWithTopic: "Ask anything about {topic}.",
    topicNotSelected: "Not selected",
    levelNotSet: "Not set",
    difficultyNotSet: "Not defined",
    newConversation: "+ New conversation",
    aiTools: "AI tools",
    generateQuiz: "Generate quiz",
    exploreContent: "Explore content",
    guidedPractice: "Guided practice",
    analyzeDocument: "Analyze document",
    analyzingDocument: "Analyzing document…",
    history: "History",
    deleteConversation: "Delete conversation",
    topics: "Topics",
    selectTopic: "Select a topic",
    progress: "Progress",
    studyPlan: "Study plan",
    changeTopic: "Change topic",
    lightMode: "Light mode",
    darkMode: "Dark mode",
    session: "Session",
    noSession: "No session",
    signOut: "Sign out",
    inputPlaceholder:
      "Ask anything, request an illustration (e.g. “generate a diagram of…”), or attach an image…",
    inputHint: "Enter to send · Shift+Enter for new line",
    sendMessage: "Send message",
    userAvatar: "You",
    assistantAvatar: "AI",
    imageSent: "Uploaded image",
    imageGenerated: "Generated educational illustration",
    chatError: "Error contacting the AI tutor. Check your API key and try again.",
    difficultyBasic: "Basic",
    difficultyIntermediate: "Intermediate",
    difficultyAdvanced: "Advanced",
    customTopicDescription: "Custom topic to study {topic} with the AI tutor.",
    categoryCustom: "Custom",
    languageLabel: "Language",
    imageReplyWithTopic:
      "Here is an educational illustration about **{topic}**. Which part would you like me to explain step by step?",
    imageReply:
      "Here is the educational illustration you requested. Which part would you like me to explain step by step?",
    imageApiKeyMissing:
      "To generate educational illustrations, configure `OPENAI_API_KEY` on the server. Then write, for example: **Generate a diagram of the cell**.",
    imageGenerationFailed:
      "I couldn't generate the illustration this time. Check that your `OPENAI_API_KEY` has image generation access (DALL·E). Try again with a clear phrase, for example: **Generate a diagram of photosynthesis**.",
    chatErrorFallback:
      "I had a temporary issue. Resend your question and I'll guide you step by step.",
    analyzeImagePrompt: "Please analyze this image.",
  },
  es: {
    assistantTitle: "Asistente de aprendizaje guiado",
    guidedTutor: "Tutor académico guiado",
    typing: "El tutor está escribiendo…",
    emptyChat: "Escribe tu pregunta para comenzar.",
    emptyChatWithTopic: "Pregunta lo que quieras sobre {topic}.",
    topicNotSelected: "No seleccionado",
    levelNotSet: "No definido",
    difficultyNotSet: "No definido",
    newConversation: "+ Nueva conversación",
    aiTools: "Herramientas IA",
    generateQuiz: "Generar cuestionario",
    exploreContent: "Explorar contenido",
    guidedPractice: "Práctica guiada",
    analyzeDocument: "Analizar documento",
    analyzingDocument: "Analizando documento…",
    history: "Historial",
    deleteConversation: "Eliminar conversación",
    topics: "Temas",
    selectTopic: "Selecciona un tema",
    progress: "Progreso",
    studyPlan: "Plan de estudio",
    changeTopic: "Cambiar tema",
    lightMode: "Modo claro",
    darkMode: "Modo oscuro",
    session: "Sesión",
    noSession: "Sin sesión",
    signOut: "Cerrar sesión",
    inputPlaceholder:
      "Pregunta lo que quieras, pide una ilustración (ej. «genera un diagrama de…») o adjunta una imagen…",
    inputHint: "Enter para enviar · Shift+Enter para nueva línea",
    sendMessage: "Enviar mensaje",
    userAvatar: "Tú",
    assistantAvatar: "IA",
    imageSent: "Imagen enviada",
    imageGenerated: "Ilustración educativa generada",
    chatError: "Error al contactar el tutor IA. Verifica tu API key e intenta de nuevo.",
    difficultyBasic: "Básico",
    difficultyIntermediate: "Intermedio",
    difficultyAdvanced: "Avanzado",
    customTopicDescription: "Tema personalizado para trabajar {topic} con el tutor IA.",
    categoryCustom: "Personalizado",
    languageLabel: "Idioma",
    imageReplyWithTopic:
      "Aquí tienes una ilustración educativa sobre **{topic}**. ¿Qué parte te gustaría que te explique paso a paso?",
    imageReply:
      "Aquí tienes la ilustración educativa que pediste. ¿Qué parte te gustaría que te explique paso a paso?",
    imageApiKeyMissing:
      "Para generar ilustraciones educativas configura `OPENAI_API_KEY` en el servidor. Luego escribe, por ejemplo: **Genera un diagrama de la célula**.",
    imageGenerationFailed:
      "No pude generar la ilustración en este intento. Verifica que tu `OPENAI_API_KEY` tenga acceso a generación de imágenes (DALL·E). Puedes intentar de nuevo con una frase clara, por ejemplo: **Genera un diagrama de la fotosíntesis**.",
    chatErrorFallback:
      "Tuve un problema temporal. Reenvía tu pregunta y te guiaré paso a paso.",
    analyzeImagePrompt: "Analiza esta imagen, por favor.",
  },
} as const;

export type TranslationKey = keyof typeof translations.en;

export function t(locale: AppLocale, key: TranslationKey, vars?: Record<string, string>) {
  let text: string = translations[locale][key];
  if (vars) {
    for (const [name, value] of Object.entries(vars)) {
      text = text.replaceAll(`{${name}}`, value);
    }
  }
  return text;
}

export function difficultyLabel(
  locale: AppLocale,
  difficulty: "basico" | "intermedio" | "avanzado" | string,
) {
  const map = {
    basico: "difficultyBasic",
    intermedio: "difficultyIntermediate",
    avanzado: "difficultyAdvanced",
  } as const;
  const key = map[difficulty as keyof typeof map];
  return key ? t(locale, key) : difficulty;
}

export function localeInstruction(locale: AppLocale) {
  return locale === "es"
    ? "Responde siempre en español."
    : "Always respond in English.";
}
