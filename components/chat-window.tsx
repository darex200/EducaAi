"use client";

import { useState } from "react";
import { LoadingSpinner } from "@/components/loading-spinner";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const initialMessages: ChatMessage[] = [
  {
    role: "assistant",
    content:
      "Hi! I am your Educa AI tutor. I provide general learning guidance, ask questions, and help you think step by step without giving direct final answers.",
  },
];

export function ChatWindow() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!input.trim() || isSending) return;

    const userMessage: ChatMessage = { role: "user", content: input.trim() };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setIsSending(true);
    setError(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const data = (await response.json()) as { reply?: string };
      const reply =
        data.reply ??
        "I could not generate a response this time. Please try your question again.";
      setMessages((current) => [...current, { role: "assistant", content: reply }]);
    } catch {
      setError("Message failed to send. Check your connection and try again.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section className="card-surface flex h-[72vh] flex-col overflow-hidden">
      <div className="border-b bg-gradient-to-r from-indigo-100/70 via-white to-violet-100/70 px-4 py-3">
        <p className="text-sm font-medium text-indigo-800">Student Support Mode</p>
        <p className="text-xs text-slate-600">
          General explanations only. You do the thinking, and I guide each step.
        </p>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto bg-indigo-50/40 p-4">
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm transition ${
              message.role === "user"
                ? "ml-auto bg-indigo-600 text-white"
                : "bg-white text-slate-700"
            }`}
          >
            {message.content}
          </div>
        ))}
        {isSending && <LoadingSpinner label="Tutor is thinking..." />}
      </div>

      <form onSubmit={handleSend} className="flex gap-2 border-t bg-white p-3">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask for guidance (example: help me understand this topic step by step)"
          className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none ring-indigo-300 transition focus:ring-2"
        />
        <button
          type="submit"
          disabled={isSending}
          className="gradient-accent rounded-xl px-4 py-2 text-sm font-medium transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
        >
          Send
        </button>
      </form>
      {error && <p className="px-3 pb-3 text-xs text-red-600">{error}</p>}
    </section>
  );
}
