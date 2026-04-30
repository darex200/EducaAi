import { ChatWindow } from "@/components/chat-window";

export default function AITutorPage() {
  return (
    <div className="space-y-5">
      <header className="card-surface overflow-hidden p-0">
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-6 text-white">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-indigo-100">
            Educa AI Tutor
          </p>
          <h1 className="mb-2 text-2xl font-semibold sm:text-3xl">Guided Student Learning</h1>
          <p className="max-w-2xl text-sm text-indigo-50">
            Your tutor helps you understand concepts, asks reflective questions, and supports
            learning with general explanations instead of direct answers.
          </p>
        </div>
        <div className="grid gap-3 bg-white p-4 sm:grid-cols-3">
          <article className="rounded-xl border bg-indigo-50/50 p-3">
            <h2 className="mb-1 text-sm font-semibold text-indigo-800">Step-by-step guidance</h2>
            <p className="text-xs leading-5 text-slate-600">
              Break problems into small parts and solve with confidence.
            </p>
          </article>
          <article className="rounded-xl border bg-indigo-50/50 p-3">
            <h2 className="mb-1 text-sm font-semibold text-indigo-800">General information</h2>
            <p className="text-xs leading-5 text-slate-600">
              Learn key ideas and methods without receiving final shortcuts.
            </p>
          </article>
          <article className="rounded-xl border bg-indigo-50/50 p-3">
            <h2 className="mb-1 text-sm font-semibold text-indigo-800">Critical thinking</h2>
            <p className="text-xs leading-5 text-slate-600">
              Answer guiding questions to strengthen your reasoning.
            </p>
          </article>
        </div>
      </header>
      <ChatWindow />
    </div>
  );
}
