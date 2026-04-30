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
      className={`sticky bottom-0 mt-auto border-t px-4 py-2.5 ${
        isDarkMode ? "border-slate-700/80 bg-slate-900/95 backdrop-blur" : "border-slate-200 bg-white/95 backdrop-blur"
      }`}
    >
      <p className={`mb-2 text-xs font-medium ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>
        Escribe tu pregunta
      </p>
      {imagePreviewUrl && (
        <div className="mb-2 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2">
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
            className="ml-auto rounded-md px-2 py-1 text-xs text-slate-600 hover:bg-slate-200"
          >
            Quitar
          </button>
        </div>
      )}

      <div
        className={`flex items-center gap-2 rounded-xl border p-1.5 ${
          isDarkMode ? "border-slate-600 bg-slate-900" : "border-blue-200 bg-blue-50/40"
        }`}
      >
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
          className={`rounded-lg border px-3 py-1.5 text-sm transition-colors duration-200 ${
            isDarkMode
              ? "border-slate-600 bg-slate-800 text-slate-200 hover:bg-slate-700"
              : "border-slate-300 bg-white text-slate-700"
          }`}
        >
          Adjuntar
        </button>

        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Escribe tu pregunta o sube una imagen..."
          disabled={disabled}
          className={`w-full rounded-lg border px-4 py-2 text-sm outline-none transition-all duration-200 focus:ring-2 ${
            isDarkMode
              ? "border-slate-600 bg-slate-800 text-slate-100 ring-blue-400"
              : "border-slate-300 bg-white text-slate-700 ring-blue-200"
          }`}
        />
        <button
          type="submit"
          disabled={disabled}
          className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-700 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:from-blue-800 hover:to-blue-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
        >
          Enviar
        </button>
      </div>
    </form>
  );
}
