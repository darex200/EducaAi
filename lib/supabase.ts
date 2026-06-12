import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null | undefined;

const DOCUMENTS_BUCKET = "documents";

function getSupabase(): SupabaseClient | null {
  if (client !== undefined) return client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  client = url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;
  return client;
}

/**
 * Sube un documento a Supabase Storage. Devuelve la URL pública o null si
 * el storage no está configurado o falla (el análisis continúa igualmente).
 */
export async function uploadDocument(
  userId: string,
  fileName: string,
  buffer: ArrayBuffer,
  contentType: string,
): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80);
  const path = `${userId}/${Date.now()}-${safeName}`;

  try {
    const { error } = await supabase.storage
      .from(DOCUMENTS_BUCKET)
      .upload(path, buffer, { contentType, upsert: false });
    if (error) {
      console.error("[supabase] error al subir:", error.message);
      return null;
    }
    const { data } = supabase.storage.from(DOCUMENTS_BUCKET).getPublicUrl(path);
    return data.publicUrl ?? null;
  } catch (error) {
    console.error("[supabase] fallo el upload:", error);
    return null;
  }
}
