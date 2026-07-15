import { cleanEnvValue } from "@/lib/auth/env";
import { isGoogleAuthConfigured } from "@/lib/auth/google-user";
import { isDatabaseEnabled } from "@/lib/demo-mode";

export function getAuthSecret() {
  return cleanEnvValue(process.env.AUTH_SECRET);
}

export function getAuthUrl() {
  const explicit = cleanEnvValue(process.env.AUTH_URL);
  if (explicit) return explicit;

  const vercel = cleanEnvValue(process.env.VERCEL_URL);
  if (vercel) return `https://${vercel}`;

  return "";
}

export function getAuthDiagnostics() {
  const authSecret = getAuthSecret();
  const authUrl = getAuthUrl();

  return {
    hasAuthSecret: Boolean(authSecret),
    hasAuthUrl: Boolean(authUrl),
    authUrl,
    googleConfigured: isGoogleAuthConfigured(),
    databaseEnabled: isDatabaseEnabled(),
    ready: Boolean(authSecret) && isGoogleAuthConfigured(),
  };
}
