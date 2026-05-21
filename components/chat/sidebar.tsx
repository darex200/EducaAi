"use client";

import { useCallback, useEffect, useRef } from "react";
import { TopicCard } from "@/components/chat/topic-card";

type SidebarProps = {
  isDarkMode: boolean;
  onNewChat: () => void;
  onChooseTopic: () => void;
  onToggleTheme: () => void;
  onGenerateQuiz: () => void;
  onExploreContent: () => void;
  onToggleGuidedPractice: () => void;
  practiceEnabled: boolean;
  topics: Array<{
    id: string;
    title: string;
    description: string;
    category: string;
    difficulty: "basico" | "intermedio" | "avanzado";
  }>;
  selectedTopicId: string;
  onSelectTopic: (topicId: string) => void;
};

function ToolButton({
  children,
  onClick,
  active,
  isDarkMode,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  isDarkMode: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`btn-hover-lift w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium ${
        isDarkMode ? "btn-hover-lift-dark" : "btn-hover-lift-light"
      } ${
        active
          ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25"
          : isDarkMode
            ? "border border-slate-700/80 bg-slate-800/60 text-slate-200 hover:border-slate-500 hover:bg-slate-800"
            : "border border-slate-200/80 bg-white/70 text-slate-700 hover:border-blue-200 hover:bg-white"
      }`}
    >
      {children}
    </button>
  );
}

function FooterButton({
  children,
  onClick,
  isDarkMode,
}: {
  children: React.ReactNode;
  onClick: () => void;
  isDarkMode: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`btn-hover-lift w-full rounded-xl border px-3 py-2 text-left text-sm ${
        isDarkMode ? "btn-hover-lift-dark" : "btn-hover-lift-light"
      } ${
        isDarkMode
          ? "border-slate-700 bg-slate-800/80 text-slate-200 hover:border-slate-500 hover:bg-slate-800"
          : "border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50/60"
      }`}
    >
      {children}
    </button>
  );
}

export function Sidebar({
  isDarkMode,
  onNewChat,
  onChooseTopic,
  onToggleTheme,
  onGenerateQuiz,
  onExploreContent,
  onToggleGuidedPractice,
  practiceEnabled,
  topics,
  selectedTopicId,
  onSelectTopic,
}: SidebarProps) {
  const sectionLabel = isDarkMode ? "text-slate-500" : "text-slate-400";
  const topicsScrollRef = useRef<HTMLDivElement>(null);
  const topicCardRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const registerTopicRef = useCallback((id: string, el: HTMLButtonElement | null) => {
    topicCardRefs.current[id] = el;
  }, []);

  const scrollTopicIntoView = useCallback((topicId: string) => {
    const card = topicCardRefs.current[topicId];
    const container = topicsScrollRef.current;
    if (!card || !container) return;

    const cardTop = card.offsetTop;
    const cardHeight = card.offsetHeight;
    const containerHeight = container.clientHeight;
    const targetTop = cardTop - containerHeight / 2 + cardHeight / 2;

    container.scrollTo({
      top: Math.max(0, Math.min(targetTop, container.scrollHeight - containerHeight)),
      behavior: "smooth",
    });
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(() => scrollTopicIntoView(selectedTopicId));
    return () => cancelAnimationFrame(frame);
  }, [selectedTopicId, scrollTopicIntoView]);

  const handleSelectFromDropdown = (topicId: string) => {
    onSelectTopic(topicId);
    requestAnimationFrame(() => scrollTopicIntoView(topicId));
  };

  const handleSelectFromCard = (topicId: string) => {
    onSelectTopic(topicId);
    scrollTopicIntoView(topicId);
  };

  return (
    <div
      className={`flex h-full flex-col overflow-hidden rounded-2xl border shadow-[0_8px_32px_rgba(15,23,42,0.06)] ${
        isDarkMode
          ? "border-slate-700/80 bg-slate-900/95 text-slate-100"
          : "glass-panel border-white/60 bg-white/90 text-slate-800"
      }`}
    >
      <div className={`border-b px-4 py-4 ${isDarkMode ? "border-slate-800" : "border-slate-100"}`}>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-bold text-white shadow-lg shadow-blue-500/30">
            E
          </div>
          <div>
            <p className="text-base font-semibold tracking-tight">Educa AI</p>
            <p className={`text-[11px] ${isDarkMode ? "text-slate-500" : "text-slate-500"}`}>Tutor académico guiado</p>
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col px-3 py-4">
        <button
          type="button"
          onClick={onNewChat}
          className="btn-hover-primary relative mb-5 w-full overflow-hidden rounded-xl bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_4px_16px_rgba(37,99,235,0.35)]"
        >
          + Nueva conversación
        </button>

        <section className="mb-5">
          <p className={`mb-2.5 px-1 text-[10px] font-semibold uppercase tracking-widest ${sectionLabel}`}>
            Herramientas IA
          </p>
          <div className="space-y-1.5">
            <ToolButton isDarkMode={isDarkMode} onClick={onGenerateQuiz}>
              Generar cuestionario
            </ToolButton>
            <ToolButton isDarkMode={isDarkMode} onClick={onExploreContent}>
              Explorar contenido
            </ToolButton>
            <ToolButton isDarkMode={isDarkMode} onClick={onToggleGuidedPractice} active={practiceEnabled}>
              Práctica guiada
            </ToolButton>
          </div>
        </section>

        <section className="mb-4 min-h-0 flex-1">
          <p className={`mb-2.5 px-1 text-[10px] font-semibold uppercase tracking-widest ${sectionLabel}`}>Temas</p>
          <select
            value={selectedTopicId}
            onChange={(e) => handleSelectFromDropdown(e.target.value)}
            className={`btn-hover-lift mb-3 w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/30 ${
              isDarkMode ? "btn-hover-lift-dark border-slate-700 bg-slate-800 text-slate-100" : "btn-hover-lift-light border-slate-200 bg-white text-slate-700"
            }`}
          >
            {topics.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.title}
              </option>
            ))}
          </select>
          <div
            ref={topicsScrollRef}
            className="chat-scroll chat-scroll-smooth max-h-[38vh] space-y-2 overflow-y-auto scroll-py-2 pr-0.5"
          >
            {topics.map((topic) => (
              <TopicCard
                key={topic.id}
                topic={topic}
                isActive={topic.id === selectedTopicId}
                isDarkMode={isDarkMode}
                registerRef={registerTopicRef}
                onSelect={() => handleSelectFromCard(topic.id)}
              />
            ))}
          </div>
        </section>
      </div>

      <div className={`space-y-1.5 border-t px-3 py-3 ${isDarkMode ? "border-slate-800" : "border-slate-100"}`}>
        <FooterButton isDarkMode={isDarkMode} onClick={onChooseTopic}>
          Cambiar tema
        </FooterButton>
        <FooterButton isDarkMode={isDarkMode} onClick={onToggleTheme}>
          {isDarkMode ? "Modo claro" : "Modo oscuro"}
        </FooterButton>
      </div>
    </div>
  );
}
