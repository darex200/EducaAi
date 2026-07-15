"use client";

import Link from "next/link";
import type { Lesson } from "@/lib/lesson-types";
import { useLanguage } from "@/context/language-context";
import { getLessonBySlug } from "@/lib/lessons";

type TopicCardProps = { lesson: Lesson };

export function TopicCard({ lesson }: TopicCardProps) {
  const { locale, t } = useLanguage();
  const localized = getLessonBySlug(lesson.slug, locale) ?? lesson;

  return (
    <Link
      href={`/dashboard/topics/${lesson.slug}`}
      className="card-surface block w-full p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
    >
      <h2 className="mb-2 text-lg font-semibold text-slate-900">{localized.title}</h2>
      <p className="mb-4 text-sm leading-6 text-slate-600">{localized.explanation}</p>
      <span className="text-xs font-semibold text-slate-500">{t("openTopicInterface")}</span>
    </Link>
  );
}
