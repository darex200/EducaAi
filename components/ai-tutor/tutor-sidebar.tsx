"use client";

type TutorSidebarProps = {
  onNewChat: () => void;
  isDarkMode: boolean;
};

const topics = ["Matematicas", "Fisica", "Lenguaje"];

export function TutorSidebar({ onNewChat, isDarkMode }: TutorSidebarProps) {
  return (
    <aside
      className={`hidden w-80 shrink-0 rounded-2xl border p-4 transition-colors duration-300 lg:block ${
        isDarkMode ? "border-slate-700/80 bg-slate-900/90" : "border-slate-200 bg-white"
      }`}
    >
      <button onClick={onNewChat} className="gradient-accent mb-5 w-full rounded-lg px-4 py-2.5 text-sm font-semibold">
        Nueva conversación
      </button>

      <section className="mb-5">
        <h3 className={`mb-2 text-xs font-semibold uppercase ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>Tutor IA</h3>
        <p className={`rounded-lg px-3 py-2 text-sm ${isDarkMode ? "bg-slate-800 text-slate-200" : "bg-slate-100 text-slate-700"}`}>
          Guía académica estructurada para resolver dudas paso a paso.
        </p>
      </section>

      <section>
        <h3 className={`mb-2 text-xs font-semibold uppercase ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
          Temas de aprendizaje
        </h3>
        <div className="flex flex-wrap gap-2">
          {topics.map((topic) => (
            <span
              key={topic}
              className={`rounded-full px-3 py-1 text-xs ${
                isDarkMode ? "bg-slate-800 text-slate-200" : "bg-indigo-100 text-indigo-700"
              }`}
            >
              {topic}
            </span>
          ))}
        </div>
      </section>
    </aside>
  );
}
