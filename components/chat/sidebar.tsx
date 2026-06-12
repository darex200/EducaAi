"use client";

import { useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { TopicCard } from "@/components/chat/topic-card";

export type ConversationSummary = {
  id: string;
  title: string;
  topic: string;
  updatedAt: string;
  messageCount?: number;
};

type SidebarProps = {
  isDarkMode: boolean;
  userName?: string | null;
  onNewChat: () => void;
  onChooseTopic: () => void;
  onToggleTheme: () => void;
  onGenerateQuiz: () => void;
  onExploreContent: () => void;
  onToggleGuidedPractice: () => void;
  onAnalyzeDocument: () => void;
  isAnalyzingDocument?: boolean;
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
  conversations: ConversationSummary[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onLogout: () => void;
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
            ? "border border-white/[0.08] bg-slate-800/45 text-slate-200 hover:border-indigo-400/25 hover:bg-slate-800/75"
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
          ? "border-white/[0.08] bg-slate-800/70 text-slate-200 hover:border-indigo-400/20 hover:bg-slate-800"
          : "border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50/60"
      }`}
    >
      {children}
    </button>
  );
}

export function Sidebar({
  isDarkMode,
  userName,
  onNewChat,
  onChooseTopic,
  onToggleTheme,
  onGenerateQuiz,
  onExploreContent,
  onToggleGuidedPractice,
  onAnalyzeDocument,
  isAnalyzingDocument,
  practiceEnabled,
  topics,
  selectedTopicId,
  onSelectTopic,
  conversations,
  activeConversationId,
  onSelectConversation,
  onDeleteConversation,
  onLogout,
}: SidebarProps) {
  const sectionLabel = isDarkMode ? "text-slate-500" : "text-slate-400";
  const sidebarScrollRef = useRef<HTMLDivElement>(null);
  const topicCardRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const registerTopicRef = useCallback((id: string, el: HTMLButtonElement | null) => {
    topicCardRefs.current[id] = el;
  }, []);

  const scrollTopicIntoView = useCallback((topicId: string) => {
    const card = topicCardRefs.current[topicId];
    const container = sidebarScrollRef.current;
    if (!card || !container) return;

    const containerRect = container.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    const offsetInContainer = cardRect.top - containerRect.top + container.scrollTop;
    const targetTop = offsetInContainer - container.clientHeight / 2 + card.offsetHeight / 2;

    container.scrollTo({
      top: Math.max(0, Math.min(targetTop, container.scrollHeight - container.clientHeight)),
      behavior: "smooth",
    });
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => scrollTopicIntoView(selectedTopicId), 80);
    return () => window.clearTimeout(timer);
  }, [selectedTopicId, scrollTopicIntoView]);

  const handleSelectFromDropdown = (topicId: string) => {
    onSelectTopic(topicId);
    window.setTimeout(() => scrollTopicIntoView(topicId), 80);
  };

  const handleSelectFromCard = (topicId: string) => {
    onSelectTopic(topicId);
    scrollTopicIntoView(topicId);
  };

  const scrollWrapClass = isDarkMode ? "sidebar-scroll-wrap-dark" : "sidebar-scroll-wrap-light";
  const scrollClass = isDarkMode ? "sidebar-scroll sidebar-scroll-dark" : "sidebar-scroll";

  return (
    <div
      className={`theme-animate flex h-full flex-col overflow-hidden rounded-2xl border backdrop-blur-xl ${
        isDarkMode
          ? "chat-sidebar-dark text-slate-100"
          : "glass-panel border-white/60 bg-white/90 text-slate-800 shadow-[0_8px_32px_rgba(15,23,42,0.06)]"
      }`}
    >
      <div className={`theme-animate shrink-0 border-b px-4 py-4 ${isDarkMode ? "border-white/[0.06]" : "border-slate-100"}`}>
        <div className="flex items-center gap-3">
          <BrandLogo className="h-10 w-10 drop-shadow-[0_8px_14px_rgba(37,99,235,0.25)]" />
          <div>
            <p className="text-base font-semibold tracking-tight">Educa AI</p>
            <p className={`text-[11px] ${isDarkMode ? "text-slate-500" : "text-slate-500"}`}>Tutor académico guiado</p>
          </div>
        </div>
      </div>

      <div className={`sidebar-scroll-wrap ${scrollWrapClass} min-h-0 flex-1`}>
        <div ref={sidebarScrollRef} className={`${scrollClass} h-full px-3 py-4`}>
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
              <ToolButton isDarkMode={isDarkMode} onClick={onAnalyzeDocument}>
                {isAnalyzingDocument ? "Analizando documento…" : "Analizar documento"}
              </ToolButton>
            </div>
          </section>

          {conversations.length > 0 && (
            <section className="mb-5">
              <p className={`mb-2.5 px-1 text-[10px] font-semibold uppercase tracking-widest ${sectionLabel}`}>
                Historial
              </p>
              <div className="space-y-1">
                {conversations.map((conversation) => {
                  const isActive = conversation.id === activeConversationId;
                  return (
                    <div
                      key={conversation.id}
                      className={`group flex items-center gap-1 rounded-xl border px-2 py-1.5 transition ${
                        isActive
                          ? isDarkMode
                            ? "border-indigo-400/35 bg-indigo-950/35"
                            : "border-blue-300 bg-blue-50"
                          : isDarkMode
                            ? "border-transparent hover:border-white/[0.08] hover:bg-slate-800/50"
                            : "border-transparent hover:border-slate-200 hover:bg-white"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => onSelectConversation(conversation.id)}
                        className="min-w-0 flex-1 text-left"
                        title={conversation.title}
                      >
                        <p
                          className={`truncate text-xs font-medium ${
                            isDarkMode ? "text-slate-200" : "text-slate-700"
                          }`}
                        >
                          {conversation.title}
                        </p>
                        {conversation.topic && (
                          <p className={`truncate text-[10px] ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>
                            {conversation.topic}
                          </p>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteConversation(conversation.id)}
                        aria-label="Eliminar conversación"
                        className={`shrink-0 rounded-lg px-1.5 py-0.5 text-xs opacity-0 transition group-hover:opacity-100 ${
                          isDarkMode
                            ? "text-slate-500 hover:bg-red-500/15 hover:text-red-400"
                            : "text-slate-400 hover:bg-red-50 hover:text-red-600"
                        }`}
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          <section className="pb-2">
            <p className={`mb-2.5 px-1 text-[10px] font-semibold uppercase tracking-widest ${sectionLabel}`}>Temas</p>
            <select
              value={selectedTopicId}
              onChange={(e) => handleSelectFromDropdown(e.target.value)}
              className={`btn-hover-lift theme-animate mb-3 w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500/30 ${
                isDarkMode
                  ? "btn-hover-lift-dark border-white/[0.1] bg-slate-800/60 text-slate-100"
                  : "btn-hover-lift-light border-slate-200 bg-white text-slate-700"
              }`}
            >
              {!selectedTopicId && (
                <option value="" disabled>
                  Selecciona un tema
                </option>
              )}
              {topics.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.title}
                </option>
              ))}
            </select>
            <div className="space-y-2 pr-1">
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
      </div>

      <div className={`theme-animate shrink-0 space-y-1.5 border-t px-3 py-3 ${isDarkMode ? "border-white/[0.06]" : "border-slate-100"}`}>
        <div className="grid grid-cols-2 gap-1.5">
          <Link
            href="/dashboard/progress"
            className={`btn-hover-lift theme-animate rounded-xl border px-3 py-2 text-center text-xs font-medium ${
              isDarkMode
                ? "btn-hover-lift-dark border-white/[0.08] bg-slate-800/55 text-slate-200 hover:border-indigo-400/25"
                : "btn-hover-lift-light border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50/60"
            }`}
          >
            Progreso
          </Link>
          <Link
            href="/dashboard/plan"
            className={`btn-hover-lift theme-animate rounded-xl border px-3 py-2 text-center text-xs font-medium ${
              isDarkMode
                ? "btn-hover-lift-dark border-white/[0.08] bg-slate-800/55 text-slate-200 hover:border-indigo-400/25"
                : "btn-hover-lift-light border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50/60"
            }`}
          >
            Plan de estudio
          </Link>
        </div>
        <FooterButton isDarkMode={isDarkMode} onClick={onChooseTopic}>
          Cambiar tema
        </FooterButton>
        <FooterButton isDarkMode={isDarkMode} onClick={onToggleTheme}>
          {isDarkMode ? "Modo claro" : "Modo oscuro"}
        </FooterButton>
        <div className="flex items-center gap-2 pt-1">
          <p className={`min-w-0 flex-1 truncate px-1 text-[11px] ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>
            {userName ? `Sesión: ${userName}` : "Sin sesión"}
          </p>
          <button
            type="button"
            onClick={onLogout}
            className={`shrink-0 rounded-lg px-2 py-1 text-[11px] font-medium transition ${
              isDarkMode
                ? "text-slate-400 hover:bg-red-500/15 hover:text-red-400"
                : "text-slate-500 hover:bg-red-50 hover:text-red-600"
            }`}
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}
