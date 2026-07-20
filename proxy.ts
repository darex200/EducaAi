import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authConfig } from "@/auth.config";
import { cleanEnvValue } from "@/lib/auth/env";

const { auth } = NextAuth(authConfig);

function redirectToCanonicalDomain(request: NextRequest) {
  const canonicalRaw =
    cleanEnvValue(process.env.AUTH_URL) || cleanEnvValue(process.env.NEXT_PUBLIC_SITE_URL);
  if (!canonicalRaw) return null;

  let canonicalHost: string;
  try {
    canonicalHost = new URL(canonicalRaw).host;
  } catch {
    return null;
  }

  const currentHost = request.nextUrl.host;
  if (currentHost === canonicalHost) return null;
  if (!currentHost.endsWith(".vercel.app")) return null;

  // No redirigir el callback OAuth: perdería code/state/cookies de sesión
  // intermedias y provoca OAuthCallback / errores de conexión con Google.
  const pathname = request.nextUrl.pathname;
  if (pathname.startsWith("/api/auth/callback/")) {
    return null;
  }

  const redirectUrl = request.nextUrl.clone();
  redirectUrl.protocol = "https:";
  redirectUrl.host = canonicalHost;
  return NextResponse.redirect(redirectUrl);
}

export default auth((request) => {
  const redirect = redirectToCanonicalDomain(request);
  if (redirect) return redirect;
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
