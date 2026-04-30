"use client";

import Link from "next/link";

export function Navbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-indigo-100/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="text-lg font-semibold tracking-tight text-indigo-700">
          Educa AI
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          <Link href="/dashboard" className="rounded-full px-3 py-1.5 text-indigo-700 transition hover:bg-indigo-50">
            Panel
          </Link>
          <Link href="/dashboard/topics" className="rounded-full px-3 py-1.5 text-indigo-700 transition hover:bg-indigo-50">
            Temas
          </Link>
        </nav>
      </div>
    </header>
  );
}
