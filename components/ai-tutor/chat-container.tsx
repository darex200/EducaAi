"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/chat/app-layout";
import { Sidebar } from "@/components/chat/sidebar";
import { ChatWindow } from "@/components/chat/chat-window";
import { ChatInput } from "@/components/chat/chat-input";
import { QuizModal } from "@/components/chat/quiz-modal";
import { ContentViewer } from "@/components/chat/content-viewer";
import { GuidedPractice } from "@/components/chat/guided-practice";
import { TopicSelector } from "@/components/onboarding/topic-selector";
import { useLearning } from "@/context/learning-context";
import type { TutorMessage } from "@/components/ai-tutor/types";
import { lessons } from "@/lib/lessons";

const CHAT_STORAGE_KEY = "educa-ai-chat-state";
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

function getWelcomeMessage(topic?: string) {
  const starters = [
    "¿Qué parte te gustaría entender primero?",
    "¿Quieres empezar por teoría o por ejercicios?",
    "¿Cuál es el punto que más te está costando?",
  ];
  const randomStarter = starters[Math.floor(Math.random() * starters.length)];

  return {
    id: "assistant-welcome",
    role: "assistant" as const,
    content: topic
      ? `Hola. Veo que estás estudiando ${topic}. Para empezar, ${randomStarter}`
      : "Hola. Soy tu tutor IA. ¿Qué tema te gustaría trabajar hoy?",
  };
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
  const { profile } = useLearning();
  const [messages, setMessages] = useState<TutorMessage[]>(() => {
    if (typeof window === "undefined") return [getWelcomeMessage(profile.topic)];
    const stored = localStorage.getItem(CHAT_STORAGE_KEY);
    if (!stored) return [getWelcomeMessage(profile.topic)];
    try {
      const parsed = JSON.parse(stored) as {
        topic?: string;
        messages?: TutorMessage[];
      };
      if (parsed.topic !== (profile.topic || "")) return [getWelcomeMessage(profile.topic)];
      return parsed.messages?.length ? parsed.messages : [getWelcomeMessage(profile.topic)];
    } catch {
      return [getWelcomeMessage(profile.topic)];
    }
  });
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
  const [content, setContent] = useState<{
    title?: string;
    summary?: string;
    examples?: string[];
    references?: string[];
    articles?: string[];
    explanations?: string[];
  } | null>(null);
  const [conversationId, setConversationId] = useState(() => {
    if (typeof window === "undefined") return `conv-${Date.now()}`;
    return localStorage.getItem("educa-ai-conversation-id") || `conv-${Date.now()}`;
  });
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
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify({ topic: profile.topic || "", messages }));
  }, [messages, profile.topic]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("educa-ai-dark-mode", isDarkMode ? "1" : "0");
  }, [isDarkMode]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("educa-ai-conversation-id", conversationId);
  }, [conversationId]);


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
            conversationId,
          },
        }),
      });

      if (!response.ok) throw new Error("Fallo la solicitud");

      const data = (await response.json()) as { reply?: string };
      const assistantMessage: TutorMessage = {
        id: `assistant-${crypto.randomUUID()}`,
        role: "assistant",
        content:
          data.reply ??
          "No pude responder en este intento. Reenvia tu pregunta y lo resolvemos paso a paso.",
      };
      setMessages((current) => [...current, assistantMessage]);
    } catch {
      setError("Error al contactar el tutor IA. Verifica tu API key e intenta de nuevo.");
    } finally {
      setIsSending(false);
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
          onNewChat={() => {
            if (!activeTopicTitle) {
              router.push("/onboarding");
              return;
            }
            setMessages([getWelcomeMessage(activeTopicTitle)]);
            setConversationId(`conv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);
            setError(null);
          }}
          onChooseTopic={() => setShowTopicSelector((v) => !v)}
          onToggleTheme={() => setIsDarkMode((v) => !v)}
          onGenerateQuiz={() => setIsQuizOpen(true)}
          onExploreContent={exploreContent}
          onToggleGuidedPractice={() => setShowGuidedPractice((v) => !v)}
          practiceEnabled={showGuidedPractice}
          topics={dynamicTopics}
          selectedTopicId={visibleSelectedTopicId}
          onSelectTopic={setSelectedTopicId}
        />
      }
    >
      <div className="h-full min-h-0">
        <ChatWindow
          messages={messages}
          isSending={isSending}
          isDarkMode={isDarkMode}
          showTopicSelector={showTopicSelector}
          topicSelector={
            <TopicSelector
              onApply={(topic) => {
                setShowTopicSelector(false);
                setSelectedTopicId(
                  dynamicTopics.find((item) => topicMatches(item.title, topic))?.id ?? topicIdFromTitle(topic, 0),
                );
                setMessages([getWelcomeMessage(topic)]);
                setConversationId(`conv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);
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
          input={<ChatInput onSend={handleSend} disabled={isSending} isDarkMode={isDarkMode} />}
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
