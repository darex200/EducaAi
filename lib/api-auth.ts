import { auth } from "@/auth";

/** Sin DATABASE_URL la app corre en modo demo (sin persistencia ni cuentas). */
export function isDbConfigured() {
  return Boolean(process.env.DATABASE_URL);
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
