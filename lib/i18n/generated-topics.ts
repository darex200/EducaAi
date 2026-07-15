import type { AppLocale } from "@/lib/i18n/translations";
import { fallbackOnboardingTopics } from "@/lib/i18n/locale-ai";

type LocalizeOptions = {
  storedTopics: string[];
  subjects: string[];
  level: string;
  locale: AppLocale;
};

/** Traduce temas del onboarding al instante usando catálogos en código (sin API). */
export function localizeGeneratedTopics({
  storedTopics,
  subjects,
  level,
  locale,
}: LocalizeOptions) {
  if (!storedTopics.length) return [];

  const effectiveSubjects = subjects.length ? subjects : inferSubjectFromStoredTopics(storedTopics);
  const effectiveLevel = level || "secundaria";
  const localizedCatalog = fallbackOnboardingTopics(effectiveSubjects, effectiveLevel, locale);
  const spanishCatalog = fallbackOnboardingTopics(effectiveSubjects, effectiveLevel, "es");

  return storedTopics.map((stored, index) => {
    const matchedIndex = findIndexInCatalog(stored, spanishCatalog);
    const resolvedIndex = matchedIndex >= 0 ? matchedIndex : index;
    return localizedCatalog[resolvedIndex] ?? localizedCatalog[index] ?? stored;
  });
}

function inferSubjectFromStoredTopics(storedTopics: string[]) {
  const subjects = ["Matematicas", "Fisica", "Quimica", "Lenguaje", "Biologia", "Historia"] as const;
  let bestSubject: (typeof subjects)[number] = "Matematicas";
  let bestScore = 0;

  for (const subject of subjects) {
    const spanishCatalog = fallbackOnboardingTopics([subject], "secundaria", "es");
    const score = storedTopics.reduce((total, topic) => {
      return findIndexInCatalog(topic, spanishCatalog) >= 0 ? total + 1 : total;
    }, 0);
    if (score > bestScore) {
      bestScore = score;
      bestSubject = subject;
    }
  }

  return [bestSubject];
}

function findIndexInCatalog(topic: string, catalog: string[]) {
  const token = normalizeTopicToken(topic);
  if (!token) return -1;

  return catalog.findIndex((entry) => {
    const entryToken = normalizeTopicToken(entry);
    return (
      entryToken === token ||
      entryToken.includes(token) ||
      token.includes(entryToken)
    );
  });
}

export function findStoredTopicIndex(storedTopics: string[], value: string) {
  const normalized = normalizeTopicToken(value);
  return storedTopics.findIndex((topic) => {
    const token = normalizeTopicToken(topic);
    return token === normalized || token.includes(normalized) || normalized.includes(token);
  });
}

function normalizeTopicToken(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}
