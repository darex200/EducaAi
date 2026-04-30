import Link from "next/link";
import { FeatureCard } from "@/components/feature-card";
import { Navbar } from "@/components/navbar";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <section className="card-surface mb-8 p-8 text-center sm:p-12">
          <p className="mb-3 inline-flex rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold tracking-wide text-indigo-700">
            Educacion lista para el futuro
          </p>
          <h1 className="mx-auto mb-4 max-w-3xl text-3xl font-semibold tracking-tight text-indigo-900 sm:text-5xl">
            Aprende mejor con <span className="text-violet-600">Educa AI</span>
          </h1>
          <p className="mx-auto mb-7 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
            Una plataforma moderna donde los estudiantes crecen con practica guiada,
            apoyo de IA responsable y rutas de aprendizaje personalizadas.
          </p>
          <Link
            href="/dashboard"
            className="gradient-accent inline-flex rounded-full px-6 py-3 text-sm font-semibold transition hover:opacity-90"
          >
            Empezar a aprender
          </Link>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            title="Aprendizaje guiado"
            description="Divide temas complejos en lecciones manejables y gana confianza paso a paso."
          />
          <FeatureCard
            title="IA responsable"
            description="Nuestro tutor promueve comprension y reflexion en lugar de dar respuestas directas."
          />
          <FeatureCard
            title="Apoyo personalizado"
            description="Recibe orientacion adaptativa y practica alineada con tu ritmo y objetivos."
          />
        </section>
      </main>
    </div>
  );
}
