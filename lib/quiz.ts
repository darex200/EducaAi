export type QuizDifficulty = "basico" | "intermedio" | "avanzado";
export type QuizQuestionType =
  | "opcion_multiple"
  | "verdadero_falso"
  | "abiertas"
  | "problemas"
  | "casos"
  | "examen"
  | "mixto";
export type SchoolLevel = "primaria" | "secundaria" | "bachillerato" | "universidad";

export type QuizQuestion = {
  id: string;
  type:
    | "opcion_multiple"
    | "verdadero_falso"
    | "abierta"
    | "problema"
    | "caso"
    | "examen"
    | "mixto";
  question: string;
  options?: string[];
  answer?: string;
};

/** Tipos de pregunta que se responden con texto libre. */
export function isOpenQuestionType(type: QuizQuestion["type"]) {
  return type === "abierta" || type === "problema" || type === "caso" || type === "examen";
}

export function clampQuestionCount(value?: number) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 5;
  return Math.max(3, Math.min(20, Math.round(n)));
}

export function extractJsonPayload(text: string): unknown {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1].trim() : trimmed;

  try {
    return JSON.parse(candidate);
  } catch {
    const start = candidate.indexOf("{");
    const end = candidate.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(candidate.slice(start, end + 1));
    }
    throw new Error("No se pudo interpretar el JSON del modelo.");
  }
}

function normalizeQuestionType(raw: unknown): QuizQuestion["type"] {
  const value = String(raw ?? "abierta").toLowerCase();
  if (value.includes("multiple") || value === "opcion_multiple") return "opcion_multiple";
  if (value.includes("verdadero") || value.includes("falso") || value.includes("true_false"))
    return "verdadero_falso";
  if (value.includes("problema")) return "problema";
  if (value.includes("caso")) return "caso";
  if (value.includes("examen")) return "examen";
  if (value.includes("mixto")) return "mixto";
  return "abierta";
}

export function normalizeQuizItem(raw: unknown, index: number, topic: string): QuizQuestion | null {
  if (!raw || typeof raw !== "object") return null;
  const item = raw as Record<string, unknown>;
  const question = String(item.question ?? item.text ?? "").trim();
  if (!question) return null;

  const type = normalizeQuestionType(item.type);
  let options = Array.isArray(item.options)
    ? item.options.map((opt) => String(opt).trim()).filter(Boolean)
    : [];

  const answer = String(item.answer ?? item.correctAnswer ?? item.correct ?? "").trim();

  if (type === "opcion_multiple" && options.length < 2) {
    options = ["Opción A", "Opción B", "Opción C", "Opción D"];
  }
  if (type === "verdadero_falso") {
    options = ["Verdadero", "Falso"];
  }

  const usesOptions = type === "opcion_multiple" || type === "verdadero_falso";

  return {
    id: String(item.id ?? `q-${topic.replace(/\s+/g, "-").toLowerCase()}-${index + 1}`),
    type,
    question,
    options: usesOptions ? options : options.length ? options : undefined,
    answer: answer || undefined,
  };
}

export function normalizeQuiz(
  rawQuiz: unknown,
  topic: string,
  questionCount: number,
  questionType: QuizQuestionType,
): QuizQuestion[] {
  const list = Array.isArray(rawQuiz) ? rawQuiz : [];
  const normalized = list
    .map((item, index) => normalizeQuizItem(item, index, topic))
    .filter((item): item is QuizQuestion => item !== null);

  let filtered = normalized;
  if (questionType === "opcion_multiple") {
    filtered = normalized.filter((q) => q.type === "opcion_multiple" && (q.options?.length ?? 0) >= 2);
  } else if (questionType === "verdadero_falso") {
    filtered = normalized.filter((q) => q.type === "verdadero_falso");
  } else if (questionType === "abiertas") {
    filtered = normalized.filter((q) => isOpenQuestionType(q.type));
  } else if (questionType === "problemas") {
    filtered = normalized.filter((q) => q.type === "problema" || q.type === "abierta");
  } else if (questionType === "casos") {
    filtered = normalized.filter((q) => q.type === "caso" || q.type === "abierta");
  } else if (questionType === "examen") {
    // En modo examen se aceptan todos los tipos generados.
    filtered = normalized;
  }

  const target = clampQuestionCount(questionCount);
  if (filtered.length >= 3) return filtered.slice(0, target);

  const fallback = buildFallbackQuiz(topic, target, questionType);
  const merged = [...filtered];
  for (const item of fallback) {
    if (merged.length >= target) break;
    if (!merged.some((q) => q.question === item.question)) merged.push(item);
  }
  return merged.slice(0, target);
}

export function buildFallbackQuiz(
  topic: string,
  count: number,
  questionType: QuizQuestionType = "mixto",
): QuizQuestion[] {
  const total = clampQuestionCount(count);
  return Array.from({ length: total }).map((_, index) => {
    const n = index + 1;

    if (questionType === "verdadero_falso") {
      return {
        id: `fallback-${n}`,
        type: "verdadero_falso" as const,
        question: `Pregunta ${n}: ${topic} es un tema que requiere dominar conceptos previos. ¿Verdadero o falso?`,
        options: ["Verdadero", "Falso"],
        answer: "Verdadero",
      };
    }

    const useMultiple = questionType === "opcion_multiple" || (questionType === "mixto" && n % 2 === 1);

    if (useMultiple) {
      const options = [
        `Definición central de ${topic}`,
        `Ejemplo aplicado de ${topic}`,
        `Error común al estudiar ${topic}`,
        `Concepto no relacionado`,
      ];
      return {
        id: `fallback-${n}`,
        type: "opcion_multiple" as const,
        question: `Pregunta ${n}: ¿Cuál opción describe mejor un concepto clave de ${topic}?`,
        options,
        answer: options[0],
      };
    }

    return {
      id: `fallback-${n}`,
      type: "abierta" as const,
      question: `Pregunta ${n}: Explica con tus palabras un concepto importante de ${topic}.`,
      answer: "Respuesta abierta válida si demuestra comprensión del concepto.",
    };
  });
}

export function getQuestionResult(question: QuizQuestion, userAnswer: string) {
  const normalizedUser = userAnswer.trim().toLowerCase();
  const normalizedExpected = (question.answer ?? "").trim().toLowerCase();
  if (!normalizedUser) return "sin-responder" as const;
  if (!normalizedExpected) return "sin-clave" as const;
  if (normalizedUser === normalizedExpected) return "correcta" as const;
  // Allow matching by option letter prefix for MC
  if (question.options?.some((opt) => opt.toLowerCase() === normalizedUser)) {
    return normalizedExpected.includes(normalizedUser) ? "correcta" : "incorrecta";
  }
  return "incorrecta" as const;
}
