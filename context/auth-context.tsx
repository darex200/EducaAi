"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { SessionProvider, signIn, signOut, useSession } from "next-auth/react";
import { isClientDatabaseEnabled } from "@/lib/demo-mode";

type User = {
  id: string;
  name: string;
  email: string;
};

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  isDatabaseEnabled: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const DEMO_USER_KEY = "educa-ai-demo-user";

function readDemoUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DEMO_USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as User;
  } catch {
    localStorage.removeItem(DEMO_USER_KEY);
    return null;
  }
}

function writeDemoUser(user: User) {
  localStorage.setItem(DEMO_USER_KEY, JSON.stringify(user));
}

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

function DatabaseAuthProvider({ children }: { children: ReactNode }) {
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
      isDatabaseEnabled: true,
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

function DemoAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => readDemoUser());
  const isLoading = false;

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isDatabaseEnabled: false,
      login: async () => {
        throw new Error("Ingresa tu nombre para comenzar.");
      },
      register: async (name) => {
        const demoUser: User = {
          id: `demo-${crypto.randomUUID()}`,
          name: name.trim() || "Estudiante",
          email: "",
        };
        writeDemoUser(demoUser);
        setUser(demoUser);
      },
      logout: async () => {
        localStorage.removeItem(DEMO_USER_KEY);
        setUser(null);
        window.location.href = "/";
      },
    }),
    [user, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  if (isClientDatabaseEnabled()) {
    return (
      <SessionProvider>
        <DatabaseAuthProvider>{children}</DatabaseAuthProvider>
      </SessionProvider>
    );
  }

  return <DemoAuthProvider>{children}</DemoAuthProvider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return context;
}
