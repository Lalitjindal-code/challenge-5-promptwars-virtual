import React, { useEffect, useRef } from "react";

/**
 * AmbientCanvas
 * Restrained, high-performance ambient light canvas for Planora hero.
 * Uses soft floating brand-tinted light waves with IntersectionObserver pausing.
 */
export const AmbientCanvas: React.FC<{ className?: string }> = ({ className = "" }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let isVisible = true;
    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth || window.innerWidth);
    let height = (canvas.height = canvas.offsetHeight || 600);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth || window.innerWidth;
      height = canvas.height = canvas.offsetHeight || 600;
    };

    window.addEventListener("resize", handleResize, { passive: true });

    // Light orb definitions with brand palette
    const orbs = [
      { x: width * 0.2, y: height * 0.35, r: 240, vx: 0.2, vy: 0.15, color: "rgba(115, 87, 219, 0.08)" }, // Violet
      { x: width * 0.75, y: height * 0.45, r: 280, vx: -0.15, vy: -0.2, color: "rgba(214, 168, 95, 0.07)" }, // Gold
      { x: width * 0.5, y: height * 0.6, r: 200, vx: 0.18, vy: -0.12, color: "rgba(23, 35, 59, 0.05)" },    // Navy
    ];

    // IntersectionObserver to freeze canvas when user scrolls out of hero view
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
        });
      },
      { threshold: 0.05 }
    );
    observer.observe(canvas);

    let lastTime = performance.now();

    const render = (time: number) => {
      if (!isVisible || prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      // Render each soft ambient orb
      orbs.forEach((orb) => {
        orb.x += orb.vx * dt * 45;
        orb.y += orb.vy * dt * 45;

        // Bounce gently inside canvas bounds
        if (orb.x < -orb.r * 0.5) orb.vx *= -1;
        if (orb.x > width + orb.r * 0.5) orb.vx *= -1;
        if (orb.y < -orb.r * 0.5) orb.vy *= -1;
        if (orb.y > height + orb.r * 0.5) orb.vy *= -1;

        const gradient = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.r);
        gradient.addColorStop(0, orb.color);
        gradient.addColorStop(1, "transparent");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.r, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 h-full w-full opacity-90 ${className}`}
      aria-hidden="true"
    />
  );
};

export default AmbientCanvas;
