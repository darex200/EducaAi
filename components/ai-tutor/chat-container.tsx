"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AppLayout } from "@/components/chat/app-layout";
import { Sidebar, type ConversationSummary } from "@/components/chat/sidebar";
import { ChatWindow } from "@/components/chat/chat-window";
import { ChatInput } from "@/components/chat/chat-input";
import { QuizModal } from "@/components/chat/quiz-modal";
import { ContentViewer } from "@/components/chat/content-viewer";
import { GuidedPractice } from "@/components/chat/guided-practice";
import { TopicSelector } from "@/components/onboarding/topic-selector";
import { useAuth } from "@/context/auth-context";
import { useLanguage } from "@/context/language-context";
import { useLearning } from "@/context/learning-context";
import type { TutorMessage } from "@/components/ai-tutor/types";
import { wantsImageGeneration } from "@/lib/ai/image-intent";
import { difficultyLabel, academicLevelLabel } from "@/lib/i18n/translations";
import { topicCategoryKeys, type TopicCategoryKey } from "@/lib/i18n/locale-ai";
import { getLessonBySlug, getLessons } from "@/lib/lessons";
import type { TopicItem } from "@/components/chat/topic-card";
import {
  useLocalizedGeneratedTopics,
} from "@/hooks/use-localized-generated-topics";
import { detectFileKind, validateDocumentUpload } from "@/lib/security/upload-validation";
import {
  resolveCustomTopicId,
  resolveTopicId,
  resolveTopicIdFromLabel,
} from "@/lib/topics/selection";

const ACTIVE_CONVERSATION_KEY = "educa-ai-active-conversation";

function isLegacyWelcomeMessage(message: TutorMessage) {
  return (
    message.role === "assistant" &&
    (message.id === "assistant-welcome" ||
      /^Hola\. Veo que estás estudiando/i.test(message.content.trim()))
  );
}

function toDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function ChatContainer() {
  const pathname = usePathname();
  const embedded = pathname.startsWith("/dashboard");
  const { user, logout } = useAuth();
  const { profile, setProfile } = useLearning();
  const { locale, t } = useLanguage();
  const [messages, setMessages] = useState<TutorMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("educa-ai-dark-mode") === "1";
  });
  const [showTopicSelector, setShowTopicSelector] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isContentLoading, setIsContentLoading] = useState(false);
  const [showGuidedPractice, setShowGuidedPractice] = useState(false);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [isAnalyzingDocument, setIsAnalyzingDocument] = useState(false);
  const [contentEntry, setContentEntry] = useState<{
    locale: typeof locale;
    data: {
      title?: string;
      summary?: string;
      examples?: string[];
      references?: string[];
      articles?: string[];
      explanations?: string[];
    };
  } | null>(null);
  const content = contentEntry?.locale === locale ? contentEntry.data : null;
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const localizedGeneratedTopics = useLocalizedGeneratedTopics({
    subjects: profile.subjects,
    level: profile.level,
    storedTopics: profile.generatedTopics,
    locale,
  });
  const dynamicTopics = useMemo<TopicItem[]>(
    () => {
      const categoryKeys = topicCategoryKeys();
      const lessonTopics = getLessons(locale).map((lesson, index) => ({
        id: lesson.slug,
        lessonSlug: lesson.slug,
        title: lesson.title,
        description: lesson.explanation,
        categoryKey: categoryKeys[index % categoryKeys.length] as TopicCategoryKey,
        category: "",
        difficulty: (["basico", "intermedio", "avanzado"] as const)[index % 3],
      }));
      const customTopics = localizedGeneratedTopics.map((topic, index) => ({
        id: `topic-custom-${index}`,
        title: topic,
        description: "",
        categoryKey: "categoryCustom" as const,
        category: "",
        difficulty: profile.difficulty,
      }));

      const seenIds = new Set<string>();
      return [...customTopics, ...lessonTopics].filter((topic) => {
        if (seenIds.has(topic.id)) return false;
        seenIds.add(topic.id);
        return true;
      });
    },
    [locale, localizedGeneratedTopics, profile.difficulty],
  );
  const selectedTopicId = useMemo(
    () =>
      resolveTopicId({
        topicId: profile.topicId,
        topicLabel: profile.topic,
        generatedTopics: profile.generatedTopics,
        topics: dynamicTopics,
      }),
    [profile.topicId, profile.topic, profile.generatedTopics, dynamicTopics],
  );
  const endRef = useRef<HTMLDivElement | null>(null);
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const documentInputRef = useRef<HTMLInputElement | null>(null);
  const selectedTopic = useMemo(
    () => dynamicTopics.find((topic) => topic.id === selectedTopicId),
    [dynamicTopics, selectedTopicId],
  );
  const hasExplicitTopic = Boolean(selectedTopic);
  const activeTopicTitle = useMemo(() => {
    if (!selectedTopic) return "";
    if (selectedTopic.lessonSlug) {
      return getLessonBySlug(selectedTopic.lessonSlug, locale)?.title ?? selectedTopic.title;
    }
    return selectedTopic.title;
  }, [selectedTopic, locale]);
  const activeDifficulty = selectedTopic
    ? difficultyLabel(locale, selectedTopic.difficulty)
    : t("difficultyNotSet");

  const refreshConversations = useCallback(async () => {
    try {
      const response = await fetch("/api/conversations");
      if (!response.ok) return;
      const data = (await response.json()) as { conversations?: ConversationSummary[] };
      setConversations(data.conversations ?? []);
    } catch {
      // modo demo o sin red: el historial queda vacío
    }
  }, []);

  const loadConversation = useCallback(
    async (id: string) => {
      try {
        const response = await fetch(`/api/conversations/${id}`);
        if (!response.ok) return false;
        const data = (await response.json()) as {
          conversation?: {
            id: string;
            topic: string;
            messages: Array<{
              id: string;
              role: "user" | "assistant";
              content: string;
              imageUrl?: string | null;
            }>;
          };
        };
        if (!data.conversation) return false;
        const loaded: TutorMessage[] = data.conversation.messages
          .map((message) => ({
            id: message.id,
            role: message.role,
            content: message.content,
            imageDataUrl: message.role === "user" ? message.imageUrl ?? undefined : undefined,
            generatedImageUrl: message.role === "assistant" ? message.imageUrl ?? undefined : undefined,
          }))
          .filter((message) => !isLegacyWelcomeMessage(message));
        setMessages(loaded);
        setConversationId(id);
        setError(null);
        setContentEntry(null);
        setShowGuidedPractice(false);

        if (data.conversation.topic) {
          const topicId = resolveTopicIdFromLabel(
            data.conversation.topic,
            profile.generatedTopics,
            dynamicTopics,
          );
          if (topicId) {
            const nextTopic = dynamicTopics.find((topic) => topic.id === topicId);
            if (nextTopic) {
              setProfile({
                topicId,
                topic: nextTopic.title,
                difficulty: nextTopic.difficulty,
              });
            }
          }
        }

        return true;
      } catch {
        return false;
      }
    },
    [dynamicTopics, profile.generatedTopics, setProfile],
  );

  // Limpia caché antigua del chat en localStorage (ya no se usa).
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.removeItem("educa-ai-chat-state");
  }, []);

  // Al entrar con sesión: carga el historial de conversaciones.
  useEffect(() => {
    if (!user?.id) return;
    const timer = window.setTimeout(() => {
      void refreshConversations();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [user?.id, refreshConversations]);

  const scrollChatToBottom = (behavior: ScrollBehavior = "smooth") => {
    const node = bodyRef.current;
    if (!node) return;
    node.scrollTo({ top: node.scrollHeight, behavior });
  };

  useEffect(() => {
    if (!shouldAutoScroll) return;
    const frame = requestAnimationFrame(() => scrollChatToBottom("smooth"));
    return () => cancelAnimationFrame(frame);
  }, [messages, isSending, shouldAutoScroll]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setConversationId(null);
    setError(null);
    setContentEntry(null);
    setShowGuidedPractice(false);
  }, []);

  const handleSelectTopic = useCallback(
    (topicId: string) => {
      if (!topicId || topicId === selectedTopicId) return;
      const nextTopic = dynamicTopics.find((topic) => topic.id === topicId);
      if (!nextTopic) return;

      setProfile({
        topicId,
        topic: nextTopic.title,
        difficulty: nextTopic.difficulty,
      });
      clearChat();
      setContentEntry(null);
      setShowGuidedPractice(false);
    },
    [clearChat, dynamicTopics, selectedTopicId, setProfile],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("educa-ai-dark-mode", isDarkMode ? "1" : "0");
  }, [isDarkMode]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (conversationId) {
      localStorage.setItem(ACTIVE_CONVERSATION_KEY, conversationId);
    } else {
      localStorage.removeItem(ACTIVE_CONVERSATION_KEY);
    }
  }, [conversationId]);

  useEffect(() => {
    scrollChatToBottom("smooth");
  }, [selectedTopicId]);

  useEffect(() => {
    if (profile.topicId) return;
    const legacyTopicId = resolveTopicIdFromLabel(
      profile.topic,
      profile.generatedTopics,
      dynamicTopics,
    );
    if (!legacyTopicId) return;
    const topic = dynamicTopics.find((item) => item.id === legacyTopicId);
    if (!topic) return;
    setProfile({ topicId: legacyTopicId, topic: topic.title });
  }, [profile.topicId, profile.topic, profile.generatedTopics, dynamicTopics, setProfile]);

  useEffect(() => {
    if (!profile.topicId) return;
    const topic = dynamicTopics.find((item) => item.id === profile.topicId);
    if (!topic || topic.title === profile.topic) return;
    setProfile({ topic: topic.title });
  }, [profile.topicId, profile.topic, dynamicTopics, setProfile]);

  useEffect(() => {
    if (selectedTopicId || !dynamicTopics.length) return;
    const first = dynamicTopics[0];
    setProfile({
      topicId: first.id,
      topic: first.title,
      difficulty: first.difficulty,
    });
  }, [selectedTopicId, dynamicTopics, setProfile]);

  const requireTopic = useCallback(() => {
    if (selectedTopic) return selectedTopic;
    if (dynamicTopics[0]) {
      const first = dynamicTopics[0];
      setProfile({
        topicId: first.id,
        topic: first.title,
        difficulty: first.difficulty,
      });
      return first;
    }
    setError(t("selectTopicFirst"));
    setShowTopicSelector(true);
    return null;
  }, [dynamicTopics, selectedTopic, setProfile, t]);

  const handleSend = async ({
    text,
    imageFile,
  }: {
    text: string;
    imageFile: File | null;
  }) => {
    const imageDataUrl = imageFile ? await toDataUrl(imageFile) : undefined;
    const userMessage: TutorMessage = {
      id: `user-${crypto.randomUUID()}`,
      role: "user",
      content: text || t("analyzeImagePrompt"),
      imageDataUrl,
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setIsSending(true);
    setError(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          generateImage: wantsImageGeneration(text),
          messages: nextMessages.map((message) => ({
            role: message.role,
            content: message.content,
            imageDataUrl: message.imageDataUrl,
          })),
          context: {
            subjects: profile.subjects,
            level: profile.level,
            topic: activeTopicTitle,
            difficulty: selectedTopic?.difficulty ?? profile.difficulty,
            conversationId: conversationId ?? undefined,
            locale,
          },
        }),
      });

      const data = (await response.json()) as {
        reply?: string;
        generatedImageUrl?: string | null;
        conversationId?: string | null;
        meta?: { mode?: string; note?: string };
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? t("chatError"));
      }

      const assistantMessage: TutorMessage = {
        id: `assistant-${crypto.randomUUID()}`,
        role: "assistant",
        content: data.reply ?? t("chatEmptyReply"),
        generatedImageUrl: data.generatedImageUrl ?? undefined,
      };
      setMessages((current) => [...current, assistantMessage]);
      if (data.conversationId && data.conversationId !== conversationId) {
        setConversationId(data.conversationId);
      }
      if (data.conversationId) {
        void refreshConversations();
      }
      if (
        data.meta?.mode === "guided-fallback" ||
        data.meta?.mode === "image-unconfigured" ||
        data.meta?.mode === "openai-image-error"
      ) {
        setError(t("openaiUnavailable"));
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      setError(message.includes("API") ? t("chatError") : t("chatErrorNetwork"));
    } finally {
      setIsSending(false);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setConversationId(null);
    setError(null);
    setContentEntry(null);
    setShowGuidedPractice(false);
  };

  const handleDeleteConversation = async (id: string) => {
    setConversations((current) => current.filter((conversation) => conversation.id !== id));
    if (id === conversationId) {
      clearChat();
    }
    try {
      await fetch(`/api/conversations/${id}`, { method: "DELETE" });
    } catch {
      void refreshConversations();
    }
  };

  const handleAnalyzeDocument = async (file: File) => {
    setIsAnalyzingDocument(true);
    setError(null);

    const buffer = await file.arrayBuffer();
    const basicValidation = validateDocumentUpload(file, buffer);
    if (!basicValidation.ok) {
      setError(basicValidation.error);
      setIsAnalyzingDocument(false);
      return;
    }

    if (detectFileKind(buffer) !== basicValidation.kind) {
      setError(t("documentMimeMismatch"));
      setIsAnalyzingDocument(false);
      return;
    }

    const placeholder: TutorMessage = {
      id: `user-${crypto.randomUUID()}`,
      role: "user",
      content: t("documentUploaded", { name: basicValidation.safeName }),
    };
    setMessages((current) => [...current, placeholder]);

    try {
      const formData = new FormData();
      formData.append("file", file, basicValidation.safeName);
      formData.append("topic", activeTopicTitle);
      const response = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      });
      const data = (await response.json()) as {
        markdown?: string;
        error?: string;
      };
      if (!response.ok || !data.markdown) {
        throw new Error(data.error ?? t("documentAnalyzeError"));
      }
      setMessages((current) => [
        ...current,
        {
          id: `assistant-${crypto.randomUUID()}`,
          role: "assistant",
          content: data.markdown!,
        },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("documentAnalyzeError"));
    } finally {
      setIsAnalyzingDocument(false);
    }
  };

  const exploreContent = async () => {
    const topic = requireTopic();
    if (!topic) return;
    setIsContentLoading(true);
    const res = await fetch("/api/topic-tools", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "content",
        topic: topic.title,
        level: "intermedio",
        difficulty: topic.difficulty,
        locale,
      }),
    });
    const data = (await res.json()) as {
      content?: { title?: string; summary?: string; examples?: string[]; references?: string[] };
    };
    setContentEntry(
      data.content
        ? {
            locale,
            data: {
              ...data.content,
              explanations: [data.content.summary ?? ""],
              articles: data.content.references ?? [],
            },
          }
        : null,
    );
    setIsContentLoading(false);
  };

  const handleBodyScroll = () => {
    const node = bodyRef.current;
    if (!node) return;
    const distanceToBottom = node.scrollHeight - node.scrollTop - node.clientHeight;
    setShouldAutoScroll(distanceToBottom < 80);
  };

  return (
    <AppLayout
      isDarkMode={isDarkMode}
      embedded={embedded}
      renderSidebar={({ closeMobileNav }) => (
        <Sidebar
          isDarkMode={isDarkMode}
          userName={user?.name}
          onNewChat={handleNewChat}
          onChooseTopic={() => setShowTopicSelector((v) => !v)}
          onToggleTheme={() => setIsDarkMode((v) => !v)}
          onGenerateQuiz={() => {
            if (!requireTopic()) return;
            setIsQuizOpen(true);
          }}
          onExploreContent={exploreContent}
          onToggleGuidedPractice={() => setShowGuidedPractice((v) => !v)}
          onAnalyzeDocument={() => documentInputRef.current?.click()}
          isAnalyzingDocument={isAnalyzingDocument}
          practiceEnabled={showGuidedPractice}
          topics={dynamicTopics}
          selectedTopicId={selectedTopicId}
          onSelectTopic={handleSelectTopic}
          conversations={conversations}
          activeConversationId={conversationId}
          onSelectConversation={(id) => {
            if (id === conversationId) return;
            void loadConversation(id);
          }}
          onDeleteConversation={(id) => void handleDeleteConversation(id)}
          onLogout={() => void logout()}
          onMobileClose={closeMobileNav}
        />
      )}
    >
      <div className="h-full min-h-0">
        <input
          ref={documentInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,application/pdf,.jpg,.jpeg,.png,.webp,.gif,.pdf"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (file) void handleAnalyzeDocument(file);
          }}
        />
        <ChatWindow
          messages={messages}
          isSending={isSending || isAnalyzingDocument}
          isDarkMode={isDarkMode}
          emptyState={
            hasExplicitTopic
              ? t("emptyChatWithTopic", { topic: activeTopicTitle })
              : t("emptyChat")
          }
          topicLabel={hasExplicitTopic ? activeTopicTitle : t("topicNotSelected")}
          levelLabel={profile.level ? academicLevelLabel(locale, profile.level) : t("levelNotSet")}
          difficultyLabel={hasExplicitTopic ? activeDifficulty : t("difficultyNotSet")}
          showTopicSelector={showTopicSelector}
          topicSelector={
            <TopicSelector
              onApply={(topic) => {
                setShowTopicSelector(false);
                const topicId =
                  resolveCustomTopicId(topic, profile.generatedTopics) ||
                  resolveTopicIdFromLabel(topic, profile.generatedTopics, dynamicTopics);
                if (topicId) handleSelectTopic(topicId);
              }}
            />
          }
          toolsPanel={
            <div className="space-y-3">
              <ContentViewer data={content} loading={isContentLoading} isDarkMode={isDarkMode} />
              {showGuidedPractice && selectedTopic && (
                <GuidedPractice topic={selectedTopic.title} isDarkMode={isDarkMode} locale={locale} />
              )}
            </div>
          }
          input={
            <ChatInput
              onSend={handleSend}
              disabled={isSending || isAnalyzingDocument}
              isDarkMode={isDarkMode}
            />
          }
          endRef={endRef}
          bodyRef={bodyRef}
          onBodyScroll={handleBodyScroll}
          error={error}
        />
        {selectedTopic && (
          <QuizModal topic={selectedTopic.title} isOpen={isQuizOpen} onClose={() => setIsQuizOpen(false)} locale={locale} />
        )}
      </div>
    </AppLayout>
  );
}
