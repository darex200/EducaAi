import "server-only";

import { detectFileKind, MAX_CHAT_IMAGE_BYTES } from "@/lib/security/upload-validation";

export function validateChatImageDataUrl(dataUrl: string) {
  const match = /^data:(image\/(?:jpeg|png|webp|gif));base64,([A-Za-z0-9+/=]+)$/i.exec(
    dataUrl,
  );
  if (!match) {
    return { ok: false as const, error: "Formato de imagen inválido." };
  }

  const base64 = match[2];
  const approxBytes = Math.floor((base64.length * 3) / 4);
  if (approxBytes > MAX_CHAT_IMAGE_BYTES) {
    return { ok: false as const, error: "La imagen supera el límite de 5 MB." };
  }

  try {
    const bytes = Buffer.from(base64.slice(0, 24), "base64");
    const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
    if (detectFileKind(buffer) !== "image") {
      return { ok: false as const, error: "El contenido no corresponde a una imagen válida." };
    }
  } catch {
    return { ok: false as const, error: "No se pudo validar la imagen adjunta." };
  }

  return { ok: true as const };
}
