"use client";

import { useSearchParams } from "next/navigation";
import { useLanguage } from "@/context/language-context";

function authErrorMessage(code: string, locale: "en" | "es" | "pt") {
  const messages: Record<string, Record<"en" | "es" | "pt", string>> = {
    Configuration: {
      en: "Google sign-in is not configured on the server. Check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in Vercel.",
      es: "El inicio con Google no está configurado en el servidor. Revisa GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET en Vercel.",
      pt: "O login com Google não está configurado no servidor. Verifique GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET na Vercel.",
    },
    AccessDenied: {
      en: "Access denied. If the OAuth app is in testing mode, add your Gmail as a test user in Google Cloud.",
      es: "Acceso denegado. Si la app OAuth está en modo prueba, agrega tu Gmail como usuario de prueba en Google Cloud.",
      pt: "Acesso negado. Se o app OAuth estiver em modo de teste, adicione seu Gmail como usuário de teste no Google Cloud.",
    },
    OAuthAccountNotLinked: {
      en: "This email is already registered with a password. Sign in with email or use the same Google account.",
      es: "Este correo ya está registrado con contraseña. Inicia con correo o usa la misma cuenta de Google.",
      pt: "Este e-mail já está registrado com senha. Entre com e-mail ou use a mesma conta Google.",
    },
    OAuthSignin: {
      en: "Could not start Google sign-in. Check the redirect URI in Google Cloud Console.",
      es: "No se pudo iniciar el inicio con Google. Revisa la redirect URI en Google Cloud Console.",
      pt: "Não foi possível iniciar o login com Google. Verifique a redirect URI no Google Cloud Console.",
    },
    OAuthCallback: {
      en: "Google callback failed. Verify AUTH_URL and the redirect URI match your Vercel domain.",
      es: "Falló el callback de Google. Verifica que AUTH_URL y la redirect URI coincidan con tu dominio de Vercel.",
      pt: "Falha no callback do Google. Verifique se AUTH_URL e a redirect URI correspondem ao seu domínio na Vercel.",
    },
    Default: {
      en: "Google sign-in failed. Try again or use email and password.",
      es: "No se pudo iniciar sesión con Google. Intenta de nuevo o usa correo y contraseña.",
      pt: "Não foi possível entrar com Google. Tente novamente ou use e-mail e senha.",
    },
  };

  return messages[code]?.[locale] ?? messages.Default[locale];
}

export function AuthOAuthNotice() {
  const searchParams = useSearchParams();
  const { locale } = useLanguage();
  const error = searchParams.get("error");

  if (!error) return null;

  return (
    <p className="mb-4 w-full max-w-md rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
      {authErrorMessage(error, locale)}
    </p>
  );
}
