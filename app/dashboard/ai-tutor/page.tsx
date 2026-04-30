import { ChatContainer } from "@/components/ai-tutor/chat-container";

export default function AITutorPage() {
  return (
    <div className="space-y-4">
      <header className="card-surface border-slate-200 p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="42"
              height="42"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 8V4H8" />
              <rect width="16" height="12" x="4" y="8" rx="2" />
              <path d="M2 14h2" />
              <path d="M20 14h2" />
              <path d="M15 13v2" />
              <path d="M9 13v2" />
            </svg>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Tutor IA</p>
            <h1 className="mb-2 text-2xl font-semibold text-slate-900 sm:text-3xl">Asistencia académica estructurada</h1>
            <p className="max-w-3xl text-sm text-slate-600">
              Resuelve dudas con orientación paso a paso, lenguaje claro y soporte para análisis de imágenes educativas.
            </p>
          </div>
        </div>
      </header>
      <ChatContainer />
    </div>
  );
}
