"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { LoadingSpinner } from "@/components/loading-spinner";

type AuthMode = "login" | "register";

export function AuthForm({ mode }: { mode: AuthMode }) {
  const isRegister = mode === "register";
  const router = useRouter();
  const { login, register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      if (isRegister) {
        await register(name.trim() || "Estudiante", email.trim(), password);
      } else {
        await login(email.trim(), password);
      }
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Ocurrió un error. Intenta de nuevo.",
      );
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card-surface w-full max-w-md space-y-4 p-6">
      <h1 className="text-2xl font-semibold text-indigo-800">
        {isRegister ? "Crea tu cuenta" : "Bienvenido de nuevo"}
      </h1>
      {isRegister && (
        <input
          className="w-full rounded-xl border bg-white px-4 py-2.5 outline-none ring-indigo-300 transition focus:ring-2"
          placeholder="Tu nombre"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
      )}
      <input
        type="email"
        className="w-full rounded-xl border bg-white px-4 py-2.5 outline-none ring-indigo-300 transition focus:ring-2"
        placeholder="Correo electronico"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
      />
      <input
        type="password"
        className="w-full rounded-xl border bg-white px-4 py-2.5 outline-none ring-indigo-300 transition focus:ring-2"
        placeholder="Contrasena (minimo 6 caracteres)"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        minLength={6}
        required
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
            <LoadingSpinner label={isRegister ? "Creando cuenta..." : "Iniciando sesion..."} />
          </span>
        ) : isRegister ? (
          "Registrarse"
        ) : (
          "Iniciar sesion"
        )}
      </button>
    </form>
  );
}
