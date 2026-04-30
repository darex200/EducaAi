"use client";

import Image from "next/image";
import type { TutorMessage } from "@/components/ai-tutor/types";

type MessageBubbleProps = {
  message: TutorMessage;
  isDarkMode: boolean;
};

export function MessageBubble({ message, isDarkMode }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const avatarLabel = isUser ? "Tú" : "IA";

  return (
    <div className={`flex gap-3 transition-opacity duration-300 ${isUser ? "justify-end" : ""}`}>
      {!isUser && (
        <div
          className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
            isDarkMode ? "bg-indigo-500 text-white" : "bg-indigo-100 text-indigo-700"
          }`}
        >
          {avatarLabel}
        </div>
      )}

      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
          isUser
            ? "rounded-br-md bg-indigo-600 text-white"
            : isDarkMode
              ? "rounded-bl-md border border-slate-700 bg-slate-800 text-slate-100"
              : "rounded-bl-md border border-indigo-100 bg-white text-slate-700"
        }`}
      >
        {message.imageDataUrl && (
          <Image
            src={message.imageDataUrl}
            alt="Imagen enviada por estudiante"
            className="mb-3 max-h-64 w-full rounded-xl object-contain"
            width={640}
            height={360}
            unoptimized
          />
        )}
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>

      {isUser && (
        <div
          className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
            isDarkMode ? "bg-slate-600 text-slate-100" : "bg-slate-200 text-slate-700"
          }`}
        >
          {avatarLabel}
        </div>
      )}
    </div>
  );
}
