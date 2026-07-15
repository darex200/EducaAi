"use client";

import { useMemo } from "react";
import type { AppLocale } from "@/lib/i18n/translations";
import {
  findStoredTopicIndex,
  localizeGeneratedTopics,
} from "@/lib/i18n/generated-topics";

export { findStoredTopicIndex };

type Options = {
  subjects: string[];
  level: string;
  storedTopics: string[];
  locale: AppLocale;
};

/** Temas del onboarding en el idioma activo — instantáneo, sin llamadas a la API. */
export function useLocalizedGeneratedTopics({
  subjects,
  level,
  storedTopics,
  locale,
}: Options) {
  return useMemo(
    () =>
      localizeGeneratedTopics({
        storedTopics,
        subjects,
        level,
        locale,
      }),
    [storedTopics, subjects, level, locale],
  );
}
