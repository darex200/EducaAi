"use client";

import { useState } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type GuidedPracticeProps = {
  topic: string;
};

export function GuidedPractice({ topic }: GuidedPracticeProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Trabajemos ${topic} paso a paso. Para comenzar, dime que parte quieres reforzar primero.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const send = async () => {
    if (!input.trim() || isLoading) return;
    const userMessage: Message = { role: "user", content: input.trim() };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: nextMessages,
        context: {
          topic,
          level: "intermedio",
          difficulty: "intermedio",
        },
      }),
    });
    const data = (await res.json()) as { reply?: string };
    setMessages((current) => [...current, { role: "assistant", content: data.reply ?? "Sigamos por partes, cual seria tu siguiente paso?" }]);
    setIsLoading(false);
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Modo practica guiada</p>
      <div className="mb-3 max-h-64 space-y-2 overflow-y-auto">
        {messages.map((message, idx) => (
          <div key={`${message.role}-${idx}`} className={`max-w-[92%] rounded-lg px-3 py-2 text-sm ${message.role === "user" ? "ml-auto bg-blue-600 text-white" : "bg-slate-100 text-slate-700"}`}>
            {message.content}
          </div>
        ))}
        {isLoading && <p className="text-xs text-slate-500">Generando guia...</p>}
      </div>
      <div className="flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={`Continuar practica sobre ${topic}...`} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <button onClick={send} className="btn-primary">
          Enviar
        </button>
      </div>
    </section>
  );
}
