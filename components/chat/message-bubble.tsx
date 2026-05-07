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
    <div className={`flex gap-2 ${isUser ? "justify-end" : ""}`}>
      {!isUser && (
        <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${isDarkMode ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-700"}`}>
          IA
        </div>
      )}
      <div
        className={`max-w-[88%] rounded-xl px-3 py-2 text-[13px] leading-5 ${
          isUser
            ? "bg-gradient-to-r from-blue-700 to-blue-600 text-white"
            : isDarkMode
              ? "border border-slate-700 bg-slate-800 text-slate-100"
              : "border border-slate-200 bg-white text-slate-700"
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
        <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${isDarkMode ? "bg-slate-600 text-slate-100" : "bg-slate-200 text-slate-700"}`}>
          Tú
        </div>
      )}
    </div>
  );
}
