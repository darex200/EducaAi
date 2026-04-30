import Link from "next/link";
import { lessons } from "@/lib/lessons";

export default function TopicsPage() {
  return (
    <div className="space-y-4">
      <header className="card-surface p-6">
        <h1 className="mb-2 text-2xl font-semibold text-indigo-800">Temas</h1>
        <p className="text-sm text-slate-600">
          Elige un tema para explorar explicaciones, desgloses paso a paso y preguntas de practica.
        </p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {lessons.map((lesson) => (
          <Link
            key={lesson.slug}
            href={`/dashboard/topics/${lesson.slug}`}
            className="card-surface block p-5 hover:-translate-y-0.5 hover:shadow-md"
          >
            <h2 className="mb-2 text-lg font-semibold text-indigo-800">{lesson.title}</h2>
            <p className="text-sm text-slate-600">{lesson.explanation}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
