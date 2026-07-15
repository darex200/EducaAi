"use client";

import Link from "next/link";
import { useLanguage } from "@/context/language-context";
import { TopicWorkspace } from "@/components/topics/topic-workspace";
import { getLessonBySlug } from "@/lib/lessons";

export function TopicSlugClient({ slug }: { slug: string }) {
  const { locale, t } = useLanguage();
  const lesson = getLessonBySlug(slug, locale);

  if (!lesson) {
    return (
      <main className="space-y-4">
        <p className="text-sm text-slate-600">{t("topicNotSelected")}</p>
      </main>
    );
  }

  return (
    <main className="space-y-4">
      <Link href="/dashboard/topics" className="text-sm font-medium text-indigo-700">
        {t("backToTopics")}
      </Link>
      <TopicWorkspace lesson={lesson} />
    </main>
  );
}
