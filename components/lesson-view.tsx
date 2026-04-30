import type { Lesson } from "@/lib/lessons";

export function LessonView({ lesson }: { lesson: Lesson }) {
  return (
    <article className="space-y-6">
      <header className="card-surface p-6">
        <h1 className="mb-3 text-2xl font-semibold text-indigo-800">{lesson.title}</h1>
        <p className="text-sm leading-6 text-slate-600">{lesson.explanation}</p>
      </header>

      <section className="card-surface p-6">
        <h2 className="mb-4 text-lg font-semibold text-indigo-800">Desglose paso a paso</h2>
        <ol className="space-y-2 text-sm text-slate-600">
          {lesson.steps.map((step, index) => (
            <li key={step} className="flex gap-3">
              <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
                {index + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="card-surface p-6">
        <h2 className="mb-4 text-lg font-semibold text-indigo-800">Preguntas de practica</h2>
        <ul className="space-y-2 text-sm text-slate-600">
          {lesson.practiceQuestions.map((question) => (
            <li key={question} className="rounded-xl border bg-indigo-50/60 px-3 py-2">
              {question}
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
