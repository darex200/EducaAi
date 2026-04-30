"use client";

import Link from "next/link";
import type { Lesson } from "@/lib/lessons";
type TopicCardProps = { lesson: Lesson };

export function TopicCard({ lesson }: TopicCardProps) {
  return (
    <Link
      href={`/dashboard/topics/${lesson.slug}`}
      className="card-surface block w-full p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
    >
      <h2 className="mb-2 text-lg font-semibold text-slate-900">{lesson.title}</h2>
      <p className="mb-4 text-sm leading-6 text-slate-600">{lesson.explanation}</p>
      <span className="text-xs font-semibold text-slate-500">Abrir interfaz del tema</span>
    </Link>
  );
}
