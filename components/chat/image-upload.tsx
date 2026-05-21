"use client";

import Image from "next/image";

type ImageUploadProps = {
  imageFile: File | null;
  imagePreviewUrl: string | null;
  disabled: boolean;
  onFileChange: (file: File | null) => void;
  inputId?: string;
  includeInput?: boolean;
  showButton?: boolean;
  showPreview?: boolean;
  isDarkMode?: boolean;
};

export function ImageUpload({
  imageFile,
  imagePreviewUrl,
  disabled,
  onFileChange,
  inputId = "chat-image-upload",
  includeInput = true,
  showButton = true,
  showPreview = true,
  isDarkMode = false,
}: ImageUploadProps) {
  return (
    <>
      {includeInput && (
        <input
          id={inputId}
          type="file"
          accept="image/*"
          onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
          className="hidden"
          disabled={disabled}
        />
      )}
      {showButton && (
        <label
          htmlFor={inputId}
          className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border text-sm transition ${
            disabled
              ? "cursor-not-allowed opacity-60"
              : isDarkMode
                ? "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
          }`}
          aria-label="Adjuntar imagen"
        >
          +
        </label>
      )}
      {showPreview && imagePreviewUrl && (
        <div className={`mb-2 flex w-full items-center gap-2 rounded-2xl border p-2 ${
          isDarkMode ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"
        }`}>
          <Image
            src={imagePreviewUrl}
            alt="Vista previa de imagen"
            className="h-12 w-12 rounded-lg object-cover"
            width={48}
            height={48}
            unoptimized
          />
          <p className={`truncate text-xs ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>{imageFile?.name}</p>
          <button
            type="button"
            onClick={() => onFileChange(null)}
            className={`ml-auto rounded-md border px-2 py-1 text-xs transition ${
              isDarkMode ? "border-white/10 text-slate-300 hover:bg-white/10" : "border-slate-200 text-slate-600 hover:bg-slate-100"
            }`}
          >
            Quitar
          </button>
        </div>
      )}
    </>
  );
}
