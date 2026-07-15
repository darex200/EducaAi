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
      <div className="flex min-h-0 w-full flex-1 gap-1.5 py-1 pl-0 pr-2">
        <aside className="theme-animate hidden h-full w-[252px] shrink-0 overflow-hidden rounded-r-2xl lg:block">
          {sidebar}
        </aside>
        <main className="theme-animate min-h-0 min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
