"use client";

import Image from "next/image";
import {
  MAX_CHAT_IMAGE_BYTES,
  detectFileKind,
  validateChatImageFile,
} from "@/lib/security/upload-validation";

type ImageUploadProps = {
  imageFile: File | null;
  imagePreviewUrl: string | null;
  disabled: boolean;
  onFileChange: (file: File | null) => void;
  onValidationError?: (message: string | null) => void;
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
  onValidationError,
  inputId = "chat-image-upload",
  includeInput = true,
  showButton = true,
  showPreview = true,
  isDarkMode = false,
}: ImageUploadProps) {
  const btnClass = isDarkMode
    ? "theme-animate border-white/[0.1] bg-slate-800/60 text-slate-300 hover:border-indigo-400/25 hover:bg-slate-800"
    : "theme-animate border-slate-200 bg-slate-50 text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700";

  const handleFileSelect = async (file: File | null) => {
    if (!file) {
      onValidationError?.(null);
      onFileChange(null);
      return;
    }

    const basicValidation = validateChatImageFile(file);
    if (!basicValidation.ok) {
      onValidationError?.(basicValidation.error);
      onFileChange(null);
      return;
    }

    try {
      const buffer = await file.arrayBuffer();
      if (detectFileKind(buffer) !== "image") {
        onValidationError?.("El contenido del archivo no corresponde a una imagen válida.");
        onFileChange(null);
        return;
      }
    } catch {
      onValidationError?.("No se pudo validar la imagen seleccionada.");
      onFileChange(null);
      return;
    }

    onValidationError?.(null);
    onFileChange(file);
  };

  return (
    <>
      {includeInput && (
        <input
          id={inputId}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif"
          onChange={(event) => void handleFileSelect(event.target.files?.[0] ?? null)}
          className="hidden"
          disabled={disabled}
        />
      )}
      {showButton && (
        <label
          htmlFor={inputId}
          className={`btn-hover-lift flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border ${
            isDarkMode ? "btn-hover-lift-dark" : "btn-hover-lift-light"
          } ${disabled ? "cursor-not-allowed opacity-50" : btnClass}`}
          title={`Adjuntar imagen (máx. ${Math.round(MAX_CHAT_IMAGE_BYTES / (1024 * 1024))} MB)`}
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="m21 15-5-5L5 21" />
          </svg>
        </label>
      )}
      {showPreview && imagePreviewUrl && (
        <div
          className={`flex w-full items-center gap-3 rounded-xl border p-2.5 ${
            isDarkMode ? "border-slate-700 bg-slate-800/80" : "border-slate-200 bg-slate-50"
          }`}
        >
          <Image
            src={imagePreviewUrl}
            alt="Vista previa"
            className="h-14 w-14 rounded-lg object-cover ring-1 ring-black/5"
            width={56}
            height={56}
            unoptimized
          />
          <p className={`min-w-0 flex-1 truncate text-xs ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
            {imageFile?.name}
          </p>
          <button
            type="button"
            onClick={() => onFileChange(null)}
            className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-medium transition ${
              isDarkMode
                ? "text-slate-400 hover:bg-slate-700 hover:text-slate-200"
                : "text-slate-500 hover:bg-slate-200"
            }`}
          >
            Quitar
          </button>
        </div>
      )}
    </>
  );
}
