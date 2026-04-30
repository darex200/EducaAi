"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { LoadingSpinner } from "@/components/loading-spinner";

type AuthMode = "login" | "register";

export function AuthForm({ mode }: { mode: AuthMode }) {
  const isRegister = mode === "register";
  const router = useRouter();
  const { login, register, isLoading } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isRegister) {
      await register(name || "Student", email);
    } else {
      await login(email);
    }
    router.push("/dashboard");
  };

  return (
    <form onSubmit={handleSubmit} className="card-surface w-full max-w-md space-y-4 p-6">
      <h1 className="text-2xl font-semibold text-indigo-800">
        {isRegister ? "Create your account" : "Welcome back"}
      </h1>
      {isRegister && (
        <input
          className="w-full rounded-xl border bg-white px-4 py-2.5 outline-none ring-indigo-300 transition focus:ring-2"
          placeholder="Your name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
      )}
      <input
        type="email"
        className="w-full rounded-xl border bg-white px-4 py-2.5 outline-none ring-indigo-300 transition focus:ring-2"
        placeholder="Email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
      />
      <input
        type="password"
        className="w-full rounded-xl border bg-white px-4 py-2.5 outline-none ring-indigo-300 transition focus:ring-2"
        placeholder="Password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required
      />
      <button
        type="submit"
        disabled={isLoading}
        className="gradient-accent w-full rounded-xl px-4 py-2.5 font-medium transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isLoading ? (
          <span className="inline-flex items-center justify-center">
            <LoadingSpinner label={isRegister ? "Creating account..." : "Signing in..."} />
          </span>
        ) : isRegister ? (
          "Register"
        ) : (
          "Login"
        )}
      </button>
    </form>
  );
}
