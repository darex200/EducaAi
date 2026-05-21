"use client";

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
  selectedTopicId: string | null;
  activeTopicLabel: string;
  onSelectTopic: (topicId: string) => void;
};

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
  activeTopicLabel,
  onSelectTopic,
}: SidebarProps) {
  const hasActiveTopic = Boolean(activeTopicLabel);
  const toolButtonClass = (isActive = false) =>
    `w-full rounded-xl px-3 py-2.5 text-left text-sm transition ${
      isActive
        ? "bg-blue-600 text-white shadow-sm shadow-blue-900/20"
        : isDarkMode
          ? "bg-white/5 text-slate-200 hover:bg-white/10 disabled:cursor-not-allowed disabled:text-slate-500"
          : "bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:cursor-not-allowed disabled:text-slate-400"
    }`;

  return (
    <div
      className={`flex h-full flex-col rounded-3xl border px-3 py-4 shadow-sm ${
        isDarkMode ? "border-white/10 bg-slate-950 text-slate-100" : "border-slate-200 bg-slate-50 text-slate-800"
      }`}
    >
      <div className="mb-4 px-2">
        <p className="text-lg font-semibold tracking-tight">Educa AI</p>
        <p className={`mt-1 text-xs ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
          Tutor conversacional
        </p>
      </div>

      <button
        onClick={onNewChat}
        className={`mb-4 rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
          isDarkMode
            ? "border-white/10 bg-white/5 text-white hover:bg-white/10"
            : "border-slate-200 bg-white text-slate-900 hover:bg-slate-100"
        }`}
      >
        + Nueva conversacion
      </button>

      <section className="mb-5 rounded-2xl px-1">
        <p className={`mb-2 px-1 text-xs font-semibold uppercase tracking-wide ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
          Herramientas
        </p>
        <div className="space-y-2 text-sm">
          <button
            onClick={onGenerateQuiz}
            disabled={!hasActiveTopic}
            className={toolButtonClass()}
            title={!hasActiveTopic ? "Elige una modalidad para generar un cuestionario" : undefined}
          >
            Generar cuestionario
          </button>
          <button
            onClick={onExploreContent}
            disabled={!hasActiveTopic}
            className={toolButtonClass()}
            title={!hasActiveTopic ? "Elige una modalidad para explorar contenido" : undefined}
          >
            Explorar contenido
          </button>
          <button
            onClick={onToggleGuidedPractice}
            disabled={!hasActiveTopic}
            className={toolButtonClass(practiceEnabled)}
            title={!hasActiveTopic ? "Elige una modalidad para practicar" : undefined}
          >
            Modo practica guiada
          </button>
        </div>
        {!hasActiveTopic && (
          <p className={`mt-2 px-1 text-xs leading-5 ${isDarkMode ? "text-slate-500" : "text-slate-500"}`}>
            Selecciona una modalidad para activar estas herramientas.
          </p>
        )}
      </section>

      <section className="mb-6 min-h-0 flex-1">
        <p className={`mb-2 px-1 text-xs font-semibold uppercase tracking-wide ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
          Modalidad
        </p>
        <div className="mb-2">
          <select
            value={selectedTopicId ?? ""}
            onChange={(e) => onSelectTopic(e.target.value)}
            className={`w-full rounded-2xl border px-3 py-2.5 text-sm outline-none transition focus:ring-2 ${
              isDarkMode
                ? "border-white/10 bg-white/5 text-slate-100 focus:ring-blue-500/40"
                : "border-slate-200 bg-white text-slate-700 focus:ring-blue-200"
            }`}
          >
            <option value="">Sin modalidad seleccionada</option>
            {topics.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.title}
              </option>
            ))}
          </select>
          {hasActiveTopic && !selectedTopicId && (
            <p className={`mt-2 px-1 text-xs ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
              Modalidad de perfil activa: {activeTopicLabel}
            </p>
          )}
        </div>
        <div className="max-h-[42vh] space-y-2 overflow-y-auto pr-1">
          {topics.map((topic) => (
            <TopicCard
              key={topic.id}
              topic={topic}
              isActive={topic.id === selectedTopicId}
              isDarkMode={isDarkMode}
              onSelect={() => onSelectTopic(topic.id)}
            />
          ))}
        </div>
      </section>

      <div className="mt-auto space-y-2">
        <button
          onClick={onChooseTopic}
          className={`w-full rounded-2xl border px-3 py-2.5 text-left text-sm transition ${
            isDarkMode
              ? "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
          }`}
        >
          Elegir desde mi perfil
        </button>
        <button
          onClick={onToggleTheme}
          className={`w-full rounded-2xl border px-3 py-2.5 text-left text-sm transition ${
            isDarkMode
              ? "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
          }`}
        >
          {isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
        </button>
      </div>
    </div>
  );
}
