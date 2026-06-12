import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUserId } from "@/lib/api-auth";

export async function GET() {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ conversations: [] });
  }

  try {
    const conversations = await prisma.conversation.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: 30,
      select: {
        id: true,
        title: true,
        topic: true,
        updatedAt: true,
        _count: { select: { messages: true } },
      },
    });

    return NextResponse.json({
      conversations: conversations.map((conversation) => ({
        id: conversation.id,
        title: conversation.title,
        topic: conversation.topic,
        updatedAt: conversation.updatedAt,
        messageCount: conversation._count.messages,
      })),
    });
  } catch (error) {
    console.error("[conversations] error:", error);
    return NextResponse.json({ conversations: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as {
      topic?: string;
      title?: string;
    };
    const conversation = await prisma.conversation.create({
      data: {
        userId,
        topic: body.topic?.trim() ?? "",
        title: body.title?.trim() || body.topic?.trim() || "Nueva conversación",
      },
      select: { id: true, title: true, topic: true, updatedAt: true },
    });
    return NextResponse.json({ conversation }, { status: 201 });
  } catch (error) {
    console.error("[conversations] error al crear:", error);
    return NextResponse.json(
      { error: "No se pudo crear la conversación." },
      { status: 500 },
    );
  }
}
