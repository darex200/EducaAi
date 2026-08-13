/**
 * Modo demo por defecto. Solo activa BD/cuentas con email si APP_MODE=database
 * (servidor) y NEXT_PUBLIC_APP_MODE=database (cliente), además de DATABASE_URL.
 */
export function isDatabaseEnabled() {
  return (
    process.env.APP_MODE === "database" &&
    process.env.ENABLE_DATABASE === "true" &&
    Boolean(process.env.DATABASE_URL?.trim())
  );
}

export function isClientDatabaseEnabled() {
  if (process.env.NEXT_PUBLIC_APP_MODE !== "database") return false;
  if (process.env.NEXT_PUBLIC_ENABLE_DATABASE === "false") return false;
  return true;
}

export function isClientGoogleAuthEnabled() {
  return (
    process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === "true" ||
    process.env.NEXT_PUBLIC_APP_MODE === "database"
  );
}
