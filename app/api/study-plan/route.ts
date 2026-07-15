import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getAuthUserId, isDbConfigured } from "@/lib/api-auth";
import { generateStudyPlan, type GeneratedStudyPlan } from "@/lib/ai/planner";
import { bumpStudySession } from "@/lib/study-session";

const requestSchema = z.object({
  examDate: z.string().trim().optional(),
  hoursPerWeek: z.number().min(1).max(60).default(5),
  goal: z.string().trim().max(300).optional(),
  locale: z.enum(["en", "es", "pt"]).optional(),
});

export async function GET() {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ plan: null });
  }

  try {
    const latest = await prisma.studyPlan.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    if (!latest) return NextResponse.json({ plan: null });
    return NextResponse.json({
      plan: latest.plan as unknown as GeneratedStudyPlan,
      examDate: latest.examDate,
      hoursPerWeek: latest.hoursPerWeek,
      goal: latest.goal,
      createdAt: latest.createdAt,
    });
  } catch (error) {
    console.error("[study-plan] error:", error);
    return NextResponse.json({ plan: null }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isDbConfigured()) {
    return NextResponse.json(
      { error: "Configura la base de datos para generar planes personalizados." },
      { status: 503 },
    );
  }

  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  try {
    const parsed = requestSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
    }
    const { examDate, hoursPerWeek, goal, locale } = parsed.data;

    const [user, profile, masteries] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { academicLevel: true },
      }),
      prisma.learningProfile.findUnique({
        where: { userId },
        select: { generatedTopics: true, currentTopic: true },
      }),
      prisma.topicMastery.findMany({
        where: { userId },
        select: { topic: true, status: true, masteryScore: true },
      }),
    ]);

    const weakTopics = masteries
      .filter((m) => m.status === "debil" || m.masteryScore < 40)
      .map((m) => m.topic)
      .slice(0, 8);
    const masteredTopics = masteries
      .filter((m) => m.status === "dominado")
      .map((m) => m.topic)
      .slice(0, 8);
    const known = new Set(masteries.map((m) => m.topic));
    const pendingTopics = [
      ...(profile?.currentTopic ? [profile.currentTopic] : []),
      ...(profile?.generatedTopics ?? []),
    ]
      .filter((topic) => topic && !known.has(topic))
      .slice(0, 8);

    const { plan, source } = await generateStudyPlan({
      level: user?.academicLevel,
      examDate: examDate || null,
      hoursPerWeek,
      goal,
      weakTopics,
      pendingTopics,
      masteredTopics,
      locale,
    });

    const saved = await prisma.studyPlan.create({
      data: {
        userId,
        examDate: examDate ? new Date(examDate) : null,
        hoursPerWeek,
        goal: goal ?? "",
        plan: plan as unknown as object,
      },
      select: { id: true, createdAt: true },
    });

    await bumpStudySession(userId, 1);

    return NextResponse.json({
      plan,
      planId: saved.id,
      source,
      weakTopics,
      pendingTopics,
    });
  } catch (error) {
    console.error("[study-plan] error al generar:", error);
    return NextResponse.json(
      { error: "No se pudo generar el plan de estudio." },
      { status: 500 },
    );
  }
}
