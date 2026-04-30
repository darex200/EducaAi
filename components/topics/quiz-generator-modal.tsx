"use client";

import { useEffect, useState } from "react";

type QuizQuestion = {
  id: string;
  type: "opcion_multiple" | "abierta" | "mixto" | string;
  question: string;
  options?: string[];
  answer?: string;
};

type QuizGeneratorModalProps = {
  topic: string;
  isOpen: boolean;
  onClose: () => void;
};

export function QuizGeneratorModal({ topic, isOpen, onClose }: QuizGeneratorModalProps) {
  const [level, setLevel] = useState("secundaria");
  const [difficulty, setDifficulty] = useState<"basico" | "intermedio" | "avanzado">("intermedio");
  const [questionType, setQuestionType] = useState<"opcion_multiple" | "abiertas" | "mixto">("mixto");
  const [questionCount, setQuestionCount] = useState(5);
  const [subtopicsInput, setSubtopicsInput] = useState("");
  const [generatedSubtopics, setGeneratedSubtopics] = useState<string[]>([]);
  const [isLoadingSubtopics, setIsLoadingSubtopics] = useState(false);
  const [showConfig, setShowConfig] = useState(true);
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  const generateQuiz = async () => {
    setQuiz([]);
    setAnswers({});
    setIsChecked(false);
    setIsGenerating(true);
    const res = await fetch("/api/topic-tools", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "quiz",
        topic,
        level,
        difficulty,
        questionType,
        questionCount,
        subtopics: subtopicsInput
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      }),
    });
    const data = (await res.json()) as { quiz?: QuizQuestion[] };
    setQuiz(data.quiz ?? []);
    setIsGenerating(false);
    setShowConfig(false);
  };

  const getQuestionResult = (question: QuizQuestion) => {
    const userAnswer = (answers[question.id] ?? "").trim().toLowerCase();
    const expected = (question.answer ?? "").trim().toLowerCase();
    if (!userAnswer) return "sin-responder";
    if (!expected) return "sin-clave";
    return userAnswer === expected ? "correcta" : "incorrecta";
  };

  const score = quiz.reduce((acc, question) => {
    return acc + (getQuestionResult(question) === "correcta" ? 1 : 0);
  }, 0);

  const loadSubtopics = async () => {
    setIsLoadingSubtopics(true);
    const res = await fetch("/api/topic-tools", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "subtopics",
        topic,
        level,
      }),
    });
    const data = (await res.json()) as { subtopics?: string[] };
    const items = data.subtopics ?? [];
    setGeneratedSubtopics(items);
    if (items.length) {
      setSubtopicsInput(items.slice(0, 3).join(", "));
    }
    setIsLoadingSubtopics(false);
  };

  useEffect(() => {
    if (!isOpen || !showConfig) return;
    void loadSubtopics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, showConfig, level, topic]);

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
          {showConfig ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Configuración del cuestionario
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="primaria">Primaria</option>
                  <option value="secundaria">Secundaria</option>
                  <option value="bachillerato">Bachillerato</option>
                  <option value="universidad">Universidad</option>
                </select>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as "basico" | "intermedio" | "avanzado")}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="basico">Básico</option>
                  <option value="intermedio">Intermedio</option>
                  <option value="avanzado">Avanzado</option>
                </select>
                <select
                  value={questionType}
                  onChange={(e) => setQuestionType(e.target.value as "opcion_multiple" | "abiertas" | "mixto")}
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
                  <div key={q.id || `${idx}`} className="rounded-lg border border-slate-200 bg-white p-3">
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

                    {isChecked && (
                      <p
                        className={`mt-2 text-xs font-medium ${
                          getQuestionResult(q) === "correcta"
                            ? "text-green-600"
                            : getQuestionResult(q) === "incorrecta"
                              ? "text-red-600"
                              : "text-slate-500"
                        }`}
                      >
                        {getQuestionResult(q) === "correcta" && "Respuesta correcta"}
                        {getQuestionResult(q) === "incorrecta" &&
                          `Respuesta incorrecta${q.answer ? `. Respuesta sugerida: ${q.answer}` : ""}`}
                        {getQuestionResult(q) === "sin-responder" && "Sin responder"}
                        {getQuestionResult(q) === "sin-clave" && "Respuesta registrada"}
                      </p>
                    )}
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
