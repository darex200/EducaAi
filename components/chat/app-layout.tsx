"use client";

import { LanguageToggle } from "@/components/language-toggle";

type AppLayoutProps = {
  sidebar: React.ReactNode;
  children: React.ReactNode;
  isDarkMode?: boolean;
};

export function AppLayout({ sidebar, children, isDarkMode = false }: AppLayoutProps) {
  return (
    <div
      data-theme={isDarkMode ? "dark" : "light"}
      className={`chat-shell theme-animate-deep flex h-screen w-full flex-col overflow-hidden ${isDarkMode ? "chat-shell-dark" : ""}`}
    >
      <div
        className={`theme-animate flex shrink-0 items-center justify-end border-b px-3 py-2 sm:px-4 ${
          isDarkMode ? "border-[var(--dark-border)]" : "border-slate-200/70"
        }`}
      >
        <LanguageToggle isDarkMode={isDarkMode} />
      </div>
      <div className="mx-auto flex min-h-0 flex-1 max-w-[1920px] gap-3 px-2 py-2 sm:gap-4 sm:px-4 sm:py-3">
        <aside className="theme-animate hidden h-full w-[280px] shrink-0 lg:block">{sidebar}</aside>
        <main className="theme-animate min-h-0 min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
