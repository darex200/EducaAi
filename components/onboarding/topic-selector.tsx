"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useLearning } from "@/context/learning-context";
import { useLanguage } from "@/context/language-context";
import { difficultyLabel } from "@/lib/i18n/translations";
import { getLessons } from "@/lib/lessons";
import {
  findStoredTopicIndex,
  useLocalizedGeneratedTopics,
} from "@/hooks/use-localized-generated-topics";
import { resolveCustomTopicId } from "@/lib/topics/selection";

type TopicSelectorProps = {
  onApply: (topic: string) => void;
};

type TopicSelectorInnerProps = TopicSelectorProps & {
  topicOptions: string[];
  suggestedTopic: string;
  usesGeneratedTopics: boolean;
};

function TopicSelectorInner({
  onApply,
  topicOptions,
  suggestedTopic,
  usesGeneratedTopics,
}: TopicSelectorInnerProps) {
  const { profile, setProfile } = useLearning();
  const { locale, t } = useLanguage();
  const [topic, setTopic] = useState(suggestedTopic);
  const [difficulty, setDifficulty] = useState(profile.difficulty || "basico");

  return (
    <div className="mb-3 rounded-xl border border-slate-200 bg-white p-4">
      <p className="mb-2 text-xs font-semibold uppercase text-slate-500">{t("selectTopic")}</p>
      {!usesGeneratedTopics ? (
        <p className="mb-3 text-xs text-slate-500">{t("selectTopicFirst")}</p>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <select
          value={topic}
          onChange={(event) => setTopic(event.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          {topicOptions.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <select
          value={difficulty}
          onChange={(event) => setDifficulty(event.target.value as "basico" | "intermedio" | "avanzado")}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="basico">{difficultyLabel(locale, "basico")}</option>
          <option value="intermedio">{difficultyLabel(locale, "intermedio")}</option>
          <option value="avanzado">{difficultyLabel(locale, "avanzado")}</option>
        </select>
      </div>
      <div className="mt-3 flex justify-end">
        <button
          onClick={() => {
            const topicId = usesGeneratedTopics
              ? resolveCustomTopicId(topic, profile.generatedTopics)
              : "";
            setProfile({
              topic,
              topicId: topicId || profile.topicId,
              difficulty,
            });
            onApply(topic);
          }}
          className="gradient-accent rounded-lg px-4 py-2 text-sm font-semibold"
        >
          {t("applyTopic")}
        </button>
      </div>
    </div>
  );
}

export function TopicSelector({ onApply }: TopicSelectorProps) {
  const { profile } = useLearning();
  const { locale, t } = useLanguage();
  const localizedTopics = useLocalizedGeneratedTopics({
    subjects: profile.subjects,
    level: profile.level,
    storedTopics: profile.generatedTopics,
    locale,
  });
  const lessonTopics = getLessons(locale).map((lesson) => lesson.title);
  const topicOptions = localizedTopics.length ? localizedTopics : lessonTopics;
  const usesGeneratedTopics = localizedTopics.length > 0;
  const suggestedTopic = useMemo(() => {
    if (usesGeneratedTopics) {
      const storedIndex = findStoredTopicIndex(profile.generatedTopics, profile.topic);
      if (storedIndex >= 0 && localizedTopics[storedIndex]) {
        return localizedTopics[storedIndex];
      }
    }
    if (topicOptions.includes(profile.topic)) return profile.topic;
    return topicOptions[0] || "";
  }, [
    localizedTopics,
    profile.generatedTopics,
    profile.topic,
    topicOptions,
    usesGeneratedTopics,
  ]);

  if (!topicOptions.length) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
        <p>{t("selectTopicFirst")}</p>
        <Link href="/onboarding" className="mt-2 inline-block font-medium text-indigo-700">
          {t("completeOnboarding")} →
        </Link>
      </div>
    );
  }

  return (
    <TopicSelectorInner
      key={`${locale}-${suggestedTopic}`}
      onApply={onApply}
      topicOptions={topicOptions}
      suggestedTopic={suggestedTopic}
      usesGeneratedTopics={usesGeneratedTopics}
    />
  );
}
