import { notFound } from "next/navigation";
import { TopicSlugClient } from "@/components/topics/topic-slug-client";
import { LESSON_SLUGS } from "@/lib/lessons";

export function generateStaticParams() {
  return LESSON_SLUGS.map((slug) => ({ slug }));
}

export default async function DashboardTopicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const exists = LESSON_SLUGS.includes(slug);
  if (!exists) notFound();
  return <TopicSlugClient slug={slug} />;
}
