import { NextResponse } from "next/server";

type Mode = "subtopics" | "quiz" | "content";

type TopicToolsBody = {
  mode?: Mode;
  topic?: string;
  level?: string;
  difficulty?: "basico" | "intermedio" | "avanzado";
  questionType?: "opcion_multiple" | "abiertas" | "mixto";
  questionCount?: number;
  subtopics?: string[];
};

function fallbackSubtopics(topic: string) {
  return [`Introducción a ${topic}`, `Conceptos clave de ${topic}`, `Aplicaciones de ${topic}`];
}

function fallbackQuiz(topic: string, count: number) {
  return Array.from({ length: count }).map((_, i) => ({
    id: `${topic}-${i + 1}`,
    type: "abierta",
    question: `Explica con tus palabras un concepto importante de ${topic} (${i + 1}/${count}).`,
    options: [],
    answer: "Respuesta abierta",
  }));
}

function fallbackContent(topic: string) {
  return {
    title: topic,
    summary: `${topic} es un tema clave para desarrollar comprensión conceptual y capacidad de análisis.`,
    examples: [
      `Ejemplo 1: aplicación básica de ${topic}.`,
      `Ejemplo 2: caso práctico intermedio de ${topic}.`,
    ],
    references: [
      "Artículo recomendado: fundamentos del tema.",
      "Referencia académica: revisión conceptual estructurada.",
    ],
  };
}

export async function POST(request: Request) {
  const body = (await request.json()) as TopicToolsBody;
  const mode = body.mode;
  const topic = body.topic ?? "Tema general";
  const level = body.level ?? "secundaria";
  const difficulty = body.difficulty ?? "basico";
  const apiKey = process.env.OPENAI_API_KEY;

  if (!mode) {
    return NextResponse.json({ error: "mode is required" }, { status: 400 });
  }

  if (!apiKey) {
    if (mode === "subtopics") return NextResponse.json({ subtopics: fallbackSubtopics(topic), source: "fallback" });
    if (mode === "quiz") return NextResponse.json({ quiz: fallbackQuiz(topic, Math.max(3, Math.min(15, body.questionCount ?? 5))), source: "fallback" });
    return NextResponse.json({ content: fallbackContent(topic), source: "fallback" });
  }

  try {
    const promptByMode: Record<Mode, string> = {
      subtopics:
        `Devuelve JSON puro {"subtopics":["..."]} con 6 subtemas de ${topic} para nivel ${level}. Sin texto adicional.`,
      quiz:
        `Devuelve JSON puro {"quiz":[{"id":"q1","type":"opcion_multiple|abierta","question":"...","options":["A","B","C","D"],"answer":"..."}]}.
Tema: ${topic}. Nivel: ${level}. Dificultad: ${difficulty}. Tipo solicitado: ${body.questionType}. Cantidad: ${body.questionCount}.`,
      content:
        `Devuelve JSON puro {"content":{"title":"...","summary":"...","examples":["..."],"references":["..."]}}.
Tema: ${topic}. Nivel: ${level}. Dificultad: ${difficulty}. Debe ser claro, profesional y bien estructurado.`,
    };

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.5,
        messages: [
          { role: "system", content: "Responde únicamente con JSON válido sin markdown." },
          { role: "user", content: promptByMode[mode] },
        ],
      }),
    });

    if (!response.ok) throw new Error("OpenAI request failed");
    const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const content = data.choices?.[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(content) as {
      subtopics?: string[];
      quiz?: unknown[];
      content?: unknown;
    };

    if (mode === "subtopics") {
      return NextResponse.json({ subtopics: parsed.subtopics?.slice(0, 8) ?? fallbackSubtopics(topic), source: "openai" });
    }
    if (mode === "quiz") {
      return NextResponse.json({
        quiz: Array.isArray(parsed.quiz) && parsed.quiz.length ? parsed.quiz : fallbackQuiz(topic, Math.max(3, Math.min(15, body.questionCount ?? 5))),
        source: "openai",
      });
    }
    return NextResponse.json({ content: parsed.content ?? fallbackContent(topic), source: "openai" });
  } catch {
    if (mode === "subtopics") return NextResponse.json({ subtopics: fallbackSubtopics(topic), source: "fallback" });
    if (mode === "quiz") return NextResponse.json({ quiz: fallbackQuiz(topic, Math.max(3, Math.min(15, body.questionCount ?? 5))), source: "fallback" });
    return NextResponse.json({ content: fallbackContent(topic), source: "fallback" });
  }
}
