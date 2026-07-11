"use client";

import { useEffect, useRef } from "react";
import { useLanguage } from "@/context/language-context";
import { difficultyLabel } from "@/lib/i18n/translations";

export type TopicItem = {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: "basico" | "intermedio" | "avanzado";
};

type TopicCardProps = {
  topic: TopicItem;
  isActive: boolean;
  isDarkMode?: boolean;
  onSelect: () => void;
  registerRef?: (id: string, el: HTMLButtonElement | null) => void;
};

export function TopicCard({
  topic,
  isActive,
  isDarkMode = false,
  onSelect,
  registerRef,
}: TopicCardProps) {
  const { locale } = useLanguage();
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    registerRef?.(topic.id, buttonRef.current);
    return () => registerRef?.(topic.id, null);
  }, [topic.id, registerRef]);

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={onSelect}
      className={`btn-hover-lift theme-animate w-full rounded-xl border px-3 py-2.5 text-left duration-300 ${
        isDarkMode ? "btn-hover-lift-dark" : "btn-hover-lift-light"
      } ${
        isActive
          ? `topic-card-active-pulse ${isDarkMode ? "dark-topic-card-active" : "border-blue-300/80 bg-gradient-to-br from-blue-50 to-indigo-50/80 shadow-md ring-1 ring-blue-200/60"}`
          : isDarkMode
            ? "dark-topic-card"
            : "border-slate-200/80 bg-white/60 hover:border-blue-200/80 hover:bg-white"
      }`}
    >
      <p className={`theme-animate text-sm font-semibold transition-colors ${isDarkMode ? "text-[var(--dark-text)]" : "text-slate-900"}`}>
        {topic.title}
      </p>
      <p className={`mt-1 line-clamp-2 text-xs leading-5 ${isDarkMode ? "text-[var(--dark-text-muted)]" : "text-slate-600"}`}>
        {topic.description}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px]">
        <span
          className={`theme-animate rounded-md px-2 py-0.5 font-medium transition-colors ${
            isDarkMode ? "dark-chip" : "bg-slate-100 text-slate-600"
          }`}
        >
          {topic.category}
        </span>
        <span
          className={`theme-animate rounded-md px-2 py-0.5 font-medium transition-colors ${
            isDarkMode ? "dark-chip-indigo" : "bg-indigo-50 text-indigo-700"
          }`}
        >
          {difficultyLabel(locale, topic.difficulty)}
        </span>
      </div>
    </button>
  );
}
