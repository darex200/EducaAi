import { prisma } from "@/lib/db";
import { chatJSON } from "@/lib/ai/openai";
import { bumpStudySession } from "@/lib/study-session";

type DiagnosticResult = {
  topic?: string;
  subject?: string;
  estimatedLevel?: string;
  errorsDetected?: string[];
  gaps?: string[];
  masteryDelta?: number;
  understood?: boolean;
};

type StoredError = { error: string; topic: string; at: string };

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function masteryStatus(score: number, errorCount: number) {
  if (score >= 80) return "dominado";
  if (score < 45 && errorCount >= 3) return "debil";
  if (score === 0 && errorCount === 0) return "nuevo";
  return "en_progreso";
}

/**
 * Analiza el último intercambio tutor-estudiante con una llamada ligera a
 * OpenAI (JSON mode) y actualiza TopicMastery + LearningProfile.
 * Pensado para ejecutarse con after(), sin bloquear la respuesta del chat.
 */
export async function runDiagnostics(params: {
  userId: string;
  topic: string;
  userMessage: string;
  assistantReply: string;
}) {
  const { userId, topic, userMessage, assistantReply } = params;

  try {
    const result = await chatJSON<DiagnosticResult>(
      [
        {
          role: "system",
          content: [
            "Eres un evaluador pedagógico. Analiza el intercambio entre un estudiante y su tutor.",
            "Responde SOLO con JSON válido con esta forma:",
            '{"topic": "tema específico tratado", "subject": "materia general (matematicas, fisica, historia...)", "estimatedLevel": "basico|intermedio|avanzado", "errorsDetected": ["errores conceptuales o de procedimiento del ESTUDIANTE"], "gaps": ["lagunas de conocimiento detectadas"], "masteryDelta": -10 a 10, "understood": true|false}',
            "masteryDelta: positivo si el estudiante muestra comprensión/avance, negativo si muestra confusión o errores, 0 si neutro.",
            "Si el mensaje no es académico, devuelve masteryDelta 0 y listas vacías.",
          ].join("\n"),
        },
        {
          role: "user",
          content: `Tema declarado: ${topic || "desconocido"}\n\nESTUDIANTE:\n${userMessage.slice(0, 2000)}\n\nTUTOR:\n${assistantReply.slice(0, 2000)}`,
        },
      ],
      { temperature: 0.1, maxTokens: 500 },
    );

    if (!result) return;

    const resolvedTopic = (result.topic || topic || "").trim().slice(0, 120);
    if (!resolvedTopic) return;

    const errors = (result.errorsDetected ?? [])
      .map((item) => String(item).trim())
      .filter(Boolean)
      .slice(0, 5);
    const gaps = (result.gaps ?? [])
      .map((item) => String(item).trim())
      .filter(Boolean)
      .slice(0, 5);
    const delta = clamp(Math.round(Number(result.masteryDelta) || 0), -10, 10);

    const existing = await prisma.topicMastery.findUnique({
      where: { userId_topic: { userId, topic: resolvedTopic } },
    });

    const newScore = clamp((existing?.masteryScore ?? 0) + delta, 0, 100);
    const newErrorCount = (existing?.errorCount ?? 0) + errors.length;

    await prisma.topicMastery.upsert({
      where: { userId_topic: { userId, topic: resolvedTopic } },
      create: {
        userId,
        topic: resolvedTopic,
        subject: (result.subject ?? "").trim().slice(0, 60),
        masteryScore: clamp(delta, 0, 100),
        errorCount: errors.length,
        interactions: 1,
        status: masteryStatus(clamp(delta, 0, 100), errors.length),
      },
      update: {
        masteryScore: newScore,
        errorCount: newErrorCount,
        interactions: { increment: 1 },
        status: masteryStatus(newScore, newErrorCount),
        ...(result.subject ? { subject: result.subject.trim().slice(0, 60) } : {}),
      },
    });

    // Actualiza el perfil vivo: lagunas como debilidades y errores recurrentes.
    const profile = await prisma.learningProfile.findUnique({
      where: { userId },
    });
    if (profile) {
      const weaknesses = Array.from(
        new Set([...profile.weaknesses, ...gaps]),
      ).slice(-12);

      const previousErrors = Array.isArray(profile.commonErrors)
        ? (profile.commonErrors as unknown as StoredError[])
        : [];
      const newErrors: StoredError[] = errors.map((error) => ({
        error,
        topic: resolvedTopic,
        at: new Date().toISOString(),
      }));
      const commonErrors = [...previousErrors, ...newErrors].slice(-20);

      const strengths =
        delta > 0 && newScore >= 70
          ? Array.from(new Set([...profile.strengths, resolvedTopic])).slice(-12)
          : profile.strengths;

      await prisma.learningProfile.update({
        where: { userId },
        data: {
          weaknesses,
          strengths,
          commonErrors: commonErrors as unknown as object[],
        },
      });
    }

    await bumpStudySession(userId, 2, resolvedTopic);
  } catch (error) {
    console.error("[diagnostics] fallo el diagnostico:", error);
  }
}
