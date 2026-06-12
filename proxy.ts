import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Protección de rutas: usa la config edge-safe (sin Prisma/bcrypt).
// La lógica de acceso vive en el callback `authorized` de auth.config.ts.
export default NextAuth(authConfig).auth;

export const config = {
  // Protege todo excepto API, estáticos e imágenes.
  matcher: ["/((?!api|_next/static|_next/image|favicon\\.ico|.*\\..*).*)"],
};
