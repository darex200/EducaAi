"use client";

import { useMemo, useRef } from "react";
import { useLanguage } from "@/context/language-context";
import { dateLocaleTag } from "@/lib/i18n/translations";

type ExamDateFieldProps = {
  value: string;
  onChange: (value: string) => void;
};

function toInputDate(value: string) {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString().slice(0, 10);
}

function minSelectableDate() {
  return new Date().toISOString().slice(0, 10);
}

function daysUntil(value: string) {
  const normalized = toInputDate(value);
  if (!normalized) return null;
  const exam = new Date(`${normalized}T12:00:00`);
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  return Math.ceil((exam.getTime() - today.getTime()) / 86_400_000);
}

function formatExamDate(value: string, locale: string) {
  const normalized = toInputDate(value);
  if (!normalized) return "";
  return new Date(`${normalized}T12:00:00`).toLocaleDateString(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function urgencyMeta(days: number | null) {
  if (days === null) {
    return {
      badge: "bg-slate-100 text-slate-600 ring-slate-200/80",
      bar: "bg-slate-200",
      fill: "w-0",
      glow: "from-slate-100 via-white to-slate-50",
      border: "border-slate-200/90",
    };
  }
  if (days < 0) {
    return {
      badge: "bg-slate-100 text-slate-500 ring-slate-200/80",
      bar: "bg-slate-200",
      fill: "w-full opacity-40",
      glow: "from-slate-100 via-white to-slate-50",
      border: "border-slate-200/90",
    };
  }
  if (days === 0) {
    return {
      badge: "bg-red-100 text-red-700 ring-red-200/90",
      bar: "bg-red-100",
      fill: "w-full",
      glow: "from-red-50 via-white to-orange-50",
      border: "border-red-200/90",
    };
  }
  if (days <= 7) {
    return {
      badge: "bg-orange-100 text-orange-800 ring-orange-200/90",
      bar: "bg-orange-100",
      fill: "w-[92%]",
      glow: "from-orange-50 via-white to-amber-50",
      border: "border-orange-200/90",
    };
  }
  if (days <= 21) {
    return {
      badge: "bg-amber-100 text-amber-800 ring-amber-200/90",
      bar: "bg-amber-100",
      fill: "w-[65%]",
      glow: "from-amber-50 via-white to-yellow-50",
      border: "border-amber-200/90",
    };
  }
  return {
    badge: "bg-emerald-100 text-emerald-800 ring-emerald-200/90",
    bar: "bg-emerald-100",
    fill: "w-[35%]",
    glow: "from-emerald-50 via-white to-teal-50",
    border: "border-emerald-200/90",
  };
}

export function ExamDateField({ value, onChange }: ExamDateFieldProps) {
  const { locale, t } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);
  const normalized = toInputDate(value);
  const days = useMemo(() => daysUntil(value), [value]);
  const styles = urgencyMeta(days);
  const dateLocale = dateLocaleTag(locale);

  const countdownLabel = (() => {
    if (days === null) return t("examDateEmptyHint");
    if (days < 0) return t("examPassed");
    if (days === 0) return t("examToday");
    if (days === 1) return t("examDayLeft");
    return t("examDaysLeft", { days: String(days) });
  })();

  const urgencyLabel = (() => {
    if (days === null || days < 0) return null;
    if (days <= 7) return t("examUrgencySprint");
    if (days <= 21) return t("examUrgencyFocus");
    return t("examUrgencyRelaxed");
  })();

  const openPicker = () => inputRef.current?.showPicker?.() ?? inputRef.current?.click();

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br p-4 shadow-sm transition-colors sm:p-5 ${styles.glow} ${styles.border}`}
    >
      <div className="pointer-events-none absolute -right-6 -top-8 h-28 w-28 rounded-full bg-blue-400/10 blur-2xl" />

      <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/25">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900">{t("examDateTitle")}</p>
              <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                {t("examDateOptional")}
              </p>
            </div>
            {urgencyLabel && (
              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ring-1 ${styles.badge}`}
              >
                {urgencyLabel}
              </span>
            )}
          </div>

          {normalized ? (
            <p className="mt-3 text-base font-semibold capitalize text-slate-800 sm:text-lg">
              {formatExamDate(normalized, dateLocale)}
            </p>
          ) : (
            <p className="mt-3 text-sm text-slate-600">{t("examDateEmptyHint")}</p>
          )}

          <p className="mt-1 text-sm font-medium text-slate-500">{countdownLabel}</p>

          <div className={`mt-3 h-1.5 w-full overflow-hidden rounded-full ${styles.bar}`}>
            <div
              className={`h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500 ${styles.fill}`}
            />
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2 lg:justify-end">
          <input
            ref={inputRef}
            type="date"
            value={normalized}
            min={minSelectableDate()}
            onChange={(event) => onChange(event.target.value)}
            className="sr-only"
            aria-label={t("examDateTitle")}
          />
          <button
            type="button"
            onClick={openPicker}
            className="inline-flex items-center gap-2 rounded-xl border border-blue-200/80 bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
            </svg>
            {normalized ? t("examDateChange") : t("examDatePick")}
          </button>
          {normalized && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
            >
              {t("examDateClear")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
