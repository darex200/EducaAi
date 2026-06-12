"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/chat/app-layout";
import { Sidebar, type ConversationSummary } from "@/components/chat/sidebar";
import { ChatWindow } from "@/components/chat/chat-window";
import { ChatInput } from "@/components/chat/chat-input";
import { QuizModal } from "@/components/chat/quiz-modal";
import { ContentViewer } from "@/components/chat/content-viewer";
import { GuidedPractice } from "@/components/chat/guided-practice";
import { TopicSelector } from "@/components/onboarding/topic-selector";
import { useAuth } from "@/context/auth-context";
import { useLearning } from "@/context/learning-context";
import type { TutorMessage } from "@/components/ai-tutor/types";
import { lessons } from "@/lib/lessons";

const ACTIVE_CONVERSATION_KEY = "educa-ai-active-conversation";
const topicCategories = ["Ciencias", "Matematicas", "Lenguaje", "Historia", "Tecnologia"];

function normalizeTopicName(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function topicMatches(left: string, right: string) {
  const normalizedLeft = normalizeTopicName(left);
  const normalizedRight = normalizeTopicName(right);

  if (!normalizedLeft || !normalizedRight) return false;
  return (
    normalizedLeft === normalizedRight ||
    normalizedLeft.includes(normalizedRight) ||
    normalizedRight.includes(normalizedLeft)
  );
}

function topicIdFromTitle(title: string, index: number) {
  const slug = normalizeTopicName(title).replace(/\s+/g, "-");
  return `topic-${slug || index}`;
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
  const router = useRouter();
  const { user, logout } = useAuth();
  const { profile } = useLearning();
  const [messages, setMessages] = useState<TutorMessage[]>([]);
  const [isNewChat, setIsNewChat] = useState(false);
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
  const [content, setContent] = useState<{
    title?: string;
    summary?: string;
    examples?: string[];
    references?: string[];
    articles?: string[];
    explanations?: string[];
  } | null>(null);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const dynamicTopics = useMemo(
    () => {
      const lessonTopics = lessons.map((lesson, index) => ({
        id: lesson.slug,
        title: lesson.title,
        description: lesson.explanation,
        category: topicCategories[index % topicCategories.length],
        difficulty: (["basico", "intermedio", "avanzado"] as const)[index % 3],
      }));
      const customTopicTitles = [
        ...profile.generatedTopics,
        ...(profile.topic ? [profile.topic] : []),
      ].filter(
        (topic, index, list) =>
          topic &&
          list.findIndex((item) => topicMatches(item, topic)) === index &&
          !lessonTopics.some((lesson) => topicMatches(lesson.title, topic)),
      );
      const customTopics = customTopicTitles.map((topic, index) => ({
        id: topicIdFromTitle(topic, index),
        title: topic,
        description: `Tema personalizado para trabajar ${topic} con el tutor IA.`,
        category: "Personalizado",
        difficulty: profile.difficulty,
      }));

      return [...customTopics, ...lessonTopics];
    },
    [profile.difficulty, profile.generatedTopics, profile.topic],
  );
  const preferredTopicId = profile.topic
    ? dynamicTopics.find((topic) => topicMatches(topic.title, profile.topic))?.id ?? ""
    : "";
  const [selectedTopicId, setSelectedTopicId] = useState("");
  const endRef = useRef<HTMLDivElement | null>(null);
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const documentInputRef = useRef<HTMLInputElement | null>(null);
  const selectedTopic = useMemo(
    () => {
      const explicitlySelectedTopic = dynamicTopics.find((topic) => topic.id === selectedTopicId);
      if (explicitlySelectedTopic) return explicitlySelectedTopic;
      if (!selectedTopicId && preferredTopicId) {
        return dynamicTopics.find((topic) => topic.id === preferredTopicId);
      }
      return undefined;
    },
    [dynamicTopics, preferredTopicId, selectedTopicId],
  );
  const visibleSelectedTopicId = selectedTopic?.id ?? "";
  const activeTopicTitle = selectedTopic?.title || profile.topic;
  const activeDifficulty = selectedTopic?.difficulty || profile.difficulty;

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

  const loadConversation = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/conversations/${id}`);
      if (!response.ok) return false;
      const data = (await response.json()) as {
        conversation?: {
          id: string;
          messages: Array<{
            id: string;
            role: "user" | "assistant";
            content: string;
            imageUrl?: string | null;
          }>;
        };
      };
      if (!data.conversation) return false;
      const loaded: TutorMessage[] = data.conversation.messages.map((message) => ({
        id: message.id,
        role: message.role,
        content: message.content,
        imageDataUrl: message.imageUrl ?? undefined,
      }));
      setMessages(loaded);
      setConversationId(id);
      setIsNewChat(false);
      setError(null);
      return true;
    } catch {
      return false;
    }
  }, [profile.topic]);

  // Al entrar con sesión: solo carga el historial, sin restaurar conversación automáticamente.
  useEffect(() => {
    if (!user?.id) return;
    void refreshConversations();
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

  useEffect(() => {
    scrollChatToBottom("smooth");
  }, [visibleSelectedTopicId]);

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

  const clearChat = useCallback(() => {
    setMessages([]);
    setConversationId(null);
    setIsNewChat(false);
    setError(null);
    setContent(null);
    setShowGuidedPractice(false);
  }, []);


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
      content: text || "Analiza esta imagen, por favor.",
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
          messages: nextMessages.map((message) => ({
            role: message.role,
            content: message.content,
            imageDataUrl: message.imageDataUrl,
          })),
          context: {
            subjects: profile.subjects,
            level: profile.level,
            topic: activeTopicTitle,
            difficulty: activeDifficulty,
            conversationId: conversationId ?? undefined,
          },
        }),
      });

      if (!response.ok) throw new Error("Fallo la solicitud");

      const data = (await response.json()) as {
        reply?: string;
        conversationId?: string | null;
      };
      const assistantMessage: TutorMessage = {
        id: `assistant-${crypto.randomUUID()}`,
        role: "assistant",
        content:
          data.reply ??
          "No pude responder en este intento. Reenvia tu pregunta y lo resolvemos paso a paso.",
      };
      setMessages((current) => [...current, assistantMessage]);
      if (data.conversationId && data.conversationId !== conversationId) {
        setConversationId(data.conversationId);
        setIsNewChat(false);
      }
      if (data.conversationId) {
        void refreshConversations();
      }
    } catch {
      setError("Error al contactar el tutor IA. Verifica tu API key e intenta de nuevo.");
    } finally {
      setIsSending(false);
    }
  };

  const handleNewChat = () => {
    if (!activeTopicTitle) {
      router.push("/onboarding");
      return;
    }
    setMessages([]);
    setConversationId(null);
    setIsNewChat(true);
    setError(null);
    setContent(null);
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
    const placeholder: TutorMessage = {
      id: `user-${crypto.randomUUID()}`,
      role: "user",
      content: `He subido el documento "${file.name}" para analizarlo.`,
    };
    setMessages((current) => [...current, placeholder]);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("topic", selectedTopic?.title || profile.topic || "");
      const response = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      });
      const data = (await response.json()) as {
        markdown?: string;
        error?: string;
      };
      if (!response.ok || !data.markdown) {
        throw new Error(data.error ?? "No se pudo analizar el documento.");
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
      setError(
        err instanceof Error ? err.message : "No se pudo analizar el documento.",
      );
    } finally {
      setIsAnalyzingDocument(false);
    }
  };

  const exploreContent = async () => {
    if (!selectedTopic) return;
    setIsContentLoading(true);
    const res = await fetch("/api/topic-tools", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "content",
        topic: selectedTopic.title,
        level: "intermedio",
        difficulty: selectedTopic.difficulty,
      }),
    });
    const data = (await res.json()) as {
      content?: { title?: string; summary?: string; examples?: string[]; references?: string[] };
    };
    setContent(data.content ? { ...data.content, explanations: [data.content.summary ?? ""], articles: data.content.references ?? [] } : null);
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
      sidebar={
        <Sidebar
          isDarkMode={isDarkMode}
          userName={user?.name}
          onNewChat={handleNewChat}
          onChooseTopic={() => setShowTopicSelector((v) => !v)}
          onToggleTheme={() => setIsDarkMode((v) => !v)}
          onGenerateQuiz={() => setIsQuizOpen(true)}
          onExploreContent={exploreContent}
          onToggleGuidedPractice={() => setShowGuidedPractice((v) => !v)}
          onAnalyzeDocument={() => documentInputRef.current?.click()}
          isAnalyzingDocument={isAnalyzingDocument}
          practiceEnabled={showGuidedPractice}
          topics={dynamicTopics}
          selectedTopicId={visibleSelectedTopicId}
          onSelectTopic={setSelectedTopicId}
          conversations={conversations}
          activeConversationId={conversationId}
          onSelectConversation={(id) => {
            if (id === conversationId) return;
            void loadConversation(id);
          }}
          onDeleteConversation={(id) => void handleDeleteConversation(id)}
          onLogout={() => void logout()}
        />
      }
    >
      <div className="h-full min-h-0">
        <input
          ref={documentInputRef}
          type="file"
          accept="image/*,application/pdf"
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
            isNewChat
              ? "Nueva conversación. Escribe tu primera pregunta para comenzar."
              : "No se ha seleccionado una conversación. Elige una del historial o crea una nueva."
          }
          topicLabel={activeTopicTitle || "No seleccionado"}
          levelLabel={profile.level || "No definido"}
          difficultyLabel={activeDifficulty}
          showTopicSelector={showTopicSelector}
          topicSelector={
            <TopicSelector
              onApply={(topic) => {
                setShowTopicSelector(false);
                setSelectedTopicId(
                  dynamicTopics.find((item) => topicMatches(item.title, topic))?.id ?? topicIdFromTitle(topic, 0),
                );
                clearChat();
              }}
            />
          }
          toolsPanel={
            <div className="space-y-3">
              <ContentViewer data={content} loading={isContentLoading} isDarkMode={isDarkMode} />
              {showGuidedPractice && selectedTopic && (
                <GuidedPractice topic={selectedTopic.title} isDarkMode={isDarkMode} />
              )}
            </div>
          }
          input={
            <ChatInput
              onSend={handleSend}
              disabled={isSending || isAnalyzingDocument || (!conversationId && !isNewChat)}
              isDarkMode={isDarkMode}
            />
          }
          endRef={endRef}
          bodyRef={bodyRef}
          onBodyScroll={handleBodyScroll}
          error={error}
        />
        {selectedTopic && (
          <QuizModal topic={selectedTopic.title} isOpen={isQuizOpen} onClose={() => setIsQuizOpen(false)} />
        )}
      </div>
    </AppLayout>
  );
}
