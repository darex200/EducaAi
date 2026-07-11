"use client";

import type { TutorMessage } from "@/components/ai-tutor/types";
import { MessageBubble } from "@/components/chat/message-bubble";

type ChatWindowProps = {
  messages: TutorMessage[];
  isSending: boolean;
  isDarkMode: boolean;
  emptyState?: string;
  topicLabel: string;
  levelLabel: string;
  difficultyLabel: string;
  showTopicSelector: boolean;
  topicSelector: React.ReactNode;
  input: React.ReactNode;
  endRef: React.RefObject<HTMLDivElement | null>;
  bodyRef: React.RefObject<HTMLDivElement | null>;
  onBodyScroll: () => void;
  error: string | null;
  toolsPanel?: React.ReactNode;
};

export function ChatWindow({
  messages,
  isSending,
  isDarkMode,
  emptyState,
  topicLabel,
  levelLabel,
  difficultyLabel,
  showTopicSelector,
  topicSelector,
  input,
  endRef,
  bodyRef,
  onBodyScroll,
  error,
  toolsPanel,
}: ChatWindowProps) {
  const shell = isDarkMode
    ? "chat-surface-dark theme-animate backdrop-blur-xl text-slate-100"
    : "glass-panel chat-surface-light theme-animate border-white/70 text-slate-900";

  return (
    <section className={`flex h-full flex-col overflow-hidden rounded-2xl border ${shell}`}>
      <header
        className={`theme-animate shrink-0 border-b px-5 py-3.5 ${
          isDarkMode ? "dark-header" : "border-slate-100/80 bg-white/50"
        }`}
      >
        <p className="text-sm font-semibold tracking-tight">Asistente de aprendizaje guiado</p>
        <p className={`theme-animate mt-0.5 text-xs ${isDarkMode ? "text-[var(--dark-text-muted)]" : "text-slate-500"}`}>
          <span className={isDarkMode ? "text-[var(--dark-text-soft)]" : "text-slate-600"}>{topicLabel}</span>
          <span className="mx-1.5 opacity-40">·</span>
          {levelLabel}
          <span className="mx-1.5 opacity-40">·</span>
          {difficultyLabel}
        </p>
      </header>

      {showTopicSelector && (
        <div className={`theme-animate shrink-0 border-b px-4 py-3 ${isDarkMode ? "dark-panel" : "border-slate-100 bg-blue-50/30"}`}>
          {topicSelector}
        </div>
      )}
      {toolsPanel && (
        <div className={`chat-scroll theme-animate shrink-0 max-h-[40vh] overflow-y-auto border-b px-4 py-3 ${isDarkMode ? "dark-panel" : "border-slate-100 bg-slate-50/50"}`}>
          {toolsPanel}
        </div>
      )}

      <div
        ref={bodyRef}
        onScroll={onBodyScroll}
        className={`chat-scroll chat-scroll-smooth theme-animate flex-1 space-y-3 overflow-y-auto px-4 py-5 sm:px-6 ${
          isDarkMode ? "chat-scroll-dark chat-body-dark" : "bg-gradient-to-b from-slate-50/30 to-transparent"
        }`}
      >
        {messages.length === 0 && emptyState && (
          <div className={`theme-animate animate-fade-up rounded-2xl border border-dashed px-4 py-8 text-center ${
            isDarkMode ? "dark-empty-state" : "border-slate-200 bg-white/60 text-slate-500"
          }`}>
            <p className="text-sm">{emptyState}</p>
          </div>
        )}
        {messages.map((message) => (
          <div key={message.id} className="animate-fade-up">
            <MessageBubble message={message} isDarkMode={isDarkMode} />
          </div>
        ))}
        {isSending && (
          <div className={`theme-animate flex items-center gap-3 rounded-2xl px-4 py-3 ${isDarkMode ? "dark-typing" : "bg-white/80"}`}>
            <div className="flex items-center gap-1">
              <span className={`h-2 w-2 animate-bounce rounded-full [animation-delay:-0.2s] ${isDarkMode ? "bg-blue-400" : "bg-blue-500"}`} />
              <span className={`h-2 w-2 animate-bounce rounded-full [animation-delay:-0.1s] ${isDarkMode ? "bg-blue-400" : "bg-blue-500"}`} />
              <span className={`h-2 w-2 animate-bounce rounded-full ${isDarkMode ? "bg-blue-400" : "bg-blue-500"}`} />
            </div>
            <span className={`text-xs font-medium ${isDarkMode ? "text-[var(--dark-text-muted)]" : "text-slate-500"}`}>
              El tutor está escribiendo…
            </span>
          </div>
        )}
        <div ref={endRef} className="h-1" />
      </div>

      <div className="shrink-0">{input}</div>
      {error && (
        <p className="shrink-0 px-5 pb-3 text-xs font-medium text-red-500">{error}</p>
      )}
    </section>
  );
}
