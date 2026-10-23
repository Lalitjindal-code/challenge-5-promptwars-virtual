import { useCallback, useEffect, useState } from "react";
import { DashboardPreview, Events, Features, FinalCTA, Footer, Header, Hero, HowItWorks } from "../components/Sections";
import EventModal, { type PlannedEvent } from "../components/EventModal";

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

  useEffect(() => {
    setLatestEvent(getLatestEvent());
  }, []);

  const openPlanner = useCallback(() => setModalOpen(true), []);
  const closePlanner = useCallback(() => setModalOpen(false), []);
  const handleCreated = useCallback((event: PlannedEvent) => setLatestEvent(event), []);

  return (
    <div className="min-h-screen bg-background font-body-md text-on-surface antialiased selection:bg-secondary-fixed selection:text-on-secondary-fixed">
      <Header onPlan={openPlanner} />
      <main className="w-full pt-[76px] bg-background min-h-[calc(100vh-76px)]">
        <Hero onPlan={openPlanner} />
        <Events onPlan={openPlanner} />
        <Features onPlan={openPlanner} />
        <HowItWorks onPlan={openPlanner} />
        <DashboardPreview latestEvent={latestEvent} onPlan={openPlanner} />
        <FinalCTA onPlan={openPlanner} />
      </main>
      <Footer />
      <EventModal open={modalOpen} onClose={closePlanner} onCreated={handleCreated} />
    </div>
  );
}
