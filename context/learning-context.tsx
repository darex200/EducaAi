"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/context/auth-context";
import { isClientDatabaseEnabled } from "@/lib/demo-mode";

export type StudentProfile = {
  subjects: string[];
  level: string;
  topic: string;
  topicId: string;
  difficulty: "basico" | "intermedio" | "avanzado";
  generatedTopics: string[];
};

const defaultProfile: StudentProfile = {
  subjects: [],
  level: "",
  topic: "",
  topicId: "",
  difficulty: "basico",
  generatedTopics: [],
};

type LearningContextValue = {
  profile: StudentProfile;
  setProfile: (next: Partial<StudentProfile>) => void;
  clearProfile: () => void;
};

const LearningContext = createContext<LearningContextValue | undefined>(undefined);
const STORAGE_KEY = "educa-ai-profile";

function readLocalProfile(): StudentProfile | null {
  if (typeof window === "undefined") return null;
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return null;
  try {
    return { ...defaultProfile, ...(JSON.parse(saved) as Partial<StudentProfile>) };
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

function hasProfileData(profile: StudentProfile | null) {
  return Boolean(
    profile && (profile.subjects.length || profile.topic || profile.level),
  );
}

export function LearningProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfileState] = useState<StudentProfile>(
    () => readLocalProfile() ?? defaultProfile,
  );
  const syncedUserRef = useRef<string | null>(null);

  // Con base de datos: carga el perfil desde el servidor y migra localStorage si hace falta.
  useEffect(() => {
    if (!isClientDatabaseEnabled() || !user?.id || syncedUserRef.current === user.id) return;
    syncedUserRef.current = user.id;

    void (async () => {
      try {
        const response = await fetch("/api/profile");
        if (!response.ok) return;
        const data = (await response.json()) as {
          profile?: Partial<StudentProfile>;
        };
        const server: StudentProfile = {
          ...defaultProfile,
          ...data.profile,
        };

        const local = readLocalProfile();
        if (!hasProfileData(server) && hasProfileData(local)) {
          // Migración localStorage -> BD
          await fetch("/api/profile", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(local),
          }).catch(() => null);
          setProfileState(local as StudentProfile);
          return;
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(server));
        setProfileState(server);
      } catch {
        // sin red o modo demo: se mantiene el perfil local
      }
    })();
  }, [user?.id]);

  const setProfile = (next: Partial<StudentProfile>) => {
    setProfileState((current) => {
      const merged = { ...current, ...next };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      return merged;
    });
    if (isClientDatabaseEnabled()) {
      void fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      }).catch(() => null);
    }
  };

  const clearProfile = () => {
    localStorage.removeItem(STORAGE_KEY);
    setProfileState(defaultProfile);
    if (isClientDatabaseEnabled()) {
      void fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(defaultProfile),
      }).catch(() => null);
    }
  };

  const value = useMemo(() => ({ profile, setProfile, clearProfile }), [profile]);
  return <LearningContext.Provider value={value}>{children}</LearningContext.Provider>;
}

export function useLearning() {
  const context = useContext(LearningContext);
  if (!context) throw new Error("useLearning must be used within LearningProvider");
  return context;
}
