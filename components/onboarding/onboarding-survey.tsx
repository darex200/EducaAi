"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLearning } from "@/context/learning-context";

const subjectsOptions = ["Matematicas", "Fisica", "Quimica", "Lenguaje", "Biologia", "Historia"];
const levelOptions = ["primaria", "secundaria", "bachillerato", "universidad"];
const difficultyOptions: Array<"basico" | "intermedio" | "avanzado"> = [
  "basico",
  "intermedio",
  "avanzado",
];

export function OnboardingSurvey() {
  const router = useRouter();
  const { setProfile } = useLearning();
  const [step, setStep] = useState(1);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [level, setLevel] = useState("");
  const [topics, setTopics] = useState<string[]>([]);
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState<"basico" | "intermedio" | "avanzado">("basico");
  const [isLoadingTopics, setIsLoadingTopics] = useState(false);

  const toggleSubject = (value: string) => {
    setSubjects((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    );
  };

  const fetchTopics = async () => {
    setIsLoadingTopics(true);
    const response = await fetch("/api/onboarding-topics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subjects, level }),
    });
    const data = (await response.json()) as { topics?: string[] };
    const generated = data.topics?.length ? data.topics : ["Introduccion", "Conceptos clave", "Ejercicios"];
    setTopics(generated);
    setTopic(generated[0]);
    setIsLoadingTopics(false);
    setStep(3);
  };

  return (
    <section className="card-surface mx-auto w-full max-w-3xl p-6">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Encuesta inicial</p>
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">Personaliza tu ruta de aprendizaje</h1>

      {step === 1 && (
        <div>
          <p className="mb-4 text-sm font-medium text-slate-800">1) ¿En qué materias tienes dificultades?</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {subjectsOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => toggleSubject(option)}
                className={`rounded-lg border px-3 py-2 text-sm ${
                  subjects.includes(option)
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-slate-300 bg-white text-slate-700"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
          <div className="mt-5 flex justify-end">
            <button
              type="button"
              disabled={!subjects.length}
              onClick={() => setStep(2)}
              className="gradient-accent rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <p className="mb-4 text-sm font-medium text-slate-800">2) ¿En qué año o nivel estás?</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {levelOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setLevel(option)}
                className={`rounded-lg border px-3 py-2 text-sm capitalize ${
                  level === option
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-slate-300 bg-white text-slate-700"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
          <div className="mt-5 flex justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700"
            >
              Atrás
            </button>
            <button
              type="button"
              disabled={!level || isLoadingTopics}
              onClick={fetchTopics}
              className="gradient-accent rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50"
            >
              {isLoadingTopics ? "Generando temas..." : "Generar temas"}
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <p className="mb-4 text-sm font-medium text-slate-800">3) Selecciona un tema sugerido</p>
          <label className="mb-2 block text-xs font-semibold uppercase text-slate-500">Tema sugerido</label>
          <select
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
            className="mb-4 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            {topics.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <div className="mt-5 flex justify-between">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700"
            >
              Atrás
            </button>
            <button
              type="button"
              onClick={() => setStep(4)}
              className="gradient-accent rounded-lg px-4 py-2 text-sm font-semibold"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div>
          <p className="mb-4 text-sm font-medium text-slate-800">4) Selecciona dificultad</p>
          <label className="mb-2 block text-xs font-semibold uppercase text-slate-500">Dificultad</label>
          <div className="mb-5 flex gap-2">
            {difficultyOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setDifficulty(option)}
                className={`rounded-lg border px-3 py-2 text-sm capitalize ${
                  difficulty === option
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-slate-300 bg-white text-slate-700"
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700"
            >
              Atrás
            </button>
            <button
              type="button"
              onClick={() => {
                setProfile({ subjects, level, generatedTopics: topics, topic, difficulty });
                router.push("/dashboard/ai-tutor");
              }}
              className="gradient-accent rounded-lg px-4 py-2 text-sm font-semibold"
            >
              Ir al tutor IA
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
