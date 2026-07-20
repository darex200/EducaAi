"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { LanguageToggle } from "@/components/language-toggle";
import { useLanguage } from "@/context/language-context";

type AppLayoutProps = {
  renderSidebar: (helpers: { closeMobileNav: () => void }) => React.ReactNode;
  children: React.ReactNode;
  isDarkMode?: boolean;
  embedded?: boolean;
};

export function AppLayout({
  renderSidebar,
  children,
  isDarkMode = false,
  embedded = false,
}: AppLayoutProps) {
  const { t } = useLanguage();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileNavOpen]);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileNavOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileNavOpen]);

  const closeMobileNav = () => setMobileNavOpen(false);
  const shellHeight = embedded
    ? "h-[min(72dvh,640px)] sm:h-[min(78dvh,720px)] lg:h-[calc(100vh-11rem)]"
    : "h-[100dvh]";

  return (
    <div
      data-theme={isDarkMode ? "dark" : "light"}
      className={`chat-shell theme-animate-deep flex w-full flex-col overflow-hidden ${shellHeight} ${
        isDarkMode ? "chat-shell-dark" : ""
      }`}
    >
      <div
        className={`theme-animate flex shrink-0 items-center justify-between gap-2 border-b px-3 py-2 sm:gap-3 sm:px-4 ${
          isDarkMode ? "border-[var(--dark-border)]" : "border-slate-200/70"
        }`}
      >
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border lg:hidden ${
              isDarkMode
                ? "border-[var(--dark-border-strong)] bg-[var(--dark-surface)] text-slate-100"
                : "border-slate-200 bg-white text-slate-700"
            }`}
            aria-label={mobileNavOpen ? t("landingCloseMenu") : t("landingOpenMenu")}
            aria-expanded={mobileNavOpen}
            onClick={() => setMobileNavOpen((open) => !open)}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileNavOpen ? (
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
              )}
            </svg>
          </button>
          <Link
            href="/"
            className={`inline-flex min-w-0 items-center gap-2 rounded-lg px-1.5 py-1 text-sm font-semibold tracking-tight transition ${
              isDarkMode
                ? "text-slate-100 hover:bg-white/5"
                : "text-slate-900 hover:bg-slate-100/80"
            }`}
            aria-label="EducaAI — ir a la página principal"
          >
            <BrandLogo className="h-7 w-7 shrink-0" />
            <span className="truncate">EducaAI</span>
          </Link>
        </div>
        <LanguageToggle isDarkMode={isDarkMode} />
      </div>

      <div className="flex min-h-0 w-full flex-1 gap-1.5 px-1 py-1 sm:px-2 lg:pl-0 lg:pr-2">
        <aside className="theme-animate hidden h-full w-[252px] shrink-0 overflow-hidden rounded-r-2xl lg:block">
          {renderSidebar({ closeMobileNav: () => undefined })}
        </aside>
        <main className="theme-animate min-h-0 min-w-0 flex-1">{children}</main>
      </div>

      {mobileNavOpen ? (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/45 backdrop-blur-[1px]"
            aria-label={t("landingCloseMenu")}
            onClick={closeMobileNav}
          />
          <aside
            className={`relative z-10 flex h-full w-[min(88vw,320px)] max-w-full flex-col overflow-hidden shadow-2xl ${
              isDarkMode ? "chat-sidebar-dark" : "bg-white"
            }`}
          >
            {renderSidebar({ closeMobileNav })}
          </aside>
        </div>
      ) : null}
    </div>
  );
}
