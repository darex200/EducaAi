"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type StudentProfile = {
  subjects: string[];
  level: string;
  topic: string;
  difficulty: "basico" | "intermedio" | "avanzado";
  generatedTopics: string[];
};

const defaultProfile: StudentProfile = {
  subjects: [],
  level: "",
  topic: "",
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

export function LearningProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<StudentProfile>(() => {
    if (typeof window === "undefined") return defaultProfile;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return defaultProfile;
    try {
      return JSON.parse(saved) as StudentProfile;
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return defaultProfile;
    }
  });

  const setProfile = (next: Partial<StudentProfile>) => {
    setProfileState((current) => {
      const merged = { ...current, ...next };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      return merged;
    });
  };

  const clearProfile = () => {
    localStorage.removeItem(STORAGE_KEY);
    setProfileState(defaultProfile);
  };

  const value = useMemo(() => ({ profile, setProfile, clearProfile }), [profile]);
  return <LearningContext.Provider value={value}>{children}</LearningContext.Provider>;
}

export function useLearning() {
  const context = useContext(LearningContext);
  if (!context) throw new Error("useLearning must be used within LearningProvider");
  return context;
}
