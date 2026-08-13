"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { useLanguage } from "@/context/language-context";
import { useLearning } from "@/context/learning-context";
import { LoadingSpinner } from "@/components/loading-spinner";
import { academicLevelLabel, difficultyLabel } from "@/lib/i18n/translations";
import { resolveTopicDisplayTitle } from "@/lib/lessons";
import { isClientDatabaseEnabled } from "@/lib/demo-mode";

type ServerProfile = {
  user?: {
    name?: string;
    email?: string;
    birthYear?: number | null;
    academicLevel?: string | null;
  };
  profile?: {
    subjects?: string[];
    level?: string;
    topic?: string;
    difficulty?: string;
    goals?: string;
    generatedTopics?: string[];
  };
};

export default function ProfilePage() {
  const { user } = useAuth();
  const { locale, t } = useLanguage();
  const { profile } = useLearning();
  const databaseEnabled = isClientDatabaseEnabled();
  const userId = user?.id;
  const [serverProfile, setServerProfile] = useState<ServerProfile | null>(null);
  const [loadedForUserId, setLoadedForUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!databaseEnabled || !userId) return;

    let cancelled = false;
    void (async () => {
      try {
        const response = await fetch("/api/profile");
        if (!cancelled && response.ok) {
          setServerProfile((await response.json()) as ServerProfile);
        }
      } finally {
        if (!cancelled) setLoadedForUserId(userId);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [databaseEnabled, userId]);

  const isLoading = databaseEnabled && Boolean(userId) && loadedForUserId !== userId;

  const displayName = serverProfile?.user?.name ?? user?.name ?? t("noSession");
  const displayEmail = serverProfile?.user?.email ?? user?.email ?? "";
  const level =
    serverProfile?.profile?.level ||
    serverProfile?.user?.academicLevel ||
    profile.level;
  const subjects = serverProfile?.profile?.subjects?.length
    ? serverProfile.profile.subjects
    : profile.subjects;
  const topic = serverProfile?.profile?.topic || profile.topic;
  const difficulty = serverProfile?.profile?.difficulty || profile.difficulty;
  const goals = serverProfile?.profile?.goals || "";

  if (!user) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
        <h1 className="mb-3 text-2xl font-semibold text-slate-900">{t("myProfile")}</h1>
        <p className="mb-6 text-sm text-slate-600">{t("profileSignInRequired")}</p>
        <Link href="/login" className="btn-primary px-6 py-3">
          {t("landingSignIn")}
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoadingSpinner label={t("profileLoading")} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{t("myProfile")}</h1>
        <p className="text-sm text-slate-500">{t("profileSubtitle")}</p>
      </header>

      <div className="space-y-4">
        <section className="card-surface p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
            {t("profileAccount")}
          </h2>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-slate-500">{t("profileName")}</dt>
              <dd className="font-medium text-slate-900">{displayName}</dd>
            </div>
            {displayEmail ? (
              <div>
                <dt className="text-slate-500">{t("profileEmail")}</dt>
                <dd className="font-medium text-slate-900">{displayEmail}</dd>
              </div>
            ) : null}
          </dl>
        </section>

        <section className="card-surface p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
            {t("profileLearning")}
          </h2>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-slate-500">{t("profileLevel")}</dt>
              <dd className="font-medium text-slate-900">
                {level ? academicLevelLabel(locale, level) : t("levelNotSet")}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">{t("profileDifficulty")}</dt>
              <dd className="font-medium text-slate-900">
                {difficulty ? difficultyLabel(locale, difficulty) : t("difficultyNotSet")}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-slate-500">{t("profileSubjects")}</dt>
              <dd className="font-medium text-slate-900">
                {subjects.length ? subjects.join(", ") : t("topicNotSelected")}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-slate-500">{t("profileTopic")}</dt>
              <dd className="font-medium text-slate-900">
                {topic ? resolveTopicDisplayTitle(topic, locale) : t("topicNotSelected")}
              </dd>
            </div>
            {goals ? (
              <div className="sm:col-span-2">
                <dt className="text-slate-500">{t("profileGoals")}</dt>
                <dd className="font-medium text-slate-900">{goals}</dd>
              </div>
            ) : null}
          </dl>
        </section>

        <div className="flex flex-wrap gap-3">
          <Link href="/onboarding" className="btn-secondary px-5 py-2.5 text-sm">
            {t("profileEdit")}
          </Link>
          <Link href="/dashboard/progress" className="btn-primary px-5 py-2.5 text-sm">
            {t("progress")}
          </Link>
          <Link href="/tutor" className="btn-secondary px-5 py-2.5 text-sm">
            {t("guidedTutor")}
          </Link>
        </div>
      </div>
    </div>
  );
}
