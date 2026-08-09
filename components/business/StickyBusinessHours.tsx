"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import { canUseStickyBusinessHours } from "@/lib/sticky-business-hours";

const STICKY_TOP_OFFSET = 136;

export function StickyBusinessHours({ children }: { children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canStick, setCanStick] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function updateStickyState() {
      setCanStick(
        canUseStickyBusinessHours({
          viewportWidth: window.innerWidth,
          viewportHeight: window.innerHeight,
          contentHeight: container?.getBoundingClientRect().height ?? 0,
          topOffset: STICKY_TOP_OFFSET
        })
      );
    }

    updateStickyState();

    const resizeObserver = new ResizeObserver(updateStickyState);
    resizeObserver.observe(container);
    window.addEventListener("resize", updateStickyState);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateStickyState);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={canStick ? "sticky top-[8.5rem]" : undefined}
    >
      {children}
    </div>
  );
}
