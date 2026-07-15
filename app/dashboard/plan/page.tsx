"use client";

import { useEffect, useState } from "react";
import { ExamDateField } from "@/components/plan/exam-date-field";
import { LoadingSpinner } from "@/components/loading-spinner";
import { useLanguage } from "@/context/language-context";
import { dateLocaleTag } from "@/lib/i18n/translations";
import { resolveTopicDisplayTitle } from "@/lib/lessons";
import type { AppLocale } from "@/lib/i18n/translations";

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
  locale?: AppLocale;
};

function toInputDate(value: string | Date | null | undefined) {
  if (!value) return "";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString().slice(0, 10);
}

export default function StudyPlanPage() {
  const { locale, t } = useLanguage();
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
            examDate?: string | null;
          };
          if (data.plan) {
            setPlan(data.plan);
            if (data.hoursPerWeek) setHoursPerWeek(data.hoursPerWeek);
            if (data.goal) setGoal(data.goal);
            if (data.examDate) setExamDate(toInputDate(data.examDate));
            if (data.createdAt) {
              const dateLocale = dateLocaleTag(locale);
              setPlanMeta(
                t("planLastGenerated", {
                  date: new Date(data.createdAt).toLocaleDateString(dateLocale),
                }),
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
  }, [locale, t]);

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
          locale,
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
          ? t("planPrioritizingWeak", {
              topics: data.weakTopics
                .slice(0, 3)
                .map((topic) => resolveTopicDisplayTitle(topic, locale))
                .join(", "),
            })
          : t("planFromProfile"),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo generar el plan.");
    } finally {
      setIsGenerating(false);
    }
  };

  const needsLocaleRefresh = Boolean(plan && plan.locale && plan.locale !== locale);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{t("studyPlanTitle")}</h1>
        <p className="text-sm text-slate-500">{t("studyPlanSubtitle")}</p>
      </header>

      <section className="card-surface space-y-5 p-5">
        <ExamDateField value={examDate} onChange={setExamDate} />

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {t("hoursPerWeekLabel")}
            </span>
            <div className="mt-2 flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2">
              <input
                type="range"
                min={1}
                max={30}
                value={hoursPerWeek}
                onChange={(event) => setHoursPerWeek(Number(event.target.value))}
                className="h-2 flex-1 cursor-pointer accent-blue-600"
              />
              <span className="w-12 text-right text-sm font-semibold text-blue-700">{hoursPerWeek}h</span>
            </div>
          </label>

          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {t("studyGoalLabel")}
            </span>
            <input
              type="text"
              value={goal}
              onChange={(event) => setGoal(event.target.value)}
              placeholder={t("studyGoalPlaceholder")}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-500/20"
            />
          </label>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
          {error ? <p className="text-sm text-red-600">{error}</p> : <span />}
          <button
            type="button"
            onClick={generatePlan}
            disabled={isGenerating}
            className="btn-primary px-5 py-2.5 text-sm"
          >
            {isGenerating
              ? t("generatingPlan")
              : plan
                ? t("regeneratePlan")
                : t("generatePlan")}
          </button>
        </div>
      </section>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner label={t("loadingPlan")} />
        </div>
      ) : plan ? (
        <>
          {needsLocaleRefresh ? (
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {t("planRegenerateLocale")}
            </p>
          ) : null}
          {planMeta && <p className="text-xs text-slate-500">{planMeta}</p>}
          <div className="space-y-4">
            {plan.weeks.map((week) => (
              <section key={week.week} className="card-surface p-5">
                <div className="mb-3 flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-bold text-white">
                    {week.week}
                  </span>
                  <h2 className="text-sm font-semibold text-slate-800">
                    {t("planWeekLabel", { week: String(week.week) })} · {week.focus}
                  </h2>
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
                          {t("planMinutes", { minutes: String(day.minutes) })}
                        </span>
                      </div>
                      {day.topics.length > 0 && (
                        <p className="mb-1 text-xs font-medium text-indigo-700">
                          {day.topics
                            .map((topic) => resolveTopicDisplayTitle(topic, locale))
                            .join(" · ")}
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
                {t("planTips")}
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
          {t("planEmpty")}
        </div>
      )}
    </div>
  );
}
