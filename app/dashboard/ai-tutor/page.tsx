import { ChatWindow } from "@/components/chat-window";

export default function AITutorPage() {
  return (
    <div className="space-y-5">
      <header className="card-surface overflow-hidden p-0">
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-6 text-white">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-indigo-100">
            Tutor IA de Educa
          </p>
          <h1 className="mb-2 text-2xl font-semibold sm:text-3xl">Aprendizaje Guiado para Estudiantes</h1>
          <p className="max-w-2xl text-sm text-indigo-50">
            Tu tutor te ayuda a entender conceptos, te hace preguntas de reflexion y apoya
            el aprendizaje con explicaciones generales en lugar de respuestas directas.
          </p>
        </div>
        <div className="grid gap-3 bg-white p-4 sm:grid-cols-3">
          <article className="rounded-xl border bg-indigo-50/50 p-3">
            <h2 className="mb-1 text-sm font-semibold text-indigo-800">Guia paso a paso</h2>
            <p className="text-xs leading-5 text-slate-600">
              Divide los problemas en partes pequenas y resuelve con confianza.
            </p>
          </article>
          <article className="rounded-xl border bg-indigo-50/50 p-3">
            <h2 className="mb-1 text-sm font-semibold text-indigo-800">Informacion general</h2>
            <p className="text-xs leading-5 text-slate-600">
              Aprende ideas y metodos clave sin recibir atajos con la respuesta final.
            </p>
          </article>
          <article className="rounded-xl border bg-indigo-50/50 p-3">
            <h2 className="mb-1 text-sm font-semibold text-indigo-800">Pensamiento critico</h2>
            <p className="text-xs leading-5 text-slate-600">
              Responde preguntas guia para fortalecer tu razonamiento.
            </p>
          </article>
        </div>
      </header>
      <ChatWindow />
    </div>
  );
}
