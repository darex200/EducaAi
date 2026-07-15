import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUserId } from "@/lib/api-auth";
import { bumpStudySession } from "@/lib/study-session";
import {
  difficultyFromMastery,
  generateAdaptiveQuiz,
  gradeOpenAnswers,
  type GradedAnswer,
} from "@/lib/ai/exercises";
import { normalizeAppLocale } from "@/lib/i18n/locale-ai";
import type { AppLocale } from "@/lib/i18n/translations";
import { DEFAULT_LOCALE } from "@/lib/i18n/translations";
import {
  clampQuestionCount,
  getQuestionResult,
  isOpenQuestionType,
  type QuizDifficulty,
  type QuizQuestion,
  type QuizQuestionType,
} from "@/lib/quiz";

type GenerateBody = {
  action: "generate";
  topic?: string;
  level?: string;
  difficulty?: QuizDifficulty | "auto";
  questionType?: QuizQuestionType;
  questionCount?: number;
  subtopics?: string[];
  locale?: string;
};

type SubmitBody = {
  action: "submit";
  attemptId?: string;
  questions?: QuizQuestion[];
  answers?: Record<string, string>;
  topic?: string;
  locale?: string;
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function masteryStatus(score: number, errorCount: number) {
  if (score >= 80) return "dominado";
  if (score < 45 && errorCount >= 3) return "debil";
  return "en_progreso";
}

async function handleGenerate(body: GenerateBody, userId: string | null) {
  const topic = (body.topic ?? "").trim();
  if (!topic) {
    return NextResponse.json({ error: "Falta el tema del cuestionario." }, { status: 400 });
  }

  const questionType: QuizQuestionType = body.questionType ?? "mixto";
  const questionCount = clampQuestionCount(body.questionCount);

  let difficulty: QuizDifficulty;
  let masteryScore: number | null = null;
  let weaknesses: string[] = [];
  let commonErrors: string[] = [];

  if (userId) {
    const [mastery, profile] = await Promise.all([
      prisma.topicMastery.findUnique({
        where: { userId_topic: { userId, topic } },
        select: { masteryScore: true },
      }),
      prisma.learningProfile.findUnique({
        where: { userId },
        select: { weaknesses: true, commonErrors: true },
      }),
    ]);
    masteryScore = mastery?.masteryScore ?? null;
    weaknesses = profile?.weaknesses ?? [];
    commonErrors = Array.isArray(profile?.commonErrors)
      ? (profile.commonErrors as Array<{ error?: string }>)
          .map((item) => String(item.error ?? ""))
          .filter(Boolean)
          .slice(-5)
      : [];
  }

  if (body.difficulty && body.difficulty !== "auto") {
    difficulty = body.difficulty;
  } else {
    difficulty = difficultyFromMastery(masteryScore);
  }

  const locale = normalizeAppLocale(body.locale);

  const { quiz, source } = await generateAdaptiveQuiz({
    topic,
    level: body.level,
    difficulty,
    questionType,
    questionCount,
    subtopics: body.subtopics,
    weaknesses,
    commonErrors,
    locale,
  });

  let attemptId: string | null = null;
  if (userId) {
    try {
      const attempt = await prisma.quizAttempt.create({
        data: {
          userId,
          topic,
          difficulty,
          questionType,
          questions: quiz as unknown as object[],
          total: quiz.length,
        },
        select: { id: true },
      });
      attemptId = attempt.id;
    } catch (error) {
      console.error("[quiz] no se pudo guardar el intento:", error);
    }
  }

  return NextResponse.json({
    quiz,
    attemptId,
    difficulty,
    source,
    ...(masteryScore != null ? { masteryScore } : {}),
    ...(source === "fallback"
      ? { note: "Se generó un cuestionario de respaldo porque la IA no respondió correctamente." }
      : {}),
  });
}

async function gradeQuiz(
  questions: QuizQuestion[],
  answers: Record<string, string>,
  locale: AppLocale = DEFAULT_LOCALE,
): Promise<{ feedback: GradedAnswer[]; score: number }> {
  const labels = {
    en: {
      correct: "Correct answer.",
      unanswered: "Unanswered.",
      incorrect: (answer: string) => `Incorrect. Expected answer: ${answer}`,
      recorded: "Answer recorded.",
    },
    es: {
      correct: "Respuesta correcta.",
      unanswered: "Sin responder.",
      incorrect: (answer: string) => `Incorrecta. Respuesta esperada: ${answer}`,
      recorded: "Respuesta registrada.",
    },
    pt: {
      correct: "Resposta correta.",
      unanswered: "Sem resposta.",
      incorrect: (answer: string) => `Incorreta. Resposta esperada: ${answer}`,
      recorded: "Resposta registrada.",
    },
  }[locale];

  const objective: GradedAnswer[] = [];
  const openItems: Array<{ question: QuizQuestion; userAnswer: string }> = [];

  for (const question of questions) {
    const userAnswer = (answers[question.id] ?? "").trim();
    if (isOpenQuestionType(question.type) && userAnswer) {
      openItems.push({ question, userAnswer });
      continue;
    }
    const result = getQuestionResult(question, userAnswer);
    objective.push({
      questionId: question.id,
      correct: result === "correcta",
      feedback:
        result === "correcta"
          ? labels.correct
          : result === "sin-responder"
            ? labels.unanswered
            : question.answer
              ? labels.incorrect(question.answer)
              : labels.recorded,
    });
  }

  const openGraded = await gradeOpenAnswers(openItems, locale);
  const feedback = [...objective, ...openGraded];
  const score = feedback.filter((item) => item.correct).length;
  return { feedback, score };
}

async function handleSubmit(body: SubmitBody, userId: string | null) {
  const answers = body.answers ?? {};

  // Con sesión y attemptId: corrige, guarda el intento y actualiza el dominio.
  if (userId && body.attemptId) {
    const attempt = await prisma.quizAttempt.findFirst({
      where: { id: body.attemptId, userId },
    });
    if (!attempt) {
      return NextResponse.json({ error: "Intento no encontrado." }, { status: 404 });
    }

    const questions = (attempt.questions as unknown as QuizQuestion[]) ?? [];
    const locale = normalizeAppLocale(body.locale);
    const { feedback, score } = await gradeQuiz(questions, answers, locale);
    const total = questions.length || attempt.total;

    await prisma.quizAttempt.update({
      where: { id: attempt.id },
      data: {
        answers: answers as unknown as object,
        feedback: feedback as unknown as object[],
        score,
        total,
        completedAt: new Date(),
      },
    });

    // Actualiza el dominio del tema según el desempeño.
    const ratio = total > 0 ? score / total : 0;
    const delta = clamp(Math.round((ratio - 0.55) * 20), -10, 10);
    const wrongCount = total - score;
    const existing = await prisma.topicMastery.findUnique({
      where: { userId_topic: { userId, topic: attempt.topic } },
    });
    const newScore = clamp((existing?.masteryScore ?? 0) + delta, 0, 100);
    const newErrors = (existing?.errorCount ?? 0) + wrongCount;
    await prisma.topicMastery.upsert({
      where: { userId_topic: { userId, topic: attempt.topic } },
      create: {
        userId,
        topic: attempt.topic,
        masteryScore: clamp(delta, 0, 100),
        errorCount: wrongCount,
        interactions: 1,
        status: masteryStatus(clamp(delta, 0, 100), wrongCount),
      },
      update: {
        masteryScore: newScore,
        errorCount: newErrors,
        interactions: { increment: 1 },
        status: masteryStatus(newScore, newErrors),
      },
    });

    await bumpStudySession(userId, Math.max(3, Math.round(total * 1.5)), attempt.topic);

    return NextResponse.json({ score, total, feedback, masteryScore: newScore });
  }

  // Modo demo: corrige las preguntas enviadas sin persistir.
  const questions = body.questions ?? [];
  if (!questions.length) {
    return NextResponse.json(
      { error: "No hay preguntas para corregir." },
      { status: 400 },
    );
  }
  const locale = normalizeAppLocale(body.locale);
  const { feedback, score } = await gradeQuiz(questions, answers, locale);
  return NextResponse.json({ score, total: questions.length, feedback });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as GenerateBody | SubmitBody;
    const userId = await getAuthUserId();

    if (body.action === "generate") {
      return await handleGenerate(body, userId);
    }
    if (body.action === "submit") {
      return await handleSubmit(body, userId);
    }
    return NextResponse.json({ error: "Acción no soportada." }, { status: 400 });
  } catch (error) {
    console.error("[quiz] error:", error);
    return NextResponse.json(
      { error: "No se pudo procesar la solicitud del cuestionario." },
      { status: 500 },
    );
  }
}
