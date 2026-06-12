import { chatJSON } from "@/lib/ai/openai";
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
  const prompt = [
    `Genera un cuestionario de ${count} preguntas sobre "${params.topic}".`,
    params.level ? `Nivel del estudiante: ${params.level}.` : "",
    `Dificultad: ${params.difficulty}.`,
    TYPE_INSTRUCTIONS[params.questionType],
    params.subtopics?.length
      ? `Cubre estos subtemas: ${params.subtopics.join(", ")}.`
      : "",
    params.weaknesses?.length
      ? `El estudiante tiene debilidades en: ${params.weaknesses.join(", ")}. Incluye 1-2 preguntas que las refuercen.`
      : "",
    params.commonErrors?.length
      ? `Errores frecuentes del estudiante: ${params.commonErrors.join(" | ")}. Diseña distractores o preguntas que detecten si los repite.`
      : "",
    "",
    "Responde SOLO con JSON válido con esta forma exacta:",
    '{"quiz": [{"id": "q1", "type": "opcion_multiple|verdadero_falso|abierta|problema|caso|examen", "question": "...", "options": ["..."], "answer": "..."}]}',
    'Las preguntas sin opciones (abierta, problema, caso) omiten el campo "options".',
    "Todo el contenido en español. Si hay matemáticas, escribe fórmulas en LaTeX con $...$.",
  ]
    .filter(Boolean)
    .join("\n");

  const result = await chatJSON<{ quiz?: unknown }>(
    [
      {
        role: "system",
        content:
          "Eres un generador de contenido educativo experto. Respondes únicamente con JSON válido en español, sin markdown.",
      },
      { role: "user", content: prompt },
    ],
    { temperature: 0.4, maxTokens: 2500 },
  );

  if (result?.quiz) {
    const quiz = normalizeQuiz(result.quiz, params.topic, count, params.questionType);
    if (quiz.length) {
      return { quiz, source: "openai" };
    }
  }

  return {
    quiz: buildFallbackQuiz(params.topic, count, params.questionType),
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
): Promise<GradedAnswer[]> {
  if (!items.length) return [];

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
          "Eres un corrector académico justo pero exigente. Evalúa cada respuesta del estudiante frente a los criterios.",
          'Responde SOLO con JSON: {"results": [{"id": "...", "correct": true|false, "feedback": "explicación breve (máx 2 frases) de por qué y cómo mejorar"}]}',
          "Marca correct=true si la respuesta demuestra comprensión esencial aunque la redacción difiera.",
          "Feedback en español, concreto y útil.",
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
    // Fallback sin IA: comparación laxa con la respuesta esperada.
    const expected = (question.answer ?? "").trim().toLowerCase();
    const given = userAnswer.trim().toLowerCase();
    const correct = Boolean(expected && given && (given === expected || expected.includes(given)));
    return {
      questionId: question.id,
      correct,
      feedback: correct
        ? "Respuesta aceptada."
        : "Respuesta registrada; compárala con la solución sugerida.",
    };
  });
}
