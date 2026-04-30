"use client";

import Image from "next/image";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import type { TutorMessage } from "@/components/ai-tutor/types";

type MessageBubbleProps = {
  message: TutorMessage;
  isDarkMode: boolean;
};

export function MessageBubble({ message, isDarkMode }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const avatarLabel = isUser ? "Tú" : "IA";

  return (
    <div className={`flex gap-2 transition-all duration-200 ${isUser ? "justify-end" : ""}`}>
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
        className={`max-w-[86%] rounded-xl px-3.5 py-2.5 text-[14px] leading-6 shadow-sm transition-colors duration-200 ${
          isUser
            ? "bg-gradient-to-r from-blue-700 to-blue-600 text-white"
            : isDarkMode
              ? "border border-slate-700/70 bg-slate-800/90 text-slate-100 shadow-slate-900/30"
              : "border border-slate-200 bg-white text-slate-700"
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
        <div className="prose prose-sm max-w-none whitespace-pre-wrap dark:prose-invert">
          <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
            {message.content}
          </ReactMarkdown>
        </div>
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
