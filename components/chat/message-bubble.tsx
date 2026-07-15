"use client";

import Image from "next/image";
import type { TutorMessage } from "@/components/ai-tutor/types";
import { AIResponseFormatter } from "@/components/chat/ai-response-formatter";
import { useLanguage } from "@/context/language-context";

type MessageBubbleProps = {
  message: TutorMessage;
  isDarkMode: boolean;
};

export function MessageBubble({ message, isDarkMode }: MessageBubbleProps) {
  const { t } = useLanguage();
  const isUser = message.role === "user";

  const assistantBubble = isDarkMode
    ? "chat-bubble-assistant-dark theme-animate shadow-sm"
    : "theme-animate border border-slate-200/80 bg-white text-slate-700 shadow-[0_2px_12px_rgba(15,23,42,0.04)]";

  const userBubble = isDarkMode
    ? "chat-bubble-user-dark theme-animate text-white"
    : "theme-animate bg-gradient-to-br from-blue-600 via-blue-600 to-indigo-600 text-white shadow-[0_4px_16px_rgba(37,99,235,0.28)]";

  const avatarAssistant = isDarkMode
    ? "theme-animate bg-gradient-to-br from-blue-600 to-indigo-600 text-white ring-2 ring-[rgba(8,14,28,0.9)] shadow-[0_0_12px_rgba(59,130,246,0.25)]"
    : "theme-animate bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 ring-2 ring-white";

  const avatarUser = isDarkMode
    ? "theme-animate bg-[rgba(30,58,138,0.55)] text-blue-100 ring-2 ring-[rgba(8,14,28,0.9)]"
    : "theme-animate bg-slate-200 text-slate-700 ring-2 ring-white";

  return (
    <div className={`flex gap-2.5 ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
          isUser ? avatarUser : avatarAssistant
        }`}
      >
        {isUser ? t("userAvatar") : t("assistantAvatar")}
      </div>
      <div
        className={`max-w-[min(96%,56rem)] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser ? userBubble : assistantBubble
        }`}
      >
        {message.imageDataUrl && (
          <Image
            src={message.imageDataUrl}
            alt={isUser ? t("imageSent") : t("imageGenerated")}
            className="mb-2 max-h-80 w-full rounded-xl object-contain ring-1 ring-white/20"
            width={640}
            height={480}
            unoptimized
          />
        )}
        {!message.imageDataUrl && message.generatedImageUrl && (
          <Image
            src={message.generatedImageUrl}
            alt={t("imageGenerated")}
            className="mb-2 max-h-80 w-full rounded-xl object-contain ring-1 ring-blue-400/20"
            width={1024}
            height={1024}
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
