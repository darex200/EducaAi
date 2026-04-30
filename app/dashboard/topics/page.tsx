import { lessons } from "@/lib/lessons";
import { TopicCard } from "@/components/topics/topic-card";

export default function TopicsPage() {
  return (
    <div className="space-y-4">
      <header className="card-surface p-6">
        <h1 className="mb-2 text-2xl font-semibold text-indigo-800">Temas</h1>
        <p className="text-sm text-slate-600">
          Selecciona un tema para abrir su interfaz interactiva en una página dedicada.
        </p>
      </header>
      <div className="grid gap-4 lg:grid-cols-2">
        {lessons.map((lesson) => (
          <TopicCard key={lesson.slug} lesson={lesson} />
        ))}
      </div>
    </div>
  );
}
