"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { InputBar } from "@/components/ai-tutor/input-bar";
import { MessageBubble } from "@/components/ai-tutor/message-bubble";
import { TutorSidebar } from "@/components/ai-tutor/tutor-sidebar";
import type { TutorMessage } from "@/components/ai-tutor/types";

const initialMessages: TutorMessage[] = [
  {
    id: "assistant-welcome",
    role: "assistant",
    content:
      "Hola, soy tu tutor IA. Te acompano con metodo socratico para que entiendas por que funciona cada paso.\n\n🧠 Concepto\nDime el tema o comparte una imagen del ejercicio.\n\n🪜 Paso a paso\nEmpezaremos por una idea pequena y la construiremos juntos.\n\n❓ Pregunta para estudiante\nQue parte te resulta mas dificil ahora mismo?",
  },
];

function toDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function ChatContainer() {
  const [messages, setMessages] = useState<TutorMessage[]>(initialMessages);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  const containerClass = useMemo(
    () =>
      isDarkMode
        ? "border-slate-700 bg-slate-950 text-slate-100"
        : "border-indigo-100 bg-white text-slate-900",
    [isDarkMode],
  );

  const handleSend = async ({
    text,
    imageFile,
  }: {
    text: string;
    imageFile: File | null;
  }) => {
    const imageDataUrl = imageFile ? await toDataUrl(imageFile) : undefined;
    const userMessage: TutorMessage = {
      id: `user-${crypto.randomUUID()}`,
      role: "user",
      content: text || "Analiza esta imagen, por favor.",
      imageDataUrl,
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setIsSending(true);
    setError(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map((message) => ({
            role: message.role,
            content: message.content,
            imageDataUrl: message.imageDataUrl,
          })),
        }),
      });

      if (!response.ok) throw new Error("Fallo la solicitud");

      const data = (await response.json()) as { reply?: string };
      const assistantMessage: TutorMessage = {
        id: `assistant-${crypto.randomUUID()}`,
        role: "assistant",
        content:
          data.reply ??
          "No pude responder en este intento. Reenvia tu pregunta y lo resolvemos paso a paso.",
      };
      setMessages((current) => [...current, assistantMessage]);
    } catch {
      setError("Error al contactar el tutor IA. Verifica tu API key e intenta de nuevo.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-6xl">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-indigo-500">Tutor IA Avanzado</h2>
        <button
          onClick={() => setIsDarkMode((v) => !v)}
          className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs text-indigo-700"
        >
          {isDarkMode ? "Modo claro" : "Modo oscuro"}
        </button>
      </div>

      <div className="flex gap-4">
        <TutorSidebar
          isDarkMode={isDarkMode}
          onNewChat={() => {
            setMessages(initialMessages);
            setError(null);
          }}
        />

        <div className={`flex h-[75vh] w-full flex-col overflow-hidden rounded-2xl border ${containerClass}`}>
          <div className={`border-b px-4 py-3 ${isDarkMode ? "border-slate-700" : "border-indigo-100"}`}>
            <p className="text-sm font-semibold">Aprendizaje guiado estilo socratico</p>
            <p className={`text-xs ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
              No doy respuestas directas: construimos comprension por pasos.
            </p>
          </div>

          <div className={`flex-1 space-y-4 overflow-y-auto px-4 py-4 ${isDarkMode ? "bg-slate-900" : "bg-indigo-50/40"}`}>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} isDarkMode={isDarkMode} />
            ))}

            {isSending && (
              <div className="flex items-center gap-2 text-sm text-indigo-500">
                <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-500 [animation-delay:-0.2s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-500 [animation-delay:-0.1s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-500" />
                <span className="ml-1">La IA esta pensando...</span>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <InputBar onSend={handleSend} disabled={isSending} isDarkMode={isDarkMode} />
          {error && <p className="px-4 pb-3 text-xs text-red-500">{error}</p>}
        </div>
      </div>
    </section>
  );
}
