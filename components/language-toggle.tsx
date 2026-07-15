"use client";

import { useLanguage } from "@/context/language-context";
import type { AppLocale } from "@/lib/i18n/translations";

type LanguageToggleProps = {
  isDarkMode?: boolean;
};

export function LanguageToggle({ isDarkMode = false }: LanguageToggleProps) {
  const { locale, setLocale, t } = useLanguage();

  const buttonClass = (active: boolean) =>
    `rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
      active
        ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/25"
        : isDarkMode
          ? "text-[var(--dark-text-muted)] hover:bg-[rgba(30,58,138,0.25)] hover:text-[var(--dark-text)]"
          : "text-slate-500 hover:bg-blue-50 hover:text-slate-700"
    }`;

  const set = (next: AppLocale) => setLocale(next);

  return (
    <div
      className={`theme-animate inline-flex items-center gap-1 rounded-xl border p-1 ${
        isDarkMode
          ? "border-[var(--dark-border)] bg-[rgba(12,20,40,0.55)]"
          : "border-slate-200/90 bg-white/80"
      }`}
      role="group"
      aria-label={t("languageLabel")}
    >
      <button type="button" className={buttonClass(locale === "en")} onClick={() => set("en")}>
        EN
      </button>
      <button type="button" className={buttonClass(locale === "es")} onClick={() => set("es")}>
        ES
      </button>
      <button type="button" className={buttonClass(locale === "pt")} onClick={() => set("pt")}>
        PT
      </button>
    </div>
  );
}
