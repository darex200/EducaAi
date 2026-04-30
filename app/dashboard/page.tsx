import { DashboardCard } from "@/components/dashboard-card";

export default function DashboardPage() {
  return (
    <div className="space-y-4">
      <header className="card-surface p-6">
        <h1 className="mb-2 text-2xl font-semibold text-indigo-800">My Learning</h1>
        <p className="text-sm text-slate-600">
          Continue your progress with topic lessons and a student-focused AI tutor for general guidance.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <DashboardCard
          title="Go to Topics"
          description="Review Math, Science, and Language lessons with step-by-step content."
          href="/dashboard/topics"
        />
        <DashboardCard
          title="Talk to AI Tutor"
          description="Get general explanations, guiding questions, and step-by-step learning support."
          href="/dashboard/ai-tutor"
        />
      </div>
    </div>
  );
}
