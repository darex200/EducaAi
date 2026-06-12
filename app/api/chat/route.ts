import { NextResponse } from "next/server";
import { after } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUserId, isDbConfigured } from "@/lib/api-auth";
import { buildGuidedReply, type TutorMessage, type TutorStudentContext } from "@/lib/tutor";
import {
  buildAdaptiveSystemPrompt,
  type AdaptiveContext,
} from "@/lib/ai/tutor-engine";
import { runDiagnostics } from "@/lib/ai/diagnostics";
import {
  chatCompletion,
  hasOpenAIKey,
  type OpenAIChatMessage,
} from "@/lib/ai/openai";

type ChatRequestBody = {
  messages?: TutorMessage[];
  context?: TutorStudentContext;
  conversationId?: string;
};

function mapToOpenAIMessages(messages: TutorMessage[]): OpenAIChatMessage[] {
  return messages.map((message) => {
    if (message.role === "assistant") {
      return { role: "assistant", content: message.content };
    }

    if (message.imageDataUrl) {
      return {
        role: "user",
        content: [
          { type: "text", text: message.content || "Analiza esta imagen y guíame como tutor." },
          { type: "image_url", image_url: { url: message.imageDataUrl } },
        ],
      };
    }

    return { role: "user", content: message.content };
  });
}

function normalizeMathFormatting(text: string) {
  return text
    .replace(/\\\(([\s\S]*?)\\\)/g, (_match, expr: string) => `$${expr.trim()}$`)
    .replace(/\\\[([\s\S]*?)\\\]/g, (_match, expr: string) => `$$${expr.trim()}$$`)
    .replace(/^\s*\*{3,}\s*$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function loadAdaptiveContext(
  userId: string,
  topic: string,
  hasImage: boolean,
): Promise<AdaptiveContext> {
  const [user, profile, mastery] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, birthYear: true, academicLevel: true },
    }),
    prisma.learningProfile.findUnique({ where: { userId } }),
    topic
      ? prisma.topicMastery.findUnique({
          where: { userId_topic: { userId, topic } },
          select: {
            masteryScore: true,
            status: true,
            errorCount: true,
            interactions: true,
          },
        })
      : Promise.resolve(null),
  ]);

  return {
    student: user,
    profile: profile
      ? {
          subjects: profile.subjects,
          goals: profile.goals,
          difficulty: profile.difficulty,
          strengths: profile.strengths,
          weaknesses: profile.weaknesses,
          commonErrors: Array.isArray(profile.commonErrors)
            ? (profile.commonErrors as Array<{ error: string; topic?: string }>)
            : [],
        }
      : null,
    mastery,
    topic,
    hasImage,
  };
}

async function resolveConversation(
  userId: string,
  conversationId: string | undefined,
  topic: string,
  firstUserText: string,
) {
  if (conversationId) {
    const existing = await prisma.conversation.findFirst({
      where: { id: conversationId, userId },
      select: { id: true },
    });
    if (existing) return existing.id;
  }

  const created = await prisma.conversation.create({
    data: {
      userId,
      topic,
      title: firstUserText.slice(0, 60) || topic || "Nueva conversación",
    },
    select: { id: true },
  });
  return created.id;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ChatRequestBody;
    const messages = body.messages ?? [];
    const context = body.context;
    const latestMessages = messages.slice(-12);
    const lastUserMessage = [...latestMessages]
      .reverse()
      .find((message) => message.role === "user");
    const hasImage = latestMessages.some((message) => Boolean(message.imageDataUrl));
    const topic = (context?.topic ?? "").trim();

    const userId = await getAuthUserId();
    let conversationId: string | null = null;

    // Persistencia del mensaje del estudiante.
    if (userId && lastUserMessage) {
      conversationId = await resolveConversation(
        userId,
        body.conversationId ?? context?.conversationId,
        topic,
        lastUserMessage.content,
      );
      await prisma.message.create({
        data: {
          conversationId,
          role: "user",
          content: lastUserMessage.content,
          imageUrl: lastUserMessage.imageDataUrl ?? null,
        },
      });
    }

    // Prompt adaptativo: con BD usa perfil/mastery reales; sin BD usa el contexto del cliente.
    const adaptiveContext: AdaptiveContext = userId
      ? await loadAdaptiveContext(userId, topic, hasImage)
      : {
          student: { academicLevel: context?.level || null },
          profile: { subjects: context?.subjects, difficulty: context?.difficulty },
          mastery: null,
          topic,
          hasImage,
        };

    let reply: string | null = null;
    let mode = "guided";
    let note: string | undefined;

    if (hasOpenAIKey()) {
      const modelReply = await chatCompletion(
        [
          { role: "system", content: buildAdaptiveSystemPrompt(adaptiveContext) },
          ...mapToOpenAIMessages(latestMessages),
        ],
        { temperature: 0.35 },
      );
      if (modelReply) {
        reply = normalizeMathFormatting(modelReply);
        mode = "openai";
      } else {
        note = "La solicitud a OpenAI falló; se usó el modo guiado local.";
        mode = "guided-fallback";
      }
    } else {
      note = "Define OPENAI_API_KEY para habilitar respuestas IA en vivo con texto e imagen.";
    }

    if (!reply) {
      reply = buildGuidedReply(latestMessages, context);
    }

    // Persistencia de la respuesta + diagnóstico sin bloquear la respuesta.
    if (userId && conversationId) {
      const finalReply = reply;
      const finalConversationId = conversationId;
      await prisma.message.create({
        data: {
          conversationId: finalConversationId,
          role: "assistant",
          content: finalReply,
        },
      });
      await prisma.conversation.update({
        where: { id: finalConversationId },
        data: { updatedAt: new Date(), ...(topic ? { topic } : {}) },
      });

      if (lastUserMessage && mode === "openai") {
        after(() =>
          runDiagnostics({
            userId,
            topic,
            userMessage: lastUserMessage.content,
            assistantReply: finalReply,
          }),
        );
      }
    }

    return NextResponse.json({
      reply,
      conversationId,
      meta: { mode, ...(note ? { note } : {}), persisted: Boolean(conversationId) },
    });
  } catch (error) {
    console.error("[chat] error:", error);
    return NextResponse.json(
      {
        reply: "Tuve un problema temporal. Reenvia tu pregunta y te guiare paso a paso.",
        meta: { mode: "error", dbConfigured: isDbConfigured() },
      },
      { status: 500 },
    );
  }
}
