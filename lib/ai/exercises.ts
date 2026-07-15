import { chatJSON } from "@/lib/ai/openai";
import type { AppLocale } from "@/lib/i18n/translations";
import { DEFAULT_LOCALE } from "@/lib/i18n/translations";
import { aiJsonSystemPrompt, aiLanguageLabel } from "@/lib/i18n/locale-ai";
import {
  buildFallbackQuiz,
  clampQuestionCount,
  normalizeQuiz,
  type QuizDifficulty,
  type QuizQuestion,
  type QuizQuestionType,
} from "@/lib/quiz";

const TYPE_INSTRUCTIONS: Record<QuizQuestionType, string> = {
  opcion_multiple:
    'Todas las preguntas de tipo "opcion_multiple" con exactamente 4 opciones plausibles y una sola correcta.',
  verdadero_falso:
    'Todas las preguntas de tipo "verdadero_falso". El campo "answer" debe ser "Verdadero" o "Falso" y la afirmación no debe ser ambigua.',
  abiertas:
    'Todas las preguntas de tipo "abierta", que exijan explicar o justificar. En "answer" incluye los criterios de una buena respuesta.',
  problemas:
    'Todas las preguntas de tipo "problema": ejercicios con datos numéricos o concretos para resolver paso a paso. En "answer" incluye el resultado y el procedimiento resumido.',
  casos:
    'Todas las preguntas de tipo "caso": un escenario breve y realista seguido de una pregunta de análisis. En "answer" incluye los puntos clave del análisis esperado.',
  examen:
    'Estilo examen oficial: mezcla "opcion_multiple", "verdadero_falso" y "problema", con redacción formal de examen y dificultad pareja.',
  mixto:
    'Mezcla equilibrada de tipos: "opcion_multiple", "verdadero_falso", "abierta" y "problema".',
};

export type GenerateQuizParams = {
  topic: string;
  level?: string;
  difficulty: QuizDifficulty;
  questionType: QuizQuestionType;
  questionCount: number;
  subtopics?: string[];
  weaknesses?: string[];
  commonErrors?: string[];
  locale?: AppLocale;
};

/** Calcula la dificultad automática a partir del dominio del tema (0-100). */
export function difficultyFromMastery(masteryScore: number | null | undefined): QuizDifficulty {
  if (masteryScore == null) return "basico";
  if (masteryScore >= 75) return "avanzado";
  if (masteryScore >= 40) return "intermedio";
  return "basico";
}

export async function generateAdaptiveQuiz(params: GenerateQuizParams): Promise<{
  quiz: QuizQuestion[];
  source: "openai" | "fallback";
}> {
  const count = clampQuestionCount(params.questionCount);
  const locale = params.locale ?? DEFAULT_LOCALE;
  const language = aiLanguageLabel(locale);
  const prompt = [
    `Generate a quiz with ${count} questions about "${params.topic}".`,
    params.level ? `Student level: ${params.level}.` : "",
    `Difficulty: ${params.difficulty}.`,
    TYPE_INSTRUCTIONS[params.questionType],
    params.subtopics?.length ? `Cover these subtopics: ${params.subtopics.join(", ")}.` : "",
    params.weaknesses?.length
      ? `The student has weaknesses in: ${params.weaknesses.join(", ")}. Include 1-2 reinforcing questions.`
      : "",
    params.commonErrors?.length
      ? `Frequent student errors: ${params.commonErrors.join(" | ")}. Design distractors or questions that detect repeats.`
      : "",
    "",
    "Respond ONLY with valid JSON in this exact shape:",
    '{"quiz": [{"id": "q1", "type": "opcion_multiple|verdadero_falso|abierta|problema|caso|examen", "question": "...", "options": ["..."], "answer": "..."}]}',
    'Questions without options (abierta, problema, caso) omit the "options" field.',
    `All content in ${language}. If there is math, write formulas in LaTeX with $...$.`,
  ]
    .filter(Boolean)
    .join("\n");

  const result = await chatJSON<{ quiz?: unknown }>(
    [
      { role: "system", content: aiJsonSystemPrompt(locale) },
      { role: "user", content: prompt },
    ],
    { temperature: 0.4, maxTokens: 2500 },
  );

  if (result?.quiz) {
    const quiz = normalizeQuiz(result.quiz, params.topic, count, params.questionType, locale);
    if (quiz.length) {
      return { quiz, source: "openai" };
    }
  }

  return {
    quiz: buildFallbackQuiz(params.topic, count, params.questionType, locale),
    source: "fallback",
  };
}

export type GradedAnswer = {
  questionId: string;
  correct: boolean;
  feedback: string;
};

/**
 * Corrige respuestas abiertas con IA. Las preguntas objetivas (opción
 * múltiple, V/F) se corrigen por comparación directa antes de llamar aquí.
 */
export async function gradeOpenAnswers(
  items: Array<{ question: QuizQuestion; userAnswer: string }>,
  locale: AppLocale = DEFAULT_LOCALE,
): Promise<GradedAnswer[]> {
  if (!items.length) return [];

  const language = aiLanguageLabel(locale);
  const feedbackAccepted = {
    en: "Answer accepted.",
    es: "Respuesta aceptada.",
    pt: "Resposta aceita.",
  }[locale];
  const feedbackRecorded = {
    en: "Answer recorded; compare it with the suggested solution.",
    es: "Respuesta registrada; compárala con la solución sugerida.",
    pt: "Resposta registrada; compare com a solução sugerida.",
  }[locale];

  const payload = items.map(({ question, userAnswer }, index) => ({
    id: question.id || `open-${index}`,
    pregunta: question.question,
    criterios: question.answer ?? "Evalúa exactitud conceptual y justificación.",
    respuesta_estudiante: userAnswer.slice(0, 1200),
  }));

  const result = await chatJSON<{
    results?: Array<{ id?: string; correct?: boolean; feedback?: string }>;
  }>(
    [
      {
        role: "system",
        content: [
          "You are a fair but rigorous academic grader. Evaluate each student answer against the criteria.",
          'Respond ONLY with JSON: {"results": [{"id": "...", "correct": true|false, "feedback": "brief explanation (max 2 sentences) of why and how to improve"}]}',
          "Mark correct=true if the answer shows essential understanding even if wording differs.",
          `Feedback in ${language}, concrete and useful.`,
        ].join("\n"),
      },
      { role: "user", content: JSON.stringify({ respuestas: payload }) },
    ],
    { temperature: 0.1, maxTokens: 1500 },
  );

  const graded = result?.results ?? [];
  return items.map(({ question, userAnswer }, index) => {
    const match = graded.find((item) => item.id === (question.id || `open-${index}`));
    if (match) {
      return {
        questionId: question.id,
        correct: Boolean(match.correct),
        feedback: String(match.feedback ?? "").slice(0, 400),
      };
    }
    const expected = (question.answer ?? "").trim().toLowerCase();
    const given = userAnswer.trim().toLowerCase();
    const correct = Boolean(expected && given && (given === expected || expected.includes(given)));
    return {
      questionId: question.id,
      correct,
      feedback: correct ? feedbackAccepted : feedbackRecorded,
    };
  });
}
