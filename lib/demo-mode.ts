/** Activa persistencia en Supabase solo cuando ENABLE_DATABASE=true y hay DATABASE_URL. */
export function isDatabaseEnabled() {
  return process.env.ENABLE_DATABASE === "true" && Boolean(process.env.DATABASE_URL?.trim());
}

/** Flag espejo para el cliente (debe coincidir con ENABLE_DATABASE en el servidor). */
export function isClientDatabaseEnabled() {
  return process.env.NEXT_PUBLIC_ENABLE_DATABASE === "true";
}
