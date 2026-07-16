"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useLanguage } from "@/context/language-context";

type GoogleSignInButtonProps = {
  label: string;
  callbackUrl?: string;
  onError?: (message: string | null) => void;
};

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M12 10.2v3.6h5.1c-.2 1.2-1.6 3.5-5.1 3.5-3.1 0-5.6-2.5-5.6-5.6S8.9 5.1 12 5.1c1.8 0 3 .8 3.7 1.4l2.5-2.4C16.8 2.9 14.6 2 12 2 6.9 2 2.7 6.2 2.7 11.3S6.9 20.6 12 20.6c6.1 0 7.6-4.3 7.6-6.5 0-.4 0-.7-.1-1.1H12z"
      />
      <path
        fill="#34A853"
        d="M4.4 14.5 2 16.7A9.9 9.9 0 0 0 12 22c2.4 0 4.6-.8 6.2-2.2l-3-2.3c-.8.6-1.9 1-3.2 1-2.5 0-4.6-1.7-5.3-4z"
      />
      <path
        fill="#4A90E2"
        d="M2 7.3l3.6 2.8C6.4 7.8 8.9 6 12 6c1.8 0 3 .8 3.7 1.4l2.5-2.4C16.8 2.9 14.6 2 12 2 7.5 2 3.7 4.8 2 7.3z"
      />
      <path
        fill="#FBBC05"
        d="M12 20.6c2.3 0 4.2-.8 5.6-2.1l-2.7-2.1c-.7.5-1.7.8-2.9.8-2.5 0-4.6-1.7-5.3-4l-3.6 2.8c1.5 3 4.6 4.6 8.9 4.6z"
      />
    </svg>
  );
}

function authErrorMessage(code: string, locale: "en" | "es" | "pt") {
  const messages: Record<string, Record<"en" | "es" | "pt", string>> = {
    Configuration: {
      en: "Google sign-in is not configured on the server. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in Vercel, then redeploy.",
      es: "El inicio con Google no está configurado en el servidor. Agrega GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET en Vercel y haz redeploy.",
      pt: "O login com Google não está configurado no servidor. Adicione GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET na Vercel e faça redeploy.",
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
      en: "Google callback failed. Verify AUTH_URL and the redirect URI match your custom domain.",
      es: "Falló el callback de Google. Verifica que AUTH_URL y la redirect URI coincidan con tu dominio personalizado.",
      pt: "Falha no callback do Google. Verifique se AUTH_URL e a redirect URI correspondem ao seu domínio personalizado.",
    },
    ServerError: {
      en: "Could not complete Google sign-in on the server. Check the database connection and try again.",
      es: "No se pudo completar el inicio con Google en el servidor. Revisa la conexión a la base de datos e intenta de nuevo.",
      pt: "Não foi possível concluir o login com Google no servidor. Verifique a conexão com o banco e tente novamente.",
    },
    Unreachable: {
      en: "Could not reach the auth server. Reload the page and try again.",
      es: "No se pudo conectar con el servidor de autenticación. Recarga la página e intenta de nuevo.",
      pt: "Não foi possível conectar ao servidor de autenticação. Recarregue a página e tente novamente.",
    },
    Default: {
      en: "Google sign-in failed. Try again or use email and password.",
      es: "No se pudo iniciar sesión con Google. Intenta de nuevo o usa correo y contraseña.",
      pt: "Não foi possível entrar com Google. Tente novamente ou use e-mail e senha.",
    },
  };

  return messages[code]?.[locale] ?? messages.Default[locale];
}

export function GoogleSignInButton({
  label,
  callbackUrl = "/tutor",
  onError,
}: GoogleSignInButtonProps) {
  const { locale } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function checkProviders() {
      try {
        const response = await fetch("/api/auth/providers", {
          credentials: "same-origin",
          headers: { Accept: "application/json" },
        });
        if (!response.ok) {
          if (!cancelled) onError?.(authErrorMessage("Unreachable", locale));
          return;
        }

        const contentType = response.headers.get("content-type") ?? "";
        if (!contentType.includes("application/json")) {
          if (!cancelled) onError?.(authErrorMessage("Unreachable", locale));
          return;
        }

        const providers = (await response.json()) as Record<string, unknown>;
        if (!cancelled && !providers.google) {
          onError?.(authErrorMessage("Configuration", locale));
        }
      } catch {
        if (!cancelled) {
          onError?.(authErrorMessage("Unreachable", locale));
        }
      }
    }

    void checkProviders();
    return () => {
      cancelled = true;
    };
  }, [locale, onError]);

  const handleClick = async () => {
    setIsLoading(true);
    onError?.(null);

    try {
      const result = await signIn("google", { callbackUrl, redirect: false });
      if (result?.error) {
        onError?.(authErrorMessage(result.error, locale));
        return;
      }
      if (result?.url) {
        window.location.assign(result.url);
        return;
      }
      // Fallback si Auth.js no devolvió URL (p. ej. redirección directa).
      window.location.assign(
        `/api/auth/signin/google?callbackUrl=${encodeURIComponent(callbackUrl)}`,
      );
    } catch {
      onError?.(authErrorMessage("OAuthSignin", locale));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={() => {
        void handleClick();
      }}
      disabled={isLoading}
      className="inline-flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-wait disabled:opacity-70"
    >
      <GoogleIcon />
      {isLoading ? "..." : label}
    </button>
  );
}
