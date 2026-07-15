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
import type { AppLocale } from "@/lib/i18n/translations";
import {
  aiJsonSystemPrompt,
  aiLanguageLabel,
  fallbackSubtopics,
  fallbackTopicContent,
  normalizeAppLocale,
} from "@/lib/i18n/locale-ai";

type Mode = "subtopics" | "quiz" | "content";

type TopicToolsBody = {
  mode?: Mode;
  topic?: string;
  level?: string;
  difficulty?: QuizDifficulty;
  questionType?: QuizQuestionType;
  questionCount?: number;
  subtopics?: string[];
  locale?: string;
};

function buildQuizPrompt(
  body: TopicToolsBody,
  topic: string,
  level: string,
  difficulty: QuizDifficulty,
  locale: AppLocale,
) {
  const count = clampQuestionCount(body.questionCount);
  const questionType = body.questionType ?? "mixto";
  const subtopics =
    body.subtopics?.length ? body.subtopics.join(", ") : "no specific subtopics";
  const language = aiLanguageLabel(locale);

  return `Generate an educational quiz in ${language}.

Return ONLY valid JSON with this exact shape:
{"quiz":[{"id":"q1","type":"opcion_multiple","question":"...","options":["A","B","C","D"],"answer":"exact text of the correct option"}]}

Required rules:
- Topic: ${topic}
- School level: ${level}
- Difficulty: ${difficulty}
- Requested type: ${questionType}
- Number of questions: ${count}
- Subtopics to cover: ${subtopics}
- Each question must have a unique "id" (q1, q2, ...)
- If type is "opcion_multiple": include 4 clear options and "answer" equal to the correct option text
- If type is "abierta": options may be omitted and "answer" with a brief model answer
- If type is "mixto": combine both types
- Clear wording, appropriate academic level
- No markdown or text outside JSON
- All content in ${language}`;
}

export async function POST(request: Request) {
  let body: TopicToolsBody;
  try {
    body = (await request.json()) as TopicToolsBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON in request." }, { status: 400 });
  }

  const mode = body.mode;
  const locale = normalizeAppLocale(body.locale);
  const topic = (body.topic ?? (locale === "en" ? "General topic" : locale === "pt" ? "Tópico geral" : "Tema general")).trim();
  const level = (body.level ?? "secundaria") as SchoolLevel | string;
  const difficulty = body.difficulty ?? "intermedio";
  const questionCount = clampQuestionCount(body.questionCount);
  const questionType = body.questionType ?? "mixto";
  const apiKey = process.env.OPENAI_API_KEY;
  const language = aiLanguageLabel(locale);

  if (!mode) {
    return NextResponse.json({ error: "The mode field is required." }, { status: 400 });
  }

  if (!apiKey) {
    if (mode === "subtopics") {
      return NextResponse.json({ subtopics: fallbackSubtopics(topic, locale), source: "fallback" });
    }
    if (mode === "quiz") {
      return NextResponse.json({
        quiz: buildFallbackQuiz(topic, questionCount, questionType, locale),
        source: "fallback",
        note: "No OPENAI_API_KEY: local quiz used.",
      });
    }
    return NextResponse.json({ content: fallbackTopicContent(topic, locale), source: "fallback" });
  }

  try {
    const promptByMode: Record<Mode, string> = {
      subtopics: `Return pure JSON {"subtopics":["..."]} with 6 subtopics for "${topic}" at level ${level}. All text in ${language}. JSON only, no markdown.`,
      quiz: buildQuizPrompt(body, topic, level, difficulty, locale),
      content: `Return pure JSON {"content":{"title":"...","summary":"...","examples":["..."],"references":["..."]}} for topic "${topic}", level ${level}, difficulty ${difficulty}. All text in ${language}. JSON only.`,
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
          { role: "system", content: aiJsonSystemPrompt(locale) },
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
        : fallbackSubtopics(topic, locale);
      return NextResponse.json({ subtopics, source: "openai" });
    }

    if (mode === "quiz") {
      const quiz = normalizeQuiz(parsed.quiz, topic, questionCount, questionType, locale);
      return NextResponse.json({ quiz, source: "openai" });
    }

    return NextResponse.json({
      content: (parsed.content as object) ?? fallbackTopicContent(topic, locale),
      source: "openai",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    if (mode === "subtopics") {
      return NextResponse.json({ subtopics: fallbackSubtopics(topic, locale), source: "fallback", note: message });
    }
    if (mode === "quiz") {
      return NextResponse.json({
        quiz: buildFallbackQuiz(topic, questionCount, questionType, locale),
        source: "fallback",
        note: message,
      });
    }
    return NextResponse.json({ content: fallbackTopicContent(topic, locale), source: "fallback", note: message });
  }
}
