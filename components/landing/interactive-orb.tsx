"use client";

import { useEffect, useRef } from "react";
import { BrandLogo } from "@/components/brand-logo";

export function InteractiveOrb() {
  const orbRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleMove = (event: MouseEvent) => {
      if (!orbRef.current) return;
      const { innerWidth, innerHeight } = window;
      const x = (event.clientX / innerWidth - 0.5) * 24;
      const y = (event.clientY / innerHeight - 0.5) * -24;
      orbRef.current.style.transform = `rotateX(${12 + y}deg) rotateY(${x}deg)`;
    };

    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  return (
    <div className="perspective-1000 relative h-44 w-44 sm:h-52 sm:w-52 lg:h-60 lg:w-60">
      <div ref={orbRef} className="smooth-3d absolute inset-0 flex items-center justify-center" aria-hidden="true">
        <BrandLogo className="h-32 w-32 drop-shadow-[0_24px_36px_rgba(37,99,235,0.28)] sm:h-40 sm:w-40 lg:h-48 lg:w-48" />
      </div>
    </div>
  );
}
