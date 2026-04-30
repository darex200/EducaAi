"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

type InputBarProps = {
  onSend: (payload: { text: string; imageFile: File | null }) => Promise<void>;
  disabled: boolean;
  isDarkMode: boolean;
};

export function InputBar({ onSend, disabled, isDarkMode }: InputBarProps) {
  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`sticky bottom-0 mt-auto border-t p-3 ${
        isDarkMode ? "border-slate-700 bg-slate-900" : "border-indigo-100 bg-white"
      }`}
    >
      {imagePreviewUrl && (
        <div className="mb-2 flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 p-2">
          <Image
            src={imagePreviewUrl}
            alt="Vista previa"
            className="h-14 w-14 rounded-lg object-cover"
            width={56}
            height={56}
            unoptimized
          />
          <p className="text-xs text-slate-600">{imageFile?.name}</p>
          <button
            type="button"
            onClick={() => {
              setImageFile(null);
              if (fileInputRef.current) fileInputRef.current.value = "";
            }}
            className="ml-auto rounded-md px-2 py-1 text-xs text-red-600 hover:bg-red-50"
          >
            Quitar
          </button>
        </div>
      )}

      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(event) => setImageFile(event.target.files?.[0] ?? null)}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className={`rounded-xl border px-3 py-2 text-sm ${
            isDarkMode
              ? "border-slate-700 bg-slate-800 text-slate-200"
              : "border-indigo-200 bg-indigo-50 text-indigo-700"
          }`}
        >
          📎 Imagen
        </button>

        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Escribe tu pregunta o sube una imagen..."
          disabled={disabled}
          className={`w-full rounded-2xl border px-4 py-2.5 text-sm outline-none transition focus:ring-2 ${
            isDarkMode
              ? "border-slate-700 bg-slate-800 text-slate-100 ring-indigo-400"
              : "border-indigo-200 bg-white text-slate-700 ring-indigo-300"
          }`}
        />
        <button
          type="submit"
          disabled={disabled}
          className="gradient-accent rounded-2xl px-4 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
        >
          ➤
        </button>
      </div>
    </form>
  );
}
