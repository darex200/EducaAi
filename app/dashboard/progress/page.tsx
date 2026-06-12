"use client";

import { useEffect, useState } from "react";
import { LoadingSpinner } from "@/components/loading-spinner";

type ProgressData = {
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
  risks: Array<{ level: "alto" | "medio"; message: string }>;
  recommendations: string[];
};

const STATUS_STYLES: Record<string, string> = {
  dominado: "bg-emerald-100 text-emerald-700",
  en_progreso: "bg-blue-100 text-blue-700",
  debil: "bg-red-100 text-red-700",
  nuevo: "bg-slate-100 text-slate-600",
};

function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="card-surface p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

export default function ProgressPage() {
  const [data, setData] = useState<ProgressData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const response = await fetch("/api/progress");
        const payload = (await response.json()) as ProgressData & { error?: string };
        if (!response.ok) {
          setError(payload.error ?? "No se pudo cargar el progreso.");
          return;
        }
        setData(payload);
      } catch {
        setError("No se pudo cargar el progreso.");
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner label="Calculando tu progreso..." />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="card-surface p-6 text-sm text-slate-600">
        {error ?? "Sin datos de progreso."}
      </div>
    );
  }

  const maxWeekly = Math.max(...data.weekly.map((week) => week.minutes), 1);
  const hours = Math.floor(data.totalMinutes / 60);
  const minutes = data.totalMinutes % 60;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Tu progreso</h1>
        <p className="text-sm text-slate-500">
          Métricas calculadas a partir de tus conversaciones, cuestionarios y sesiones de estudio.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Racha de estudio"
          value={`${data.streakDays} ${data.streakDays === 1 ? "día" : "días"}`}
          hint="días consecutivos"
        />
        <StatCard
          label="Tiempo estudiado"
          value={hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`}
          hint="últimos 90 días"
        />
        <StatCard
          label="Temas dominados"
          value={`${data.totals.topicsMastered}/${data.totals.topicsStudied}`}
          hint={`${data.totals.weakTopics} débiles`}
        />
        <StatCard
          label="Cuestionarios"
          value={`${data.totals.quizzesTaken}`}
          hint={
            data.totals.avgQuizPct != null
              ? `promedio ${data.totals.avgQuizPct}%`
              : "sin intentos aún"
          }
        />
      </div>

      {data.risks.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Alertas de riesgo académico
          </h2>
          {data.risks.map((risk) => (
            <div
              key={risk.message}
              className={`rounded-xl border px-4 py-3 text-sm ${
                risk.level === "alto"
                  ? "border-red-200 bg-red-50 text-red-800"
                  : "border-amber-200 bg-amber-50 text-amber-800"
              }`}
            >
              <span className="mr-2 rounded-md bg-white/60 px-1.5 py-0.5 text-[10px] font-semibold uppercase">
                {risk.level}
              </span>
              {risk.message}
            </div>
          ))}
        </section>
      )}

      <section className="card-surface p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Evolución semanal (minutos de estudio)
        </h2>
        <div className="flex h-36 items-end gap-2">
          {data.weekly.map((week) => (
            <div key={week.label} className="flex min-w-0 flex-1 flex-col items-center gap-1">
              <span className="text-[10px] text-slate-500">{week.minutes > 0 ? week.minutes : ""}</span>
              <div
                className="w-full rounded-t-md bg-gradient-to-t from-blue-600 to-indigo-400 transition-all"
                style={{ height: `${Math.max((week.minutes / maxWeekly) * 100, week.minutes > 0 ? 6 : 2)}%` }}
              />
              <span className="text-[10px] text-slate-400">{week.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="card-surface p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Dominio por tema
        </h2>
        {data.masteries.length === 0 ? (
          <p className="text-sm text-slate-500">
            Aún no hay temas registrados. Conversa con el tutor o resuelve un cuestionario para empezar.
          </p>
        ) : (
          <div className="space-y-3">
            {data.masteries.map((mastery) => (
              <div key={mastery.topic}>
                <div className="mb-1 flex items-center justify-between gap-2 text-sm">
                  <p className="min-w-0 truncate font-medium text-slate-800">
                    {mastery.topic}
                    {mastery.subject && (
                      <span className="ml-2 text-xs font-normal text-slate-400">{mastery.subject}</span>
                    )}
                  </p>
                  <div className="flex shrink-0 items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        STATUS_STYLES[mastery.status] ?? STATUS_STYLES.nuevo
                      }`}
                    >
                      {mastery.status.replace("_", " ")}
                    </span>
                    <span className="text-xs font-semibold text-slate-600">{mastery.masteryScore}/100</span>
                  </div>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full transition-all ${
                      mastery.status === "debil"
                        ? "bg-red-400"
                        : mastery.status === "dominado"
                          ? "bg-emerald-500"
                          : "bg-blue-500"
                    }`}
                    style={{ width: `${mastery.masteryScore}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="card-surface p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Recomendaciones
        </h2>
        <ul className="space-y-2">
          {data.recommendations.map((recommendation) => (
            <li key={recommendation} className="flex gap-2 text-sm text-slate-700">
              <span className="text-blue-600">→</span>
              {recommendation}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
