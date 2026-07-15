"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { LoadingSpinner } from "@/components/loading-spinner";
import { GoogleSignInButton } from "@/components/google-sign-in-button";
import { useLanguage } from "@/context/language-context";

type AuthMode = "login" | "register";

type AuthFormProps = {
  mode?: AuthMode;
};

export function AuthForm({ mode = "login" }: AuthFormProps) {
  const isRegister = mode === "register";
  const router = useRouter();
  const { login, register, isDatabaseEnabled } = useAuth();
  const { t } = useLanguage();
  const showGoogleAuth = isDatabaseEnabled;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const finishAuth = () => {
    router.replace("/tutor");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (isDatabaseEnabled) {
        if (isRegister) {
          await register(name.trim() || "Estudiante", email.trim(), password);
        } else {
          await login(email.trim(), password);
        }
      } else {
        await register(name.trim() || "Estudiante", "", "");
      }
      finishAuth();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Ocurrió un error. Intenta de nuevo.",
      );
      setIsSubmitting(false);
    }
  };

  if (!isDatabaseEnabled) {
    return (
      <form onSubmit={handleSubmit} className="card-surface w-full max-w-md space-y-4 p-6">
        <h1 className="text-2xl font-semibold text-indigo-800">Entra a Educa AI</h1>
        <p className="text-sm text-slate-600">
          Solo escribe tu nombre. No necesitas correo ni contraseña.
        </p>
        <input
          className="w-full rounded-xl border bg-white px-4 py-2.5 outline-none ring-indigo-300 transition focus:ring-2"
          placeholder="Tu nombre"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          autoComplete="name"
        />
        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="gradient-accent w-full rounded-xl px-4 py-2.5 font-medium transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? (
            <span className="inline-flex items-center justify-center">
              <LoadingSpinner label="Entrando..." />
            </span>
          ) : (
            "Empezar"
          )}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card-surface w-full max-w-md space-y-4 p-6">
      <h1 className="text-2xl font-semibold text-indigo-800">
        {isRegister ? "Crea tu cuenta" : "Bienvenido de nuevo"}
      </h1>
      <p className="text-sm text-slate-600">
        {isRegister
          ? "Regístrate para guardar tu historial y progreso."
          : "Inicia sesión con tu correo y contraseña."}
      </p>
      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
          {error}
        </p>
      )}
      {showGoogleAuth ? (
        <>
          <GoogleSignInButton label={t("authGoogleSignIn")} onError={setError} />
          <div className="relative py-1 text-center text-xs text-slate-500">
            <span className="relative z-10 bg-white px-2">{t("authOrContinueWith")}</span>
            <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-slate-200" />
          </div>
        </>
      ) : null}
      {isRegister && (
        <input
          className="w-full rounded-xl border bg-white px-4 py-2.5 outline-none ring-indigo-300 transition focus:ring-2"
          placeholder="Tu nombre"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          autoComplete="name"
        />
      )}
      <input
        type="email"
        className="w-full rounded-xl border bg-white px-4 py-2.5 outline-none ring-indigo-300 transition focus:ring-2"
        placeholder="Correo electrónico"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
        autoComplete="email"
      />
      <input
        type="password"
        className="w-full rounded-xl border bg-white px-4 py-2.5 outline-none ring-indigo-300 transition focus:ring-2"
        placeholder="Contraseña (mínimo 6 caracteres)"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        minLength={6}
        required
        autoComplete={isRegister ? "new-password" : "current-password"}
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className="gradient-accent w-full rounded-xl px-4 py-2.5 font-medium transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? (
          <span className="inline-flex items-center justify-center">
            <LoadingSpinner
              label={isRegister ? "Creando cuenta..." : "Iniciando sesión..."}
            />
          </span>
        ) : isRegister ? (
          "Registrarse"
        ) : (
          "Iniciar sesión"
        )}
      </button>
      <p className="text-center text-sm text-slate-600">
        {isRegister ? (
          <>
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="font-medium text-indigo-700">
              Inicia sesión
            </Link>
          </>
        ) : (
          <>
            ¿Primera vez?{" "}
            <Link href="/register" className="font-medium text-indigo-700">
              Crear cuenta
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
