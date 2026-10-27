import React, { useEffect, useRef } from "react";

interface SmoothScrollProviderProps {
  children: React.ReactNode;
  enabled?: boolean;
}

/**
 * Lenis Smooth Scroll Provider for public pages
 * Respects prefers-reduced-motion, handles cleanup, and keeps touch native.
 * Dynamically loads Lenis to keep critical-path bundle lean.
 */
export const SmoothScrollProvider: React.FC<SmoothScrollProviderProps> = ({
  children,
  enabled = true,
}) => {
  const lenisRef = useRef<any>(null);

  useEffect(() => {
    // Respect user's motion preference
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (!enabled || prefersReducedMotion) {
      return;
    }

    let isMounted = true;
    let rafId: number;

    import("lenis").then(({ default: Lenis }) => {
      if (!isMounted) return;

      const lenis = new Lenis({
        duration: 1.15,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: "vertical",
        gestureOrientation: "vertical",
        smoothWheel: true,
        touchMultiplier: 1.2,
      });

      lenisRef.current = lenis;

      function raf(time: number) {
        lenis.raf(time);
        rafId = requestAnimationFrame(raf);
      }

      rafId = requestAnimationFrame(raf);
    });

    return () => {
      isMounted = false;
      cancelAnimationFrame(rafId);
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
      }
    };
  }, [enabled]);

  return <>{children}</>;
};

export default SmoothScrollProvider;
