import { NextResponse } from "next/server";
import { getAuthUserId, isDbConfigured } from "@/lib/api-auth";
import { getProgressSummary } from "@/lib/progress";

export async function GET() {
  if (!isDbConfigured()) {
    return NextResponse.json(
      { error: "Configura la base de datos (DATABASE_URL) para ver tu progreso." },
      { status: 503 },
    );
  }

  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  try {
    const summary = await getProgressSummary(userId);
    return NextResponse.json(summary);
  } catch (error) {
    console.error("[progress] error:", error);
    return NextResponse.json(
      { error: "No se pudo calcular el progreso." },
      { status: 500 },
    );
  }
}
