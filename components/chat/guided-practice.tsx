"use client";

import { useMemo, useState } from "react";
import type { AppLocale } from "@/lib/i18n/translations";
import { t as translate } from "@/lib/i18n/translations";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type GuidedPracticeProps = {
  topic: string;
  isDarkMode?: boolean;
  locale?: AppLocale;
};

export function GuidedPractice({ topic, isDarkMode = false, locale = "en" }: GuidedPracticeProps) {
  const initialMessage = useMemo(
    () => translate(locale, "guidedPracticeStart", { topic }),
    [locale, topic],
  );
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: initialMessage,
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
          locale,
        },
      }),
    });
    const data = (await res.json()) as { reply?: string };
    setMessages((current) => [
      ...current,
      { role: "assistant", content: data.reply ?? translate(locale, "guidedPracticeFallback") },
    ]);
    setIsLoading(false);
  };

  const shell = isDarkMode
    ? "border-slate-700/80 bg-slate-800/60"
    : "border-slate-200/80 bg-white shadow-sm";

  return (
    <section className={`rounded-2xl border p-4 ${shell}`}>
      <p className={`mb-3 text-[10px] font-semibold uppercase tracking-widest ${isDarkMode ? "text-slate-500" : "text-slate-500"}`}>
        {translate(locale, "guidedPractice")}
      </p>
      <div className="chat-scroll mb-3 max-h-64 space-y-2 overflow-y-auto">
        {messages.map((message, idx) => (
          <div
            key={`${message.role}-${idx}`}
            className={`max-w-[92%] rounded-xl px-3 py-2 text-sm ${
              message.role === "user"
                ? "ml-auto bg-gradient-to-br from-blue-600 to-indigo-600 text-white"
                : isDarkMode
                  ? "bg-slate-900/80 text-slate-300"
                  : "bg-slate-100 text-slate-700"
            }`}
          >
            {message.content}
          </div>
        ))}
        {isLoading && (
          <p className={`text-xs ${isDarkMode ? "text-slate-500" : "text-slate-500"}`}>
            {translate(locale, "guidedPracticeGenerating")}
          </p>
        )}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder={translate(locale, "guidedPracticeContinuePlaceholder", { topic })}
          className={`w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/30 ${
            isDarkMode
              ? "border-slate-600 bg-slate-900 text-slate-100 placeholder:text-slate-600"
              : "border-slate-200 bg-white text-slate-700"
          }`}
        />
        <button type="button" onClick={send} className="btn-primary shrink-0 px-4">
          {translate(locale, "sendMessage")}
        </button>
      </div>
    </section>
  );
}
