"use client";

import { useState } from "react";

type GuidedPracticeChatProps = {
  topic: string;
  level: string;
};

type Message = {
  role: "user" | "assistant";
  content: string;
};

export function GuidedPracticeChat({ topic, level }: GuidedPracticeChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Vamos a trabajar ${topic}. Para comenzar, ¿qué sabes sobre este tema?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const userMessage: Message = { role: "user", content: input.trim() };
    const next = [...messages, userMessage];
    setMessages(next);
    setInput("");
    setIsLoading(true);

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: next,
        context: {
          topic,
          level,
          difficulty: "intermedio",
        },
      }),
    });

    const data = (await response.json()) as { reply?: string };
    setMessages((current) => [
      ...current,
      { role: "assistant", content: data.reply ?? "Sigamos paso a paso. ¿Qué intentaste?" },
    ]);
    setIsLoading(false);
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 max-h-64 space-y-2 overflow-y-auto">
        {messages.map((m, idx) => (
          <div
            key={`${m.role}-${idx}`}
            className={`rounded-lg px-3 py-2 text-sm ${
              m.role === "user" ? "ml-auto max-w-[85%] bg-blue-600 text-white" : "max-w-[85%] bg-white text-slate-700"
            }`}
          >
            {m.content}
          </div>
        ))}
        {isLoading && <p className="text-xs text-slate-500">Generando guía...</p>}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          placeholder="Escribe tu respuesta"
        />
        <button onClick={sendMessage} className="btn-primary">
          Enviar
        </button>
      </div>
    </div>
  );
}
