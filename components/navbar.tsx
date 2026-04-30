"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Inicio" },
  { href: "/dashboard/topics", label: "Temas" },
  { href: "/dashboard/ai-tutor", label: "Tutor IA" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/90 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="text-lg font-semibold tracking-tight text-slate-900">
          Educa AI
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href === "/dashboard/topics" && pathname.startsWith("/dashboard/topics/"));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative rounded-lg px-3 py-1.5 transition-all duration-200 ${
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {item.label}
                <span
                  className={`absolute -bottom-1 left-2 right-2 h-0.5 rounded-full bg-blue-600 transition-all duration-200 ${
                    isActive ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0"
                  }`}
                />
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
