"use client";

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

import { TopicCard } from "@/components/chat/topic-card";

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
  return (
    <div
      className={`flex h-full flex-col rounded-2xl border px-4 py-5 ${
        isDarkMode ? "border-slate-700 bg-slate-900 text-slate-100" : "border-blue-100 bg-white text-slate-800"
      }`}
    >
      <p className="mb-5 text-lg font-semibold tracking-tight">Educa AI</p>

      <button onClick={onNewChat} className="mb-6 rounded-lg bg-gradient-to-r from-blue-700 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white">
        Nueva conversación
      </button>

      <section className="mb-5">
        <p className={`mb-2 text-xs font-semibold uppercase ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>Herramientas</p>
        <div className="space-y-2 text-sm">
          <button onClick={onGenerateQuiz} className={`w-full rounded-lg px-3 py-2 text-left ${isDarkMode ? "bg-slate-800 text-slate-200" : "bg-blue-50 text-slate-700"}`}>
            Generar cuestionario
          </button>
          <button onClick={onExploreContent} className={`w-full rounded-lg px-3 py-2 text-left ${isDarkMode ? "bg-slate-800 text-slate-200" : "bg-blue-50 text-slate-700"}`}>
            Explorar contenido
          </button>
          <button onClick={onToggleGuidedPractice} className={`w-full rounded-lg px-3 py-2 text-left ${practiceEnabled ? "bg-blue-600 text-white" : isDarkMode ? "bg-slate-800 text-slate-200" : "bg-blue-50 text-slate-700"}`}>
            Modo practica guiada
          </button>
        </div>
      </section>

      <section className="mb-6 min-h-0 flex-1">
        <p className={`mb-2 text-xs font-semibold uppercase ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>Temas</p>
        <div className="mb-2">
          <select
            value={selectedTopicId}
            onChange={(e) => onSelectTopic(e.target.value)}
            className={`w-full rounded-lg border px-3 py-2 text-sm ${
              isDarkMode ? "border-slate-600 bg-slate-800 text-slate-100" : "border-slate-200 bg-white text-slate-700"
            }`}
          >
            {topics.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.title}
              </option>
            ))}
          </select>
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
          className={`w-full rounded-lg border px-3 py-2 text-left text-sm ${
            isDarkMode ? "border-slate-600 bg-slate-800 text-slate-200" : "border-slate-200 bg-white text-slate-700"
          }`}
        >
          Cambiar tema
        </button>
        <button
          onClick={onToggleTheme}
          className={`w-full rounded-lg border px-3 py-2 text-left text-sm ${
            isDarkMode ? "border-slate-600 bg-slate-800 text-slate-200" : "border-slate-200 bg-white text-slate-700"
          }`}
        >
          Configuración: {isDarkMode ? "Modo claro" : "Modo oscuro"}
        </button>
      </div>
    </div>
  );
}
