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
          className={`cursor-pointer rounded-lg border px-3 py-2 text-sm ${
            disabled
              ? "cursor-not-allowed opacity-60"
              : "border-slate-300 bg-white text-slate-700"
          }`}
        >
          Adjuntar imagen
        </label>
      )}
      {showPreview && imagePreviewUrl && (
        <div className="mb-2 flex w-full items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2">
          <Image
            src={imagePreviewUrl}
            alt="Vista previa de imagen"
            className="h-12 w-12 rounded-lg object-cover"
            width={48}
            height={48}
            unoptimized
          />
          <p className="truncate text-xs text-slate-600">{imageFile?.name}</p>
          <button
            type="button"
            onClick={() => onFileChange(null)}
            className="ml-auto rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-600 hover:bg-slate-100"
          >
            Quitar
          </button>
        </div>
      )}
    </>
  );
}
