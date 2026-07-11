"use client";

import { useEffect, useMemo, useState } from "react";
import { ImageUpload } from "@/components/chat/image-upload";

type ChatInputProps = {
  onSend: (payload: { text: string; imageFile: File | null }) => Promise<void>;
  disabled: boolean;
  isDarkMode: boolean;
};

export function ChatInput({ onSend, disabled, isDarkMode }: ChatInputProps) {
  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const imagePreviewUrl = useMemo(() => {
    if (!imageFile) return null;
    return URL.createObjectURL(imageFile);
  }, [imageFile]);

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    };
  }, [imagePreviewUrl]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (disabled || (!text.trim() && !imageFile)) return;
    await onSend({ text: text.trim(), imageFile });
    setText("");
    setImageFile(null);
  };

  const bar = isDarkMode
    ? "theme-animate dark-input-bar"
    : "theme-animate border-slate-100/90 bg-white/90";

  const composer = isDarkMode
    ? "chat-composer-dark theme-animate focus-within:ring-blue-500/20"
    : "theme-animate border-slate-200/90 bg-white shadow-[0_4px_24px_rgba(15,23,42,0.06)] focus-within:ring-blue-500/25";

  return (
    <form onSubmit={handleSubmit} className={`border-t px-4 pb-4 pt-3 backdrop-blur-md sm:px-6 ${bar}`}>
      {imagePreviewUrl && (
        <div className="mb-3">
          <ImageUpload
            imageFile={imageFile}
            imagePreviewUrl={imagePreviewUrl}
            disabled={disabled}
            onFileChange={setImageFile}
            inputId="chat-image-upload-main"
            includeInput={false}
            showButton={false}
            showPreview
            isDarkMode={isDarkMode}
          />
        </div>
      )}
      <div className={`theme-animate flex items-end gap-2 rounded-2xl border p-2 transition-shadow focus-within:ring-2 ${composer}`}>
        <ImageUpload
          imageFile={imageFile}
          imagePreviewUrl={null}
          disabled={disabled}
          onFileChange={setImageFile}
          inputId="chat-image-upload-main"
          includeInput
          showButton
          showPreview={false}
          isDarkMode={isDarkMode}
        />
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              event.currentTarget.form?.requestSubmit();
            }
          }}
          rows={1}
          placeholder="Pregunta lo que quieras, pide una ilustración (ej. «genera un diagrama de…») o adjunta una imagen…"
          disabled={disabled}
          className={`theme-animate max-h-32 min-h-[44px] flex-1 resize-none rounded-xl border-0 bg-transparent px-2 py-2.5 text-sm outline-none placeholder:opacity-60 ${
            isDarkMode ? "text-[var(--dark-text)] placeholder:text-[var(--dark-text-muted)]" : "text-slate-800 placeholder:text-slate-400"
          }`}
        />
        <button
          type="submit"
          disabled={disabled || (!text.trim() && !imageFile)}
          className="btn-hover-primary relative mb-0.5 flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 text-white shadow-md shadow-blue-600/35 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Enviar mensaje"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
        </button>
      </div>
      <p className={`theme-animate mt-2 text-center text-[10px] ${isDarkMode ? "text-[var(--dark-text-muted)]" : "text-slate-400"}`}>
        Enter para enviar · Shift+Enter para nueva línea
      </p>
    </form>
  );
}
