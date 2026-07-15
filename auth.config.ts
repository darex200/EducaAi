import type { NextAuthConfig } from "next-auth";
import { isDatabaseEnabled } from "@/lib/demo-mode";

const PUBLIC_PATHS = ["/", "/landing", "/login", "/register"];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

/**
 * Configuración compartida y compatible con edge (sin Prisma ni bcrypt).
 * El proveedor de credenciales se añade en `auth.ts`.
 */
export const authConfig = {
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      // Modo demo: sin base de datos activada no se exige sesión ni correo.
      if (!isDatabaseEnabled()) return true;

      const isLoggedIn = Boolean(auth?.user);
      const pathname = nextUrl.pathname;

      if (isPublicPath(pathname)) {
        if (isLoggedIn && (pathname.startsWith("/login") || pathname.startsWith("/register"))) {
          return Response.redirect(new URL("/tutor", nextUrl));
        }
        return true;
      }

      return isLoggedIn;
    },
    jwt({ token, user }) {
      if (user?.id) {
        token.sub = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      if (token.name && session.user) {
        session.user.name = String(token.name);
      }
      if (token.email && session.user) {
        session.user.email = String(token.email);
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
