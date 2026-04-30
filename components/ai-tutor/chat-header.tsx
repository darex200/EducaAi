"use client";

type ChatHeaderProps = {
  title: string;
  subtitle: string;
  isDarkMode: boolean;
  onChooseTopic: () => void;
};

export function ChatHeader({ title, subtitle, isDarkMode, onChooseTopic }: ChatHeaderProps) {
  return (
    <div
      className={`border-b px-5 py-4 transition-colors duration-300 ${
        isDarkMode ? "border-slate-700/80 bg-slate-900/70" : "border-slate-200 bg-slate-50/80"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className={`text-xs ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>{subtitle}</p>
        </div>
        <button
          onClick={onChooseTopic}
          className={`rounded-lg border px-3 py-1.5 text-xs ${
            isDarkMode
              ? "border-slate-600 bg-slate-800 text-slate-200 hover:bg-slate-700"
              : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
          }`}
        >
          Cambiar tema
        </button>
      </div>
    </div>
  );
}
