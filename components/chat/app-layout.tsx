"use client";

type AppLayoutProps = {
  sidebar: React.ReactNode;
  children: React.ReactNode;
};

export function AppLayout({ sidebar, children }: AppLayoutProps) {
  return (
    <div className="h-screen w-full bg-slate-100">
      <div className="mx-auto flex h-full max-w-[1880px] gap-4 px-3 py-3 sm:px-4">
        <aside className="hidden h-full w-72 shrink-0 lg:block">{sidebar}</aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
