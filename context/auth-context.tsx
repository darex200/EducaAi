"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { SessionProvider, signIn, signOut, useSession } from "next-auth/react";

type User = {
  id: string;
  name: string;
  email: string;
};

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function loginWithCredentials(email: string, password: string) {
  const result = await signIn("credentials", {
    email,
    password,
    redirect: false,
  });
  if (result?.error) {
    throw new Error("Correo o contraseña incorrectos.");
  }
}

function InnerAuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();

  const value = useMemo<AuthContextValue>(() => {
    const user = session?.user
      ? {
          id: session.user.id ?? "",
          name: session.user.name ?? "Estudiante",
          email: session.user.email ?? "",
        }
      : null;

    return {
      user,
      isLoading: status === "loading",
      login: loginWithCredentials,
      register: async (name, email, password) => {
        const response = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        if (!response.ok) {
          const data = (await response.json().catch(() => null)) as {
            error?: string;
          } | null;
          throw new Error(data?.error ?? "No se pudo crear la cuenta.");
        }
        await loginWithCredentials(email, password);
      },
      logout: async () => {
        await signOut({ redirect: false });
        window.location.href = "/login";
      },
    };
  }, [session, status]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <InnerAuthProvider>{children}</InnerAuthProvider>
    </SessionProvider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return context;
}
