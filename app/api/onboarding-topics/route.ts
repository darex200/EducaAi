import { NextResponse } from "next/server";

type Body = {
  subjects?: string[];
  level?: string;
};

function fallbackTopics(subjects: string[], level: string) {
  const subject = subjects[0] || "Aprendizaje general";
  const bySubject: Record<string, string[]> = {
    Matematicas: ["Álgebra básica", "Fracciones y proporciones", "Ecuaciones lineales"],
    Fisica: ["Movimiento y velocidad", "Fuerza y energía", "Leyes de Newton"],
    Quimica: ["Estructura atómica", "Enlaces químicos", "Reacciones básicas"],
    Lenguaje: ["Comprensión lectora", "Estructura textual", "Análisis gramatical"],
    Biologia: ["Célula", "Fotosíntesis", "Ecosistemas"],
    Historia: ["Líneas del tiempo", "Causas y consecuencias", "Fuentes históricas"],
  };

  return bySubject[subject] ?? [`Fundamentos de ${subject}`, `Ejercicios de ${subject}`, `Repaso de ${level}`];
}

export async function POST(request: Request) {
  const body = (await request.json()) as Body;
  const subjects = body.subjects ?? [];
  const level = body.level ?? "secundaria";
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ topics: fallbackTopics(subjects, level), source: "fallback" });
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
            content:
              "Genera exactamente 6 temas académicos en español, en formato JSON puro: {\"topics\":[\"...\",\"...\"]}. Sin texto adicional.",
          },
          {
            role: "user",
            content: `Materias: ${subjects.join(", ")}. Nivel: ${level}.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ topics: fallbackTopics(subjects, level), source: "fallback" });
    }

    const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const content = data.choices?.[0]?.message?.content ?? "";
    const parsed = JSON.parse(content) as { topics?: string[] };
    const topics = parsed.topics?.filter(Boolean).slice(0, 6);
    return NextResponse.json({ topics: topics?.length ? topics : fallbackTopics(subjects, level), source: "openai" });
  } catch {
    return NextResponse.json({ topics: fallbackTopics(subjects, level), source: "fallback" });
  }
}
