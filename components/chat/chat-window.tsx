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
  hasSelectedTopic: boolean;
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
  hasSelectedTopic,
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
    <section className={`flex h-full flex-col overflow-hidden ${isDarkMode ? "bg-slate-950 text-slate-100" : "bg-white text-slate-900"}`}>
      <header className={`border-b px-5 py-3 backdrop-blur ${isDarkMode ? "border-white/10 bg-slate-950/90" : "border-slate-200 bg-white/90"}`}>
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">Tutor IA</p>
            <p className={`text-xs ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
              {hasSelectedTopic ? topicLabel : "Empieza sin modalidad predeterminada"}
            </p>
          </div>
          <div className="hidden items-center gap-2 text-[11px] sm:flex">
            <span className={`rounded-full px-2.5 py-1 ${hasSelectedTopic ? "bg-emerald-500/10 text-emerald-600" : isDarkMode ? "bg-white/10 text-slate-300" : "bg-slate-100 text-slate-600"}`}>
              {hasSelectedTopic ? "Modalidad activa" : "Sin modalidad"}
            </span>
            <span className={`rounded-full px-2.5 py-1 ${isDarkMode ? "bg-white/10 text-slate-300" : "bg-slate-100 text-slate-600"}`}>
              Nivel: {levelLabel}
            </span>
            <span className={`rounded-full px-2.5 py-1 ${isDarkMode ? "bg-white/10 text-slate-300" : "bg-slate-100 text-slate-600"}`}>
              Dificultad: {difficultyLabel}
            </span>
          </div>
        </div>
      </header>

      {showTopicSelector && (
        <div className={`border-b px-4 py-3 ${isDarkMode ? "border-white/10 bg-slate-900" : "border-slate-200 bg-slate-50"}`}>
          <div className="mx-auto max-w-4xl">{topicSelector}</div>
        </div>
      )}
      {toolsPanel && (
        <div className={`border-b px-4 py-3 ${isDarkMode ? "border-white/10 bg-slate-900/80" : "border-slate-200 bg-slate-50/80"}`}>
          <div className="mx-auto max-w-4xl">{toolsPanel}</div>
        </div>
      )}

      <div
        ref={bodyRef}
        onScroll={onBodyScroll}
        className={`flex-1 overflow-y-auto px-4 py-6 ${isDarkMode ? "bg-slate-950" : "bg-white"}`}
      >
        <div className="mx-auto flex max-w-4xl flex-col gap-5">
          {!hasSelectedTopic && (
            <div className={`rounded-3xl border px-5 py-4 text-sm ${isDarkMode ? "border-white/10 bg-white/5 text-slate-300" : "border-slate-200 bg-slate-50 text-slate-600"}`}>
              No hay modalidad seleccionada. Puedes conversar de forma general o elegir una modalidad en la barra lateral cuando la necesites.
            </div>
          )}
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} isDarkMode={isDarkMode} />
          ))}
          {isSending && (
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-xs font-semibold text-white">
                IA
              </div>
              <div className="flex items-center gap-1 rounded-2xl px-3 py-2">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.2s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.1s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />
              </div>
            </div>
          )}
        </div>
        <div ref={endRef} />
      </div>

      {input}
      {error && <p className="mx-auto w-full max-w-4xl px-4 pb-3 text-xs text-red-500">{error}</p>}
    </section>
  );
}
