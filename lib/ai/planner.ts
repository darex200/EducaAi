import { chatJSON } from "@/lib/ai/openai";

export type StudyPlanDay = {
  day: string;
  topics: string[];
  activities: string[];
  minutes: number;
};

export type StudyPlanWeek = {
  week: number;
  focus: string;
  days: StudyPlanDay[];
};

export type GeneratedStudyPlan = {
  weeks: StudyPlanWeek[];
  tips: string[];
};

export type PlannerParams = {
  level?: string | null;
  examDate?: string | null;
  hoursPerWeek: number;
  goal?: string;
  weakTopics: string[];
  pendingTopics: string[];
  masteredTopics: string[];
};

function weeksUntil(examDate?: string | null) {
  if (!examDate) return 4;
  const diff = new Date(examDate).getTime() - Date.now();
  if (Number.isNaN(diff) || diff <= 0) return 1;
  return Math.max(1, Math.min(12, Math.ceil(diff / (7 * 24 * 60 * 60 * 1000))));
}

function normalizePlan(raw: unknown): GeneratedStudyPlan | null {
  if (!raw || typeof raw !== "object") return null;
  const item = raw as Record<string, unknown>;
  const weeksRaw = Array.isArray(item.weeks) ? item.weeks : [];

  const weeks: StudyPlanWeek[] = weeksRaw
    .map((week, index) => {
      if (!week || typeof week !== "object") return null;
      const w = week as Record<string, unknown>;
      const daysRaw = Array.isArray(w.days) ? w.days : [];
      const days: StudyPlanDay[] = daysRaw
        .map((day) => {
          if (!day || typeof day !== "object") return null;
          const d = day as Record<string, unknown>;
          return {
            day: String(d.day ?? "").trim() || "Día",
            topics: Array.isArray(d.topics)
              ? d.topics.map((t) => String(t).trim()).filter(Boolean)
              : [],
            activities: Array.isArray(d.activities)
              ? d.activities.map((a) => String(a).trim()).filter(Boolean)
              : [],
            minutes: Math.max(10, Math.min(480, Math.round(Number(d.minutes) || 45))),
          };
        })
        .filter((d): d is StudyPlanDay => d !== null);
      if (!days.length) return null;
      return {
        week: Number(w.week) || index + 1,
        focus: String(w.focus ?? "").trim() || `Semana ${index + 1}`,
        days,
      };
    })
    .filter((w): w is StudyPlanWeek => w !== null);

  if (!weeks.length) return null;

  return {
    weeks,
    tips: Array.isArray(item.tips)
      ? item.tips.map((t) => String(t).trim()).filter(Boolean).slice(0, 6)
      : [],
  };
}

function buildFallbackPlan(params: PlannerParams): GeneratedStudyPlan {
  const totalWeeks = weeksUntil(params.examDate);
  const topics = [...params.weakTopics, ...params.pendingTopics];
  const pool = topics.length ? topics : ["Repaso general"];
  const sessionsPerWeek = Math.max(2, Math.min(6, Math.round(params.hoursPerWeek)));
  const minutesPerSession = Math.max(
    25,
    Math.round((params.hoursPerWeek * 60) / sessionsPerWeek),
  );
  const dayNames = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

  let topicIndex = 0;
  const weeks: StudyPlanWeek[] = Array.from({ length: totalWeeks }).map((_, weekIdx) => {
    const days: StudyPlanDay[] = Array.from({ length: sessionsPerWeek }).map((__, dayIdx) => {
      const topic = pool[topicIndex % pool.length];
      topicIndex += 1;
      const isLastWeek = weekIdx === totalWeeks - 1;
      return {
        day: dayNames[dayIdx % dayNames.length],
        topics: [topic],
        activities: isLastWeek
          ? [`Simulacro de examen sobre ${topic}`, "Revisión de errores"]
          : [`Estudiar teoría de ${topic}`, `Resolver ejercicios de ${topic}`],
        minutes: minutesPerSession,
      };
    });
    return {
      week: weekIdx + 1,
      focus:
        weekIdx === totalWeeks - 1
          ? "Repaso final y simulacros"
          : `Refuerzo: ${days[0]?.topics[0] ?? "temas pendientes"}`,
      days,
    };
  });

  return {
    weeks,
    tips: [
      "Estudia en bloques de 25-45 minutos con descansos cortos.",
      "Termina cada sesión con un mini-cuestionario para fijar lo aprendido.",
      "Prioriza los temas débiles al inicio de la semana, cuando tienes más energía.",
    ],
  };
}

export async function generateStudyPlan(params: PlannerParams): Promise<{
  plan: GeneratedStudyPlan;
  source: "openai" | "fallback";
}> {
  const totalWeeks = weeksUntil(params.examDate);

  const prompt = [
    "Genera un plan de estudio personalizado.",
    `Duración: ${totalWeeks} semana(s).`,
    `Horas disponibles por semana: ${params.hoursPerWeek}.`,
    params.level ? `Nivel académico: ${params.level}.` : "",
    params.examDate ? `Fecha del examen: ${params.examDate}.` : "Sin examen fijado: plan de mejora continua.",
    params.goal ? `Objetivo del estudiante: ${params.goal}.` : "",
    params.weakTopics.length
      ? `Temas débiles (prioridad máxima): ${params.weakTopics.join(", ")}.`
      : "",
    params.pendingTopics.length
      ? `Temas pendientes: ${params.pendingTopics.join(", ")}.`
      : "",
    params.masteredTopics.length
      ? `Temas ya dominados (solo repaso ligero): ${params.masteredTopics.join(", ")}.`
      : "",
    "",
    "Reglas: prioriza temas débiles al principio, incluye repaso espaciado, y si hay examen dedica la última semana a simulacros.",
    "Responde SOLO con JSON válido:",
    '{"weeks": [{"week": 1, "focus": "objetivo de la semana", "days": [{"day": "Lunes", "topics": ["..."], "activities": ["actividad concreta"], "minutes": 45}]}], "tips": ["consejo breve"]}',
    `Distribuye las sesiones para no superar ${params.hoursPerWeek} horas semanales. Todo en español.`,
  ]
    .filter(Boolean)
    .join("\n");

  const result = await chatJSON<unknown>(
    [
      {
        role: "system",
        content:
          "Eres un planificador de estudio experto. Respondes únicamente con JSON válido en español, sin markdown.",
      },
      { role: "user", content: prompt },
    ],
    { temperature: 0.4, maxTokens: 3000 },
  );

  const plan = normalizePlan(result);
  if (plan) return { plan, source: "openai" };
  return { plan: buildFallbackPlan(params), source: "fallback" };
}
