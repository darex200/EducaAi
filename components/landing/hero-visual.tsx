"use client";

import { useEffect, useRef } from "react";
import { BrandLogo } from "@/components/brand-logo";

export function HeroVisual() {
  const orbRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleMove = (event: MouseEvent) => {
      if (!orbRef.current) return;
      const { innerWidth, innerHeight } = window;
      const x = (event.clientX / innerWidth - 0.5) * 18;
      const y = (event.clientY / innerHeight - 0.5) * -18;
      orbRef.current.style.transform = `rotateX(${10 + y}deg) rotateY(${x}deg)`;
    };

    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  return (
    <div className="relative mx-auto flex h-[320px] w-full max-w-md items-center justify-center sm:h-[380px] lg:mx-0 lg:max-w-none">
      <div
        className="landing-glow absolute inset-0 rounded-full blur-3xl"
        aria-hidden="true"
      />

      <div className="landing-float-card landing-float-delay-1 absolute left-0 top-8 hidden rounded-2xl border border-white/70 bg-white/90 px-4 py-3 shadow-lg sm:block">
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Tutor IA</p>
        <p className="mt-1 text-sm text-slate-600">Guía socrática paso a paso</p>
      </div>

      <div className="landing-float-card landing-float-delay-2 absolute right-0 top-16 hidden rounded-2xl border border-white/70 bg-white/90 px-4 py-3 shadow-lg sm:block">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Progreso</p>
        <div className="mt-2 h-2 w-28 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-blue-500 to-indigo-500" />
        </div>
      </div>

      <div className="landing-float-card landing-float-delay-3 absolute bottom-10 left-6 hidden rounded-2xl border border-white/70 bg-white/90 px-4 py-3 shadow-lg md:block">
        <p className="text-xs font-semibold uppercase tracking-wide text-sky-600">Adaptativo</p>
        <p className="mt-1 text-sm text-slate-600">Ajusta el ritmo a tu nivel</p>
      </div>

      <div
        ref={orbRef}
        className="perspective-1000 relative z-10 flex h-48 w-48 items-center justify-center sm:h-56 sm:w-56"
        aria-hidden="true"
      >
        <div className="smooth-3d relative flex h-full w-full items-center justify-center">
          <div className="absolute inset-4 rounded-full bg-gradient-to-br from-blue-400/30 via-indigo-500/20 to-purple-500/25 blur-2xl" />
          <BrandLogo className="relative h-36 w-36 drop-shadow-[0_24px_40px_rgba(37,99,235,0.35)] sm:h-44 sm:w-44" />
        </div>
      </div>
    </div>
  );
}
