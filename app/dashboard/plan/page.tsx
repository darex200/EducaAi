"use client";

import { useEffect, useState } from "react";
import { LoadingSpinner } from "@/components/loading-spinner";

type StudyPlanDay = {
  day: string;
  topics: string[];
  activities: string[];
  minutes: number;
};

type StudyPlanWeek = {
  week: number;
  focus: string;
  days: StudyPlanDay[];
};

type GeneratedStudyPlan = {
  weeks: StudyPlanWeek[];
  tips: string[];
};

export default function StudyPlanPage() {
  const [examDate, setExamDate] = useState("");
  const [hoursPerWeek, setHoursPerWeek] = useState(5);
  const [goal, setGoal] = useState("");
  const [plan, setPlan] = useState<GeneratedStudyPlan | null>(null);
  const [planMeta, setPlanMeta] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const response = await fetch("/api/study-plan");
        if (response.ok) {
          const data = (await response.json()) as {
            plan?: GeneratedStudyPlan | null;
            createdAt?: string;
            hoursPerWeek?: number;
            goal?: string;
          };
          if (data.plan) {
            setPlan(data.plan);
            if (data.hoursPerWeek) setHoursPerWeek(data.hoursPerWeek);
            if (data.goal) setGoal(data.goal);
            if (data.createdAt) {
              setPlanMeta(
                `Último plan generado el ${new Date(data.createdAt).toLocaleDateString("es")}`,
              );
            }
          }
        }
      } catch {
        // sin plan previo
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const generatePlan = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const response = await fetch("/api/study-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examDate: examDate || undefined,
          hoursPerWeek,
          goal: goal || undefined,
        }),
      });
      const data = (await response.json()) as {
        plan?: GeneratedStudyPlan;
        error?: string;
        source?: string;
        weakTopics?: string[];
      };
      if (!response.ok || !data.plan) {
        throw new Error(data.error ?? "No se pudo generar el plan.");
      }
      setPlan(data.plan);
      setPlanMeta(
        data.weakTopics?.length
          ? `Plan priorizando tus temas débiles: ${data.weakTopics.slice(0, 3).join(", ")}`
          : "Plan generado a partir de tu perfil de aprendizaje.",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo generar el plan.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Plan de estudio</h1>
        <p className="text-sm text-slate-500">
          Genera un plan personalizado según tu examen, tus horas disponibles y tus temas débiles.
        </p>
      </header>

      <section className="card-surface p-5">
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block text-xs text-slate-500">
            Fecha de examen (opcional)
            <input
              type="date"
              value={examDate}
              onChange={(event) => setExamDate(event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-500/20"
            />
          </label>
          <label className="block text-xs text-slate-500">
            Horas disponibles por semana
            <input
              type="number"
              min={1}
              max={60}
              value={hoursPerWeek}
              onChange={(event) => setHoursPerWeek(Number(event.target.value) || 1)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-500/20"
            />
          </label>
          <label className="block text-xs text-slate-500">
            Objetivo (opcional)
            <input
              type="text"
              value={goal}
              onChange={(event) => setGoal(event.target.value)}
              placeholder="Ej: aprobar el parcial de cálculo"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-500/20"
            />
          </label>
        </div>
        <div className="mt-4 flex items-center justify-between gap-3">
          {error ? <p className="text-sm text-red-600">{error}</p> : <span />}
          <button
            type="button"
            onClick={generatePlan}
            disabled={isGenerating}
            className="btn-primary px-5 py-2.5 text-sm"
          >
            {isGenerating ? "Generando plan…" : plan ? "Regenerar plan" : "Generar plan"}
          </button>
        </div>
      </section>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner label="Cargando plan..." />
        </div>
      ) : plan ? (
        <>
          {planMeta && <p className="text-xs text-slate-500">{planMeta}</p>}
          <div className="space-y-4">
            {plan.weeks.map((week) => (
              <section key={week.week} className="card-surface p-5">
                <div className="mb-3 flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-bold text-white">
                    {week.week}
                  </span>
                  <h2 className="text-sm font-semibold text-slate-800">{week.focus}</h2>
                </div>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {week.days.map((day, index) => (
                    <div
                      key={`${week.week}-${day.day}-${index}`}
                      className="rounded-xl border border-slate-200 bg-slate-50/60 p-3"
                    >
                      <div className="mb-1.5 flex items-center justify-between">
                        <p className="text-xs font-semibold text-slate-700">{day.day}</p>
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                          {day.minutes} min
                        </span>
                      </div>
                      {day.topics.length > 0 && (
                        <p className="mb-1 text-xs font-medium text-indigo-700">
                          {day.topics.join(" · ")}
                        </p>
                      )}
                      <ul className="space-y-0.5">
                        {day.activities.map((activity) => (
                          <li key={activity} className="text-xs text-slate-600">
                            • {activity}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {plan.tips.length > 0 && (
            <section className="card-surface p-5">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                Consejos
              </h2>
              <ul className="space-y-2">
                {plan.tips.map((tip) => (
                  <li key={tip} className="flex gap-2 text-sm text-slate-700">
                    <span className="text-blue-600">→</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      ) : (
        <div className="card-surface p-6 text-sm text-slate-500">
          Aún no tienes un plan de estudio. Configura tus horas y genera el primero.
        </div>
      )}
    </div>
  );
}
