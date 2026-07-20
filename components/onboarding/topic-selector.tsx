"use client";

import { useEffect, useState } from "react";
import { useLearning } from "@/context/learning-context";
import { useLanguage } from "@/context/language-context";
import { difficultyLabel } from "@/lib/i18n/translations";
import {
  findStoredTopicIndex,
  useLocalizedGeneratedTopics,
} from "@/hooks/use-localized-generated-topics";
import { resolveCustomTopicId } from "@/lib/topics/selection";

type TopicSelectorProps = {
  onApply: (topic: string) => void;
};

export function TopicSelector({ onApply }: TopicSelectorProps) {
  const { profile, setProfile } = useLearning();
  const { locale, t } = useLanguage();
  const localizedTopics = useLocalizedGeneratedTopics({
    subjects: profile.subjects,
    level: profile.level,
    storedTopics: profile.generatedTopics,
    locale,
  });
  const [topic, setTopic] = useState(profile.topic || profile.generatedTopics[0] || "");
  const [difficulty, setDifficulty] = useState(profile.difficulty || "basico");

  useEffect(() => {
    const storedIndex = findStoredTopicIndex(
      profile.generatedTopics,
      profile.topic || topic,
    );
    if (storedIndex >= 0 && localizedTopics[storedIndex]) {
      setTopic(localizedTopics[storedIndex]);
      return;
    }
    if (localizedTopics[0]) setTopic(localizedTopics[0]);
  }, [locale, localizedTopics, profile.generatedTopics, profile.topic, topic]);

  if (!localizedTopics.length) return null;

  return (
    <div className="mb-3 rounded-xl border border-slate-200 bg-white p-4">
      <p className="mb-2 text-xs font-semibold uppercase text-slate-500">{t("selectTopic")}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <select
          value={topic}
          onChange={(event) => setTopic(event.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          {localizedTopics.map((item) => (
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
            const topicId = resolveCustomTopicId(topic, profile.generatedTopics);
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
