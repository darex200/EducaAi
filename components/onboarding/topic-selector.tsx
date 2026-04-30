"use client";

import { useState } from "react";
import { useLearning } from "@/context/learning-context";

type TopicSelectorProps = {
  onApply: (topic: string) => void;
};

export function TopicSelector({ onApply }: TopicSelectorProps) {
  const { profile, setProfile } = useLearning();
  const [topic, setTopic] = useState(profile.topic || profile.generatedTopics[0] || "");
  const [difficulty, setDifficulty] = useState(profile.difficulty || "basico");

  if (!profile.generatedTopics.length) return null;

  return (
    <div className="mb-3 rounded-xl border border-slate-200 bg-white p-4">
      <p className="mb-2 text-xs font-semibold uppercase text-slate-500">Seleccionar tema</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <select
          value={topic}
          onChange={(event) => setTopic(event.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          {profile.generatedTopics.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <select
          value={difficulty}
          onChange={(event) => setDifficulty(event.target.value as "basico" | "intermedio" | "avanzado")}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="basico">Básico</option>
          <option value="intermedio">Intermedio</option>
          <option value="avanzado">Avanzado</option>
        </select>
      </div>
      <div className="mt-3 flex justify-end">
        <button
          onClick={() => {
            setProfile({ topic, difficulty });
            onApply(topic);
          }}
          className="gradient-accent rounded-lg px-4 py-2 text-sm font-semibold"
        >
          Aplicar
        </button>
      </div>
    </div>
  );
}
