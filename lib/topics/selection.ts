import type { TopicItem } from "@/components/chat/topic-card";
import { findStoredTopicIndex } from "@/lib/i18n/generated-topics";

function normalizeTopicName(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function topicLabelsMatch(left: string, right: string) {
  const normalizedLeft = normalizeTopicName(left);
  const normalizedRight = normalizeTopicName(right);

  if (!normalizedLeft || !normalizedRight) return false;
  return (
    normalizedLeft === normalizedRight ||
    normalizedLeft.includes(normalizedRight) ||
    normalizedRight.includes(normalizedLeft)
  );
}

export function customTopicId(index: number) {
  return `topic-custom-${index}`;
}

export function resolveTopicId(options: {
  topicId?: string;
  topicLabel?: string;
  generatedTopics: string[];
  topics: TopicItem[];
}) {
  const { topicId, topicLabel, generatedTopics, topics } = options;

  if (topicId && topics.some((topic) => topic.id === topicId)) {
    return topicId;
  }

  if (!topicLabel?.trim()) return "";

  const storedIndex = findStoredTopicIndex(generatedTopics, topicLabel);
  if (storedIndex >= 0) {
    const id = customTopicId(storedIndex);
    if (topics.some((topic) => topic.id === id)) return id;
  }

  const byTitle = topics.find((topic) => topicLabelsMatch(topic.title, topicLabel));
  if (byTitle) return byTitle.id;

  const normalizedLabel = normalizeTopicName(topicLabel).replace(/\s+/g, "-");
  const bySlug = topics.find(
    (topic) => topic.id === topicLabel || topic.lessonSlug === topicLabel || topic.id === normalizedLabel,
  );
  return bySlug?.id ?? "";
}

export function resolveTopicIdFromLabel(
  topicLabel: string,
  generatedTopics: string[],
  topics: TopicItem[],
) {
  return resolveTopicId({ topicLabel, generatedTopics, topics });
}

export function resolveCustomTopicId(topicLabel: string, generatedTopics: string[]) {
  const storedIndex = findStoredTopicIndex(generatedTopics, topicLabel);
  return storedIndex >= 0 ? customTopicId(storedIndex) : "";
}
