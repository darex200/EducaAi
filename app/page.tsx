import Link from "next/link";
import { Card } from "@/components/card";
import { FeatureCard } from "@/components/feature-card";
import { InteractiveOrb } from "@/components/landing/interactive-orb";
import { Navbar } from "@/components/navbar";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <Card className="hero-surface mb-10 p-8 sm:p-12">
          <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <h1 className="mb-4 max-w-3xl text-3xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
                Aprendizaje guiado con inteligencia artificial
              </h1>
              <p className="mb-7 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                Educa AI integra tutoría académica y práctica estructurada para ayudar a los
                estudiantes a comprender conceptos con claridad y avanzar con autonomía.
              </p>
              <div className="flex w-full max-w-md flex-col gap-3 sm:flex-row">
                <Link href="/onboarding" className="btn-primary">
                  Comenzar a aprender
                </Link>
                <Link href="/dashboard/ai-tutor" className="btn-secondary">
                  Ir al tutor IA
                </Link>
              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
              <InteractiveOrb />
            </div>
          </div>
        </Card>

        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            title="Aprendizaje guiado"
            description="Desarrolla comprensión sólida con explicaciones secuenciales y objetivos claros."
            icon={
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 5h16v14H4z" />
                <path d="M8 9h8M8 13h6" />
              </svg>
            }
          />
          <FeatureCard
            title="Tutor IA académico"
            description="Recibe orientación paso a paso con preguntas que fomentan análisis y razonamiento."
            icon={
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="4" />
                <path d="M6 20c1.5-3 4-4 6-4s4.5 1 6 4" />
              </svg>
            }
          />
          <FeatureCard
            title="Seguimiento por temas"
            description="Organiza el estudio por áreas clave y mantiene una trayectoria de aprendizaje consistente."
            icon={
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M5 6h14M5 18h10" />
              </svg>
            }
          />
        </section>
      </main>
    </div>
  );
}
