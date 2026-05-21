"use client";

type AppLayoutProps = {
  sidebar: React.ReactNode;
  children: React.ReactNode;
  isDarkMode?: boolean;
};

export function AppLayout({ sidebar, children, isDarkMode = false }: AppLayoutProps) {
  return (
    <div className={`chat-shell h-screen w-full overflow-hidden ${isDarkMode ? "chat-shell-dark" : ""}`}>
      <div className="mx-auto flex h-full max-w-[1920px] gap-3 px-2 py-2 sm:gap-4 sm:px-4 sm:py-3">
        <aside className="hidden h-full w-[280px] shrink-0 lg:block">{sidebar}</aside>
        <main className="min-h-0 min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
