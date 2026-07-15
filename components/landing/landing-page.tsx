"use client";

import Link from "next/link";
import { FeatureCard } from "@/components/feature-card";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { HeroVisual } from "@/components/landing/hero-visual";

const FEATURES = [
  {
    title: "Tutor de IA personalizado",
    description:
      "Conversa con un asistente académico que adapta explicaciones a tu edad, nivel y objetivos de estudio.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="8" r="4" />
        <path d="M6 20c1.5-3 4-4 6-4s4.5 1 6 4" />
      </svg>
    ),
  },
  {
    title: "Aprendizaje adaptativo",
    description:
      "El sistema detecta tus fortalezas y brechas para proponer rutas de estudio que evolucionan contigo.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 19V5M4 19h16M8 15l3-3 3 2 5-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Seguimiento del progreso",
    description:
      "Visualiza tu avance por temas, rachas de estudio y métricas que muestran cómo mejoras con el tiempo.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M5 12h14M5 6h14M5 18h10" />
      </svg>
    ),
  },
  {
    title: "Generación de cuestionarios",
    description:
      "Practica con quizzes dinámicos alineados a tu materia y dificultad, con retroalimentación inmediata.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Explicaciones paso a paso",
    description:
      "Comprende conceptos complejos con desgloses secuenciales, ejemplos y preguntas que fomentan el razonamiento.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 5h16v14H4z" />
        <path d="M8 9h8M8 13h6" />
      </svg>
    ),
  },
  {
    title: "Análisis de documentos",
    description:
      "Sube imágenes o PDFs para recibir ayuda contextualizada sobre ejercicios, apuntes y material de clase.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6M10 13h4M10 17h7" />
      </svg>
    ),
  },
];

const STEPS = [
  {
    step: "01",
    title: "Elige una materia",
    description: "Selecciona el área que quieres estudiar o define tus propios temas de interés.",
  },
  {
    step: "02",
    title: "Habla con el tutor",
    description: "Plantea dudas, pide explicaciones o sube material para recibir orientación personalizada.",
  },
  {
    step: "03",
    title: "Resuelve actividades",
    description: "Practica con ejercicios guiados y cuestionarios que refuerzan lo aprendido.",
  },
  {
    step: "04",
    title: "Revisa tu progreso",
    description: "Consulta métricas, dominio por tema y recomendaciones para seguir mejorando.",
  },
];

export function LandingPage() {
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
                Educación con IA responsable
              </p>
              <h1 className="mb-5 max-w-2xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-[3.35rem] lg:leading-[1.08]">
                Aprende mejor con un tutor de IA que{" "}
                <span className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  piensa contigo
                </span>
              </h1>
              <p className="mb-8 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
                EducaAI es una plataforma educativa que combina tutoría inteligente, práctica adaptativa y
                seguimiento de progreso para fortalecer tu comprensión — no para reemplazar tu esfuerzo.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link href="/tutor" className="btn-primary px-6 py-3 text-base">
                  Comenzar a aprender
                </Link>
                <a href="#que-es" className="btn-secondary px-6 py-3 text-base">
                  Explorar la plataforma
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
                  ¿Qué es EducaAI?
                </p>
                <h2 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  Tecnología al servicio del aprendizaje profundo
                </h2>
                <p className="text-base leading-7 text-slate-600">
                  EducaAI nace para acompañar a estudiantes en su proceso académico con herramientas
                  inteligentes que promueven la reflexión, la autonomía y el pensamiento crítico.
                </p>
              </div>
              <div className="space-y-4">
                <article className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5">
                  <h3 className="mb-2 text-lg font-semibold text-slate-900">IA con propósito educativo</h3>
                  <p className="text-sm leading-6 text-slate-600">
                    Utilizamos inteligencia artificial de forma responsable: como apoyo para comprender,
                    practicar y organizar el estudio, nunca como atajo para evitar el aprendizaje real.
                  </p>
                </article>
                <article className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-5">
                  <h3 className="mb-2 text-lg font-semibold text-slate-900">Pensamiento crítico primero</h3>
                  <p className="text-sm leading-6 text-slate-600">
                    El tutor guía con preguntas, ejemplos y retroalimentación para que construyas tus propias
                    conclusiones y fortalezas cognitivas duraderas.
                  </p>
                </article>
              </div>
            </div>
          </div>
        </section>

        <section id="caracteristicas" className="px-4 py-20 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 max-w-2xl">
              <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-blue-600">
                Características principales
              </p>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Todo lo que necesitas para estudiar con claridad
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-600">
                Herramientas diseñadas para acompañarte en cada etapa: desde la primera duda hasta el seguimiento
                de tu evolución académica.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((feature) => (
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
                Cómo funciona
              </p>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Cuatro pasos para empezar hoy
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">
                Un flujo simple y claro para integrar EducaAI en tu rutina de estudio sin fricción.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {STEPS.map((item, index) => (
                <article key={item.step} className="landing-step-card relative p-6">
                  <span className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-bold text-white shadow-md">
                    {item.step}
                  </span>
                  <h3 className="mb-2 text-lg font-semibold text-slate-900">{item.title}</h3>
                  <p className="text-sm leading-6 text-slate-600">{item.description}</p>
                  {index < STEPS.length - 1 ? (
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
                Comenzar a aprender
              </Link>
            </div>
          </div>
        </section>

        <section id="mision" className="px-4 py-20 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-6xl">
            <div className="landing-mission relative overflow-hidden rounded-3xl p-8 sm:p-12">
              <div className="relative z-10 max-w-3xl">
                <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-blue-100">
                  Nuestra misión
                </p>
                <h2 className="mb-5 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Democratizar el acceso a una educación personalizada y ética
                </h2>
                <p className="mb-4 text-base leading-7 text-blue-50/95">
                  Creemos que la inteligencia artificial puede ampliar oportunidades de aprendizaje cuando se
                  usa con transparencia, criterio pedagógico y respeto por el proceso del estudiante.
                </p>
                <p className="text-base leading-7 text-blue-50/90">
                  Nuestra visión es construir una comunidad educativa donde la tecnología impulse la curiosidad,
                  el análisis y la confianza académica — con impacto real en el aula y en el estudio autónomo.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer id="contacto" className="border-t border-slate-200/80 bg-white px-4 py-14 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <div>
            <p className="mb-3 text-lg font-semibold text-slate-900">EducaAI</p>
            <p className="max-w-sm text-sm leading-6 text-slate-600">
              Plataforma educativa con tutor de IA adaptativo, seguimiento de progreso y herramientas para
              estudiar con método y responsabilidad.
            </p>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Contacto</p>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <a href="mailto:contacto@educaai.app" className="hover:text-blue-700">
                  contacto@educaai.app
                </a>
              </li>
              <li>
                <a href="mailto:soporte@educaai.app" className="hover:text-blue-700">
                  soporte@educaai.app
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Redes sociales</p>
            <div className="flex items-center gap-3">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                aria-label="LinkedIn"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                  <path d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8h4V23h-4V8zm7.5 0h3.8v2.05h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.77 2.65 4.77 6.1V23h-4v-6.75c0-1.61-.03-3.68-2.24-3.68-2.24 0-2.58 1.75-2.58 3.55V23h-4V8z" />
                </svg>
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                aria-label="X"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                  <path d="M18.9 2H22l-6.8 7.8L23 22h-6.7l-4.2-5.5L7.5 22H2.4l7.3-8.4L1 2h6.9l3.8 5.1L18.9 2zm-1.2 18h1.7L7.1 4H5.3l12.4 16z" />
                </svg>
              </a>
              <a
                href="https://instagram.com"
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
          © {new Date().getFullYear()} EducaAI. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
}
