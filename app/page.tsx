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
            Future-ready education
          </p>
          <h1 className="mx-auto mb-4 max-w-3xl text-3xl font-semibold tracking-tight text-indigo-900 sm:text-5xl">
            Learn smarter with <span className="text-violet-600">Educa AI</span>
          </h1>
          <p className="mx-auto mb-7 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
            A modern learning platform where students grow with guided practice,
            ethical AI support, and personalized learning paths.
          </p>
          <Link
            href="/dashboard"
            className="gradient-accent inline-flex rounded-full px-6 py-3 text-sm font-semibold transition hover:opacity-90"
          >
            Start learning
          </Link>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            title="Guided Learning"
            description="Break down complex topics into manageable lessons and build confidence one step at a time."
          />
          <FeatureCard
            title="Ethical AI"
            description="Our tutor supports understanding and reflection instead of giving direct shortcut answers."
          />
          <FeatureCard
            title="Personalized Support"
            description="Get adaptive prompts and practice aligned with your pace and learning goals."
          />
        </section>
      </main>
    </div>
  );
}
