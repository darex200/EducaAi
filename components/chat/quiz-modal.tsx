"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  QuizDifficulty,
  QuizQuestion,
  QuizQuestionType,
  SchoolLevel,
} from "@/lib/quiz";

type QuizModalProps = {
  topic: string;
  isOpen: boolean;
  onClose: () => void;
};

type GradedAnswer = {
  questionId: string;
  correct: boolean;
  feedback: string;
};

type GenerateResponse = {
  quiz?: QuizQuestion[];
  attemptId?: string | null;
  difficulty?: QuizDifficulty;
  source?: string;
  note?: string;
  error?: string;
};

type SubmitResponse = {
  score?: number;
  total?: number;
  feedback?: GradedAnswer[];
  masteryScore?: number;
  error?: string;
};

export function QuizModal({ topic, isOpen, onClose }: QuizModalProps) {
  if (!isOpen) return null;
  return <QuizModalContent key={topic} topic={topic} onClose={onClose} />;
}

function QuizModalContent({ topic, onClose }: { topic: string; onClose: () => void }) {
  const [schoolLevel, setSchoolLevel] = useState<SchoolLevel>("secundaria");
  const [difficulty, setDifficulty] = useState<QuizDifficulty | "auto">("auto");
  const [questionType, setQuestionType] = useState<QuizQuestionType>("mixto");
  const [questionCount, setQuestionCount] = useState(6);
  const [subtopicsInput, setSubtopicsInput] = useState("");
  const [generatedSubtopics, setGeneratedSubtopics] = useState<string[]>([]);
  const [isLoadingSubtopics, setIsLoadingSubtopics] = useState(false);
  const [showConfig, setShowConfig] = useState(true);
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [appliedDifficulty, setAppliedDifficulty] = useState<QuizDifficulty | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    total: number;
    masteryScore?: number;
    feedback: Record<string, GradedAnswer>;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusNote, setStatusNote] = useState<string | null>(null);

  const loadSubtopics = useCallback(async () => {
    setIsLoadingSubtopics(true);
    setError(null);
    try {
      const res = await fetch("/api/topic-tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "subtopics", topic, level: schoolLevel }),
      });
      const data = (await res.json()) as { subtopics?: string[]; error?: string; note?: string };
      if (!res.ok) throw new Error(data.error ?? "No se pudieron cargar subtemas.");
      const items = data.subtopics ?? [];
      setGeneratedSubtopics(items);
      if (items.length) setSubtopicsInput(items.slice(0, 3).join(", "));
      if (data.note) setStatusNote(data.note);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar subtemas.");
    } finally {
      setIsLoadingSubtopics(false);
    }
  }, [topic, schoolLevel]);

  const generateQuiz = async () => {
    setQuiz([]);
    setAnswers({});
    setResult(null);
    setAttemptId(null);
    setIsGenerating(true);
    setError(null);
    setStatusNote(null);

    const safeCount = Math.max(3, Math.min(20, questionCount || 6));

    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate",
          topic,
          level: schoolLevel,
          difficulty,
          questionType,
          questionCount: safeCount,
          subtopics: subtopicsInput
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
        }),
      });

      const data = (await res.json()) as GenerateResponse;
      if (!res.ok) throw new Error(data.error ?? "No se pudo generar el cuestionario.");

      const items = data.quiz ?? [];
      if (!items.length) throw new Error("El servidor devolvió un cuestionario vacío. Intenta de nuevo.");

      setQuiz(items);
      setAttemptId(data.attemptId ?? null);
      setAppliedDifficulty(data.difficulty ?? null);
      setShowConfig(false);
      if (data.note) setStatusNote(data.note);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al generar el cuestionario.");
    } finally {
      setIsGenerating(false);
    }
  };

  const submitAnswers = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "submit",
          attemptId,
          questions: quiz,
          answers,
          topic,
        }),
      });
      const data = (await res.json()) as SubmitResponse;
      if (!res.ok) throw new Error(data.error ?? "No se pudieron corregir las respuestas.");

      const feedbackMap: Record<string, GradedAnswer> = {};
      for (const item of data.feedback ?? []) {
        feedbackMap[item.questionId] = item;
      }
      setResult({
        score: data.score ?? 0,
        total: data.total ?? quiz.length,
        masteryScore: data.masteryScore,
        feedback: feedbackMap,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al corregir las respuestas.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!showConfig) return;
    const timer = window.setTimeout(() => {
      void loadSubtopics();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [showConfig, schoolLevel, topic, loadSubtopics]);

  const selectClass =
    "rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-500/20";

  const typeLabel: Record<string, string> = {
    opcion_multiple: "opción múltiple",
    verdadero_falso: "verdadero / falso",
    abierta: "abierta",
    problema: "problema",
    caso: "caso",
    examen: "examen",
    mixto: "mixto",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="glass-panel chat-scroll-smooth mt-4 mb-6 flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/60 shadow-[0_24px_64px_rgba(15,23,42,0.18)]">
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-slate-900">
              {showConfig ? "Configurar cuestionario" : "Cuestionario generado"}
            </h3>
            <p className="text-xs text-slate-500">
              {topic}
              {appliedDifficulty && !showConfig && (
                <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                  dificultad {appliedDifficulty}
                </span>
              )}
            </p>
          </div>
          <button type="button" onClick={onClose} className="btn-ghost rounded-xl">
            Cerrar
          </button>
        </div>

        <div className="chat-scroll min-h-0 flex-1 overflow-y-auto px-6 py-5">
          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
          {statusNote && !error && (
            <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
              {statusNote}
            </div>
          )}

          {showConfig ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                  Configuración
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block text-xs text-slate-500">
                    Nivel escolar
                    <select
                      value={schoolLevel}
                      onChange={(e) => setSchoolLevel(e.target.value as SchoolLevel)}
                      className={`${selectClass} mt-1 w-full`}
                    >
                      <option value="primaria">Primaria</option>
                      <option value="secundaria">Secundaria</option>
                      <option value="bachillerato">Bachillerato</option>
                      <option value="universidad">Universidad</option>
                    </select>
                  </label>
                  <label className="block text-xs text-slate-500">
                    Dificultad
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value as QuizDifficulty | "auto")}
                      className={`${selectClass} mt-1 w-full`}
                    >
                      <option value="auto">Automática (según tu dominio)</option>
                      <option value="basico">Básico</option>
                      <option value="intermedio">Intermedio</option>
                      <option value="avanzado">Avanzado</option>
                    </select>
                  </label>
                  <label className="block text-xs text-slate-500">
                    Tipo de preguntas
                    <select
                      value={questionType}
                      onChange={(e) => setQuestionType(e.target.value as QuizQuestionType)}
                      className={`${selectClass} mt-1 w-full`}
                    >
                      <option value="mixto">Mixto</option>
                      <option value="opcion_multiple">Opción múltiple</option>
                      <option value="verdadero_falso">Verdadero / Falso</option>
                      <option value="abiertas">Abiertas</option>
                      <option value="problemas">Problemas</option>
                      <option value="casos">Casos de análisis</option>
                      <option value="examen">Tipo examen</option>
                    </select>
                  </label>
                  <label className="block text-xs text-slate-500">
                    Cantidad (3–20)
                    <input
                      type="number"
                      min={3}
                      max={20}
                      value={questionCount}
                      onChange={(e) => setQuestionCount(Number(e.target.value))}
                      className={`${selectClass} mt-1 w-full`}
                    />
                  </label>
                </div>
              </div>

              <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-blue-700">
                    Subtemas sugeridos
                  </p>
                  <button
                    type="button"
                    onClick={loadSubtopics}
                    disabled={isLoadingSubtopics}
                    className="btn-secondary px-3 py-1.5 text-xs"
                  >
                    {isLoadingSubtopics ? "Cargando…" : "Regenerar"}
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
                        className="btn-hover-lift rounded-full border border-blue-200 bg-white px-3 py-1 text-xs text-blue-700"
                      >
                        + {item}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="mb-3 text-sm text-slate-600">
                    {isLoadingSubtopics ? "Cargando subtemas…" : "Sin subtemas aún."}
                  </p>
                )}
                <input
                  value={subtopicsInput}
                  onChange={(e) => setSubtopicsInput(e.target.value)}
                  className={`${selectClass} w-full`}
                  placeholder="Ej: ecuaciones, fracciones, proporcionalidad"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={generateQuiz}
                  disabled={isGenerating}
                  className="btn-hover-primary btn-primary"
                >
                  {isGenerating ? "Generando cuestionario…" : "Generar cuestionario"}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-4 flex flex-wrap justify-between gap-2">
                <button type="button" onClick={() => setShowConfig(true)} className="btn-secondary text-sm">
                  Cambiar configuración
                </button>
                <button type="button" onClick={generateQuiz} disabled={isGenerating} className="btn-secondary text-sm">
                  {isGenerating ? "Regenerando…" : "Regenerar"}
                </button>
              </div>

              <div className="space-y-3">
                {quiz.map((q, idx) => {
                  const graded = result?.feedback[q.id] ?? null;
                  return (
                    <article
                      key={q.id}
                      className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm"
                    >
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-slate-900">
                          {idx + 1}. {q.question}
                        </p>
                        <span className="shrink-0 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase text-slate-500">
                          {typeLabel[q.type] ?? q.type}
                        </span>
                      </div>

                      {q.options?.length ? (
                        <div className="space-y-2">
                          {q.options.map((opt) => (
                            <label
                              key={opt}
                              className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm transition hover:border-blue-200 hover:bg-blue-50/40"
                            >
                              <input
                                type="radio"
                                name={`quiz-${q.id}`}
                                value={opt}
                                checked={answers[q.id] === opt}
                                disabled={Boolean(result)}
                                onChange={(e) =>
                                  setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                                }
                              />
                              {opt}
                            </label>
                          ))}
                        </div>
                      ) : (
                        <textarea
                          value={answers[q.id] ?? ""}
                          onChange={(e) =>
                            setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                          }
                          rows={2}
                          disabled={Boolean(result)}
                          placeholder="Escribe tu respuesta"
                          className={`${selectClass} mt-1 w-full`}
                        />
                      )}

                      {graded && (
                        <p
                          className={`mt-2 text-xs font-medium ${
                            graded.correct ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {graded.correct ? "✓ " : "✗ "}
                          {graded.feedback}
                        </p>
                      )}
                    </article>
                  );
                })}
              </div>

              {quiz.length > 0 && (
                <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                  {result ? (
                    <p className="text-sm font-semibold text-slate-800">
                      Resultado: {result.score} / {result.total}
                      <span className="ml-2 font-normal text-slate-500">
                        ({result.total ? Math.round((result.score / result.total) * 100) : 0}%)
                      </span>
                      {result.masteryScore != null && (
                        <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                          dominio del tema: {result.masteryScore}/100
                        </span>
                      )}
                    </p>
                  ) : (
                    <span />
                  )}
                  {!result && (
                    <button
                      type="button"
                      onClick={submitAnswers}
                      disabled={isSubmitting}
                      className="btn-primary px-4 py-2 text-sm"
                    >
                      {isSubmitting ? "Corrigiendo…" : "Corregir respuestas"}
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
