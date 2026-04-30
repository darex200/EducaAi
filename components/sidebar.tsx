"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Aprendizaje" },
  { href: "/dashboard/topics", label: "Temas" },
  { href: "/dashboard/ai-tutor", label: "Tutor IA" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="card-surface h-fit w-full border-slate-200 p-4 lg:w-64">
      <h2 className="mb-4 px-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Navegación
      </h2>
      <nav className="space-y-1.5">
        {links.map((link) => {
          const isActive =
            pathname === link.href ||
            (link.href === "/dashboard/topics" && pathname.startsWith("/dashboard/topics/"));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`block rounded-lg px-3 py-2 text-sm transition-all duration-200 ${
                isActive
                  ? "translate-x-1 bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
