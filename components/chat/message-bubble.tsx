"use client";

import Image from "next/image";
import type { TutorMessage } from "@/components/ai-tutor/types";
import { AIResponseFormatter } from "@/components/chat/ai-response-formatter";

type MessageBubbleProps = {
  message: TutorMessage;
  isDarkMode: boolean;
};

export function MessageBubble({ message, isDarkMode }: MessageBubbleProps) {
  const isUser = message.role === "user";

  const assistantBubble = isDarkMode
    ? "border border-slate-700/90 bg-slate-800/90 text-slate-100 shadow-sm"
    : "border border-slate-200/80 bg-white text-slate-700 shadow-[0_2px_12px_rgba(15,23,42,0.04)]";

  const userBubble =
    "bg-gradient-to-br from-blue-600 via-blue-600 to-indigo-600 text-white shadow-[0_4px_16px_rgba(37,99,235,0.28)]";

  const avatarAssistant = isDarkMode
    ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white ring-2 ring-slate-800"
    : "bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 ring-2 ring-white";

  const avatarUser = isDarkMode
    ? "bg-slate-700 text-slate-200 ring-2 ring-slate-800"
    : "bg-slate-200 text-slate-700 ring-2 ring-white";

  return (
    <div className={`flex gap-2.5 ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
          isUser ? avatarUser : avatarAssistant
        }`}
      >
        {isUser ? "Tú" : "IA"}
      </div>
      <div
        className={`max-w-[min(88%,42rem)] rounded-2xl px-3.5 py-2.5 text-[13px] leading-[1.55] ${
          isUser ? userBubble : assistantBubble
        }`}
      >
        {message.imageDataUrl && (
          <Image
            src={message.imageDataUrl}
            alt="Imagen enviada"
            className="mb-2 max-h-56 w-full rounded-xl object-contain ring-1 ring-white/20"
            width={640}
            height={360}
            unoptimized
          />
        )}
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="chat-prose">
            <AIResponseFormatter content={message.content} />
          </div>
        )}
      </div>
    </div>
  );
}
