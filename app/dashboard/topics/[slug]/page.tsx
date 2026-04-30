import Link from "next/link";
import { notFound } from "next/navigation";
import { LessonView } from "@/components/lesson-view";
import { getLessonBySlug, lessons } from "@/lib/lessons";

export function generateStaticParams() {
  return lessons.map((lesson) => ({ slug: lesson.slug }));
}

export default async function DashboardTopicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const lesson = getLessonBySlug(slug);

  if (!lesson) {
    notFound();
  }

  return (
    <main className="space-y-4">
      <Link href="/dashboard/topics" className="text-sm font-medium text-indigo-700">
        Volver a temas
      </Link>
      <LessonView lesson={lesson} />
    </main>
  );
}
