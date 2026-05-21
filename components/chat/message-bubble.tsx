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

  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-[11px] font-semibold text-white">
          IA
        </div>
      )}
      <div
        className={`max-w-[78%] px-4 py-3 text-sm leading-6 shadow-sm sm:max-w-[70%] ${
          isUser
            ? isDarkMode
              ? "rounded-3xl bg-slate-800 text-slate-100"
              : "rounded-3xl bg-slate-100 text-slate-900"
            : isDarkMode
              ? "rounded-3xl rounded-tl-md border border-white/10 bg-white/5 text-slate-100"
              : "rounded-3xl rounded-tl-md border border-slate-200 bg-white text-slate-800"
        }`}
      >
        {message.imageDataUrl && (
          <Image src={message.imageDataUrl} alt="Imagen enviada por estudiante" className="mb-2 max-h-56 w-full rounded-lg object-contain" width={640} height={360} unoptimized />
        )}
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <AIResponseFormatter content={message.content} />
        )}
      </div>
      {isUser && (
        <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${isDarkMode ? "bg-slate-700 text-slate-100" : "bg-slate-200 text-slate-700"}`}>
          Tú
        </div>
      )}
    </div>
  );
}
