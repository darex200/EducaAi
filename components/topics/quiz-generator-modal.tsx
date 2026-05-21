"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getQuestionResult,
  type QuizDifficulty,
  type QuizQuestion,
  type QuizQuestionType,
  type SchoolLevel,
} from "@/lib/quiz";

type QuizGeneratorModalProps = {
  topic: string;
  isOpen: boolean;
  onClose: () => void;
};

export function QuizGeneratorModal({ topic, isOpen, onClose }: QuizGeneratorModalProps) {
  const [level, setLevel] = useState<SchoolLevel>("secundaria");
  const [difficulty, setDifficulty] = useState<QuizDifficulty>("intermedio");
  const [questionType, setQuestionType] = useState<QuizQuestionType>("mixto");
  const [questionCount, setQuestionCount] = useState(5);
  const [subtopicsInput, setSubtopicsInput] = useState("");
  const [generatedSubtopics, setGeneratedSubtopics] = useState<string[]>([]);
  const [isLoadingSubtopics, setIsLoadingSubtopics] = useState(false);
  const [showConfig, setShowConfig] = useState(true);
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const score = quiz.reduce((acc, question) => {
    return acc + (getQuestionResult(question, answers[question.id] ?? "") === "correcta" ? 1 : 0);
  }, 0);

  const generateQuiz = async () => {
    setQuiz([]);
    setAnswers({});
    setIsChecked(false);
    setIsGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/topic-tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "quiz",
          topic,
          level,
          difficulty,
          questionType,
          questionCount: Math.max(3, Math.min(20, questionCount)),
          subtopics: subtopicsInput
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
        }),
      });
      const data = (await res.json()) as { quiz?: QuizQuestion[]; error?: string };
      if (!res.ok) throw new Error(data.error ?? "No se pudo generar el cuestionario.");
      if (!data.quiz?.length) throw new Error("Cuestionario vacío. Intenta de nuevo.");
      setQuiz(data.quiz);
      setShowConfig(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al generar.");
    } finally {
      setIsGenerating(false);
    }
  };

  const loadSubtopics = useCallback(async () => {
    setIsLoadingSubtopics(true);
    try {
      const res = await fetch("/api/topic-tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "subtopics", topic, level }),
      });
      const data = (await res.json()) as { subtopics?: string[] };
      const items = data.subtopics ?? [];
      setGeneratedSubtopics(items);
      if (items.length) setSubtopicsInput(items.slice(0, 3).join(", "));
    } finally {
      setIsLoadingSubtopics(false);
    }
  }, [topic, level]);

  useEffect(() => {
    if (!isOpen || !showConfig) return;
    const timer = window.setTimeout(() => {
      void loadSubtopics();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [isOpen, showConfig, level, topic, loadSubtopics]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/40 p-4">
      <div className="mx-auto mt-6 mb-6 flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
        <div className="mb-4 flex items-center justify-between px-5 pt-5">
          <h3 className="text-lg font-semibold text-slate-900">
            {showConfig ? "Configurar cuestionario" : "Cuestionario generado"}
          </h3>
          <button onClick={onClose} className="rounded-lg border border-slate-300 px-3 py-1 text-sm text-slate-600">
            Cerrar
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
          {showConfig ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Configuración del cuestionario
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value as SchoolLevel)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="primaria">Primaria</option>
                  <option value="secundaria">Secundaria</option>
                  <option value="bachillerato">Bachillerato</option>
                  <option value="universidad">Universidad</option>
                </select>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as QuizDifficulty)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="basico">Básico</option>
                  <option value="intermedio">Intermedio</option>
                  <option value="avanzado">Avanzado</option>
                </select>
                <select
                  value={questionType}
                  onChange={(e) => setQuestionType(e.target.value as QuizQuestionType)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="opcion_multiple">Opción múltiple</option>
                  <option value="abiertas">Abiertas</option>
                  <option value="mixto">Mixto</option>
                </select>
                <input
                  type="number"
                  min={3}
                  max={20}
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  placeholder="Cantidad de preguntas"
                />
                </div>
              </div>

              <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                    Subtemas sugeridos por IA
                  </p>
                  <button
                    type="button"
                    onClick={loadSubtopics}
                    className="rounded-lg border border-blue-300 bg-white px-3 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                    disabled={isLoadingSubtopics}
                  >
                    {isLoadingSubtopics ? "Generando..." : "Regenerar subtemas"}
                  </button>
                </div>

                {generatedSubtopics.length > 0 ? (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {generatedSubtopics.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() =>
                          setSubtopicsInput((current) => {
                            const list = current
                              .split(",")
                              .map((s) => s.trim())
                              .filter(Boolean);
                            if (list.includes(item)) return current;
                            return [...list, item].join(", ");
                          })
                        }
                        className="rounded-full border border-blue-300 bg-white px-3 py-1 text-xs text-blue-700 hover:bg-blue-100"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="mb-3 text-sm text-slate-600">
                    {isLoadingSubtopics ? "Cargando subtemas..." : "Aún no hay subtemas generados."}
                  </p>
                )}

                <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">
                  Subtemas seleccionados (editable)
                </label>
                <input
                  value={subtopicsInput}
                  onChange={(e) => setSubtopicsInput(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                  placeholder="Ej: ecuaciones lineales, fracciones, proporcionalidad"
                />
              </div>

              {isGenerating && (
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                  Generando cuestionario...
                </div>
              )}

              <div className="flex justify-end">
                <button onClick={generateQuiz} className="btn-primary" disabled={isGenerating}>
                  {isGenerating ? "Generando..." : "Continuar y generar"}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-3 flex justify-between">
                <button
                  type="button"
                  onClick={() => setShowConfig(true)}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700"
                >
                  Cambiar configuración
                </button>
                <button onClick={generateQuiz} className="btn-secondary">
                  Regenerar
                </button>
              </div>

              <div className="mt-5 max-h-[45vh] space-y-3 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-4">
                {quiz.map((q, idx) => (
                  <div key={q.id} className="rounded-lg border border-slate-200 bg-white p-3">
                    <p className="mb-2 text-sm font-medium text-slate-900">
                      {idx + 1}. {q.question}
                    </p>
                    {q.options?.length ? (
                      <div className="space-y-1">
                        {q.options.map((opt) => (
                          <label key={opt} className="flex items-center gap-2 text-sm text-slate-700">
                            <input
                              type="radio"
                              name={`q-${idx}`}
                              value={opt}
                              checked={answers[q.id] === opt}
                              onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                            />
                            {opt}
                          </label>
                        ))}
                      </div>
                    ) : (
                      <textarea
                        value={answers[q.id] ?? ""}
                        onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        rows={2}
                        placeholder="Escribe tu respuesta"
                      />
                    )}

                    {isChecked && (() => {
                      const result = getQuestionResult(q, answers[q.id] ?? "");
                      return (
                      <p
                        className={`mt-2 text-xs font-medium ${
                          result === "correcta"
                            ? "text-green-600"
                            : result === "incorrecta"
                              ? "text-red-600"
                              : "text-slate-500"
                        }`}
                      >
                        {result === "correcta" && "Respuesta correcta"}
                        {result === "incorrecta" &&
                          `Respuesta incorrecta${q.answer ? `. Respuesta sugerida: ${q.answer}` : ""}`}
                        {result === "sin-responder" && "Sin responder"}
                        {result === "sin-clave" && "Respuesta registrada"}
                      </p>
                      );
                    })()}
                  </div>
                ))}
              </div>

              {quiz.length > 0 && (
                <div className="mt-3 flex items-center justify-between">
                  {isChecked ? (
                    <p className="text-sm font-medium text-slate-700">
                      Resultado: {score} / {quiz.length}
                    </p>
                  ) : (
                    <span />
                  )}
                  <button
                    type="button"
                    onClick={() => setIsChecked(true)}
                    className="rounded-lg border border-blue-300 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
                  >
                    Corregir respuestas
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
