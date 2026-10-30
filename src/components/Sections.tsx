import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import type { PlannedEvent } from "./EventModal";
import { fadeInUpVariants, containerStaggerVariants } from "../lib/motion";
import AmbientCanvas from "./motion/AmbientCanvas";
import MagneticButton from "./motion/MagneticButton";
import SpotlightCard from "./motion/SpotlightCard";

const images = {
  logo: "/logo.png",
  hero: "https://lh3.googleusercontent.com/aida-public/AB6AXuDihzOyFLz5dKPsCJ3dMYDNxJC9jF0nuF1RyMUrfQpgOemoM3evPJoLk2cInZofMXjuGH-u8oYU6cGrmiIRw-OzJnQSMq9KLQOo4XzPZ8fpZpSvK1gX-U44mbrg4qid-aQP1kabfAEff6l5JaQBDUQPygcc6QL-9X6-juK8rP9bGntMvHdBaylA9f0appdpsrS8xfu3avDN91Dmx0aqsLzjoGW0ui7NeMKt403lsWLEAcVu3v6PRsQgyg",
  wedding: "https://lh3.googleusercontent.com/aida-public/AB6AXuBe3rLirqrcUckwbxQ7kyj7z8nMjBLyrGkpBz8zynL2WVP2HdvljGwaNcE-9i-uAJC8jYl5K3y9dvBCgRkfswRpzmEe1KHTy1Uw-lIOcIkf-eaAp8ofbaVJt2nIDw8HkR5qOIzHKxB2cS1CZuxHrhsZYR62V7ldftGkrB3ypiQHM_wFfw38QBV9d68c6MXnjuQtxLdrlHtOujmmlUvyHVYjmtqtaUJknGAeokXgSSzJag8lzLcgwY4itQ",
  birthday: "https://lh3.googleusercontent.com/aida-public/AB6AXuDdrGQ5buh_Y88_xssyKqZPYKt2S2w9D3-JV1itMfO7oXVDcfLcIXAcuscYNTEiu5rSWjt8M7VOs4wzLzR6n4aYEUj08HxLLF9kKMUG39NEKPt0UW1OHmQ983ZWUkbuK4JpcyzwO2TKsqrkKrH2VdE8pQ2T6sVlzwo0z31zSjUOKWOeNYtJuuPKZgYakoGXUBtrieRsPSob_VB9QFg7Tl_3hXXhfcMtg1u8tbopOUWeURo_iNjXO9gY0Q",
  anniversary: "https://lh3.googleusercontent.com/aida-public/AB6AXuAU38FCIMc7stHR7QUX2jDHJyNyZRlyLrQR-68UxnYkCv0Ysbfqm7KvYgJ34qwKmu60Wn46ikdPl5ELFtQZxa8czsJnSg5ZxTgIXSkD6vdxLBOUa_swnXHJdPxB1a4fDkRWTMDeXdhEz0S8g1cgf78XAEhtcFCHx75YbnzwF271kbHhxGxgK86BUBP0WnG94z0WqGsKbBS0Q6zRCW7wmXbFFaTriwEP-83g2e6oA2uPldV52eTtVHcVew",
  community: "https://lh3.googleusercontent.com/aida-public/AB6AXuDOhBi_CEiz6lOlsb_r9O3YUDZnN2yM6ZAtuATH2xDzxjtKC9Uu_YelDP_gYfX3nRr9BWlheRUBCezEUe1DG69pe2aicZoOJlJj3CHO1YSs8u1rwFHRPcB5CmUwznjJu1TMszQlM1fLOPB-7_7E3vuWQAuXOCueKNrBFJNXYATaA6PVM9MUWQQMoCRzzwQP-wNApr83U4j0kO9IOhhww2Mv2iQJZ1ILNusNwlLsP_5K2WxIAwTkfRT2bw"
};

function SafeImage({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={(event) => {
        const image = event.currentTarget;
        image.onerror = null;
        image.src =
          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 500'%3E%3Crect width='800' height='500' fill='%23e8edff'/%3E%3Cpath d='M0 400L210 220 360 350 520 170 800 400V500H0Z' fill='%23d6a85f' opacity='.45'/%3E%3Ccircle cx='620' cy='100' r='45' fill='%237357db' opacity='.25'/%3E%3Ctext x='400' y='460' font-family='Arial' font-size='24' text-anchor='middle' fill='%2317233b'%3EPlanora AI%3C/text%3E%3C/svg%3E";
      }}
    />
  );
}

/* -------------------------------------------------------------
 * HEADER COMPONENT (Exact Stitch design + Log In & Sign Up)
 * ----------------------------------------------------------- */
export function Header({ onPlan }: { onPlan: () => void }) {
  const { user } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest border-b border-outline-variant">
      <div className="h-[76px] w-full max-w-[1440px] mx-auto px-margin-mobile md:px-margin-tablet lg:px-margin flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-space-sm group">
          <img
            alt="Planora AI Logo"
            className="h-10 w-10 object-contain rounded-lg shadow-sm border border-outline-variant/10 group-hover:scale-105 transition-transform"
            src="/logo.png"
          />
          <span className="font-headline-sm text-headline-sm text-on-surface tracking-tight group-hover:text-primary transition-colors font-bold">
            Planora <span className="text-secondary font-heading">AI</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-space-xl">
          <a
            className="font-body-md-medium text-body-md-medium text-on-surface-variant hover:text-on-surface transition-colors"
            href="#features"
          >
            Features
          </a>
          <a
            className="font-body-md-medium text-body-md-medium text-on-surface-variant hover:text-on-surface transition-colors"
            href="#how-it-works"
          >
            How It Works
          </a>
          <a
            className="font-body-md-medium text-body-md-medium text-on-surface-variant hover:text-on-surface transition-colors"
            href="#events"
          >
            Events
          </a>
          <a
            className="font-body-md-medium text-body-md-medium text-on-surface-variant hover:text-on-surface transition-colors"
            href="#about"
          >
            About
          </a>
        </nav>

        {/* Right CTA / Auth Controls */}
        <div className="flex items-center gap-2 sm:gap-space-md">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container text-primary font-body-md-medium text-body-md-medium hover:bg-surface-variant transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">dashboard</span>
                <span className="hidden sm:inline">Go to Dashboard</span>
              </Link>
              <button
                type="button"
                onClick={onPlan}
                className="inline-flex items-center gap-space-xs bg-primary-container text-on-primary font-body-md-medium text-body-md-medium px-space-md py-space-sm rounded-lg shadow-[0_2px_0_0_#020d24] hover:bg-primary transition-all active:translate-y-[1px]"
              >
                <span>Plan Event</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
              <Link
                to="/settings"
                className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold text-xs ring-2 ring-primary/10 overflow-hidden hover:opacity-90 transition-opacity"
                title={user.email ?? "Profile"}
              >
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span>{user.displayName?.[0]?.toUpperCase() ?? user.email?.[0]?.toUpperCase() ?? "U"}</span>
                )}
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/signin"
                className="font-body-md-medium text-body-md-medium text-on-surface-variant hover:text-on-surface px-3 py-1.5 transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="font-body-md-medium text-body-md-medium text-secondary hover:text-primary px-3 py-1.5 font-semibold transition-colors hidden sm:inline"
              >
                Sign Up
              </Link>
              <button
                type="button"
                onClick={onPlan}
                className="inline-flex items-center gap-space-xs bg-primary-container text-on-primary font-body-md-medium text-body-md-medium px-space-md py-space-sm rounded-lg shadow-[0_2px_0_0_#020d24] hover:bg-primary transition-all active:translate-y-[1px]"
              >
                <span>Plan My Event</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
              <Link
                to="/signin"
                className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary hover:bg-primary-container transition-colors"
                title="Account"
              >
                <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

/* -------------------------------------------------------------
 * 1. HERO SECTION (Exact Stitch Design with Motion Upgrade)
 * ----------------------------------------------------------- */
export function Hero({ onPlan }: { onPlan: () => void }) {
  const [tasks, setTasks] = useState([
    { id: 1, text: "Venue booking confirmed • Courtyard reserved", done: true },
    { id: 2, text: "Curate acoustic quartet playlist", done: true },
    { id: 3, text: "Finalize artisanal dinner tasting menu", done: false },
  ]);

  const toggleTask = (id: number) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  return (
    <section className="relative w-full max-w-[1440px] mx-auto px-margin-mobile md:px-margin-tablet lg:px-margin pt-space-xl pb-16 lg:pb-24 overflow-hidden">
      {/* Background Ambient Light Canvas */}
      <AmbientCanvas className="opacity-70" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-gutter items-center">
        {/* Left Column: Copy & Actions */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerStaggerVariants}
          className="lg:col-span-6 flex flex-col items-start pr-0 lg:pr-space-md"
        >
          <motion.div
            variants={fadeInUpVariants}
            className="inline-flex items-center gap-space-xs px-3.5 py-1.5 rounded-full bg-surface-container-high text-tertiary-container shadow-xs mb-space-md border border-outline-variant/20"
          >
            <span className="material-symbols-outlined text-[15px] text-tertiary-container">auto_awesome</span>
            <span className="font-label-sm text-label-sm tracking-wide uppercase font-semibold text-tertiary-container">
              Your Personal AI Event Planner
            </span>
          </motion.div>

          <motion.h1
            variants={fadeInUpVariants}
            className="font-headline-xl text-[40px] md:text-[52px] lg:text-[58px] leading-[1.08] text-primary font-bold tracking-tight mb-space-md"
          >
            Plan Beautiful Events.
            <br className="hidden sm:inline" /> Without the Stress.
          </motion.h1>

          <motion.p
            variants={fadeInUpVariants}
            className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed max-w-xl mb-space-lg"
          >
            From intimate weddings to milestones and dinners, turn scattered ideas into a thoughtful, budget-aware event
            plan in minutes.
          </motion.p>

          <motion.div
            variants={fadeInUpVariants}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-space-sm sm:gap-space-md w-full sm:w-auto mb-space-md"
          >
            <MagneticButton
              type="button"
              onClick={onPlan}
              className="inline-flex items-center justify-center gap-space-xs bg-primary-container text-on-primary font-body-md-medium text-body-md-medium px-7 py-3.5 rounded-xl shadow-[0_4px_12px_rgba(23,35,59,0.18)] hover:bg-primary transition-all active:translate-y-[1px]"
            >
              <span>Plan My Event</span>
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </MagneticButton>
            <a
              className="inline-flex items-center justify-center bg-surface-container-lowest text-on-surface border border-outline-variant/30 font-body-md-medium text-body-md-medium px-7 py-3.5 rounded-xl shadow-xs hover:bg-surface-container-low transition-all active:translate-y-[1px]"
              href="#features"
            >
              <span>Explore Features</span>
            </a>
          </motion.div>

          <motion.div
            variants={fadeInUpVariants}
            className="flex items-center gap-space-xs text-on-surface-variant font-caption text-body-md mt-1"
          >
            <span className="material-symbols-outlined text-secondary text-[18px]">verified</span>
            <span>Your ideas. Your budget. A plan built effortlessly around you.</span>
          </motion.div>
        </motion.div>

        {/* Right Column: Visual Composition with Hero Photo & Floating Card */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-6 relative mt-10 lg:mt-0 flex flex-col items-center"
        >
          <div className="w-full relative rounded-2xl overflow-hidden shadow-xl bg-surface-container-low border border-outline-variant/30 group">
            <SafeImage
              className="w-full h-[360px] md:h-[420px] object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              alt="An elegant evening Tuscan outdoor wedding dinner with long rustic wooden tables, floral centerpieces of blush garden roses, glowing warm candles, crystal stemware, and overhead string fairy lights in front of a stone villa at dusk."
              src={images.hero}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/35 via-transparent to-transparent pointer-events-none"></div>
          </div>

          {/* Refined Floating Interactive Event Plan Card with Cursor Spotlight */}
          <SpotlightCard
            spotlightColor="rgba(214, 168, 95, 0.14)"
            spotlightSize={400}
            className="w-[92%] sm:w-[88%] lg:w-[94%] xl:w-[90%] -mt-20 md:-mt-24 relative z-10 bg-surface-container-lowest rounded-2xl p-space-md md:p-space-lg shadow-2xl border border-outline-variant/30 backdrop-blur-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-space-xs mb-space-md pb-space-xs border-b border-outline-variant/30">
              <div>
                <h3 className="font-title-md text-[18px] text-on-surface font-semibold">An Evening to Remember</h3>
                <p className="font-caption text-on-surface-variant flex items-center gap-1 mt-1">
                  <span className="material-symbols-outlined text-[15px]">event</span> Sat, Oct 18, 2025 • Tuscan Courtyard
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-surface-container text-on-surface font-caption font-semibold">
                  120 Guests
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-surface-container-high text-tertiary-container font-caption font-semibold">
                  <span className="material-symbols-outlined text-[14px] text-tertiary-container">auto_awesome</span> AI Optimized
                </span>
              </div>
            </div>

            <div className="bg-surface-container-low rounded-xl p-space-sm mb-space-md">
              <div className="flex justify-between items-center font-caption text-on-surface-variant mb-2">
                <span>
                  Budget Allocation: <strong className="text-on-surface font-semibold">₹1,20,000</strong>
                </span>
                <span>
                  Estimated spend: <strong className="text-secondary font-semibold">₹78,000</strong>
                </span>
              </div>
              <div className="w-full h-2.5 bg-surface-container rounded-full overflow-hidden flex">
                <div className="bg-primary-container h-full w-[45%] transition-all duration-500"></div>
                <div className="bg-secondary h-full w-[20%] transition-all duration-500"></div>
                <div className="bg-transparent h-full w-[35%]"></div>
              </div>
            </div>

            {/* Interactive Tasks */}
            <div className="space-y-2.5 mb-space-md">
              {tasks.map((task) => (
                <button
                  type="button"
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className="w-full flex items-center gap-2.5 text-[14px] font-body-md text-left p-1 rounded-lg hover:bg-surface-container-low transition-colors"
                >
                  <span
                    className={`material-symbols-outlined text-[18px] transition-colors ${
                      task.done ? "text-green-700" : "text-outline-variant"
                    }`}
                  >
                    {task.done ? "check_circle" : "radio_button_unchecked"}
                  </span>
                  <span
                    className={`font-medium transition-all ${
                      task.done ? "text-on-surface line-through opacity-85" : "text-on-surface-variant"
                    }`}
                  >
                    {task.text}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between gap-space-xs p-3 rounded-xl bg-surface-container-high border border-outline-variant/15">
              <div className="flex items-center gap-2 min-w-0">
                <span className="material-symbols-outlined text-tertiary-container text-[18px] shrink-0 animate-pulse">auto_awesome</span>
                <p className="font-caption text-tertiary-container truncate font-medium">
                  <strong>AI Recommendation:</strong> Curate Tuscan wine pairing &amp; outdoor heating
                </p>
              </div>
              <span className="font-caption text-tertiary-container shrink-0 text-[11px] font-semibold bg-surface-container-lowest px-2 py-0.5 rounded-full shadow-2xs">
                Ready
              </span>
            </div>
          </SpotlightCard>
        </motion.div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------
 * 2. EVENT CATEGORIES SECTION (Exact Stitch Design)
 * ----------------------------------------------------------- */
export function Events({ onPlan }: { onPlan: () => void }) {
  const cards = [
    {
      title: "Weddings",
      desc: "Intimate ceremonies to grand receptions with tailored timelines and coordinated vendor contracts.",
      meta: "Timelines • Seating • Vendors",
      img: images.wedding,
      alt: "Outdoor wedding ceremony banquet under warm fairy lights"
    },
    {
      title: "Birthdays",
      desc: "Milestone parties, chic dinner soirées, and immersive themed gatherings planned effortlessly.",
      meta: "Themes • Menus • Playlists",
      img: images.birthday,
      alt: "Young adults celebrating birthday with drinks"
    },
    {
      title: "Anniversaries",
      desc: "Romantic celebrations, family reunions, and commemorative legacy banquets with thoughtful touches.",
      meta: "Venues • Keepsakes • Budgets",
      img: images.anniversary,
      alt: "Elderly couple celebrating anniversary"
    },
    {
      title: "Community Events",
      desc: "Festivals, workshops, fundraisers, and courtyard block parties made structured and seamless.",
      meta: "Schedules • Logistics • RSVPs",
      img: images.community,
      alt: "Community dinner gathering in outdoor courtyard"
    }
  ];

  return (
    <section className="w-full bg-surface-container-low py-16 lg:py-24" id="events">
      <div className="w-full max-w-[1440px] mx-auto px-margin-mobile md:px-margin-tablet lg:px-margin">
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-space-xl">
          <span className="font-label-md text-label-md uppercase tracking-wider text-secondary font-semibold mb-space-xs">
            Versatile Occasions
          </span>
          <h2 className="font-headline-lg text-headline-lg text-primary font-bold tracking-tight mb-space-xs">
            Whatever You’re Celebrating
          </h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            One thoughtful, personalized blueprint for every memorable moment.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
          {cards.map((card) => (
            <SpotlightCard
              key={card.title}
              spotlightColor="rgba(214, 168, 95, 0.16)"
              spotlightSize={320}
              onClick={onPlan}
              className="group flex flex-col bg-surface-container-lowest rounded-2xl overflow-hidden shadow-xs hover:shadow-xl border border-outline-variant/30 transition-all duration-300 hover:-translate-y-1.5 cursor-pointer"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-surface-container">
                <SafeImage
                  alt={card.alt}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  src={card.img}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/35 to-transparent pointer-events-none opacity-60 group-hover:opacity-40 transition-opacity"></div>
              </div>
              <div className="p-space-md flex flex-col flex-1 justify-between">
                <div>
                  <h3 className="font-title-md text-[18px] font-semibold text-primary mb-1.5 group-hover:text-secondary transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-[14px] leading-relaxed text-on-surface-variant mb-space-md">{card.desc}</p>
                </div>
                <div className="pt-space-sm border-t border-outline-variant/30 flex items-center justify-between text-on-surface-variant">
                  <span className="font-caption text-on-surface-variant font-medium">{card.meta}</span>
                  <span className="material-symbols-outlined text-[18px] text-primary group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </div>
              </div>
            </SpotlightCard>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------
 * 3. FEATURE SHOWCASE SECTION (Exact Stitch Design)
 * ----------------------------------------------------------- */
export function Features({ onPlan: _onPlan }: { onPlan: () => void }) {
  return (
    <section className="w-full max-w-[1440px] mx-auto px-margin-mobile md:px-margin-tablet lg:px-margin py-16 lg:py-24" id="features">
      {/* Header */}
      <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-space-xl">
        <h2 className="font-headline-lg text-headline-lg text-primary font-bold tracking-tight mb-space-xs">
          Everything Your Event Needs. In One Plan.
        </h2>
        <p className="font-body-lg text-body-lg text-on-surface-variant">
          Built for hosts who value thoughtful details, realistic budgets, and calm execution.
        </p>
      </div>

      {/* 2x2 Feature Bento */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
        {/* Card 1: Budget */}
        <SpotlightCard
          spotlightColor="rgba(214, 168, 95, 0.14)"
          spotlightSize={380}
          className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-xs hover:shadow-xl border border-outline-variant/30 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-secondary-fixed flex items-center justify-center mb-space-md text-on-secondary-fixed shadow-2xs">
              <span className="material-symbols-outlined text-[24px]">account_balance_wallet</span>
            </div>
            <h3 className="font-title-md text-[20px] font-semibold text-primary mb-space-xs">Smart Budget Planning</h3>
            <p className="text-[15px] leading-relaxed text-on-surface-variant mb-space-md">
              Break down your budget, estimate expenses dynamically, and understand exactly where your funds go without hidden surprises.
            </p>
          </div>
          <div className="bg-surface-container-low rounded-xl p-space-md border border-outline-variant/30">
            <div className="flex justify-between items-center text-caption font-caption text-on-surface-variant mb-2.5">
              <span>
                Total Budget: <strong className="text-on-surface font-semibold">₹2,50,000</strong>
              </span>
              <span className="text-secondary font-semibold">Tracked (100%)</span>
            </div>
            <div className="flex h-3 w-full rounded-full overflow-hidden gap-0.5 mb-3 bg-surface-container">
              <div className="bg-primary-container h-full w-[45%]"></div>
              <div className="bg-secondary h-full w-[30%]"></div>
              <div className="bg-tertiary-container h-full w-[15%]"></div>
              <div className="bg-outline-variant h-full w-[10%]"></div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-caption text-caption text-on-surface">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-primary-container"></span> Venue 45%
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span> Catering 30%
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-tertiary-container"></span> Decor 15%
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-outline-variant"></span> Reserve 10%
              </div>
            </div>
          </div>
        </SpotlightCard>

        {/* Card 2: Timeline */}
        <SpotlightCard
          spotlightColor="rgba(115, 87, 219, 0.14)"
          spotlightSize={380}
          className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-xs hover:shadow-xl border border-outline-variant/30 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-tertiary-fixed flex items-center justify-center mb-space-md text-on-tertiary-fixed shadow-2xs">
              <span className="material-symbols-outlined text-[24px]">calendar_month</span>
            </div>
            <h3 className="font-title-md text-[20px] font-semibold text-primary mb-space-xs">Intelligent Timelines</h3>
            <p className="text-[15px] leading-relaxed text-on-surface-variant mb-space-md">
              Turn important dates into an organized run-of-show with automated countdown milestones and syncable alerts.
            </p>
          </div>
          <div className="bg-surface-container-low rounded-xl p-space-md space-y-2.5 border border-outline-variant/30">
            <div className="flex items-center gap-3 bg-surface-container-lowest p-2 rounded-lg">
              <span className="px-2 py-0.5 rounded bg-surface-container font-caption text-on-surface shrink-0 font-semibold">
                T-90 days
              </span>
              <div className="flex-1 text-[13px] font-body-md text-on-surface truncate">
                Confirm venue deposit &amp; capacity
              </div>
              <span className="material-symbols-outlined text-green-700 text-[18px]">check_circle</span>
            </div>
            <div className="flex items-center gap-3 bg-surface-container-lowest p-2 rounded-lg">
              <span className="px-2 py-0.5 rounded bg-surface-container font-caption text-on-surface shrink-0 font-semibold">
                T-30 days
              </span>
              <div className="flex-1 text-[13px] font-body-md text-on-surface truncate">
                Send invitations &amp; dietary queries
              </div>
              <span className="material-symbols-outlined text-secondary text-[18px]">schedule</span>
            </div>
            <div className="flex items-center gap-3 bg-surface-container-lowest p-2 rounded-lg">
              <span className="px-2 py-0.5 rounded bg-surface-container font-caption text-on-surface shrink-0 font-semibold">
                Day of Event
              </span>
              <div className="flex-1 text-[13px] font-body-md text-on-surface truncate">
                Acoustic check &amp; cocktail reception
              </div>
              <span className="material-symbols-outlined text-outline-variant text-[18px]">radio_button_unchecked</span>
            </div>
          </div>
        </SpotlightCard>

        {/* Card 3: Vendor */}
        <SpotlightCard
          spotlightColor="rgba(23, 35, 59, 0.12)"
          spotlightSize={380}
          className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-xs hover:shadow-xl border border-outline-variant/30 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-primary-fixed flex items-center justify-center mb-space-md text-on-primary-fixed shadow-2xs">
              <span className="material-symbols-outlined text-[24px]">fact_check</span>
            </div>
            <h3 className="font-title-md text-[20px] font-semibold text-primary mb-space-xs">Vendor Checklists</h3>
            <p className="text-[15px] leading-relaxed text-on-surface-variant mb-space-md">
              Know what to compare, what key questions to ask, and arrange contracts without overlooked fine-print clauses.
            </p>
          </div>
          <div className="bg-surface-container-low rounded-xl p-space-md border border-outline-variant/30">
            <div className="flex items-center justify-between font-caption text-on-surface-variant mb-2.5 pb-1 border-b border-outline-variant/30">
              <span>Vendor Interview Assistant</span>
              <span className="text-tertiary-container font-semibold">3 Quotes Compared</span>
            </div>
            <div className="space-y-2 text-[13px] font-body-md text-on-surface">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-green-700 text-[18px]">verified</span>
                <span>Check late-night noise ordinances &amp; load-in limits</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-green-700 text-[18px]">verified</span>
                <span>Confirm dietary accommodations (vegan, gluten-free)</span>
              </div>
            </div>
          </div>
        </SpotlightCard>

        {/* Card 4: Ideas */}
        <SpotlightCard
          spotlightColor="rgba(115, 87, 219, 0.16)"
          spotlightSize={380}
          className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-xs hover:shadow-xl border border-outline-variant/30 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center mb-space-md text-tertiary-container shadow-2xs">
              <span className="material-symbols-outlined text-[24px]">palette</span>
            </div>
            <h3 className="font-title-md text-[20px] font-semibold text-primary mb-space-xs">Personalized Ideas</h3>
            <p className="text-[15px] leading-relaxed text-on-surface-variant mb-space-md">
              Discover aesthetic themes, guest activities, decoration palettes, and tailored recommendations that fit your story.
            </p>
          </div>
          <div className="bg-surface-container-low rounded-xl p-space-md border border-outline-variant/30">
            <div className="flex items-center gap-1 font-caption text-tertiary-container font-semibold mb-2.5">
              <span className="material-symbols-outlined text-[15px]">auto_awesome</span> Generated Concept Palettes
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full bg-surface-container-lowest text-on-surface font-caption shadow-2xs border border-outline-variant/30">
                Warm Tuscan Minimalist
              </span>
              <span className="px-3 py-1 rounded-full bg-surface-container-lowest text-on-surface font-caption shadow-2xs border border-outline-variant/30">
                Candlelit Garden
              </span>
              <span className="px-3 py-1 rounded-full bg-surface-container-lowest text-on-surface font-caption shadow-2xs border border-outline-variant/30">
                Golden Hour Acoustic
              </span>
              <span className="px-3 py-1 rounded-full bg-surface-container-lowest text-on-surface font-caption shadow-2xs border border-outline-variant/30">
                Botanical Glasshouse
              </span>
            </div>
          </div>
        </SpotlightCard>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------
 * 4. HOW IT WORKS SECTION (Exact Stitch Design)
 * ----------------------------------------------------------- */
export function HowItWorks({ onPlan: _onPlan }: { onPlan: () => void }) {
  return (
    <section className="w-full bg-surface-container-low py-16 lg:py-24" id="how-it-works">
      <div className="w-full max-w-[1440px] mx-auto px-margin-mobile md:px-margin-tablet lg:px-margin">
        {/* Header */}
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-space-xl">
          <span className="font-label-md text-label-md uppercase tracking-wider text-secondary font-semibold mb-space-xs">
            Effortless Flow
          </span>
          <h2 className="font-headline-lg text-headline-lg text-primary font-bold tracking-tight mb-space-xs">
            From Idea to Celebration in Three Steps.
          </h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Planora transforms vague plans into a clear, joyful roadmap.
          </p>
        </div>

        {/* 3 Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter relative">
          {/* Step 1 */}
          <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm flex flex-col justify-between relative z-10 hover:-translate-y-1 transition-transform">
            <div>
              <div className="flex items-center justify-between mb-space-md">
                <span className="font-display-hero text-headline-xl text-primary font-bold opacity-80">01</span>
                <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[20px]">edit_note</span>
                </div>
              </div>
              <h3 className="font-title-md text-title-md font-semibold text-primary mb-space-xs">
                Tell Us About Your Event
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Share your event type, date, guest count, budget, and preferences.
              </p>
            </div>
            <div className="mt-space-lg pt-space-sm border-t border-outline-variant/30 font-caption text-on-surface-variant flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">timer</span> Takes under 2 minutes
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm flex flex-col justify-between relative z-10 hover:-translate-y-1 transition-transform">
            <div>
              <div className="flex items-center justify-between mb-space-md">
                <span className="font-display-hero text-headline-xl text-secondary font-bold">02</span>
                <div className="w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed">
                  <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
                </div>
              </div>
              <h3 className="font-title-md text-title-md font-semibold text-primary mb-space-xs">
                Get Your Personalized Plan
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant">
                AI creates a structured starting point with budget estimates, tasks, timelines, and ideas.
              </p>
            </div>
            <div className="mt-space-lg pt-space-sm border-t border-outline-variant/30 font-caption text-secondary flex items-center gap-1 font-semibold">
              <span className="material-symbols-outlined text-[14px]">bolt</span> Instant algorithmic draft
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm flex flex-col justify-between relative z-10 hover:-translate-y-1 transition-transform">
            <div>
              <div className="flex items-center justify-between mb-space-md">
                <span className="font-display-hero text-headline-xl text-primary font-bold opacity-80">03</span>
                <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[20px]">celebration</span>
                </div>
              </div>
              <h3 className="font-title-md text-title-md font-semibold text-primary mb-space-xs">
                Refine, Organize, Celebrate
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Edit your plan, track tasks, and keep your arrangements organized.
              </p>
            </div>
            <div className="mt-space-lg pt-space-sm border-t border-outline-variant/30 font-caption text-green-700 flex items-center gap-1 font-semibold">
              <span className="material-symbols-outlined text-[14px]">done_all</span> Stress-free host readiness
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------
 * 5. PRODUCT PREVIEW SECTION (Interactive Command Center)
 * ----------------------------------------------------------- */
export function DashboardPreview({
  latestEvent,
  onPlan: _onPlan
}: {
  latestEvent: PlannedEvent | null;
  onPlan: () => void;
}) {
  const [copilotPrompt, setCopilotPrompt] = useState("");
  const [copilotResponses, setCopilotResponses] = useState<string[]>([]);
  const [isCopilotLoading, setIsCopilotLoading] = useState(false);

  const handleCopilotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = copilotPrompt.trim();
    if (!query || isCopilotLoading) return;

    setCopilotPrompt("");
    setIsCopilotLoading(true);

    // Contextual event copilot guidance tailored to user query and event context
    const adviceTemplates = [
      `Planora AI: Optimized "${query}" for ${eventName}. Balanced timeline pacing with ambient styling and coordinated supplier check-ins.`,
      `Planora AI: Formulated actionable recommendations for "${query}". Cross-checked guest experience touchpoints and vendor delivery schedules.`,
      `Planora AI: Coordinated logistical safeguards for "${query}". Refined run-of-show timing and reserve buffer allocations.`
    ];
    const selectedAdvice = adviceTemplates[Math.abs(query.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)) % adviceTemplates.length];

    setCopilotResponses((prev) => [
      ...prev,
      `💡 ${selectedAdvice}`
    ]);
    setIsCopilotLoading(false);
  };

  const eventName = latestEvent?.name ?? "Autumn Solstice Soirée";
  const eventDate = latestEvent
    ? new Date(`${latestEvent.date}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "Nov 15, 2025";
  const guestCount = latestEvent?.guests ?? 85;
  const venueLocation = latestEvent?.location || "Villa San Michele, Florence";

  return (
    <section className="w-full max-w-[1440px] mx-auto px-margin-mobile md:px-margin-tablet lg:px-margin py-16 lg:py-24" id="about">
      {/* Header */}
      <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-space-xl">
        <span className="font-label-md text-label-md uppercase tracking-wider text-secondary font-semibold mb-space-xs">
          Live Command Center
        </span>
        <h2 className="font-headline-lg text-headline-lg text-primary font-bold tracking-tight mb-space-xs">
          See Your Entire Event Come Together.
        </h2>
        <p className="font-body-lg text-body-lg text-on-surface-variant">
          An intuitive, live workspace that adapts as your celebration takes shape.
        </p>
      </div>

      {/* Browser Window Frame */}
      <div className="w-full bg-surface-container-lowest rounded-2xl shadow-2xl overflow-hidden border border-outline-variant/30">
        {/* Window Chrome / Top Bar */}
        <div className="h-12 bg-surface-container px-4 flex items-center justify-between border-b border-outline-variant/30">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-amber-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
            <span className="ml-4 font-caption text-caption text-on-surface-variant hidden sm:inline">
              app.planora.ai/workspace/autumn-solstice
            </span>
          </div>
          <div className="flex items-center gap-2 font-caption text-caption text-on-surface-variant">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container-lowest text-on-surface shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse"></span> Live Sync
            </span>
          </div>
        </div>

        {/* Dashboard Inner Content */}
        <div className="p-space-md md:p-space-lg lg:p-space-xl">
          {/* Event Top Bar inside workspace */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md pb-space-lg mb-space-lg border-b border-outline-variant/30">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-headline-sm text-headline-sm font-bold text-primary">{eventName}</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-green-100 text-green-800 font-caption font-semibold">
                  Active Plan • 82% Prepared
                </span>
              </div>
              <p className="font-caption text-body-md text-on-surface-variant mt-1 flex items-center gap-2 sm:gap-3 flex-wrap">
                <span>{eventDate}</span>
                <span>•</span>
                <span>{guestCount} Guests</span>
                <span>•</span>
                <span>{venueLocation}</span>
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-container text-on-surface font-body-md text-[13px] hover:bg-surface-variant transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">file_download</span> Export PDF
              </Link>
              <Link
                to="/guests"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-container text-on-surface font-body-md text-[13px] hover:bg-surface-variant transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">person_add</span> Invite Co-host
              </Link>
              <Link
                to="/ai-ideas"
                className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-tertiary-container text-on-tertiary font-body-md text-[13px] shadow-sm hover:opacity-90 transition-opacity"
              >
                <span className="material-symbols-outlined text-[16px]">auto_awesome</span> AI Assistant
              </Link>
            </div>
          </div>

          {/* 3 Columns Inside Dashboard */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
            {/* Col 1: Budget Overview Widget (4 cols) */}
            <div className="lg:col-span-4 bg-surface-container-low rounded-xl p-space-md flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-space-sm">
                  <span className="font-title-md text-[15px] font-semibold text-primary">Budget Utilization</span>
                  <span className="font-caption text-secondary font-bold">76% Allocated</span>
                </div>
                {/* Big Numbers */}
                <div className="mb-space-md">
                  <div className="text-[26px] font-bold text-primary">₹1,82,500</div>
                  <div className="font-caption text-on-surface-variant">Committed of ₹2,40,000 Total Allocation</div>
                </div>
                {/* Bar gauge */}
                <div className="w-full h-3 bg-surface-container rounded-full overflow-hidden flex mb-4">
                  <div className="bg-primary-container h-full w-[50%]" title="Committed"></div>
                  <div className="bg-secondary h-full w-[26%]" title="Pending approvals"></div>
                  <div className="bg-transparent h-full w-[24%]"></div>
                </div>
                {/* Category breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-body-md">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-primary-container"></span> Historic Venue
                    </span>
                    <span className="font-semibold text-on-surface">₹95,000</span>
                  </div>
                  <div className="flex justify-between items-center text-body-md">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span> Tuscan Farm-to-Table
                    </span>
                    <span className="font-semibold text-on-surface">₹55,000</span>
                  </div>
                  <div className="flex justify-between items-center text-body-md">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-tertiary-container"></span> Ambient Decor &amp; Florals
                    </span>
                    <span className="font-semibold text-on-surface">₹32,500</span>
                  </div>
                </div>
              </div>
              <div className="mt-space-md pt-space-sm border-t border-outline-variant/30 flex justify-between font-caption text-on-surface-variant">
                <span>Contingency Reserve:</span>
                <strong className="text-green-700">₹57,500 Remaining</strong>
              </div>
            </div>

            {/* Col 2: Interactive Timeline & Milestone (4 cols) */}
            <div className="lg:col-span-4 bg-surface-container-low rounded-xl p-space-md flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-space-sm">
                  <span className="font-title-md text-[15px] font-semibold text-primary">Run of Show &amp; Milestones</span>
                  <span className="font-caption text-tertiary-container font-semibold">T-4 Weeks</span>
                </div>
                <div className="space-y-3">
                  <div className="p-2.5 bg-surface-container-lowest rounded-lg shadow-2xs flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-green-700 text-[20px] mt-0.5">check_circle</span>
                    <div className="flex-1">
                      <p className="font-body-md-medium text-body-md-medium text-on-surface">Floral &amp; botanic quote approved</p>
                      <span className="font-caption text-on-surface-variant">Signed contract with Villa Florists</span>
                    </div>
                  </div>
                  <div className="p-2.5 bg-surface-container-lowest rounded-lg shadow-2xs flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-green-700 text-[20px] mt-0.5">check_circle</span>
                    <div className="flex-1">
                      <p className="font-body-md-medium text-body-md-medium text-on-surface">Natural linen selection confirmed</p>
                      <span className="font-caption text-on-surface-variant">Raw oatmeal runner &amp; brass candle accents</span>
                    </div>
                  </div>
                  <div className="p-2.5 bg-surface-container-lowest rounded-lg shadow-2xs flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-secondary text-[20px] mt-0.5">schedule</span>
                    <div className="flex-1">
                      <p className="font-body-md-medium text-body-md-medium text-on-surface">Chef’s tasting &amp; wine pairing</p>
                      <span className="font-caption text-secondary font-semibold">Scheduled: Thursday at 6:00 PM</span>
                    </div>
                  </div>
                  <div className="p-2.5 bg-surface-container-lowest rounded-lg shadow-2xs flex items-start gap-2.5 opacity-60">
                    <span className="material-symbols-outlined text-outline-variant text-[20px] mt-0.5">radio_button_unchecked</span>
                    <div className="flex-1">
                      <p className="font-body-md-medium text-body-md-medium text-on-surface">Final seating chart lock</p>
                      <span className="font-caption text-on-surface-variant">Pending 4 RSVP confirmations</span>
                    </div>
                  </div>
                </div>
              </div>
              <Link
                to="/timeline"
                className="w-full mt-3 py-2 bg-surface-container hover:bg-surface-variant rounded-lg text-primary font-caption text-center font-semibold transition-colors block"
              >
                + Add Custom Milestone
              </Link>
            </div>

            {/* Col 3: AI Intelligence Feed & Copilot (4 cols) */}
            <div className="lg:col-span-4 bg-surface-container-high rounded-xl p-space-md flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-space-sm">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-tertiary-container text-[18px]">auto_awesome</span>
                    <span className="font-title-md text-[15px] font-semibold text-tertiary-container">Planora Copilot</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-surface-container-lowest text-tertiary-container font-caption font-semibold">
                    Real-Time Insight
                  </span>
                </div>

                {/* Recommendation Card */}
                <div className="bg-surface-container-lowest rounded-xl p-space-sm mb-space-sm shadow-xs">
                  <div className="flex items-center gap-1.5 text-secondary font-caption font-semibold mb-1">
                    <span className="material-symbols-outlined text-[16px]">thermostat</span>
                    <span>Atmosphere Advisory</span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface mb-3 text-[13px] leading-relaxed">
                    Weather forecast indicates <strong>18°C evening</strong>. Consider adding 4 patio heaters or pashmina wraps to the outdoor courtyard.
                  </p>
                  <Link
                    to="/budget"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-tertiary-container text-on-tertiary font-caption font-semibold hover:opacity-90 transition-opacity"
                  >
                    <span className="material-symbols-outlined text-[14px]">add_task</span> Add to Checklist
                  </Link>
                </div>

                {/* Secondary Insight */}
                <div className="bg-surface-container-lowest rounded-xl p-space-sm shadow-xs mb-3">
                  <div className="flex items-center gap-1.5 text-tertiary-container font-caption font-semibold mb-1">
                    <span className="material-symbols-outlined text-[16px]">timer</span>
                    <span>Flow Optimization</span>
                  </div>
                  <p className="font-caption text-on-surface-variant text-[12px] leading-relaxed">
                    We noticed a 45-minute gap between dessert and speeches. Would you like an acoustic intermezzo cue generated?
                  </p>
                </div>

                {/* Copilot responses */}
                {copilotResponses.map((res, i) => (
                  <div key={i} className="bg-primary text-on-primary text-xs p-2 rounded-lg mb-2 shadow-xs">
                    {res}
                  </div>
                ))}
              </div>

              {/* Natural language prompt bar */}
              <form onSubmit={handleCopilotSubmit} className="mt-space-md relative">
                <input
                  value={copilotPrompt}
                  onChange={(e) => setCopilotPrompt(e.target.value)}
                  className="w-full h-10 pl-3 pr-9 bg-surface-container-lowest rounded-lg text-body-md font-body-md text-on-surface placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-tertiary-container shadow-xs text-xs"
                  placeholder="Ask Copilot to adjust or add..."
                  type="text"
                />
                <button
                  type="submit"
                  disabled={isCopilotLoading}
                  className="absolute right-2 top-2 text-tertiary-container hover:opacity-80 disabled:opacity-50"
                  aria-label="Send Copilot prompt"
                >
                  <span className={`material-symbols-outlined text-[20px] ${isCopilotLoading ? "animate-spin" : ""}`}>
                    {isCopilotLoading ? "progress_activity" : "arrow_circle_right"}
                  </span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------
 * 6. FINAL CALL TO ACTION (Exact Stitch Design)
 * ----------------------------------------------------------- */
export function FinalCTA({ onPlan }: { onPlan: () => void }) {
  return (
    <section className="w-full bg-primary-container text-on-primary py-20 lg:py-28 relative overflow-hidden">
      {/* Star watermark/sparkle accents */}
      <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-tertiary-container/30 blur-3xl pointer-events-none"></div>
      <div className="absolute -left-16 -bottom-16 w-80 h-80 rounded-full bg-secondary-container/10 blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-[1440px] mx-auto px-margin-mobile md:px-margin-tablet lg:px-margin text-center relative z-10">
        <div className="max-w-3xl mx-auto flex flex-col items-center">
          {/* Badge */}
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-surface-container-lowest/10 text-secondary-fixed text-caption font-semibold uppercase tracking-wider mb-space-md">
            <span className="material-symbols-outlined text-[14px]">celebration</span> Ready Whenever You Are
          </span>

          {/* Headline */}
          <h2 className="font-headline-xl text-[34px] sm:text-[44px] lg:text-[48px] font-bold text-on-primary tracking-tight leading-tight mb-space-md">
            Your Next Celebration Starts With a Plan.
          </h2>

          {/* Subtitle */}
          <p className="font-body-lg text-body-lg text-primary-fixed-dim leading-relaxed max-w-xl mb-space-lg">
            Bring your ideas together and create a celebration that feels truly yours.
          </p>

          {/* CTA Button */}
          <div className="flex flex-col sm:flex-row items-center gap-space-sm mb-space-md">
            <MagneticButton
              type="button"
              onClick={onPlan}
              className="inline-flex items-center justify-center gap-space-xs bg-secondary-fixed text-on-secondary-fixed font-title-md text-[16px] font-bold px-9 py-4 rounded-xl shadow-[0_8px_25px_rgba(214,168,95,0.35)] hover:bg-secondary-fixed-dim transition-all active:translate-y-[1px]"
            >
              <span>Plan My Event</span>
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </MagneticButton>
          </div>

          {/* Micro-copy */}
          <p className="font-caption text-caption text-on-primary-container">
            No credit card required • Free plan for up to 3 events
          </p>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------
 * 7. FOOTER COMPONENT (Exact Stitch Design)
 * ----------------------------------------------------------- */
export function Footer() {
  const [activeLegalModal, setActiveLegalModal] = useState<"privacy" | "terms" | "security" | "status" | "privacy-center" | null>(null);

  useEffect(() => {
    if (!activeLegalModal) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveLegalModal(null);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeLegalModal]);

  return (
    <footer className="w-full bg-surface-container-lowest border-t border-outline-variant py-space-xl">
      <div className="w-full max-w-[1440px] mx-auto px-margin-mobile md:px-margin-tablet lg:px-margin">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-gutter mb-space-xl">
          <div className="lg:col-span-2 flex flex-col gap-space-sm pr-space-lg">
            <div className="flex items-center gap-space-xs">
              <img
                src="/logo.png"
                alt="Planora AI Logo"
                className="w-8 h-8 rounded-lg object-contain border border-outline-variant/15 shadow-xs"
              />
              <span className="font-headline-sm text-headline-sm text-on-surface tracking-tight font-bold">
                Planora AI
              </span>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-sm">
              Thoughtful planning for meaningful celebrations.
            </p>
          </div>

          <div className="flex flex-col gap-space-sm">
            <h4 className="font-label-md text-label-md text-on-surface uppercase tracking-wider font-semibold">Product</h4>
            <ul className="flex flex-col gap-space-xs">
              <li>
                <a href="#features" className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface cursor-pointer transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface cursor-pointer transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#events" className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface cursor-pointer transition-colors">
                  Event Types
                </a>
              </li>
              <li>
                <Link to="/ai-ideas" className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface cursor-pointer transition-colors">
                  Templates
                </Link>
              </li>
              <li>
                <a href="mailto:support@planora.ai" className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface cursor-pointer transition-colors">
                  support@planora.ai
                </a>
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-space-sm">
            <h4 className="font-label-md text-label-md text-on-surface uppercase tracking-wider font-semibold">Resources</h4>
            <ul className="flex flex-col gap-space-xs">
              <li>
                <Link to="/timeline" className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface cursor-pointer transition-colors">
                  Planning Guides
                </Link>
              </li>
              <li>
                <Link to="/budget" className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface cursor-pointer transition-colors">
                  Budget Calculators
                </Link>
              </li>
              <li>
                <Link to="/vendors" className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface cursor-pointer transition-colors">
                  Vendor Directory
                </Link>
              </li>
              <li>
                <a href="mailto:support@planora.ai" className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface cursor-pointer transition-colors">
                  support@planora.ai
                </a>
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-space-sm">
            <h4 className="font-label-md text-label-md text-on-surface uppercase tracking-wider font-semibold">Legal</h4>
            <ul className="flex flex-col gap-space-xs">
              <li>
                <button
                  type="button"
                  onClick={() => setActiveLegalModal("privacy")}
                  className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface cursor-pointer transition-colors text-left"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveLegalModal("terms")}
                  className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface cursor-pointer transition-colors text-left"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveLegalModal("security")}
                  className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface cursor-pointer transition-colors text-left"
                >
                  Security
                </button>
              </li>
              <li>
                <a href="mailto:support@planora.ai" className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface cursor-pointer transition-colors">
                  support@planora.ai
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-space-md border-t border-outline-variant flex flex-col sm:flex-row items-center justify-between gap-space-sm">
          <p className="font-caption text-caption text-on-surface-variant">
            © {new Date().getFullYear()} Planora AI Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-space-md">
            <button
              type="button"
              onClick={() => setActiveLegalModal("status")}
              className="font-caption text-caption text-on-surface-variant hover:text-on-surface cursor-pointer"
            >
              System Status
            </button>
            <button
              type="button"
              onClick={() => setActiveLegalModal("privacy-center")}
              className="font-caption text-caption text-on-surface-variant hover:text-on-surface cursor-pointer"
            >
              Privacy Center
            </button>
          </div>
        </div>
      </div>

      {/* Legal & Status Modal */}
      {activeLegalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="legal-modal-title"
            className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] flex flex-col overflow-hidden"
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-outline-variant flex items-center justify-between bg-surface-container-low">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">
                  {activeLegalModal === "privacy" || activeLegalModal === "privacy-center"
                    ? "policy"
                    : activeLegalModal === "terms"
                    ? "gavel"
                    : activeLegalModal === "security"
                    ? "verified_user"
                    : "dns"}
                </span>
                <h3 id="legal-modal-title" className="font-headline-sm text-lg font-bold text-on-surface">
                  {activeLegalModal === "privacy" && "Privacy Policy"}
                  {activeLegalModal === "privacy-center" && "Privacy Center"}
                  {activeLegalModal === "terms" && "Terms of Service"}
                  {activeLegalModal === "security" && "Security Architecture"}
                  {activeLegalModal === "status" && "System Status & Reliability"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveLegalModal(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
                aria-label="Close modal"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-4 text-on-surface-variant text-sm leading-relaxed">
              {(activeLegalModal === "privacy" || activeLegalModal === "privacy-center") && (
                <>
                  <div>
                    <h4 className="font-bold text-on-surface mb-1">Your Data, Strictly Yours</h4>
                    <p>
                      Planora AI treats all celebration itineraries, guest rosters, dietary records, and budget allocations as confidential client property. We do not sell, rent, or distribute planner or guest personally identifiable information (PII) to third-party advertisers.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface mb-1">Data Isolation & Security</h4>
                    <p>
                      All client events are compartmentalized in Firestore with strictly enforced user-level security rules. Each planner accesses only events stamped with their authenticated user UID.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface mb-1">Data Portability & Erasure</h4>
                    <p>
                      Planners maintain complete sovereignty over their data. You can download comprehensive JSON dossier backups and CSV exports at any time, or request irreversible workspace deletion directly in your Profile Settings.
                    </p>
                  </div>
                </>
              )}

              {activeLegalModal === "terms" && (
                <>
                  <div>
                    <h4 className="font-bold text-on-surface mb-1">Planning Advisory & Estimates</h4>
                    <p>
                      Planora AI delivers intelligent event blueprints, timelines, and budget models. However, calculations and recommendations are advisory estimates. Planners must independently verify vendor contracts, venue permits, and municipal safety requirements.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface mb-1">Account & Responsibility</h4>
                    <p>
                      Users are responsible for safeguarding their login credentials and all activities occurring under their authenticated session. Commercial misuse or automated abuse of the AI generation engine is prohibited.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface mb-1">Service SLA</h4>
                    <p>
                      Planora AI strives for continuous 99.9% uptime. System maintenance windows are communicated proactively through our platform updates and status logs.
                    </p>
                  </div>
                </>
              )}

              {activeLegalModal === "security" && (
                <>
                  <div>
                    <h4 className="font-bold text-on-surface mb-1">Defense-in-Depth Architecture</h4>
                    <p>
                      Planora AI employs end-to-end HTTPS/TLS encryption in transit and AES-256 encryption at rest across Google Cloud and Firestore infrastructure.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface mb-1">Authenticated AI Orchestration</h4>
                    <p>
                      AI generation endpoints require verified Firebase Bearer token authorization and user ownership validation before invoking server-side Gemini 2.5 Flash models. Client-side API keys are never exposed.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface mb-1">Role-Based Data Partitioning</h4>
                    <p>
                      Cross-planner reads and writes are blocked at the database rule layer, guaranteeing zero unauthorized data leakage between event planners.
                    </p>
                  </div>
                </>
              )}

              {activeLegalModal === "status" && (
                <>
                  <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-700">
                    <span className="material-symbols-outlined text-[20px]">check_circle</span>
                    <span className="font-bold text-xs uppercase tracking-wide">All Systems Operational</span>
                  </div>
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between text-xs py-1 border-b border-outline-variant/60">
                      <span className="font-medium text-on-surface">Gemini AI Generation Engine</span>
                      <span className="text-emerald-600 font-semibold">Operational (1.1s avg)</span>
                    </div>
                    <div className="flex items-center justify-between text-xs py-1 border-b border-outline-variant/60">
                      <span className="font-medium text-on-surface">Firestore Cloud Database</span>
                      <span className="text-emerald-600 font-semibold">Operational (100%)</span>
                    </div>
                    <div className="flex items-center justify-between text-xs py-1 border-b border-outline-variant/60">
                      <span className="font-medium text-on-surface">Firebase Identity & Authentication</span>
                      <span className="text-emerald-600 font-semibold">Operational</span>
                    </div>
                    <div className="flex items-center justify-between text-xs py-1 border-b border-outline-variant/60">
                      <span className="font-medium text-on-surface">Event Export & Dossier Engine</span>
                      <span className="text-emerald-600 font-semibold">Operational</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-outline-variant bg-surface-container-low flex justify-end">
              <button
                type="button"
                onClick={() => setActiveLegalModal(null)}
                className="px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
