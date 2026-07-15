"use client";

import Link from "next/link";
import { useMemo } from "react";
import { FeatureCard } from "@/components/feature-card";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { HeroVisual } from "@/components/landing/hero-visual";
import { useLanguage } from "@/context/language-context";

const FEATURE_ICONS = [
  <svg key="tutor" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="8" r="4" />
    <path d="M6 20c1.5-3 4-4 6-4s4.5 1 6 4" />
  </svg>,
  <svg key="adaptive" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 19V5M4 19h16M8 15l3-3 3 2 5-6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>,
  <svg key="progress" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 12h14M5 6h14M5 18h10" />
  </svg>,
  <svg key="quiz" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" strokeLinecap="round" />
  </svg>,
  <svg key="steps" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 5h16v14H4z" />
    <path d="M8 9h8M8 13h6" />
  </svg>,
  <svg key="docs" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6M10 13h4M10 17h7" />
  </svg>,
] as const;

export function LandingPage() {
  const { t } = useLanguage();

  const features = useMemo(
    () => [
      {
        title: t("landingFeatureTutorTitle"),
        description: t("landingFeatureTutorDesc"),
        icon: FEATURE_ICONS[0],
      },
      {
        title: t("landingFeatureAdaptiveTitle"),
        description: t("landingFeatureAdaptiveDesc"),
        icon: FEATURE_ICONS[1],
      },
      {
        title: t("landingFeatureProgressTitle"),
        description: t("landingFeatureProgressDesc"),
        icon: FEATURE_ICONS[2],
      },
      {
        title: t("landingFeatureQuizTitle"),
        description: t("landingFeatureQuizDesc"),
        icon: FEATURE_ICONS[3],
      },
      {
        title: t("landingFeatureStepsTitle"),
        description: t("landingFeatureStepsDesc"),
        icon: FEATURE_ICONS[4],
      },
      {
        title: t("landingFeatureDocsTitle"),
        description: t("landingFeatureDocsDesc"),
        icon: FEATURE_ICONS[5],
      },
    ],
    [t],
  );

  const steps = useMemo(
    () => [
      { step: "01", title: t("landingStep1Title"), description: t("landingStep1Desc") },
      { step: "02", title: t("landingStep2Title"), description: t("landingStep2Desc") },
      { step: "03", title: t("landingStep3Title"), description: t("landingStep3Desc") },
      { step: "04", title: t("landingStep4Title"), description: t("landingStep4Desc") },
    ],
    [t],
  );

  return (
    <div className="landing-shell min-h-screen scroll-smooth">
      <LandingNavbar />

      <main>
        <section
          id="inicio"
          className="landing-hero relative overflow-hidden px-4 pb-20 pt-28 sm:px-6 sm:pb-24 sm:pt-32 lg:pb-28 lg:pt-36"
        >
          <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
            <div className="landing-reveal">
              <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                {t("landingHeroBadge")}
              </p>
              <h1 className="mb-5 max-w-2xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-[3.35rem] lg:leading-[1.08]">
                {t("landingHeroTitle")}{" "}
                <span className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {t("landingHeroTitleHighlight")}
                </span>
              </h1>
              <p className="mb-8 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
                {t("landingHeroSubtitle")}
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link href="/tutor" className="btn-primary px-6 py-3 text-base">
                  {t("landingStartLearning")}
                </Link>
                <a href="#que-es" className="btn-secondary px-6 py-3 text-base">
                  {t("landingExplore")}
                </a>
              </div>
            </div>

            <div className="landing-reveal landing-reveal-delay-1">
              <HeroVisual />
            </div>
          </div>
        </section>

        <section id="que-es" className="px-4 py-20 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-6xl">
            <div className="landing-section-card grid gap-10 p-8 sm:p-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div>
                <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-indigo-600">
                  {t("landingAboutLabel")}
                </p>
                <h2 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  {t("landingAboutTitle")}
                </h2>
                <p className="text-base leading-7 text-slate-600">{t("landingAboutText")}</p>
              </div>
              <div className="space-y-4">
                <article className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5">
                  <h3 className="mb-2 text-lg font-semibold text-slate-900">
                    {t("landingAboutPurposeTitle")}
                  </h3>
                  <p className="text-sm leading-6 text-slate-600">{t("landingAboutPurposeText")}</p>
                </article>
                <article className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-5">
                  <h3 className="mb-2 text-lg font-semibold text-slate-900">
                    {t("landingAboutCriticalTitle")}
                  </h3>
                  <p className="text-sm leading-6 text-slate-600">{t("landingAboutCriticalText")}</p>
                </article>
              </div>
            </div>
          </div>
        </section>

        <section id="caracteristicas" className="px-4 py-20 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 max-w-2xl">
              <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-blue-600">
                {t("landingFeaturesLabel")}
              </p>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                {t("landingFeaturesTitle")}
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-600">{t("landingFeaturesSubtitle")}</p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <FeatureCard
                  key={feature.title}
                  title={feature.title}
                  description={feature.description}
                  icon={feature.icon}
                />
              ))}
            </div>
          </div>
        </section>

        <section id="como-funciona" className="px-4 py-20 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-indigo-600">
                {t("landingHowLabel")}
              </p>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                {t("landingHowTitle")}
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">
                {t("landingHowSubtitle")}
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {steps.map((item, index) => (
                <article key={item.step} className="landing-step-card relative p-6">
                  <span className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-bold text-white shadow-md">
                    {item.step}
                  </span>
                  <h3 className="mb-2 text-lg font-semibold text-slate-900">{item.title}</h3>
                  <p className="text-sm leading-6 text-slate-600">{item.description}</p>
                  {index < steps.length - 1 ? (
                    <span
                      className="landing-step-connector absolute -right-3 top-1/2 hidden h-0.5 w-6 -translate-y-1/2 bg-gradient-to-r from-blue-300 to-indigo-300 xl:block"
                      aria-hidden="true"
                    />
                  ) : null}
                </article>
              ))}
            </div>

            <div className="mt-10 flex justify-center">
              <Link href="/tutor" className="btn-primary px-6 py-3">
                {t("landingStartLearning")}
              </Link>
            </div>
          </div>
        </section>

        <section id="mision" className="px-4 py-20 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-6xl">
            <div className="landing-mission relative overflow-hidden rounded-3xl p-8 sm:p-12">
              <div className="relative z-10 max-w-3xl">
                <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-blue-100">
                  {t("landingMissionLabel")}
                </p>
                <h2 className="mb-5 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  {t("landingMissionTitle")}
                </h2>
                <p className="mb-4 text-base leading-7 text-blue-50/95">{t("landingMissionText1")}</p>
                <p className="text-base leading-7 text-blue-50/90">{t("landingMissionText2")}</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer id="contacto" className="border-t border-slate-200/80 bg-white px-4 py-14 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <div>
            <p className="mb-3 text-lg font-semibold text-slate-900">EducaAI</p>
            <p className="max-w-sm text-sm leading-6 text-slate-600">{t("landingFooterDesc")}</p>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
              {t("landingContact")}
            </p>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <a href="mailto:blbconomy@gmail.com" className="hover:text-blue-700">
                  blbconomy@gmail.com
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
              {t("landingSocial")}
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://instagram.com/educa.ai.ed"
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                aria-label="Instagram"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                  <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 3.5A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 0 1 12 7.5zm0 2A2.5 2.5 0 1 0 14.5 12 2.5 2.5 0 0 0 12 9.5zM17.8 6.2a1 1 0 1 1-1 1 1 1 0 0 1 1-1z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-6xl border-t border-slate-200 pt-6 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} EducaAI. {t("landingRights")}
        </div>
      </footer>
    </div>
  );
}
