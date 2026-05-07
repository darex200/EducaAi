"use client";

import type { TutorMessage } from "@/components/ai-tutor/types";
import { MessageBubble } from "@/components/chat/message-bubble";

type ChatWindowProps = {
  messages: TutorMessage[];
  isSending: boolean;
  isDarkMode: boolean;
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
  return (
    <section className={`flex h-full flex-col overflow-hidden rounded-2xl border ${isDarkMode ? "border-slate-700 bg-slate-950 text-slate-100" : "border-blue-100 bg-white text-slate-900"}`}>
      <header className={`border-b px-5 py-3 ${isDarkMode ? "border-slate-700 bg-slate-900/80" : "border-blue-100 bg-slate-50/80"}`}>
        <p className="text-sm font-semibold">Asistente de aprendizaje guiado</p>
        <p className={`text-xs ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
          Tema: {topicLabel} · Nivel: {levelLabel} · Dificultad: {difficultyLabel}
        </p>
      </header>

      {showTopicSelector && <div className={`border-b px-4 py-3 ${isDarkMode ? "border-slate-700 bg-slate-900" : "border-blue-100 bg-blue-50/40"}`}>{topicSelector}</div>}
      {toolsPanel && <div className={`border-b px-4 py-3 ${isDarkMode ? "border-slate-700 bg-slate-900/80" : "border-blue-100 bg-slate-50/70"}`}>{toolsPanel}</div>}

      <div
        ref={bodyRef}
        onScroll={onBodyScroll}
        className={`flex-1 space-y-2 overflow-y-auto px-4 py-4 ${isDarkMode ? "bg-slate-950" : "bg-slate-50/40"}`}
      >
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} isDarkMode={isDarkMode} />
        ))}
        {isSending && (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.2s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.1s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />
            </div>
            <span>El tutor esta escribiendo...</span>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {input}
      {error && <p className="px-4 pb-3 text-xs text-red-500">{error}</p>}
    </section>
  );
}
