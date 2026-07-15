"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useLanguage } from "@/context/language-context";

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "E";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export function UserMenu() {
  const { user, logout, isLoading } = useAuth();
  const { t } = useLanguage();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    window.addEventListener("mousedown", handlePointerDown);
    return () => window.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  if (isLoading) return null;

  return (
    <div ref={rootRef} className="fixed bottom-5 right-5 z-[70] sm:bottom-6 sm:right-6">
      {open ? (
        <div className="mb-3 w-56 overflow-hidden rounded-2xl border border-slate-200/90 bg-white/95 shadow-[0_18px_40px_rgba(15,23,42,0.14)] backdrop-blur-xl">
          {user ? (
            <>
              <div className="border-b border-slate-100 px-4 py-3">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {user.name || t("noSession")}
                </p>
                {user.email ? (
                  <p className="truncate text-xs text-slate-500">{user.email}</p>
                ) : null}
              </div>
              <div className="p-2">
                <Link
                  href="/profile"
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
                  onClick={() => setOpen(false)}
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M6 20c1.5-3 4-4 6-4s4.5 1 6 4" />
                  </svg>
                  {t("viewProfile")}
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    void logout();
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
                  </svg>
                  {t("signOut")}
                </button>
              </div>
            </>
          ) : (
            <div className="p-2">
              <Link
                href="/login"
                className="flex w-full items-center justify-center rounded-xl bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-600 px-3 py-2.5 text-sm font-semibold text-white shadow-md"
                onClick={() => setOpen(false)}
              >
                {t("landingSignIn")}
              </Link>
            </div>
          )}
        </div>
      ) : null}

      <button
        type="button"
        aria-label={user ? t("userMenuLabel") : t("landingSignIn")}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-white/80 bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-600 text-sm font-bold text-white shadow-[0_12px_30px_rgba(37,99,235,0.35)] transition hover:scale-[1.03] hover:shadow-[0_16px_36px_rgba(37,99,235,0.42)] active:scale-[0.98]"
      >
        {user?.name ? (
          <span>{getInitials(user.name)}</span>
        ) : (
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="8" r="4" />
            <path d="M6 20c1.5-3 4-4 6-4s4.5 1 6 4" />
          </svg>
        )}
      </button>
    </div>
  );
}
