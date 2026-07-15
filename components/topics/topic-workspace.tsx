"use client";

import { useState } from "react";
import type { Lesson } from "@/lib/lesson-types";
import { useLanguage } from "@/context/language-context";
import { getLessonBySlug } from "@/lib/lessons";
import { ContentViewer } from "@/components/chat/content-viewer";
import { GuidedPractice } from "@/components/chat/guided-practice";
import { QuizModal } from "@/components/chat/quiz-modal";

type ContentData = {
  title?: string;
  summary?: string;
  examples?: string[];
  references?: string[];
};

export function TopicWorkspace({ lesson }: { lesson: Lesson }) {
  const { locale, t } = useLanguage();
  const localized = getLessonBySlug(lesson.slug, locale) ?? lesson;
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isContentLoading, setIsContentLoading] = useState(false);
  const [content, setContent] = useState<ContentData | null>(null);
  const [showPractice, setShowPractice] = useState(false);

  const exploreContent = async () => {
    setIsContentLoading(true);
    const res = await fetch("/api/topic-tools", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "content",
        topic: localized.title,
        level: "secundaria",
        difficulty: "intermedio",
        locale,
      }),
    });
    const data = (await res.json()) as { content?: ContentData };
    setContent(data.content ?? null);
    setIsContentLoading(false);
  };

  return (
    <section className="card-surface p-5">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t("selectedTopicLabel")}</p>
        <h3 className="mt-1 text-xl font-semibold text-slate-900">{localized.title}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">{localized.explanation}</p>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        <button onClick={() => setIsQuizOpen(true)} className="btn-secondary w-full">
          {t("generateQuiz")}
        </button>
        <button onClick={exploreContent} className="btn-secondary w-full">
          {t("exploreContent")}
        </button>
        <button onClick={() => setShowPractice((v) => !v)} className="btn-primary w-full">
          {t("guidedPracticeMode")}
        </button>
      </div>

      <div className="mt-4 space-y-3">
        <ContentViewer
          data={
            content
              ? { ...content, explanations: [content.summary ?? ""], articles: content.references ?? [] }
              : null
          }
          loading={isContentLoading}
        />
        {showPractice && <GuidedPractice topic={localized.title} locale={locale} />}
      </div>

      <QuizModal topic={localized.title} isOpen={isQuizOpen} onClose={() => setIsQuizOpen(false)} locale={locale} />
    </section>
  );
}
