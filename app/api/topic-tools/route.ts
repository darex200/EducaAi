import { NextResponse } from "next/server";
import {
  buildFallbackQuiz,
  clampQuestionCount,
  extractJsonPayload,
  normalizeQuiz,
  type QuizDifficulty,
  type QuizQuestionType,
  type SchoolLevel,
} from "@/lib/quiz";

type Mode = "subtopics" | "quiz" | "content";

type TopicToolsBody = {
  mode?: Mode;
  topic?: string;
  level?: string;
  difficulty?: QuizDifficulty;
  questionType?: QuizQuestionType;
  questionCount?: number;
  subtopics?: string[];
};

function fallbackSubtopics(topic: string) {
  return [`Introducción a ${topic}`, `Conceptos clave de ${topic}`, `Aplicaciones de ${topic}`];
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

function buildQuizPrompt(body: TopicToolsBody, topic: string, level: string, difficulty: QuizDifficulty) {
  const count = clampQuestionCount(body.questionCount);
  const questionType = body.questionType ?? "mixto";
  const subtopics =
    body.subtopics?.length ? body.subtopics.join(", ") : "sin subtemas específicos";

  return `Genera un cuestionario educativo en español.

Devuelve SOLO JSON válido con esta forma exacta:
{"quiz":[{"id":"q1","type":"opcion_multiple","question":"...","options":["A","B","C","D"],"answer":"texto exacto de la opción correcta"}]}

Reglas obligatorias:
- Tema: ${topic}
- Nivel escolar: ${level}
- Dificultad: ${difficulty}
- Tipo solicitado: ${questionType}
- Cantidad de preguntas: ${count}
- Subtemas a cubrir: ${subtopics}
- Cada pregunta debe tener "id" único (q1, q2, ...)
- Si type es "opcion_multiple": incluir 4 opciones claras y "answer" igual al texto de la opción correcta
- Si type es "abierta": options puede omitirse y "answer" con respuesta modelo breve
- Si type es "mixto": combinar ambos tipos
- Preguntas con enunciado claro, sin ambigüedad, nivel académico apropiado
- No uses markdown ni texto fuera del JSON`;
}

export async function POST(request: Request) {
  let body: TopicToolsBody;
  try {
    body = (await request.json()) as TopicToolsBody;
  } catch {
    return NextResponse.json({ error: "JSON inválido en la solicitud." }, { status: 400 });
  }

  const mode = body.mode;
  const topic = (body.topic ?? "Tema general").trim() || "Tema general";
  const level = (body.level ?? "secundaria") as SchoolLevel | string;
  const difficulty = body.difficulty ?? "intermedio";
  const questionCount = clampQuestionCount(body.questionCount);
  const questionType = body.questionType ?? "mixto";
  const apiKey = process.env.OPENAI_API_KEY;

  if (!mode) {
    return NextResponse.json({ error: "El campo mode es obligatorio." }, { status: 400 });
  }

  if (!apiKey) {
    if (mode === "subtopics") {
      return NextResponse.json({ subtopics: fallbackSubtopics(topic), source: "fallback" });
    }
    if (mode === "quiz") {
      return NextResponse.json({
        quiz: buildFallbackQuiz(topic, questionCount, questionType),
        source: "fallback",
        note: "Sin OPENAI_API_KEY: se usó cuestionario local.",
      });
    }
    return NextResponse.json({ content: fallbackContent(topic), source: "fallback" });
  }

  try {
    const promptByMode: Record<Mode, string> = {
      subtopics: `Devuelve JSON puro {"subtopics":["..."]} con 6 subtemas de "${topic}" para nivel ${level}. Solo JSON, sin markdown.`,
      quiz: buildQuizPrompt(body, topic, level, difficulty),
      content: `Devuelve JSON puro {"content":{"title":"...","summary":"...","examples":["..."],"references":["..."]}} para el tema "${topic}", nivel ${level}, dificultad ${difficulty}. Solo JSON.`,
    };

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.4,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "Eres un generador de contenido educativo. Respondes únicamente con JSON válido en español, sin markdown.",
          },
          { role: "user", content: promptByMode[mode] },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenAI ${response.status}: ${errText.slice(0, 200)}`);
    }

    const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const content = data.choices?.[0]?.message?.content ?? "{}";
    const parsed = extractJsonPayload(content) as {
      subtopics?: string[];
      quiz?: unknown[];
      content?: unknown;
    };

    if (mode === "subtopics") {
      const subtopics = Array.isArray(parsed.subtopics)
        ? parsed.subtopics.map(String).filter(Boolean).slice(0, 8)
        : fallbackSubtopics(topic);
      return NextResponse.json({ subtopics, source: "openai" });
    }

    if (mode === "quiz") {
      const quiz = normalizeQuiz(parsed.quiz, topic, questionCount, questionType);
      return NextResponse.json({ quiz, source: "openai" });
    }

    return NextResponse.json({
      content: (parsed.content as object) ?? fallbackContent(topic),
      source: "openai",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";

    if (mode === "subtopics") {
      return NextResponse.json({ subtopics: fallbackSubtopics(topic), source: "fallback", note: message });
    }
    if (mode === "quiz") {
      return NextResponse.json({
        quiz: buildFallbackQuiz(topic, questionCount, questionType),
        source: "fallback",
        note: message,
      });
    }
    return NextResponse.json({ content: fallbackContent(topic), source: "fallback", note: message });
  }
}
