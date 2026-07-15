import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUserId, isDbConfigured } from "@/lib/api-auth";
import { hasOpenAIKey } from "@/lib/ai/openai";
import {
  analyzeImageDocument,
  analyzePdfText,
  buildAnalysisMarkdown,
  type DocumentAnalysis,
} from "@/lib/ai/documents";
import { uploadDocument } from "@/lib/supabase";
import { bumpStudySession } from "@/lib/study-session";
import { validateDocumentUpload } from "@/lib/security/upload-validation";

async function extractPdfText(buffer: ArrayBuffer): Promise<string> {
  const { extractText, getDocumentProxy } = await import("unpdf");
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const { text } = await extractText(pdf, { mergePages: true });
  return typeof text === "string" ? text : String(text ?? "");
}

async function persistDocument(params: {
  userId: string;
  fileName: string;
  kind: "image" | "pdf";
  contentType: string;
  buffer: ArrayBuffer;
  analysis: DocumentAnalysis;
}) {
  const { userId, fileName, kind, contentType, buffer, analysis } = params;
  try {
    const storageUrl = await uploadDocument(userId, fileName, buffer, contentType);
    const document = await prisma.document.create({
      data: {
        userId,
        fileName,
        kind,
        storageUrl: storageUrl ?? "",
        extractedText: analysis.extractedText.slice(0, 20000),
        detectedTopics: analysis.topics,
        summary: analysis.summary,
        analysis: analysis as unknown as object,
      },
      select: { id: true },
    });

    // Registra los temas detectados como temas "nuevos" si no existen.
    for (const topic of analysis.topics.slice(0, 5)) {
      await prisma.topicMastery
        .upsert({
          where: { userId_topic: { userId, topic } },
          create: { userId, topic, status: "nuevo" },
          update: {},
        })
        .catch(() => null);
    }

    await bumpStudySession(userId, 3, analysis.topics[0]);
    return document.id;
  } catch (error) {
    console.error("[documents] no se pudo persistir:", error);
    return null;
  }
}

export async function POST(request: Request) {
  try {
    if (!hasOpenAIKey()) {
      return NextResponse.json(
        { error: "Define OPENAI_API_KEY para habilitar el análisis de documentos." },
        { status: 503 },
      );
    }

    const userId = await getAuthUserId();
    if (isDbConfigured() && !userId) {
      return NextResponse.json(
        { error: "Inicia sesión para subir documentos." },
        { status: 401 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const topic = String(formData.get("topic") ?? "").trim().slice(0, 120);

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No se recibió ningún archivo." }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const validation = validateDocumentUpload(file, buffer);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 415 });
    }

    const { kind, contentType, safeName } = validation;
    let analysis: DocumentAnalysis | null = null;

    if (kind === "image") {
      const base64 = Buffer.from(buffer).toString("base64");
      const dataUrl = `data:${contentType};base64,${base64}`;
      analysis = await analyzeImageDocument(dataUrl, { topic });
    } else {
      const text = await extractPdfText(buffer);
      if (!text.trim()) {
        return NextResponse.json(
          { error: "No se pudo extraer texto del PDF (¿es un PDF escaneado sin OCR?)." },
          { status: 422 },
        );
      }
      analysis = await analyzePdfText(text, { topic, fileName: safeName });
    }

    if (!analysis) {
      return NextResponse.json(
        { error: "La IA no pudo analizar el documento. Intenta de nuevo." },
        { status: 502 },
      );
    }

    const markdown = buildAnalysisMarkdown(safeName, analysis);

    let documentId: string | null = null;
    if (userId) {
      documentId = await persistDocument({
        userId,
        fileName: safeName,
        kind,
        contentType,
        buffer,
        analysis,
      });
    }

    return NextResponse.json({ markdown, analysis, documentId });
  } catch (error) {
    console.error("[documents] error:", error);
    return NextResponse.json(
      { error: "No se pudo analizar el documento." },
      { status: 500 },
    );
  }
}

export async function GET() {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ documents: [] });
  }

  try {
    const documents = await prisma.document.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 30,
      select: {
        id: true,
        fileName: true,
        kind: true,
        summary: true,
        detectedTopics: true,
        storageUrl: true,
        createdAt: true,
      },
    });
    return NextResponse.json({ documents });
  } catch (error) {
    console.error("[documents] error al listar:", error);
    return NextResponse.json({ documents: [] }, { status: 500 });
  }
}
