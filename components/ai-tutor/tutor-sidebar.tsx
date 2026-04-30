"use client";

type TutorSidebarProps = {
  onNewChat: () => void;
  isDarkMode: boolean;
};

const mockHistory = [
  "Ecuaciones lineales",
  "Analisis de texto",
  "Fuerza y movimiento",
];

const topics = ["Matematicas", "Fisica", "Lenguaje"];

export function TutorSidebar({ onNewChat, isDarkMode }: TutorSidebarProps) {
  return (
    <aside
      className={`hidden w-72 shrink-0 rounded-2xl border p-4 lg:block ${
        isDarkMode ? "border-slate-700 bg-slate-900" : "border-indigo-100 bg-white"
      }`}
    >
      <button
        onClick={onNewChat}
        className="gradient-accent mb-5 w-full rounded-xl px-4 py-2.5 text-sm font-semibold"
      >
        + Nuevo chat
      </button>

      <section className="mb-5">
        <h3 className={`mb-2 text-xs font-semibold uppercase ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
          Historial
        </h3>
        <ul className="space-y-1">
          {mockHistory.map((item) => (
            <li
              key={item}
              className={`rounded-lg px-3 py-2 text-sm ${
                isDarkMode ? "bg-slate-800 text-slate-200" : "bg-indigo-50 text-slate-700"
              }`}
            >
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className={`mb-2 text-xs font-semibold uppercase ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
          Temas
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
