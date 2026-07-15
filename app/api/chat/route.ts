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
  buildEducationalImagePrompt,
  generateEducationalImage,
  wantsImageGeneration,
} from "@/lib/ai/images";
import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  type AppLocale,
  t,
} from "@/lib/i18n/translations";
import { detectLocaleFromMessages } from "@/lib/i18n/detect-locale";
import {
  chatCompletion,
  hasOpenAIKey,
  type OpenAIChatMessage,
} from "@/lib/ai/openai";

type ChatRequestBody = {
  messages?: TutorMessage[];
  context?: TutorStudentContext;
  conversationId?: string;
  generateImage?: boolean;
};

function normalizeLocale(value?: string): AppLocale {
  return SUPPORTED_LOCALES.includes(value as AppLocale) ? (value as AppLocale) : DEFAULT_LOCALE;
}

function mapToOpenAIMessages(messages: TutorMessage[], locale: AppLocale): OpenAIChatMessage[] {
  return messages.map((message) => {
    if (message.role === "assistant") {
      return { role: "assistant", content: message.content };
    }

    if (message.imageDataUrl) {
      return {
        role: "user",
        content: [
          {
            type: "text",
            text: message.content || t(locale, "analyzeImageTutorPrompt"),
          },
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
  let locale: AppLocale = DEFAULT_LOCALE;
  try {
    const body = (await request.json()) as ChatRequestBody;
    const messages = body.messages ?? [];
    const context = body.context;
    const uiLocale = normalizeLocale(context?.locale);
    const latestMessages = messages.slice(-12);
    const locale = detectLocaleFromMessages(latestMessages, uiLocale);
    const lastUserMessage = [...latestMessages]
      .reverse()
      .find((message) => message.role === "user");
    const hasImage = latestMessages.some((message) => Boolean(message.imageDataUrl));
    const topic = (context?.topic ?? "").trim();

    const userId = await getAuthUserId();
    let conversationId: string | null = null;

    // Persistencia del mensaje del estudiante (no debe bloquear la respuesta del tutor).
    if (userId && lastUserMessage) {
      try {
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
      } catch (persistError) {
        console.error("[chat] persistencia del mensaje falló:", persistError);
        conversationId = null;
      }
    }

    // Prompt adaptativo: con BD usa perfil/mastery reales; sin BD usa el contexto del cliente.
    let adaptiveContext: AdaptiveContext;
    if (userId) {
      try {
        adaptiveContext = { ...(await loadAdaptiveContext(userId, topic, hasImage)), locale };
      } catch (profileError) {
        console.error("[chat] no se pudo cargar perfil adaptativo:", profileError);
        adaptiveContext = {
          student: { academicLevel: context?.level || null },
          profile: { subjects: context?.subjects, difficulty: context?.difficulty },
          mastery: null,
          topic,
          hasImage,
          locale,
        };
      }
    } else {
      adaptiveContext = {
        student: { academicLevel: context?.level || null },
        profile: { subjects: context?.subjects, difficulty: context?.difficulty },
        mastery: null,
        topic,
        hasImage,
        locale,
      };
    }

    let reply: string | null = null;
    let generatedImageUrl: string | null = null;
    let mode = "guided";
    let note: string | undefined;

    const shouldGenerateImage =
      Boolean(lastUserMessage?.content) &&
      !hasImage &&
      (body.generateImage === true || wantsImageGeneration(lastUserMessage!.content));

    if (shouldGenerateImage && hasOpenAIKey()) {
      const imagePrompt = buildEducationalImagePrompt(lastUserMessage!.content, topic, locale);
      const imageResult = await generateEducationalImage(imagePrompt);

      if (imageResult?.url) {
        generatedImageUrl = imageResult.url;
        reply = topic
          ? t(locale, "imageReplyWithTopic", { topic })
          : t(locale, "imageReply");
        mode = "openai-image";
      } else {
        reply = t(locale, "imageGenerationFailed");
        mode = "openai-image-error";
      }
    } else if (shouldGenerateImage && !hasOpenAIKey()) {
      reply = t(locale, "imageApiKeyMissing");
      mode = "image-unconfigured";
    }

    if (!reply && hasOpenAIKey()) {
      const modelReply = await chatCompletion(
        [
          { role: "system", content: buildAdaptiveSystemPrompt(adaptiveContext) },
          ...mapToOpenAIMessages(latestMessages, locale),
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
    } else if (!reply && !hasOpenAIKey()) {
      note = "Define OPENAI_API_KEY para habilitar respuestas IA en vivo con texto e imagen.";
    }

    if (!reply) {
      reply = buildGuidedReply(latestMessages, { ...context, locale });
    }

    // Persistencia de la respuesta + diagnóstico sin bloquear la respuesta.
    if (userId && conversationId) {
      const finalReply = reply ?? "";
      const finalConversationId = conversationId;
      try {
        await prisma.message.create({
          data: {
            conversationId: finalConversationId,
            role: "assistant",
            content: finalReply ?? "",
            imageUrl: generatedImageUrl,
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
      } catch (persistError) {
        console.error("[chat] persistencia de la respuesta falló:", persistError);
      }
    }

    return NextResponse.json({
      reply,
      generatedImageUrl,
      conversationId,
      meta: {
        mode,
        locale,
        uiLocale,
        ...(note ? { note } : {}),
        persisted: Boolean(conversationId),
        dbConfigured: isDbConfigured(),
      },
    });
  } catch (error) {
    console.error("[chat] error:", error);
    return NextResponse.json(
      {
        reply: t(locale, "chatErrorFallback"),
        meta: { mode: "error", dbConfigured: isDbConfigured() },
      },
      { status: 500 },
    );
  }
}
