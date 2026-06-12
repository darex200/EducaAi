import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUserId } from "@/lib/api-auth";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const { id } = await params;

  try {
    const conversation = await prisma.conversation.findFirst({
      where: { id, userId },
      select: {
        id: true,
        title: true,
        topic: true,
        messages: {
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            role: true,
            content: true,
            imageUrl: true,
            createdAt: true,
          },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: "Conversación no encontrada." }, { status: 404 });
    }

    return NextResponse.json({ conversation });
  } catch (error) {
    console.error("[conversations:id] error:", error);
    return NextResponse.json(
      { error: "No se pudo cargar la conversación." },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const { id } = await params;

  try {
    await prisma.conversation.deleteMany({ where: { id, userId } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[conversations:id] error al borrar:", error);
    return NextResponse.json(
      { error: "No se pudo eliminar la conversación." },
      { status: 500 },
    );
  }
}
