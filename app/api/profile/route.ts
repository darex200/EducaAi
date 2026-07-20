import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getAuthUserId } from "@/lib/api-auth";

const patchSchema = z.object({
  subjects: z.array(z.string().trim().max(80)).max(20).optional(),
  level: z.string().trim().max(40).optional(),
  topic: z.string().trim().max(120).optional(),
  topicId: z.string().trim().max(80).optional(),
  difficulty: z.enum(["basico", "intermedio", "avanzado"]).optional(),
  generatedTopics: z.array(z.string().trim().max(120)).max(30).optional(),
  goals: z.string().trim().max(400).optional(),
  birthYear: z
    .number()
    .int()
    .min(1930)
    .max(new Date().getFullYear())
    .nullable()
    .optional(),
});

async function loadProfilePayload(userId: string) {
  const [user, profile] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
        birthYear: true,
        academicLevel: true,
      },
    }),
    prisma.learningProfile.upsert({
      where: { userId },
      create: { userId },
      update: {},
    }),
  ]);

  return {
    user,
    profile: {
      subjects: profile.subjects,
      level: user?.academicLevel ?? "",
      topic: profile.currentTopic,
      topicId: profile.currentTopicId,
      difficulty: profile.difficulty as "basico" | "intermedio" | "avanzado",
      generatedTopics: profile.generatedTopics,
      goals: profile.goals ?? "",
      strengths: profile.strengths,
      weaknesses: profile.weaknesses,
    },
  };
}

export async function GET() {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  try {
    return NextResponse.json(await loadProfilePayload(userId));
  } catch (error) {
    console.error("[profile] error:", error);
    return NextResponse.json(
      { error: "No se pudo cargar el perfil." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  try {
    const parsed = patchSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
    }

    const { subjects, level, topic, topicId, difficulty, generatedTopics, goals, birthYear } =
      parsed.data;

    await prisma.$transaction([
      prisma.learningProfile.upsert({
        where: { userId },
        create: {
          userId,
          subjects: subjects ?? [],
          currentTopic: topic ?? "",
          currentTopicId: topicId ?? "",
          difficulty: difficulty ?? "basico",
          generatedTopics: generatedTopics ?? [],
          goals,
        },
        update: {
          ...(subjects !== undefined ? { subjects } : {}),
          ...(topic !== undefined ? { currentTopic: topic } : {}),
          ...(topicId !== undefined ? { currentTopicId: topicId } : {}),
          ...(difficulty !== undefined ? { difficulty } : {}),
          ...(generatedTopics !== undefined ? { generatedTopics } : {}),
          ...(goals !== undefined ? { goals } : {}),
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          ...(level !== undefined ? { academicLevel: level || null } : {}),
          ...(birthYear !== undefined ? { birthYear } : {}),
        },
      }),
    ]);

    return NextResponse.json(await loadProfilePayload(userId));
  } catch (error) {
    console.error("[profile] error al guardar:", error);
    return NextResponse.json(
      { error: "No se pudo guardar el perfil." },
      { status: 500 },
    );
  }
}
