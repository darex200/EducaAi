export const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;
export const MAX_CHAT_IMAGE_BYTES = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const ALLOWED_IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);
const ALLOWED_PDF_EXTENSIONS = new Set([".pdf"]);

function getExtension(fileName: string) {
  const dot = fileName.lastIndexOf(".");
  return dot >= 0 ? fileName.slice(dot).toLowerCase() : "";
}

function readMagicBytes(buffer: ArrayBuffer, length = 12) {
  return new Uint8Array(buffer.slice(0, length));
}

export function sanitizeFileName(fileName: string) {
  const base = fileName.split(/[/\\]/).pop() ?? "file";
  const cleaned = base.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
  return cleaned || "file";
}

export function detectFileKind(buffer: ArrayBuffer): "image" | "pdf" | null {
  const bytes = readMagicBytes(buffer);

  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image";
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return "image";
  }
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) return "image";
  if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "image";
  }
  if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
    return "pdf";
  }

  return null;
}

function resolveImageContentType(extension: string, declaredType: string) {
  if (ALLOWED_IMAGE_TYPES.has(declaredType)) return declaredType;
  if (extension === ".png") return "image/png";
  if (extension === ".webp") return "image/webp";
  if (extension === ".gif") return "image/gif";
  return "image/jpeg";
}

export type UploadValidationResult =
  | { ok: true; kind: "image" | "pdf"; contentType: string; safeName: string }
  | { ok: false; error: string };

export function validateDocumentUpload(file: File, buffer: ArrayBuffer): UploadValidationResult {
  if (file.size === 0) {
    return { ok: false, error: "El archivo está vacío." };
  }
  if (file.size > MAX_DOCUMENT_BYTES) {
    return { ok: false, error: "El archivo supera el límite de 10 MB." };
  }

  const extension = getExtension(file.name);
  const kind = detectFileKind(buffer);
  if (!kind) {
    return {
      ok: false,
      error: "El contenido del archivo no coincide con un PDF o imagen válida.",
    };
  }

  if (kind === "image") {
    if (!ALLOWED_IMAGE_EXTENSIONS.has(extension)) {
      return { ok: false, error: "Extensión de imagen no permitida." };
    }
    const declaredType = file.type || "application/octet-stream";
    if (
      declaredType !== "application/octet-stream" &&
      !ALLOWED_IMAGE_TYPES.has(declaredType)
    ) {
      return { ok: false, error: "Tipo MIME de imagen no permitido." };
    }

    return {
      ok: true,
      kind: "image",
      contentType: resolveImageContentType(extension, declaredType),
      safeName: sanitizeFileName(file.name),
    };
  }

  if (!ALLOWED_PDF_EXTENSIONS.has(extension)) {
    return { ok: false, error: "Extensión de PDF no permitida." };
  }

  const declaredType = file.type || "application/octet-stream";
  if (
    declaredType !== "application/octet-stream" &&
    declaredType !== "application/pdf"
  ) {
    return { ok: false, error: "Tipo MIME de PDF no permitido." };
  }

  return {
    ok: true,
    kind: "pdf",
    contentType: "application/pdf",
    safeName: sanitizeFileName(file.name),
  };
}

export function validateChatImageFile(file: File): UploadValidationResult {
  if (file.size === 0) {
    return { ok: false, error: "La imagen está vacía." };
  }
  if (file.size > MAX_CHAT_IMAGE_BYTES) {
    return { ok: false, error: "La imagen supera el límite de 5 MB." };
  }

  const extension = getExtension(file.name);
  if (!ALLOWED_IMAGE_EXTENSIONS.has(extension)) {
    return { ok: false, error: "Extensión de imagen no permitida." };
  }

  const declaredType = file.type || "application/octet-stream";
  if (
    declaredType !== "application/octet-stream" &&
    !ALLOWED_IMAGE_TYPES.has(declaredType)
  ) {
    return { ok: false, error: "Tipo MIME de imagen no permitido." };
  }

  return {
    ok: true,
    kind: "image",
    contentType: resolveImageContentType(extension, declaredType),
    safeName: sanitizeFileName(file.name),
  };
}
