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

  return (
    <form
      onSubmit={handleSubmit}
      className={`sticky bottom-0 border-t px-4 pb-4 pt-3 backdrop-blur ${
        isDarkMode ? "border-slate-700 bg-slate-900/95" : "border-blue-100 bg-white/95"
      }`}
    >
      {imagePreviewUrl && (
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
      )}
      <div className={`flex items-center gap-2 rounded-xl border px-2 py-2 shadow-sm ${isDarkMode ? "border-slate-600 bg-slate-800" : "border-blue-200 bg-blue-50/40"}`}>
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
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Pregunta con claridad, sube una imagen o continúa tu conversación..."
          disabled={disabled}
          className={`w-full rounded-lg border px-4 py-2 text-sm outline-none focus:ring-2 ${isDarkMode ? "border-slate-600 bg-slate-900 text-slate-100 ring-blue-400" : "border-slate-300 bg-white text-slate-700 ring-blue-200"}`}
        />
        <button type="submit" disabled={disabled} className="rounded-lg bg-gradient-to-r from-blue-700 to-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
          Enviar
        </button>
      </div>
    </form>
  );
}
