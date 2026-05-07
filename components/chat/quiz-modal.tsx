"use client";

import { useState } from "react";

type QuizQuestion = {
  id: string;
  type: "opcion_multiple" | "abierta" | "mixto" | string;
  question: string;
  options?: string[];
};

type QuizModalProps = {
  topic: string;
  isOpen: boolean;
  onClose: () => void;
};

export function QuizModal({ topic, isOpen, onClose }: QuizModalProps) {
  const [level, setLevel] = useState<"basico" | "intermedio" | "avanzado">("intermedio");
  const [questionType, setQuestionType] = useState<"opcion_multiple" | "abiertas" | "mixto">("mixto");
  const [questionCount, setQuestionCount] = useState(6);
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateQuiz = async () => {
    setIsGenerating(true);
    const res = await fetch("/api/topic-tools", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "quiz",
        topic,
        level,
        difficulty: level,
        questionType,
        questionCount,
      }),
    });
    const data = (await res.json()) as { quiz?: QuizQuestion[] };
    setQuiz(data.quiz ?? []);
    setIsGenerating(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/45 p-4">
      <div className="mx-auto mt-6 w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Generar cuestionario IA</h3>
          <button onClick={onClose} className="rounded-lg border border-slate-300 px-3 py-1 text-sm text-slate-700">
            Cerrar
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <select value={level} onChange={(e) => setLevel(e.target.value as "basico" | "intermedio" | "avanzado")} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
            <option value="basico">Basico</option>
            <option value="intermedio">Intermedio</option>
            <option value="avanzado">Avanzado</option>
          </select>
          <select value={questionType} onChange={(e) => setQuestionType(e.target.value as "opcion_multiple" | "abiertas" | "mixto")} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
            <option value="opcion_multiple">Opcion multiple</option>
            <option value="abiertas">Abiertas</option>
            <option value="mixto">Mixto</option>
          </select>
          <input type="number" min={3} max={20} value={questionCount} onChange={(e) => setQuestionCount(Number(e.target.value))} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </div>

        <div className="mt-4 flex justify-end">
          <button onClick={generateQuiz} disabled={isGenerating} className="btn-primary">
            {isGenerating ? "Generando..." : "Generar"}
          </button>
        </div>

        <div className="mt-4 max-h-[52vh] space-y-3 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-4">
          {quiz.map((question, idx) => (
            <article key={question.id || `${idx}`} className="rounded-lg border border-slate-200 bg-white p-3">
              <p className="mb-2 text-sm font-medium text-slate-900">
                {idx + 1}. {question.question}
              </p>
              {!!question.options?.length && (
                <ul className="space-y-1 text-xs text-slate-600">
                  {question.options.map((option) => (
                    <li key={option}>- {option}</li>
                  ))}
                </ul>
              )}
            </article>
          ))}
          {!quiz.length && !isGenerating && <p className="text-sm text-slate-500">Configura y genera un cuestionario para este tema.</p>}
        </div>
      </div>
    </div>
  );
}
