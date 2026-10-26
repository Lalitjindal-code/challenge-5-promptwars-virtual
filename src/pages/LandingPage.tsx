import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DashboardPreview, Events, Features, FinalCTA, Footer, Header, Hero, HowItWorks } from "../components/Sections";
import EventModal, { type PlannedEvent } from "../components/EventModal";
import SmoothScrollProvider from "../components/motion/SmoothScrollProvider";

gsap.registerPlugin(ScrollTrigger);

const STORAGE_KEY = "planora.events.v1";

function getLatestEvent(): PlannedEvent | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (!value) return null;
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) && parsed.length > 0 ? (parsed[0] as PlannedEvent) : null;
  } catch {
    return null;
  }
}

export default function LandingPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [latestEvent, setLatestEvent] = useState<PlannedEvent | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLatestEvent(getLatestEvent());
  }, []);

  // GSAP ScrollTrigger section reveals with clean lifecycle cleanup
  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      const revealElements = gsap.utils.toArray<HTMLElement>(".gsap-reveal");
      revealElements.forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.75,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 88%",
              toggleActions: "play none none none",
            },
          }
        );
      });
    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, []);

  const openPlanner = useCallback(() => setModalOpen(true), []);
  const closePlanner = useCallback(() => setModalOpen(false), []);
  const handleCreated = useCallback((event: PlannedEvent) => setLatestEvent(event), []);

  return (
    <SmoothScrollProvider enabled={true}>
      <div
        ref={containerRef}
        className="min-h-screen bg-background font-body-md text-on-surface antialiased selection:bg-secondary-fixed selection:text-on-secondary-fixed"
      >
        <Header onPlan={openPlanner} />
        <main className="w-full pt-[76px] bg-background min-h-[calc(100vh-76px)] overflow-x-hidden">
          <Hero onPlan={openPlanner} />
          <div className="gsap-reveal">
            <Events onPlan={openPlanner} />
          </div>
          <div className="gsap-reveal">
            <Features onPlan={openPlanner} />
          </div>
          <div className="gsap-reveal">
            <HowItWorks onPlan={openPlanner} />
          </div>
          <div className="gsap-reveal">
            <DashboardPreview latestEvent={latestEvent} onPlan={openPlanner} />
          </div>
          <div className="gsap-reveal">
            <FinalCTA onPlan={openPlanner} />
          </div>
        </main>
        <Footer />
        <EventModal open={modalOpen} onClose={closePlanner} onCreated={handleCreated} />
      </div>
    </SmoothScrollProvider>
  );
}
