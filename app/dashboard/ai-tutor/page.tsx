import { ChatContainer } from "@/components/ai-tutor/chat-container";

export default function AITutorPage() {
  return (
    <div className="space-y-3">
      <header className="flex items-center justify-between gap-3 px-1">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Tutor IA</p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950">Chat académico</h1>
        </div>
        <p className="hidden max-w-md text-right text-sm text-slate-500 sm:block">
          Conversa sin modalidad predeterminada o elige una cuando necesites herramientas guiadas.
        </p>
      </header>
      <ChatContainer />
    </div>
  );
}
