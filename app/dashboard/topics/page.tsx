"use client";

import { useLanguage } from "@/context/language-context";
import { getLessons } from "@/lib/lessons";
import { TopicCard } from "@/components/topics/topic-card";

export default function TopicsPage() {
  const { locale, t } = useLanguage();
  const lessonList = getLessons(locale);

  return (
    <div className="space-y-4">
      <header className="card-surface p-6">
        <h1 className="mb-2 text-2xl font-semibold text-indigo-800">{t("topicsPageTitle")}</h1>
        <p className="text-sm text-slate-600">{t("topicsPageSubtitle")}</p>
      </header>
      <div className="grid gap-4 lg:grid-cols-2">
        {lessonList.map((lesson) => (
          <TopicCard key={lesson.slug} lesson={lesson} />
        ))}
      </div>
    </div>
  );
}
