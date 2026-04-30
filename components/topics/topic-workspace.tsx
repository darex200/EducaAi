"use client";

import { useState } from "react";
import type { Lesson } from "@/lib/lessons";
import { ContentViewer } from "@/components/topics/content-viewer";
import { GuidedPracticeChat } from "@/components/topics/guided-practice-chat";
import { QuizGeneratorModal } from "@/components/topics/quiz-generator-modal";

type ContentData = {
  title?: string;
  summary?: string;
  examples?: string[];
  references?: string[];
};

export function TopicWorkspace({ lesson }: { lesson: Lesson }) {
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
        topic: lesson.title,
        level: "secundaria",
        difficulty: "intermedio",
      }),
    });
    const data = (await res.json()) as { content?: ContentData };
    setContent(data.content ?? null);
    setIsContentLoading(false);
  };

  return (
    <section className="card-surface p-5">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Tema seleccionado</p>
        <h3 className="mt-1 text-xl font-semibold text-slate-900">{lesson.title}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">{lesson.explanation}</p>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        <button onClick={() => setIsQuizOpen(true)} className="btn-secondary w-full">
          Generar cuestionario
        </button>
        <button onClick={exploreContent} className="btn-secondary w-full">
          Explorar contenido
        </button>
        <button onClick={() => setShowPractice((v) => !v)} className="btn-primary w-full">
          Modo práctica guiada
        </button>
      </div>

      <div className="mt-4 space-y-3">
        <ContentViewer data={content} loading={isContentLoading} />
        {showPractice && <GuidedPracticeChat topic={lesson.title} level="secundaria" />}
      </div>

      <QuizGeneratorModal topic={lesson.title} isOpen={isQuizOpen} onClose={() => setIsQuizOpen(false)} />
    </section>
  );
}
