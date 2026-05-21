"use client";

type AppLayoutProps = {
  sidebar: React.ReactNode;
  children: React.ReactNode;
};

export function AppLayout({ sidebar, children }: AppLayoutProps) {
  return (
    <div className="h-[calc(100vh-12rem)] min-h-[680px] w-full overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-100/80 p-2 shadow-sm">
      <div className="mx-auto flex h-full max-w-[1440px] gap-2">
        <aside className="hidden h-full w-72 shrink-0 lg:block">{sidebar}</aside>
        <main className="min-w-0 flex-1 overflow-hidden rounded-[1.5rem]">{children}</main>
      </div>
    </div>
  );
}
