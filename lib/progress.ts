import { prisma } from "@/lib/db";

export type ProgressRisk = {
  level: "alto" | "medio";
  message: string;
};

export type ProgressSummary = {
  masteries: Array<{
    topic: string;
    subject: string;
    masteryScore: number;
    status: string;
    errorCount: number;
    interactions: number;
    lastStudiedAt: string;
  }>;
  totals: {
    topicsStudied: number;
    topicsMastered: number;
    weakTopics: number;
    quizzesTaken: number;
    avgQuizPct: number | null;
  };
  streakDays: number;
  totalMinutes: number;
  weekly: Array<{ label: string; minutes: number }>;
  risks: ProgressRisk[];
  recommendations: string[];
};

const DAY_MS = 24 * 60 * 60 * 1000;

function dayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function computeStreak(days: Set<string>) {
  let streak = 0;
  const cursor = new Date();
  // La racha sigue viva si hoy aún no se estudió pero ayer sí.
  if (!days.has(dayKey(cursor))) {
    cursor.setTime(cursor.getTime() - DAY_MS);
  }
  while (days.has(dayKey(cursor))) {
    streak += 1;
    cursor.setTime(cursor.getTime() - DAY_MS);
  }
  return streak;
}

function weekStart(date: Date) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dow = (d.getUTCDay() + 6) % 7; // lunes = 0
  d.setTime(d.getTime() - dow * DAY_MS);
  return d;
}

export async function getProgressSummary(userId: string): Promise<ProgressSummary> {
  const since = new Date(Date.now() - 90 * DAY_MS);

  const [masteries, sessions, attempts] = await Promise.all([
    prisma.topicMastery.findMany({
      where: { userId },
      orderBy: { masteryScore: "desc" },
      take: 50,
    }),
    prisma.studySession.findMany({
      where: { userId, day: { gte: since } },
      orderBy: { day: "asc" },
    }),
    prisma.quizAttempt.findMany({
      where: { userId, completedAt: { not: null } },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { topic: true, score: true, total: true, createdAt: true },
    }),
  ]);

  // --- Sesiones: racha, minutos y evolución semanal ---
  const studyDays = new Set(sessions.map((session) => dayKey(session.day)));
  const streakDays = computeStreak(studyDays);
  const totalMinutes = sessions.reduce((acc, session) => acc + session.durationMin, 0);

  const weekly: Array<{ label: string; minutes: number }> = [];
  const currentWeek = weekStart(new Date());
  for (let i = 7; i >= 0; i -= 1) {
    const start = new Date(currentWeek.getTime() - i * 7 * DAY_MS);
    const end = new Date(start.getTime() + 7 * DAY_MS);
    const minutes = sessions
      .filter((session) => session.day >= start && session.day < end)
      .reduce((acc, session) => acc + session.durationMin, 0);
    weekly.push({
      label: `${start.getUTCDate()}/${start.getUTCMonth() + 1}`,
      minutes,
    });
  }

  // --- Totales ---
  const ratios = attempts
    .filter((attempt) => attempt.total > 0)
    .map((attempt) => attempt.score / attempt.total);
  const avgQuizPct = ratios.length
    ? Math.round((ratios.reduce((a, b) => a + b, 0) / ratios.length) * 100)
    : null;

  const totals = {
    topicsStudied: masteries.length,
    topicsMastered: masteries.filter((m) => m.status === "dominado").length,
    weakTopics: masteries.filter((m) => m.status === "debil").length,
    quizzesTaken: attempts.length,
    avgQuizPct,
  };

  // --- Detección de riesgo (reglas) ---
  const risks: ProgressRisk[] = [];
  const recommendations: string[] = [];

  const lastThree = ratios.slice(0, 3);
  if (lastThree.length === 3 && lastThree.every((ratio) => ratio < 0.5)) {
    risks.push({
      level: "alto",
      message: "Tus últimos 3 cuestionarios estuvieron por debajo del 50%. Hay riesgo de arrastre de lagunas.",
    });
    recommendations.push(
      "Vuelve a la teoría base de los últimos temas evaluados y repite cuestionarios en dificultad básica antes de subir de nivel.",
    );
  }

  if (ratios.length >= 6) {
    const recent = ratios.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
    const previous = ratios.slice(3, 6).reduce((a, b) => a + b, 0) / 3;
    if (previous - recent >= 0.25) {
      risks.push({
        level: "medio",
        message: `Tu rendimiento en cuestionarios cayó de ${Math.round(previous * 100)}% a ${Math.round(recent * 100)}%.`,
      });
      recommendations.push("Identifica qué cambió: ¿temas nuevos más difíciles o menos tiempo de estudio? Ajusta tu plan.");
    }
  }

  const weakOnes = masteries.filter((m) => m.status === "debil");
  if (weakOnes.length) {
    risks.push({
      level: weakOnes.length >= 3 ? "alto" : "medio",
      message: `Temas débiles con errores acumulados: ${weakOnes
        .slice(0, 4)
        .map((m) => m.topic)
        .join(", ")}.`,
    });
    recommendations.push(
      `Dedica tu próxima sesión a ${weakOnes[0].topic} con práctica guiada y un cuestionario básico al final.`,
    );
  }

  const staleLimit = new Date(Date.now() - 14 * DAY_MS);
  const stale = masteries.filter(
    (m) => m.status !== "dominado" && m.lastStudiedAt < staleLimit,
  );
  if (stale.length) {
    risks.push({
      level: "medio",
      message: `Llevas más de 2 semanas sin tocar: ${stale
        .slice(0, 4)
        .map((m) => m.topic)
        .join(", ")}.`,
    });
    recommendations.push("Haz un repaso espaciado: 15 minutos por tema abandonado evita perder lo avanzado.");
  }

  if (streakDays === 0 && sessions.length > 0) {
    recommendations.push("Retoma tu racha hoy: una sesión corta de 10 minutos cuenta.");
  } else if (streakDays >= 3) {
    recommendations.push(`Llevas ${streakDays} días seguidos estudiando. Mantén el ritmo con sesiones cortas diarias.`);
  }

  if (!recommendations.length) {
    recommendations.push(
      masteries.length
        ? "Buen estado general. Sube la dificultad de tus cuestionarios para consolidar el dominio."
        : "Empieza una conversación con el tutor o genera un cuestionario para construir tu perfil de aprendizaje.",
    );
  }

  return {
    masteries: masteries.map((m) => ({
      topic: m.topic,
      subject: m.subject,
      masteryScore: m.masteryScore,
      status: m.status,
      errorCount: m.errorCount,
      interactions: m.interactions,
      lastStudiedAt: m.lastStudiedAt.toISOString(),
    })),
    totals,
    streakDays,
    totalMinutes,
    weekly,
    risks,
    recommendations,
  };
}
