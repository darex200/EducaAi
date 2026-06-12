import { prisma } from "@/lib/db";

function todayUTC() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

/**
 * Acumula minutos de estudio en la sesión diaria del usuario.
 * Cada interacción (mensaje, quiz, documento) suma una estimación de tiempo.
 */
export async function bumpStudySession(
  userId: string,
  minutes: number,
  topic?: string,
) {
  const day = todayUTC();
  const normalizedTopic = topic?.trim();

  try {
    const existing = await prisma.studySession.findUnique({
      where: { userId_day: { userId, day } },
      select: { id: true, topics: true },
    });

    if (!existing) {
      await prisma.studySession.create({
        data: {
          userId,
          day,
          durationMin: minutes,
          topics: normalizedTopic ? [normalizedTopic] : [],
        },
      });
      return;
    }

    const topics =
      normalizedTopic && !existing.topics.includes(normalizedTopic)
        ? [...existing.topics, normalizedTopic]
        : existing.topics;

    await prisma.studySession.update({
      where: { id: existing.id },
      data: {
        durationMin: { increment: minutes },
        endedAt: new Date(),
        topics,
      },
    });
  } catch (error) {
    console.error("[study-session] no se pudo registrar:", error);
  }
}
