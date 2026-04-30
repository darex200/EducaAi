import { DashboardCard } from "@/components/dashboard-card";

export default function DashboardPage() {
  return (
    <div className="space-y-4">
      <header className="card-surface p-6">
        <h1 className="mb-2 text-2xl font-semibold text-indigo-800">Mi aprendizaje</h1>
        <p className="text-sm text-slate-600">
          Continua tu progreso con lecciones por tema y un tutor IA enfocado en estudiantes para orientacion general.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <DashboardCard
          title="Ir a Temas"
          description="Revisa lecciones de Matematicas, Ciencias y Lenguaje con contenido paso a paso."
          href="/dashboard/topics"
        />
        <DashboardCard
          title="Hablar con Tutor IA"
          description="Obtiene explicaciones generales, preguntas guia y apoyo de aprendizaje paso a paso."
          href="/dashboard/ai-tutor"
        />
      </div>
    </div>
  );
}
