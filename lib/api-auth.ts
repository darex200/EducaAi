import { auth } from "@/auth";
import { isDatabaseEnabled } from "@/lib/demo-mode";

/** Sin base de datos activada la app corre en modo demo (localStorage, sin cuentas). */
export function isDbConfigured() {
  return isDatabaseEnabled();
}

/** Id del usuario autenticado, o null (sin sesión o modo demo). */
export async function getAuthUserId(): Promise<string | null> {
  if (!isDbConfigured()) return null;
  try {
    const session = await auth();
    return session?.user?.id ?? null;
  } catch {
    return null;
  }
}
