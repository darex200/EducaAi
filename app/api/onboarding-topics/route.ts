import { NextResponse } from "next/server";
import {
  aiJsonSystemPrompt,
  aiLanguageLabel,
  fallbackOnboardingTopics,
  normalizeAppLocale,
} from "@/lib/i18n/locale-ai";

type Body = {
  subjects?: string[];
  level?: string;
  locale?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as Body;
  const subjects = body.subjects ?? [];
  const level = body.level ?? "secundaria";
  const locale = normalizeAppLocale(body.locale);
  const apiKey = process.env.OPENAI_API_KEY;
  const language = aiLanguageLabel(locale);

  if (!apiKey) {
    return NextResponse.json({ topics: fallbackOnboardingTopics(subjects, level, locale), source: "fallback" });
  }

  try {
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
          {
            role: "system",
            content: `${aiJsonSystemPrompt(locale)} Generate exactly 6 academic topics in pure JSON: {"topics":["...","..."]}. No extra text.`,
          },
          {
            role: "user",
            content: `Subjects: ${subjects.join(", ")}. Level: ${level}. All topic names in ${language}.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ topics: fallbackOnboardingTopics(subjects, level, locale), source: "fallback" });
    }

    const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const content = data.choices?.[0]?.message?.content ?? "";
    const parsed = JSON.parse(content) as { topics?: string[] };
    const topics = parsed.topics?.filter(Boolean).slice(0, 6);
    return NextResponse.json({
      topics: topics?.length ? topics : fallbackOnboardingTopics(subjects, level, locale),
      source: "openai",
    });
  } catch {
    return NextResponse.json({ topics: fallbackOnboardingTopics(subjects, level, locale), source: "fallback" });
  }
}
