export function getDemoProgressSummary() {
  const now = new Date();
  const weekLabels = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

  return {
    masteries: [
      {
        topic: "Matemáticas",
        subject: "Matemáticas",
        masteryScore: 62,
        status: "en_progreso",
        errorCount: 2,
        interactions: 14,
        lastStudiedAt: now.toISOString(),
      },
      {
        topic: "Ciencias",
        subject: "Ciencias",
        masteryScore: 38,
        status: "debil",
        errorCount: 4,
        interactions: 9,
        lastStudiedAt: now.toISOString(),
      },
      {
        topic: "Lenguaje",
        subject: "Lenguaje",
        masteryScore: 81,
        status: "dominado",
        errorCount: 0,
        interactions: 11,
        lastStudiedAt: now.toISOString(),
      },
    ],
    totals: {
      topicsStudied: 3,
      topicsMastered: 1,
      weakTopics: 1,
      quizzesTaken: 4,
      avgQuizPct: 72,
    },
    streakDays: 3,
    totalMinutes: 145,
    weekly: weekLabels.map((label, index) => ({
      label,
      minutes: [20, 35, 0, 25, 40, 15, 10][index] ?? 0,
    })),
    risks: [
      {
        level: "medio" as const,
        message: "Ciencias necesita refuerzo esta semana.",
      },
    ],
    recommendations: [
      "Repasa Ciencias 20 minutos antes del próximo quiz.",
      "Mantén tu racha estudiando al menos 15 minutos hoy.",
    ],
    demo: true,
  };
}
