import { ChatContainer } from "@/components/ai-tutor/chat-container";

export default function AITutorPage() {
  return (
    <div className="space-y-4">
      <header className="card-surface bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-white">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-indigo-100">Tutor IA de Educa</p>
        <h1 className="mb-2 text-2xl font-semibold sm:text-3xl">Plataforma de aprendizaje inteligente</h1>
        <p className="max-w-3xl text-sm text-indigo-50">
          Chat moderno con guia socratica, respuestas estructuradas e interpretacion de imagenes para estudiar mejor.
        </p>
      </header>
      <ChatContainer />
    </div>
  );
}
