"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => readDemoUser());

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading: false,
      isDatabaseEnabled: false,
      login: async () => {
        throw new Error("Solo necesitas tu nombre para entrar.");
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
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return context;
}
