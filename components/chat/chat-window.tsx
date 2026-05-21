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
  const shell = isDarkMode
    ? "border-slate-700/80 bg-slate-950/90 text-slate-100 shadow-[0_8px_40px_rgba(0,0,0,0.35)]"
    : "glass-panel border-white/70 bg-white/85 text-slate-900 shadow-[0_8px_40px_rgba(15,23,42,0.08)]";

  return (
    <section className={`flex h-full flex-col overflow-hidden rounded-2xl border backdrop-blur-xl ${shell}`}>
      <header
        className={`shrink-0 border-b px-5 py-3.5 ${
          isDarkMode ? "border-slate-800 bg-slate-900/90" : "border-slate-100/80 bg-white/50"
        }`}
      >
        <p className="text-sm font-semibold tracking-tight">Asistente de aprendizaje guiado</p>
        <p className={`mt-0.5 text-xs ${isDarkMode ? "text-slate-500" : "text-slate-500"}`}>
          <span className={isDarkMode ? "text-slate-400" : "text-slate-600"}>{topicLabel}</span>
          <span className="mx-1.5 opacity-40">·</span>
          {levelLabel}
          <span className="mx-1.5 opacity-40">·</span>
          {difficultyLabel}
        </p>
      </header>

      {showTopicSelector && (
        <div className={`shrink-0 border-b px-4 py-3 ${isDarkMode ? "border-slate-800 bg-slate-900/80" : "border-slate-100 bg-blue-50/30"}`}>
          {topicSelector}
        </div>
      )}
      {toolsPanel && (
        <div className={`chat-scroll shrink-0 max-h-[40vh] overflow-y-auto border-b px-4 py-3 ${isDarkMode ? "border-slate-800 bg-slate-900/60" : "border-slate-100 bg-slate-50/50"}`}>
          {toolsPanel}
        </div>
      )}

      <div
        ref={bodyRef}
        onScroll={onBodyScroll}
        className={`chat-scroll chat-scroll-smooth flex-1 space-y-3 overflow-y-auto px-4 py-5 sm:px-6 ${
          isDarkMode ? "bg-slate-950/50" : "bg-gradient-to-b from-slate-50/30 to-transparent"
        }`}
      >
        {messages.length === 1 && messages[0].id === "assistant-welcome" && (
          <div className={`animate-fade-up rounded-2xl border border-dashed px-4 py-6 text-center ${isDarkMode ? "border-slate-700 bg-slate-900/50 text-slate-400" : "border-slate-200 bg-white/60 text-slate-500"}`}>
            <p className="text-sm">Escribe tu pregunta o adjunta una imagen para comenzar.</p>
          </div>
        )}
        {messages.map((message) => (
          <div key={message.id} className="animate-fade-up">
            <MessageBubble message={message} isDarkMode={isDarkMode} />
          </div>
        ))}
        {isSending && (
          <div className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${isDarkMode ? "bg-slate-900/80" : "bg-white/80"}`}>
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 animate-bounce rounded-full bg-blue-500 [animation-delay:-0.2s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-blue-500 [animation-delay:-0.1s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-blue-500" />
            </div>
            <span className={`text-xs font-medium ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
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
