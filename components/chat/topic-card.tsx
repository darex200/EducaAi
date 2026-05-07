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
  onSelect: () => void;
};

export function TopicCard({ topic, isActive, onSelect }: TopicCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-xl border px-3 py-2 text-left transition ${
        isActive
          ? "border-blue-300 bg-blue-50 shadow-sm"
          : "border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50"
      }`}
    >
      <p className="text-sm font-semibold text-slate-900">{topic.title}</p>
      <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600">{topic.description}</p>
      <div className="mt-2 flex items-center gap-2 text-[11px]">
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">{topic.category}</span>
        <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-indigo-700">{topic.difficulty}</span>
      </div>
    </button>
  );
}
