import type { ReactNode } from "react";
import { Navbar } from "@/components/navbar";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-4 sm:px-6 sm:py-6 lg:grid lg:grid-cols-[16rem_1fr] lg:gap-4">
        <DashboardSidebar />
        <section className="min-w-0 pt-3 lg:pt-0">{children}</section>
      </main>
    </div>
  );
}
