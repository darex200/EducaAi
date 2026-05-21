"use client";

export type TopicItem = {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: "basico" | "intermedio" | "avanzado";
};

type TopicCardProps = {
  topic: TopicItem;
  isActive: boolean;
  isDarkMode?: boolean;
  onSelect: () => void;
};

export function TopicCard({ topic, isActive, isDarkMode = false, onSelect }: TopicCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-2xl border px-3 py-2.5 text-left transition ${
        isActive
          ? isDarkMode
            ? "border-blue-500/60 bg-blue-500/15 shadow-sm"
            : "border-blue-300 bg-blue-50 shadow-sm"
          : isDarkMode
            ? "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
            : "border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50"
      }`}
    >
      <p className={`text-sm font-semibold ${isDarkMode ? "text-slate-100" : "text-slate-900"}`}>{topic.title}</p>
      <p className={`mt-1 line-clamp-2 text-xs leading-5 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
        {topic.description}
      </p>
      <div className="mt-2 flex items-center gap-2 text-[11px]">
        <span className={`rounded-full px-2 py-0.5 ${isDarkMode ? "bg-white/10 text-slate-300" : "bg-slate-100 text-slate-600"}`}>
          {topic.category}
        </span>
        <span className={`rounded-full px-2 py-0.5 ${isDarkMode ? "bg-indigo-400/15 text-indigo-200" : "bg-indigo-100 text-indigo-700"}`}>
          {topic.difficulty}
        </span>
      </div>
    </button>
  );
}
