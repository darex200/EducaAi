import { chatJSON } from "@/lib/ai/openai";
import type { AppLocale } from "@/lib/i18n/translations";
import { localeInstruction } from "@/lib/i18n/translations";

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
  locale?: AppLocale;
};

export type PlannerParams = {
  level?: string | null;
  examDate?: string | null;
  hoursPerWeek: number;
  goal?: string;
  weakTopics: string[];
  pendingTopics: string[];
  masteredTopics: string[];
  locale?: AppLocale;
};

const PLANNER_COPY = {
  en: {
    dayNames: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    defaultDay: "Day",
    defaultWeek: (n: number) => `Week ${n}`,
    generalReview: "General review",
    finalReview: "Final review and mock exams",
    reinforcement: (topic: string) => `Reinforcement: ${topic}`,
    pendingTopics: "pending topics",
    mockExam: (topic: string) => `Mock exam on ${topic}`,
    errorReview: "Error review",
    studyTheory: (topic: string) => `Study theory for ${topic}`,
    solveExercises: (topic: string) => `Solve exercises on ${topic}`,
    tips: [
      "Study in 25-45 minute blocks with short breaks.",
      "End each session with a mini-quiz to reinforce learning.",
      "Prioritize weak topics early in the week when you have more energy.",
    ],
    system:
      "You are an expert study planner. Respond only with valid JSON in English, without markdown.",
    promptLead: "Generate a personalized study plan.",
    duration: (weeks: number) => `Duration: ${weeks} week(s).`,
    hours: (hours: number) => `Available hours per week: ${hours}.`,
    level: (value: string) => `Academic level: ${value}.`,
    examDate: (value: string) => `Exam date: ${value}.`,
    noExam: "No exam date: continuous improvement plan.",
    goal: (value: string) => `Student goal: ${value}.`,
    weak: (topics: string) => `Weak topics (top priority): ${topics}.`,
    pending: (topics: string) => `Pending topics: ${topics}.`,
    mastered: (topics: string) => `Mastered topics (light review only): ${topics}.`,
    rules:
      "Rules: prioritize weak topics first, include spaced review, and dedicate the final week to mock exams when an exam date exists.",
    jsonShape:
      '{"weeks": [{"week": 1, "focus": "weekly goal", "days": [{"day": "Monday", "topics": ["..."], "activities": ["concrete activity"], "minutes": 45}]}], "tips": ["short tip"]}',
    distribute: (hours: number) =>
      `Distribute sessions so they do not exceed ${hours} weekly hours. Everything must be in English.`,
  },
  es: {
    dayNames: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
    defaultDay: "Día",
    defaultWeek: (n: number) => `Semana ${n}`,
    generalReview: "Repaso general",
    finalReview: "Repaso final y simulacros",
    reinforcement: (topic: string) => `Refuerzo: ${topic}`,
    pendingTopics: "temas pendientes",
    mockExam: (topic: string) => `Simulacro de examen sobre ${topic}`,
    errorReview: "Revisión de errores",
    studyTheory: (topic: string) => `Estudiar teoría de ${topic}`,
    solveExercises: (topic: string) => `Resolver ejercicios de ${topic}`,
    tips: [
      "Estudia en bloques de 25-45 minutos con descansos cortos.",
      "Termina cada sesión con un mini-cuestionario para fijar lo aprendido.",
      "Prioriza los temas débiles al inicio de la semana, cuando tienes más energía.",
    ],
    system:
      "Eres un planificador de estudio experto. Respondes únicamente con JSON válido en español, sin markdown.",
    promptLead: "Genera un plan de estudio personalizado.",
    duration: (weeks: number) => `Duración: ${weeks} semana(s).`,
    hours: (hours: number) => `Horas disponibles por semana: ${hours}.`,
    level: (value: string) => `Nivel académico: ${value}.`,
    examDate: (value: string) => `Fecha del examen: ${value}.`,
    noExam: "Sin examen fijado: plan de mejora continua.",
    goal: (value: string) => `Objetivo del estudiante: ${value}.`,
    weak: (topics: string) => `Temas débiles (prioridad máxima): ${topics}.`,
    pending: (topics: string) => `Temas pendientes: ${topics}.`,
    mastered: (topics: string) => `Temas ya dominados (solo repaso ligero): ${topics}.`,
    rules:
      "Reglas: prioriza temas débiles al principio, incluye repaso espaciado, y si hay examen dedica la última semana a simulacros.",
    jsonShape:
      '{"weeks": [{"week": 1, "focus": "objetivo de la semana", "days": [{"day": "Lunes", "topics": ["..."], "activities": ["actividad concreta"], "minutes": 45}]}], "tips": ["consejo breve"]}',
    distribute: (hours: number) =>
      `Distribuye las sesiones para no superar ${hours} horas semanales. Todo en español.`,
  },
  pt: {
    dayNames: ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"],
    defaultDay: "Dia",
    defaultWeek: (n: number) => `Semana ${n}`,
    generalReview: "Revisão geral",
    finalReview: "Revisão final e simulados",
    reinforcement: (topic: string) => `Reforço: ${topic}`,
    pendingTopics: "tópicos pendentes",
    mockExam: (topic: string) => `Simulado sobre ${topic}`,
    errorReview: "Revisão de erros",
    studyTheory: (topic: string) => `Estudar teoria de ${topic}`,
    solveExercises: (topic: string) => `Resolver exercícios de ${topic}`,
    tips: [
      "Estude em blocos de 25-45 minutos com pausas curtas.",
      "Termine cada sessão com um mini-questionário para fixar o aprendizado.",
      "Priorize os tópicos fracos no início da semana, quando você tem mais energia.",
    ],
    system:
      "Você é um planejador de estudos especialista. Responda apenas com JSON válido em português, sem markdown.",
    promptLead: "Gere um plano de estudo personalizado.",
    duration: (weeks: number) => `Duração: ${weeks} semana(s).`,
    hours: (hours: number) => `Horas disponíveis por semana: ${hours}.`,
    level: (value: string) => `Nível acadêmico: ${value}.`,
    examDate: (value: string) => `Data do exame: ${value}.`,
    noExam: "Sem data de exame: plano de melhoria contínua.",
    goal: (value: string) => `Objetivo do estudante: ${value}.`,
    weak: (topics: string) => `Tópicos fracos (prioridade máxima): ${topics}.`,
    pending: (topics: string) => `Tópicos pendentes: ${topics}.`,
    mastered: (topics: string) => `Tópicos dominados (apenas revisão leve): ${topics}.`,
    rules:
      "Regras: priorize tópicos fracos no início, inclua revisão espaçada e dedique a última semana a simulados quando houver exame.",
    jsonShape:
      '{"weeks": [{"week": 1, "focus": "objetivo da semana", "days": [{"day": "Segunda", "topics": ["..."], "activities": ["atividade concreta"], "minutes": 45}]}], "tips": ["dica breve"]}',
    distribute: (hours: number) =>
      `Distribua as sessões para não ultrapassar ${hours} horas semanais. Tudo em português.`,
  },
} as const;

function resolveLocale(locale?: AppLocale): AppLocale {
  return locale ?? "es";
}

function weeksUntil(examDate?: string | null) {
  if (!examDate) return 4;
  const diff = new Date(examDate).getTime() - Date.now();
  if (Number.isNaN(diff) || diff <= 0) return 1;
  return Math.max(1, Math.min(12, Math.ceil(diff / (7 * 24 * 60 * 60 * 1000))));
}

function normalizePlan(raw: unknown, locale: AppLocale): GeneratedStudyPlan | null {
  if (!raw || typeof raw !== "object") return null;
  const item = raw as Record<string, unknown>;
  const weeksRaw = Array.isArray(item.weeks) ? item.weeks : [];
  const copy = PLANNER_COPY[locale];

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
            day: String(d.day ?? "").trim() || copy.defaultDay,
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
        focus: String(w.focus ?? "").trim() || copy.defaultWeek(index + 1),
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
    locale,
  };
}

function buildFallbackPlan(params: PlannerParams): GeneratedStudyPlan {
  const locale = resolveLocale(params.locale);
  const copy = PLANNER_COPY[locale];
  const totalWeeks = weeksUntil(params.examDate);
  const topics = [...params.weakTopics, ...params.pendingTopics];
  const pool = topics.length ? topics : [copy.generalReview];
  const sessionsPerWeek = Math.max(2, Math.min(6, Math.round(params.hoursPerWeek)));
  const minutesPerSession = Math.max(
    25,
    Math.round((params.hoursPerWeek * 60) / sessionsPerWeek),
  );

  let topicIndex = 0;
  const weeks: StudyPlanWeek[] = Array.from({ length: totalWeeks }).map((_, weekIdx) => {
    const days: StudyPlanDay[] = Array.from({ length: sessionsPerWeek }).map((__, dayIdx) => {
      const topic = pool[topicIndex % pool.length];
      topicIndex += 1;
      const isLastWeek = weekIdx === totalWeeks - 1;
      return {
        day: copy.dayNames[dayIdx % copy.dayNames.length],
        topics: [topic],
        activities: isLastWeek
          ? [copy.mockExam(topic), copy.errorReview]
          : [copy.studyTheory(topic), copy.solveExercises(topic)],
        minutes: minutesPerSession,
      };
    });
    return {
      week: weekIdx + 1,
      focus:
        weekIdx === totalWeeks - 1
          ? copy.finalReview
          : copy.reinforcement(days[0]?.topics[0] ?? copy.pendingTopics),
      days,
    };
  });

  return {
    weeks,
    tips: [...copy.tips],
    locale,
  };
}

export async function generateStudyPlan(params: PlannerParams): Promise<{
  plan: GeneratedStudyPlan;
  source: "openai" | "fallback";
}> {
  const locale = resolveLocale(params.locale);
  const copy = PLANNER_COPY[locale];
  const totalWeeks = weeksUntil(params.examDate);

  const prompt = [
    copy.promptLead,
    copy.duration(totalWeeks),
    copy.hours(params.hoursPerWeek),
    params.level ? copy.level(params.level) : "",
    params.examDate ? copy.examDate(params.examDate) : copy.noExam,
    params.goal ? copy.goal(params.goal) : "",
    params.weakTopics.length ? copy.weak(params.weakTopics.join(", ")) : "",
    params.pendingTopics.length ? copy.pending(params.pendingTopics.join(", ")) : "",
    params.masteredTopics.length ? copy.mastered(params.masteredTopics.join(", ")) : "",
    "",
    copy.rules,
    localeInstruction(locale),
    "Responde SOLO con JSON válido:",
    copy.jsonShape,
    copy.distribute(params.hoursPerWeek),
  ]
    .filter(Boolean)
    .join("\n");

  const result = await chatJSON<unknown>(
    [
      {
        role: "system",
        content: copy.system,
      },
      { role: "user", content: prompt },
    ],
    { temperature: 0.4, maxTokens: 3000 },
  );

  const plan = normalizePlan(result, locale);
  if (plan) return { plan, source: "openai" };
  return { plan: buildFallbackPlan(params), source: "fallback" };
}
