"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "My Learning" },
  { href: "/dashboard/topics", label: "Topics" },
  { href: "/dashboard/ai-tutor", label: "AI Tutor" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="card-surface h-fit w-full p-4 lg:w-64">
      <h2 className="mb-4 px-2 text-sm font-semibold uppercase tracking-wide text-indigo-500">
        Learning Space
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
              className={`block rounded-xl px-3 py-2 text-sm transition ${
                isActive
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200"
                  : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-700"
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
