"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { InputBar } from "@/components/ai-tutor/input-bar";
import { ChatHeader } from "@/components/ai-tutor/chat-header";
import { MessageBubble } from "@/components/ai-tutor/message-bubble";
import { TutorSidebar } from "@/components/ai-tutor/tutor-sidebar";
import { TopicSelector } from "@/components/onboarding/topic-selector";
import { useLearning } from "@/context/learning-context";
import type { TutorMessage } from "@/components/ai-tutor/types";

const CHAT_STORAGE_KEY = "educa-ai-chat-state";

function getWelcomeMessage(topic?: string) {
  const starters = [
    "¿Qué parte te gustaría entender primero?",
    "¿Quieres empezar por teoría o por ejercicios?",
    "¿Cuál es el punto que más te está costando?",
  ];
  const randomStarter = starters[Math.floor(Math.random() * starters.length)];

  return {
    id: "assistant-welcome",
    role: "assistant" as const,
    content: topic
      ? `Hola. Veo que estás estudiando ${topic}. Para empezar, ${randomStarter}`
      : "Hola. Soy tu tutor IA. ¿Qué tema te gustaría trabajar hoy?",
  };
}

function toDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function ChatContainer() {
  const router = useRouter();
  const { profile } = useLearning();
  const [messages, setMessages] = useState<TutorMessage[]>(() => {
    if (typeof window === "undefined") return [getWelcomeMessage(profile.topic)];
    const stored = localStorage.getItem(CHAT_STORAGE_KEY);
    if (!stored) return [getWelcomeMessage(profile.topic)];
    try {
      const parsed = JSON.parse(stored) as {
        topic?: string;
        messages?: TutorMessage[];
      };
      if (parsed.topic !== (profile.topic || "")) return [getWelcomeMessage(profile.topic)];
      return parsed.messages?.length ? parsed.messages : [getWelcomeMessage(profile.topic)];
    } catch {
      return [getWelcomeMessage(profile.topic)];
    }
  });
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("educa-ai-dark-mode") === "1";
  });
  const [showTopicSelector, setShowTopicSelector] = useState(false);
  const [conversationId, setConversationId] = useState(() => {
    if (typeof window === "undefined") return `conv-${Date.now()}`;
    return localStorage.getItem("educa-ai-conversation-id") || `conv-${Date.now()}`;
  });
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify({ topic: profile.topic || "", messages }));
  }, [messages, profile.topic]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("educa-ai-dark-mode", isDarkMode ? "1" : "0");
  }, [isDarkMode]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("educa-ai-conversation-id", conversationId);
  }, [conversationId]);

  const containerClass = useMemo(
    () =>
      isDarkMode
        ? "border-slate-700/80 bg-slate-950 text-slate-100 shadow-xl shadow-slate-950/30"
        : "border-slate-200 bg-white text-slate-900 shadow-lg shadow-slate-200/50",
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
          context: {
            subjects: profile.subjects,
            level: profile.level,
            topic: profile.topic,
            difficulty: profile.difficulty,
            conversationId,
          },
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
    <section className="mx-auto w-full max-w-[1600px]">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Tutor IA</h2>
        <button
          onClick={() => setIsDarkMode((v) => !v)}
          className={`rounded-lg border px-3 py-1.5 text-xs transition-colors duration-300 ${
            isDarkMode
              ? "border-slate-600 bg-slate-800 text-slate-200 hover:bg-slate-700"
              : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
          }`}
        >
          {isDarkMode ? "Modo claro" : "Modo oscuro"}
        </button>
      </div>

      <div className="flex gap-4">
        <TutorSidebar
          isDarkMode={isDarkMode}
          onNewChat={() => {
            if (!profile.topic) {
              router.push("/onboarding");
              return;
            }
            setMessages([getWelcomeMessage(profile.topic)]);
            setConversationId(`conv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);
            setError(null);
          }}
        />

        <div
          className={`flex h-[86vh] w-full flex-col overflow-hidden rounded-2xl border transition-colors duration-300 ${containerClass}`}
        >
          <ChatHeader
            title="Asistente de aprendizaje guiado"
            subtitle={`Tema: ${profile.topic || "No seleccionado"} · Nivel: ${profile.level || "No definido"} · Dificultad: ${profile.difficulty}`}
            isDarkMode={isDarkMode}
            onChooseTopic={() => setShowTopicSelector((v) => !v)}
          />
          {showTopicSelector && (
            <div className={`px-4 pt-3 ${isDarkMode ? "bg-slate-900" : "bg-slate-50"}`}>
              <TopicSelector
                onApply={(topic) => {
                  setShowTopicSelector(false);
                  setMessages([getWelcomeMessage(topic)]);
                  setConversationId(`conv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);
                }}
              />
            </div>
          )}

          <div
            className={`flex-1 space-y-2 overflow-y-auto px-4 py-4 transition-colors duration-300 ${
              isDarkMode ? "bg-gradient-to-b from-slate-900 to-slate-950" : "bg-blue-50/35"
            }`}
          >
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} isDarkMode={isDarkMode} />
            ))}

            {isSending && (
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-slate-400" />
                <span>Generando respuesta...</span>
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
