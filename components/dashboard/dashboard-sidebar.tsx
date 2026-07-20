"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Aprendizaje" },
  { href: "/dashboard/topics", label: "Temas" },
  { href: "/dashboard/ai-tutor", label: "Tutor IA" },
  { href: "/dashboard/progress", label: "Progreso" },
  { href: "/dashboard/plan", label: "Plan de estudio" },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <>
      <nav className="-mx-1 flex gap-2 overflow-x-auto pb-1 lg:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {links.map((link) => {
          const isActive =
            pathname === link.href ||
            (link.href === "/dashboard/topics" && pathname.startsWith("/dashboard/topics/"));

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-medium transition ${
                isActive
                  ? "bg-blue-600 text-white shadow-sm"
                  : "border border-slate-200 bg-white text-slate-600"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <aside className="card-surface hidden h-fit w-full border-slate-200 p-4 lg:block lg:w-64">
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
    </>
  );
}
