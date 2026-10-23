import { useState, useEffect } from "react";
import AppLayout from "../components/layout/AppLayout";
import { useAuth } from "../context/AuthContext";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, isFirebaseConfigured } from "../lib/firebase";

export default function Settings() {
  const { user, updateUserPassword } = useAuth();

  // Navigation
  const [activeSection, setActiveSection] = useState<string>("section-profile");

  // Profile State
  const [fullName, setFullName] = useState(user?.displayName || "Alex Morgan");
  const [email] = useState(user?.email || "alex@planora.ai");
  const [phone, setPhone] = useState("98201 44102");
  const [jobTitle, setJobTitle] = useState("Principal Event Planner & Founder");
  const [organization, setOrganization] = useState("Aura Luxe Event Curators");
  const [region, setRegion] = useState("India (IN) — Domestic & Destination Operations");
  const [timezone, setTimezone] = useState("(GMT+05:30) India Standard Time (IST) — Kolkata, Mumbai, New Delhi");

  useEffect(() => {
    if (user && isFirebaseConfigured && db && !user.isDemo) {
      getDoc(doc(db, "users", user.uid)).then((snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (data.fullName) setFullName(data.fullName);
          if (data.phone) setPhone(data.phone);
          if (data.jobTitle) setJobTitle(data.jobTitle);
          if (data.organization) setOrganization(data.organization);
          if (data.region) setRegion(data.region);
          if (data.timezone) setTimezone(data.timezone);
          if (data.currency) setCurrency(data.currency);
          if (data.themeMode) setThemeMode(data.themeMode);
        }
      }).catch(console.warn);
    }
  }, [user?.uid]);

  // Preferences State
  const [currency, setCurrency] = useState<"INR" | "USD" | "EUR" | "GBP" | "AED">("INR");
  const [dateFormat, setDateFormat] = useState("DD/MM/YYYY (e.g., 15/12/2026) — UK/India Standard");
  const [eventArchetype, setEventArchetype] = useState("Royal Wedding & Grand Celebrations (Multi-Day)");
  const [quorumFormat, setQuorumFormat] = useState<"cohorts" | "flat">("cohorts");
  const [budgetFramework, setBudgetFramework] = useState<"standard" | "ai">("ai");
  const [vendorSynergyAi, setVendorSynergyAi] = useState(true);

  // Notifications State
  const [channelEmail, setChannelEmail] = useState(true);
  const [channelWhatsapp, setChannelWhatsapp] = useState(true);
  const [channelDesktop, setChannelDesktop] = useState(true);

  const [alertDeadlines, setAlertDeadlines] = useState(true);
  const [alertVipRsvp, setAlertVipRsvp] = useState(true);
  const [alertBudgetThreshold, setAlertBudgetThreshold] = useState(true);
  const [alertVendorPayments, setAlertVendorPayments] = useState(true);
  const [alertAiBriefs, setAlertAiBriefs] = useState(true);
  const [alertProductUpdates, setAlertProductUpdates] = useState(false);

  // Appearance State
  const [themeMode, setThemeMode] = useState<"light" | "dark" | "system">("light");
  const [density, setDensity] = useState<"comfortable" | "compact">("comfortable");

  // Security State
  const [pwdCurr, setPwdCurr] = useState("••••••••••••••");
  const [pwdNew, setPwdNew] = useState("");
  const [pwdConfirm, setPwdConfirm] = useState("");
  const [showPwdCurr, setShowPwdCurr] = useState(false);
  const [showPwdNew, setShowPwdNew] = useState(false);
  const [showPwdConfirm, setShowPwdConfirm] = useState(false);
  const [sessions, setSessions] = useState([
    { id: "s1", name: "MacBook Pro 16” — Chrome 124", loc: "Mumbai, India • IP: 103.21.244.18 • Active now", isCurrent: true },
    { id: "s2", name: "iPhone 15 Pro — Planora iOS App", loc: "Udaipur, Rajasthan, India • Last active 2 hours ago", isCurrent: false },
  ]);

  // Data State
  const [telemetryConsent, setTelemetryConsent] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");

  // Feedback Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user && isFirebaseConfigured && db && !user.isDemo) {
      try {
        await setDoc(
          doc(db, "users", user.uid),
          {
            fullName,
            phone,
            jobTitle,
            organization,
            region,
            timezone,
            currency,
            themeMode,
            updatedAt: new Date().toISOString()
          },
          { merge: true }
        );
        triggerToast("Profile settings saved and synced to cloud.");
      } catch (err: any) {
        console.error("Profile save error:", err);
        triggerToast("Error saving profile to cloud: " + (err?.message || "Unknown error"));
      }
    } else {
      triggerToast("Profile settings updated (Demo Studio Preview).");
    }
  };

  const handlePasswordUpdate = async () => {
    if (!pwdNew || pwdNew.length < 6) {
      triggerToast("Password must be at least 6 characters long.");
      return;
    }
    if (pwdNew !== pwdConfirm) {
      triggerToast("New passwords do not match.");
      return;
    }
    if (user && !user.isDemo) {
      try {
        await updateUserPassword(pwdNew);
        triggerToast("Password updated securely in Firebase Authentication.");
        setPwdNew("");
        setPwdConfirm("");
      } catch (err: any) {
        console.error("Password update error:", err);
        triggerToast(err?.message?.replace("Firebase: ", "") || "Failed to update password.");
      }
    } else {
      triggerToast("Password updated securely (Demo Studio Sandbox).");
      setPwdNew("");
      setPwdConfirm("");
    }
  };

  const handleRevokeSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    triggerToast("Hardware session terminated.");
  };

  const handlePerformDelete = () => {
    if (deleteInput.trim() === "DELETE-PLANORA") {
      setIsDeleteModalOpen(false);
      triggerToast("Account deletion request queued for 48-hour safety hold.");
      setDeleteInput("");
    } else {
      alert("Please type DELETE-PLANORA correctly to confirm.");
    }
  };

  return (
    <AppLayout
      title="Settings"
      subtitle="Configure regional financial defaults, autonomous AI Copilot rules, and security controls."
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-primary text-on-primary shadow-2xl animate-fade-in text-body-md border border-outline-variant/30">
          <span className="material-symbols-outlined text-secondary-fixed text-[20px]">check_circle</span>
          <span className="font-body-md-medium">{toastMessage}</span>
        </div>
      )}

      <div className="flex flex-col w-full pb-16">
        {/* Top Context Header Area with Breadcrumb & Global Save Indicator */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-on-surface-variant font-label-sm text-label-sm">
              <span className="hover:text-primary transition-colors cursor-pointer">Workspace</span>
              <span>/</span>
              <span className="hover:text-primary transition-colors cursor-pointer">{organization}</span>
              <span>/</span>
              <span className="text-primary font-body-md-medium">Settings &amp; Preferences</span>
            </div>
            <h1 className="font-headline-md text-headline-md text-primary tracking-tight mt-1 font-bold">
              Planner Account &amp; Workspace Engine
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Configure regional financial defaults, autonomous AI Copilot rules, and security controls.
            </p>
          </div>

          {/* Quick Status & Global CTA */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container-high text-on-surface-variant text-label-sm font-label-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
              <span>All changes synced</span>
            </div>
            <button
              type="button"
              onClick={() => triggerToast("Settings preferences applied instantly across all 8 active workspaces.")}
              className="h-10 px-5 rounded-lg bg-primary-container text-on-primary font-body-md-medium text-body-md flex items-center gap-2 hover:bg-primary transition-all duration-150 active:translate-y-0.5 shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              <span>Save All Preferences</span>
            </button>
          </div>
        </div>

        {/* Main Settings Container (2 Columns: Sub-nav & Content Panels) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Sticky Sub-navigation Panel */}
          <aside className="lg:col-span-3 lg:sticky lg:top-24 flex flex-col gap-4">
            <div className="p-3 bg-surface-container-lowest rounded-xl shadow-sm flex flex-col gap-1 border border-outline-variant/15">
              <div className="px-3 pt-2 pb-1.5 flex items-center justify-between">
                <span className="font-caption text-caption text-on-surface-variant uppercase tracking-wider font-semibold">
                  Account Sections
                </span>
                <span className="px-2 py-0.5 rounded-full bg-secondary-fixed/50 text-on-secondary-fixed font-caption text-caption font-semibold">
                  6 Core
                </span>
              </div>

              {/* Navigation Tabs */}
              <nav className="flex flex-col gap-1">
                {[
                  { id: "section-profile", label: "Profile", icon: "person" },
                  { id: "section-preferences", label: "Planning Defaults", icon: "tune" },
                  { id: "section-notifications", label: "Notifications", icon: "notifications_active", badge: "3 alerts" },
                  { id: "section-appearance", label: "Appearance", icon: "palette" },
                  { id: "section-security", label: "Security & Access", icon: "shield", verified: true },
                  { id: "section-data", label: "Data & Privacy", icon: "database" },
                ].map((item) => {
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => scrollToSection(item.id)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all text-left ${
                        isActive
                          ? "bg-primary-container text-on-primary font-body-md-medium text-body-md shadow-sm"
                          : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface font-body-md text-body-md"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`material-symbols-outlined text-[19px] ${isActive ? "text-secondary-fixed" : ""}`}>
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                      </div>
                      {isActive && <span className="w-1.5 h-1.5 rounded-full bg-secondary-fixed"></span>}
                      {item.badge && !isActive && (
                        <span className="px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-caption text-caption">
                          {item.badge}
                        </span>
                      )}
                      {item.verified && !isActive && (
                        <span className="material-symbols-outlined text-[16px] text-emerald-600">verified_user</span>
                      )}
                    </button>
                  );
                })}
              </nav>

              <div className="my-2 h-[1px] bg-surface-container"></div>

              {/* Plan & Workspace Mini-widget */}
              <div className="p-3 rounded-lg bg-surface-container-low flex flex-col gap-2.5 border border-outline-variant/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-secondary">workspace_premium</span>
                    <span className="font-body-md-medium text-body-md-medium text-primary">Pro Planner</span>
                  </div>
                  <span className="font-caption text-caption uppercase tracking-wider text-secondary font-bold">Active</span>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between font-caption text-caption text-on-surface-variant">
                    <span>Event Capacity</span>
                    <span className="font-bold text-primary">8 of 15 Active</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-surface-container overflow-hidden">
                    <div className="h-full bg-primary-container rounded-full" style={{ width: "53.3%" }}></div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1 font-label-sm text-label-sm">
                  <span className="text-on-surface-variant text-[11px]">Renews Oct 28, 2026</span>
                  <button
                    type="button"
                    onClick={() => triggerToast("Planora Concierge billing upgraded.")}
                    className="text-secondary font-body-md-medium hover:underline text-[12px] flex items-center gap-0.5"
                  >
                    <span>Upgrade</span>
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </button>
                </div>
              </div>

              {/* Cloud State Live Box */}
              <div className="p-2.5 rounded-lg bg-secondary-fixed/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-[18px]">cloud_sync</span>
                  <span className="font-caption text-caption text-on-secondary-fixed">Cloud State Live</span>
                </div>
                <span className="font-caption text-caption text-secondary font-medium">Auto-save</span>
              </div>
            </div>

            {/* Quick AI Copilot Assistant Help card */}
            <div className="p-4 bg-tertiary-fixed/40 rounded-xl flex flex-col gap-2 shadow-sm border border-outline-variant/10">
              <div className="flex items-center gap-2 text-on-tertiary-fixed">
                <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                <span className="font-body-md-medium text-body-md-medium">AI Setting Optimization</span>
              </div>
              <p className="font-body-md text-body-md text-on-tertiary-fixed-variant text-[13px] leading-relaxed">
                Planora Copilot automatically synchronizes regional supplier tax rules and multi-currency exchange rates daily.
              </p>
            </div>
          </aside>

          {/* RIGHT COLUMN: Main Content Panels */}
          <div className="lg:col-span-9 flex flex-col gap-8 pb-16">
            {/* ================= SECTION 1: PERSONAL PROFILE ================= */}
            <section
              id="section-profile"
              className="p-6 md:p-8 bg-surface-container-lowest rounded-2xl shadow-sm flex flex-col gap-6 scroll-mt-24 border border-outline-variant/15"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-container">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[22px]">badge</span>
                    <h2 className="font-headline-sm text-headline-sm text-primary font-semibold">Personal Information</h2>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
                    Update your photo, contact details and professional role across all event workspaces.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-label-sm font-label-sm self-start sm:self-auto border border-emerald-200">
                  <span className="material-symbols-outlined text-[16px] text-emerald-700">verified</span>
                  <span>Identity Verified</span>
                </div>
              </div>

              {/* Avatar & Identity Upload Row */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-6 p-4 rounded-xl bg-surface-container-low border border-outline-variant/10">
                <div className="relative flex-shrink-0">
                  <div className="w-20 h-20 rounded-full bg-primary-container text-secondary-fixed flex items-center justify-center font-headline-md text-headline-md shadow-md overflow-hidden font-bold">
                    <span>AM</span>
                  </div>
                  <span
                    className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-white ring-2 ring-surface-container-lowest"
                    title="Active Master Planner"
                  >
                    <span className="material-symbols-outlined text-[14px]">stars</span>
                  </span>
                </div>
                <div className="flex flex-col gap-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => triggerToast("Photo upload selector opened.")}
                      className="h-9 px-4 rounded-lg bg-surface-container-lowest hover:bg-surface-container font-body-md-medium text-body-md-medium text-primary shadow-sm transition-colors flex items-center gap-1.5 border border-outline-variant/15"
                    >
                      <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                      <span>Change Photo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => triggerToast("Default initials restored.")}
                      className="h-9 px-3 text-error hover:bg-error-container/30 rounded-lg font-body-md-medium text-body-md-medium transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                  <span className="font-caption text-caption text-on-surface-variant">
                    Recommended: Square portrait image (JPG, PNG or WebP), max file size 5MB. Rendered in high-DPI across client portals.
                  </span>
                </div>
              </div>

              {/* 2-Column Form Grid */}
              <form onSubmit={handleProfileSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Full Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-md text-label-md text-primary flex items-center justify-between">
                    <span>Full Name</span>
                    <span className="font-caption text-caption text-on-surface-variant">Public on proposals</span>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full h-11 px-3.5 pr-10 rounded-lg bg-surface text-body-md font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container transition-all border border-outline-variant/20"
                    />
                    <span className="material-symbols-outlined absolute right-3 text-emerald-600 text-[18px]">check_circle</span>
                  </div>
                </div>

                {/* Email Address */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-md text-label-md text-primary flex items-center justify-between">
                    <span>Email Address</span>
                    <span className="text-emerald-700 font-label-sm text-label-sm flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> Primary &amp; Verified
                    </span>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="email"
                      readOnly
                      value={email}
                      className="w-full h-11 px-3.5 pr-10 rounded-lg bg-surface text-body-md font-body-md text-on-surface opacity-80 cursor-not-allowed border border-outline-variant/20"
                    />
                    <span className="material-symbols-outlined absolute right-3 text-on-surface-variant text-[18px]">mail</span>
                  </div>
                </div>

                {/* Phone Number */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-md text-label-md text-primary">Phone Number (WhatsApp Active)</label>
                  <div className="flex gap-2">
                    <div className="h-11 px-3 rounded-lg bg-surface flex items-center gap-1.5 text-on-surface text-body-md font-body-md border border-outline-variant/20">
                      <span>🇮🇳</span>
                      <span className="font-medium">+91</span>
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-lg bg-surface text-body-md font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container transition-all border border-outline-variant/20"
                    />
                  </div>
                </div>

                {/* Job Title */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-md text-label-md text-primary">Job Title / Role</label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-lg bg-surface text-body-md font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container transition-all border border-outline-variant/20"
                  />
                </div>

                {/* Organization */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-md text-label-md text-primary">Organization / Studio Name</label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      className="w-full h-11 px-3.5 pr-10 rounded-lg bg-surface text-body-md font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container transition-all border border-outline-variant/20"
                    />
                    <span className="material-symbols-outlined absolute right-3 text-on-surface-variant text-[18px]">corporate_fare</span>
                  </div>
                </div>

                {/* Country / Region */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-md text-label-md text-primary">Country or Operating Region</label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-lg bg-surface text-body-md font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container transition-all cursor-pointer border border-outline-variant/20"
                  >
                    <option>India (IN) — Domestic &amp; Destination Operations</option>
                    <option>United Arab Emirates (UAE) — Dubai / Abu Dhabi</option>
                    <option>United Kingdom (UK) — London</option>
                    <option>United States (US) — New York / California</option>
                    <option>Italy (IT) — Lake Como / Tuscany</option>
                  </select>
                </div>

                {/* Timezone */}
                <div className="md:col-span-2 flex flex-col gap-1.5">
                  <label className="font-label-md text-label-md text-primary flex items-center justify-between">
                    <span>Default Workspace Timezone</span>
                    <span className="font-caption text-caption text-on-surface-variant">
                      Used for Run-of-Show cues &amp; timeline countdowns
                    </span>
                  </label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-lg bg-surface text-body-md font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container transition-all cursor-pointer border border-outline-variant/20"
                  >
                    <option>(GMT+05:30) India Standard Time (IST) — Kolkata, Mumbai, New Delhi</option>
                    <option>(GMT+04:00) Gulf Standard Time (GST) — Dubai, Abu Dhabi</option>
                    <option>(GMT+00:00) Western European Time (WET) / UTC — London, Lisbon</option>
                    <option>(GMT-05:00) Eastern Time (ET) — New York, Miami</option>
                    <option>(GMT+01:00) Central European Time (CET) — Paris, Rome</option>
                  </select>
                </div>

                {/* Profile Actions Bar */}
                <div className="md:col-span-2 pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-outline-variant/10">
                  <div className="flex items-center gap-2 text-on-surface-variant font-caption text-caption">
                    <span className="material-symbols-outlined text-[16px] text-emerald-600">sync</span>
                    <span>Profile synced across 8 active event workspaces in real-time.</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => triggerToast("Changes discarded.")}
                      className="h-10 px-4 rounded-lg bg-surface hover:bg-surface-container font-body-md-medium text-body-md-medium text-on-surface transition-colors border border-outline-variant/15"
                    >
                      Discard
                    </button>
                    <button
                      type="submit"
                      className="h-10 px-6 rounded-lg bg-primary-container text-on-primary font-body-md-medium text-body-md-medium hover:bg-primary transition-all shadow-sm"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </form>
            </section>

            {/* ================= SECTION 2: PLANNING PREFERENCES ================= */}
            <section
              id="section-preferences"
              className="p-6 md:p-8 bg-surface-container-lowest rounded-2xl shadow-sm flex flex-col gap-6 scroll-mt-24 border border-outline-variant/15"
            >
              <div className="flex flex-col pb-4 border-b border-surface-container">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-[22px]">tune</span>
                  <h2 className="font-headline-sm text-headline-sm text-primary font-semibold">
                    Planning Preferences &amp; Regional Defaults
                  </h2>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
                  Tailor your event financial defaults, date conventions, and Copilot algorithmic behavior.
                </p>
              </div>

              <div className="flex flex-col gap-6">
                {/* Currency Segmented Selector */}
                <div className="flex flex-col gap-2.5">
                  <label className="font-label-md text-label-md text-primary flex items-center justify-between">
                    <span>Default Financial Currency</span>
                    <span className="font-caption text-caption text-secondary font-semibold">Real-time FX converted</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                    {[
                      { code: "INR", label: "₹ INR", sub: "Indian Rupee" },
                      { code: "USD", label: "$ USD", sub: "US Dollar" },
                      { code: "EUR", label: "€ EUR", sub: "Euro" },
                      { code: "GBP", label: "£ GBP", sub: "British Pound" },
                      { code: "AED", label: "AED", sub: "UAE Dirham" },
                    ].map((cur) => {
                      const isCur = currency === cur.code;
                      return (
                        <div
                          key={cur.code}
                          onClick={() => {
                            setCurrency(cur.code as typeof currency);
                            triggerToast(`Default workspace currency updated to ${cur.code}`);
                          }}
                          className={`cursor-pointer flex flex-col p-3 rounded-xl transition-all text-center border ${
                            isCur
                              ? "bg-primary-container text-on-primary shadow-sm border-primary"
                              : "bg-surface hover:bg-surface-container text-on-surface border-outline-variant/15"
                          }`}
                        >
                          <span className={`font-headline-sm text-headline-sm ${isCur ? "text-secondary-fixed" : "text-primary"}`}>
                            {cur.label}
                          </span>
                          <span className={`font-caption text-caption mt-0.5 ${isCur ? "text-primary-fixed-dim" : "text-on-surface-variant"}`}>
                            {cur.sub}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Date & Event Type Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-label-md text-label-md text-primary">Date Display Format</label>
                    <select
                      value={dateFormat}
                      onChange={(e) => setDateFormat(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-lg bg-surface text-body-md font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container border border-outline-variant/20"
                    >
                      <option>DD/MM/YYYY (e.g., 15/12/2026) — UK/India Standard</option>
                      <option>MM/DD/YYYY (e.g., 12/15/2026) — US Standard</option>
                      <option>YYYY-MM-DD (e.g., 2026-12-15) — ISO 8601</option>
                      <option>15 Dec 2026 (Formal Editorial)</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-label-md text-label-md text-primary">Default Event Archetype</label>
                    <select
                      value={eventArchetype}
                      onChange={(e) => setEventArchetype(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-lg bg-surface text-body-md font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container border border-outline-variant/20"
                    >
                      <option>Royal Wedding &amp; Grand Celebrations (Multi-Day)</option>
                      <option>Corporate Summit &amp; Luxury Retreat</option>
                      <option>High-Jewelry Gala &amp; Charity Fundraiser</option>
                      <option>Private Milestone Anniversary &amp; Soirée</option>
                    </select>
                  </div>
                </div>

                {/* Guest Quorum Format */}
                <div className="flex flex-col gap-2">
                  <label className="font-label-md text-label-md text-primary">Default Guest Quorum Format</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div
                      onClick={() => setQuorumFormat("cohorts")}
                      className={`p-3.5 rounded-xl flex items-start gap-3 cursor-pointer border ${
                        quorumFormat === "cohorts"
                          ? "bg-surface-container-high/60 border-primary"
                          : "bg-surface border-outline-variant/15"
                      }`}
                    >
                      <input
                        type="radio"
                        checked={quorumFormat === "cohorts"}
                        onChange={() => setQuorumFormat("cohorts")}
                        className="mt-1 accent-primary"
                      />
                      <div className="flex flex-col">
                        <span className="font-body-md-medium text-body-md-medium text-primary">
                          Seatings &amp; Cohorts (VIP, Family, Friends)
                        </span>
                        <span className="font-caption text-caption text-on-surface-variant">
                          Recommended for high-touch Indian and luxury European multi-day weddings.
                        </span>
                      </div>
                    </div>

                    <div
                      onClick={() => setQuorumFormat("flat")}
                      className={`p-3.5 rounded-xl flex items-start gap-3 cursor-pointer border ${
                        quorumFormat === "flat"
                          ? "bg-surface-container-high/60 border-primary"
                          : "bg-surface border-outline-variant/15"
                      }`}
                    >
                      <input
                        type="radio"
                        checked={quorumFormat === "flat"}
                        onChange={() => setQuorumFormat("flat")}
                        className="mt-1 accent-primary"
                      />
                      <div className="flex flex-col">
                        <span className="font-body-md-medium text-body-md-medium text-primary">
                          Flat Headcount &amp; Table Numbering
                        </span>
                        <span className="font-caption text-caption text-on-surface-variant">
                          Simpler tier for corporate banquets and concise 1-day dinners.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Budget Allocation Framework */}
                <div className="flex flex-col gap-2">
                  <label className="font-label-md text-label-md text-primary">Budget Allocation Framework</label>
                  <div className="p-1 rounded-xl bg-surface flex flex-col sm:flex-row gap-1 border border-outline-variant/15">
                    <button
                      type="button"
                      onClick={() => setBudgetFramework("standard")}
                      className={`flex-1 py-2 px-3 rounded-lg font-body-md-medium text-body-md-medium text-center transition-colors ${
                        budgetFramework === "standard"
                          ? "bg-surface-container-lowest text-primary shadow-sm"
                          : "text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      Standard Vendor Split (40/30/20/10)
                    </button>
                    <button
                      type="button"
                      onClick={() => setBudgetFramework("ai")}
                      className={`flex-1 py-2 px-3 rounded-lg font-body-md-medium text-body-md-medium shadow-sm text-center flex items-center justify-center gap-1.5 transition-colors ${
                        budgetFramework === "ai"
                          ? "bg-surface-container-lowest text-primary shadow-sm"
                          : "text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      <span className="material-symbols-outlined text-secondary text-[16px]">psychology</span>
                      <span>AI Copilot Dynamic Reallocation</span>
                      <span className="px-1.5 py-0.2 rounded-full bg-secondary-fixed text-on-secondary-fixed text-caption font-caption font-semibold">
                        Recommended
                      </span>
                    </button>
                  </div>
                </div>

                {/* AI Feature Toggle Card */}
                <div className="p-4 rounded-xl bg-tertiary-fixed/30 flex items-start justify-between gap-4 border border-outline-variant/10">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-tertiary-container text-on-tertiary-container flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                      <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-body-md-medium text-body-md-medium text-primary">
                          Enable Automated Vendor Synergy Suggestions
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-caption text-caption uppercase font-semibold">
                          AI Sommelier
                        </span>
                      </div>
                      <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
                        Allows Planora's engine to cross-reference catering contracts with floral installations to identify multi-booking volume discounts (saves up to 15% across preferred partners).
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={vendorSynergyAi}
                      onChange={(e) => {
                        setVendorSynergyAi(e.target.checked);
                        triggerToast(e.target.checked ? "AI Vendor Synergies enabled" : "AI Vendor Synergies disabled");
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-surface-container rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container"></div>
                  </label>
                </div>
              </div>
            </section>

            {/* ================= SECTION 3: NOTIFICATIONS & ALERT RULES ================= */}
            <section
              id="section-notifications"
              className="p-6 md:p-8 bg-surface-container-lowest rounded-2xl shadow-sm flex flex-col gap-6 scroll-mt-24 border border-outline-variant/15"
            >
              <div className="flex flex-col pb-4 border-b border-surface-container">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[22px]">notifications_active</span>
                  <h2 className="font-headline-sm text-headline-sm text-primary font-semibold">
                    Notification Preferences &amp; Escalation Rules
                  </h2>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
                  Choose how and when Planora notifies you regarding mission-critical milestones, guest RSVPs, and payments.
                </p>
              </div>

              {/* Delivery Channels */}
              <div className="flex flex-col gap-2.5">
                <label className="font-label-md text-label-md text-primary">Enabled Delivery Channels</label>
                <div className="flex flex-wrap gap-2.5">
                  <label className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface hover:bg-surface-container cursor-pointer transition-colors shadow-sm border border-outline-variant/15">
                    <input
                      type="checkbox"
                      checked={channelEmail}
                      onChange={(e) => setChannelEmail(e.target.checked)}
                      className="w-4 h-4 rounded accent-primary"
                    />
                    <span className="material-symbols-outlined text-primary text-[18px]">mail</span>
                    <span className="font-body-md text-body-md text-on-surface font-medium">Email ({email})</span>
                  </label>

                  <label className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface hover:bg-surface-container cursor-pointer transition-colors shadow-sm border border-outline-variant/15">
                    <input
                      type="checkbox"
                      checked={channelWhatsapp}
                      onChange={(e) => setChannelWhatsapp(e.target.checked)}
                      className="w-4 h-4 rounded accent-primary"
                    />
                    <span className="material-symbols-outlined text-emerald-700 text-[18px]">chat</span>
                    <span className="font-body-md text-body-md text-on-surface font-medium">WhatsApp Priority Push</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-caption text-caption font-semibold">
                      Instant
                    </span>
                  </label>

                  <label className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface hover:bg-surface-container cursor-pointer transition-colors shadow-sm border border-outline-variant/15">
                    <input
                      type="checkbox"
                      checked={channelDesktop}
                      onChange={(e) => setChannelDesktop(e.target.checked)}
                      className="w-4 h-4 rounded accent-primary"
                    />
                    <span className="material-symbols-outlined text-primary text-[18px]">desktop_windows</span>
                    <span className="font-body-md text-body-md text-on-surface font-medium">Browser Desktop Banners</span>
                  </label>
                </div>
              </div>

              {/* Toggles List */}
              <div className="flex flex-col divide-y divide-surface-container">
                {/* Deadlines */}
                <div className="py-4 flex items-center justify-between gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="font-body-md-medium text-body-md-medium text-primary">
                      Upcoming Task Deadlines &amp; Run-of-Show Alerts
                    </span>
                    <span className="font-body-md text-body-md text-on-surface-variant">
                      Sends morning digest and immediate alerts for critical countdown milestones.
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={alertDeadlines}
                      onChange={(e) => setAlertDeadlines(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-surface-container rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container"></div>
                  </label>
                </div>

                {/* VIP RSVPs */}
                <div className="py-4 flex items-center justify-between gap-4">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-body-md-medium text-body-md-medium text-primary">
                        Guest RSVP Velocity &amp; Declines
                      </span>
                      <span className="px-2 py-0.2 rounded-full bg-secondary-fixed text-on-secondary-fixed font-caption text-caption font-semibold">
                        VIP Tracking
                      </span>
                    </div>
                    <span className="font-body-md text-body-md text-on-surface-variant">
                      Direct notifications when flagged VVIP guests submit dietary requirements or accept invites.
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={alertVipRsvp}
                      onChange={(e) => setAlertVipRsvp(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-surface-container rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container"></div>
                  </label>
                </div>

                {/* Budget Threshold */}
                <div className="py-4 flex items-center justify-between gap-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-body-md-medium text-body-md-medium text-primary">
                      Budget Threshold Caution Triggers
                    </span>
                    <span className="font-body-md text-body-md text-on-surface-variant">
                      Trigger escalation warning when any department (e.g. Production/Decor) reaches 85% of allocated ceiling.
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={alertBudgetThreshold}
                      onChange={(e) => setAlertBudgetThreshold(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-surface-container rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container"></div>
                  </label>
                </div>

                {/* Vendor Payments */}
                <div className="py-4 flex items-center justify-between gap-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-body-md-medium text-body-md-medium text-primary">
                      Vendor Contract &amp; Payment Tranche Due Dates
                    </span>
                    <span className="font-body-md text-body-md text-on-surface-variant">
                      Sends disbursement reminder 3 business days prior to milestone payouts to avoid venue locks.
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={alertVendorPayments}
                      onChange={(e) => setAlertVendorPayments(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-surface-container rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container"></div>
                  </label>
                </div>

                {/* AI Recommendations */}
                <div className="py-4 flex items-center justify-between gap-4">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-body-md-medium text-body-md-medium text-primary">
                        AI Copilot Weekly Creative Briefs
                      </span>
                      <span className="px-2 py-0.2 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-caption text-caption font-semibold">
                        Digest
                      </span>
                    </div>
                    <span className="font-body-md text-body-md text-on-surface-variant">
                      Summary of fresh lighting designs, floral seasonality pricing drops, and schedule buffer suggestions.
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={alertAiBriefs}
                      onChange={(e) => setAlertAiBriefs(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-surface-container rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container"></div>
                  </label>
                </div>

                {/* Product Updates */}
                <div className="py-4 flex items-center justify-between gap-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-body-md-medium text-body-md-medium text-primary">
                      Product Updates &amp; Feature Releases
                    </span>
                    <span className="font-body-md text-body-md text-on-surface-variant">
                      Non-critical platform news, monthly changelogs, and event masterclasses.
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={alertProductUpdates}
                      onChange={(e) => setAlertProductUpdates(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-surface-container rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container"></div>
                  </label>
                </div>
              </div>
            </section>

            {/* ================= SECTION 4: APPEARANCE & INTERFACE ================= */}
            <section
              id="section-appearance"
              className="p-6 md:p-8 bg-surface-container-lowest rounded-2xl shadow-sm flex flex-col gap-6 scroll-mt-24 border border-outline-variant/15"
            >
              <div className="flex flex-col pb-4 border-b border-surface-container">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[22px]">palette</span>
                  <h2 className="font-headline-sm text-headline-sm text-primary font-semibold">
                    Appearance &amp; Interface Canvas
                  </h2>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
                  Customize visual tone, high-contrast states, and data table information density.
                </p>
              </div>

              {/* Theme Selection Grid */}
              <div className="flex flex-col gap-3">
                <label className="font-label-md text-label-md text-primary">Color Palette &amp; Theme Mode</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Light Mode */}
                  <div
                    onClick={() => {
                      setThemeMode("light");
                      triggerToast("Switched to Editorial Light theme");
                    }}
                    className={`cursor-pointer relative p-4 rounded-xl flex flex-col gap-3 transition-all border ${
                      themeMode === "light"
                        ? "bg-surface-container-low ring-2 ring-primary border-primary shadow-sm"
                        : "bg-surface hover:bg-surface-container border-outline-variant/15"
                    }`}
                  >
                    <div className="h-28 w-full rounded-lg bg-surface p-2.5 flex flex-col justify-between shadow-inner border border-outline-variant/10">
                      <div className="h-4 w-full bg-primary-container rounded flex items-center justify-between px-2">
                        <div className="w-8 h-1.5 rounded-full bg-secondary-fixed"></div>
                        <div className="w-3 h-3 rounded-full bg-secondary"></div>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5 my-auto">
                        <div className="h-10 rounded bg-surface-container-lowest p-1 flex flex-col gap-1">
                          <div className="w-6 h-1 rounded bg-primary"></div>
                          <div className="w-10 h-1 rounded bg-surface-container"></div>
                        </div>
                        <div className="h-10 rounded bg-surface-container-lowest p-1 flex flex-col gap-1">
                          <div className="w-8 h-1 rounded bg-secondary"></div>
                          <div className="w-6 h-1 rounded bg-surface-container"></div>
                        </div>
                        <div className="h-10 rounded bg-tertiary-fixed p-1 flex flex-col gap-1">
                          <div className="w-7 h-1 rounded bg-tertiary"></div>
                          <div className="w-5 h-1 rounded bg-surface-container"></div>
                        </div>
                      </div>
                      <div className="h-2 w-16 bg-surface-container-high rounded"></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-body-md-medium text-body-md-medium text-primary">Editorial Light</span>
                        <span className="font-caption text-caption text-on-surface-variant">Default luxury canvas</span>
                      </div>
                      {themeMode === "light" && (
                        <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center">
                          <span className="material-symbols-outlined text-[14px]">check</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Dark Mode */}
                  <div
                    onClick={() => {
                      setThemeMode("dark");
                      triggerToast("Switched to Midnight Slate dark theme");
                    }}
                    className={`cursor-pointer relative p-4 rounded-xl flex flex-col gap-3 transition-all border ${
                      themeMode === "dark"
                        ? "bg-surface-container-low ring-2 ring-primary border-primary shadow-sm"
                        : "bg-surface hover:bg-surface-container border-outline-variant/15"
                    }`}
                  >
                    <div className="h-28 w-full rounded-lg bg-[#0c1322] p-2.5 flex flex-col justify-between shadow-inner">
                      <div className="h-4 w-full bg-[#1b263b] rounded flex items-center justify-between px-2">
                        <div className="w-8 h-1.5 rounded-full bg-secondary-fixed"></div>
                        <div className="w-3 h-3 rounded-full bg-[#3b4760]"></div>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5 my-auto">
                        <div className="h-10 rounded bg-[#17233b] p-1 flex flex-col gap-1">
                          <div className="w-6 h-1 rounded bg-white"></div>
                          <div className="w-8 h-1 rounded bg-slate-700"></div>
                        </div>
                        <div className="h-10 rounded bg-[#17233b] p-1 flex flex-col gap-1">
                          <div className="w-8 h-1 rounded bg-secondary-fixed"></div>
                          <div className="w-6 h-1 rounded bg-slate-700"></div>
                        </div>
                        <div className="h-10 rounded bg-[#260075] p-1 flex flex-col gap-1">
                          <div className="w-7 h-1 rounded bg-tertiary-fixed"></div>
                          <div className="w-5 h-1 rounded bg-slate-700"></div>
                        </div>
                      </div>
                      <div className="h-2 w-16 bg-slate-800 rounded"></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-body-md-medium text-body-md-medium text-primary">Midnight Slate</span>
                        <span className="font-caption text-caption text-on-surface-variant">Low glare night planning</span>
                      </div>
                      {themeMode === "dark" && (
                        <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center">
                          <span className="material-symbols-outlined text-[14px]">check</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* System Match */}
                  <div
                    onClick={() => {
                      setThemeMode("system");
                      triggerToast("Theme set to match OS settings");
                    }}
                    className={`cursor-pointer relative p-4 rounded-xl flex flex-col gap-3 transition-all border ${
                      themeMode === "system"
                        ? "bg-surface-container-low ring-2 ring-primary border-primary shadow-sm"
                        : "bg-surface hover:bg-surface-container border-outline-variant/15"
                    }`}
                  >
                    <div className="h-28 w-full rounded-lg overflow-hidden flex shadow-inner">
                      <div className="w-1/2 h-full bg-surface p-2 flex flex-col justify-between">
                        <div className="h-3 w-full bg-primary-container rounded"></div>
                        <div className="h-6 w-full rounded bg-white shadow-xs"></div>
                        <div className="h-2 w-8 bg-surface-container rounded"></div>
                      </div>
                      <div className="w-1/2 h-full bg-[#0c1322] p-2 flex flex-col justify-between">
                        <div className="h-3 w-full bg-[#1b263b] rounded"></div>
                        <div className="h-6 w-full rounded bg-[#17233b]"></div>
                        <div className="h-2 w-8 bg-slate-800 rounded"></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-body-md-medium text-body-md-medium text-primary">System Match</span>
                        <span className="font-caption text-caption text-on-surface-variant">Follows OS dark/light shift</span>
                      </div>
                      {themeMode === "system" && (
                        <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center">
                          <span className="material-symbols-outlined text-[14px]">check</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Interface Density */}
              <div className="flex flex-col gap-2 pt-2">
                <label className="font-label-md text-label-md text-primary flex items-center justify-between">
                  <span>Interface Table &amp; Timeline Density</span>
                  <span className="font-caption text-caption text-on-surface-variant">Adapts spacing in budget ledgers</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setDensity("comfortable")}
                    className={`p-3.5 rounded-xl flex items-start gap-3 cursor-pointer border ${
                      density === "comfortable"
                        ? "bg-surface-container-high/70 border-primary"
                        : "bg-surface border-outline-variant/15"
                    }`}
                  >
                    <input
                      type="radio"
                      checked={density === "comfortable"}
                      onChange={() => setDensity("comfortable")}
                      className="mt-1 accent-primary"
                    />
                    <div className="flex flex-col">
                      <span className="font-body-md-medium text-body-md-medium text-primary">Comfortable (Default)</span>
                      <span className="font-caption text-caption text-on-surface-variant">
                        Generous 16px table row padding, elevated typography, optimum readability.
                      </span>
                    </div>
                  </div>

                  <div
                    onClick={() => setDensity("compact")}
                    className={`p-3.5 rounded-xl flex items-start gap-3 cursor-pointer border ${
                      density === "compact"
                        ? "bg-surface-container-high/70 border-primary"
                        : "bg-surface border-outline-variant/15"
                    }`}
                  >
                    <input
                      type="radio"
                      checked={density === "compact"}
                      onChange={() => setDensity("compact")}
                      className="mt-1 accent-primary"
                    />
                    <div className="flex flex-col">
                      <span className="font-body-md-medium text-body-md-medium text-primary">Compact Data View</span>
                      <span className="font-caption text-caption text-on-surface-variant">
                        Dense 10px rows designed for high-item floral &amp; equipment inventory ledgers.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ================= SECTION 5: SECURITY & SESSION MANAGEMENT ================= */}
            <section
              id="section-security"
              className="p-6 md:p-8 bg-surface-container-lowest rounded-2xl shadow-sm flex flex-col gap-6 scroll-mt-24 border border-outline-variant/15"
            >
              <div className="flex flex-col pb-4 border-b border-surface-container">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[22px]">shield</span>
                  <h2 className="font-headline-sm text-headline-sm text-primary font-semibold">
                    Security &amp; Authentication Control
                  </h2>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
                  Protect client privacy, manage hardware passkeys, and enforce multi-factor authentication.
                </p>
              </div>

              {/* 2FA Status Card */}
              <div className="p-5 rounded-xl bg-surface-container-low flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-outline-variant/10">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-[22px]">verified_user</span>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-body-md-medium text-body-md-medium text-primary">
                        Two-Factor Authentication (2FA) is Active
                      </span>
                      <span className="px-2 py-0.2 rounded-full bg-emerald-200 text-emerald-900 font-caption text-caption font-semibold">
                        Protected
                      </span>
                    </div>
                    <span className="font-body-md text-body-md text-on-surface-variant">
                      Secured via Authenticator App (Google Authenticator / 1Password TOTP).
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => triggerToast("10 New Emergency One-Time Backup Codes Generated")}
                    className="h-9 px-3.5 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-primary font-body-md-medium text-body-md shadow-sm transition-colors border border-outline-variant/15"
                  >
                    Configure Backup Codes
                  </button>
                </div>
              </div>

              {/* Password Change Card Form */}
              <div className="p-5 rounded-xl bg-surface flex flex-col gap-4 border border-outline-variant/15">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-body-md-medium text-body-md-medium text-primary font-semibold">Change Master Password</span>
                    <span className="font-caption text-caption text-on-surface-variant">
                      Last updated 42 days ago • We enforce 8+ characters for enterprise planners.
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant text-[20px]">lock_reset</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                  {/* Current Password */}
                  <div className="flex flex-col gap-1">
                    <label className="font-caption text-caption text-on-surface-variant">Current Password</label>
                    <div className="relative flex items-center">
                      <input
                        type={showPwdCurr ? "text" : "password"}
                        value={pwdCurr}
                        onChange={(e) => setPwdCurr(e.target.value)}
                        className="w-full h-10 px-3 pr-8 rounded-lg bg-surface-container-lowest text-body-md font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container border border-outline-variant/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPwdCurr(!showPwdCurr)}
                        className="absolute right-2 text-on-surface-variant hover:text-primary"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {showPwdCurr ? "visibility_off" : "visibility"}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div className="flex flex-col gap-1">
                    <label className="font-caption text-caption text-on-surface-variant">New Password</label>
                    <div className="relative flex items-center">
                      <input
                        type={showPwdNew ? "text" : "password"}
                        value={pwdNew}
                        onChange={(e) => setPwdNew(e.target.value)}
                        placeholder="Min. 8 chars"
                        className="w-full h-10 px-3 pr-8 rounded-lg bg-surface-container-lowest text-body-md font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container border border-outline-variant/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPwdNew(!showPwdNew)}
                        className="absolute right-2 text-on-surface-variant hover:text-primary"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {showPwdNew ? "visibility_off" : "visibility"}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Confirm New */}
                  <div className="flex flex-col gap-1">
                    <label className="font-caption text-caption text-on-surface-variant">Confirm New Password</label>
                    <div className="relative flex items-center">
                      <input
                        type={showPwdConfirm ? "text" : "password"}
                        value={pwdConfirm}
                        onChange={(e) => setPwdConfirm(e.target.value)}
                        placeholder="Repeat new password"
                        className="w-full h-10 px-3 pr-8 rounded-lg bg-surface-container-lowest text-body-md font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container border border-outline-variant/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPwdConfirm(!showPwdConfirm)}
                        className="absolute right-2 text-on-surface-variant hover:text-primary"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {showPwdConfirm ? "visibility_off" : "visibility"}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Password Strength Indicator */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <span className="w-6 h-1.5 rounded-full bg-emerald-600"></span>
                      <span className="w-6 h-1.5 rounded-full bg-emerald-600"></span>
                      <span className="w-6 h-1.5 rounded-full bg-emerald-600"></span>
                      <span className="w-6 h-1.5 rounded-full bg-surface-container"></span>
                    </div>
                    <span className="font-caption text-caption text-emerald-800 font-medium">
                      Strong password — meets complexity requirements
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handlePasswordUpdate}
                    className="h-9 px-4 rounded-lg bg-primary text-on-primary font-body-md-medium text-body-md hover:bg-primary/90 transition-colors self-end sm:self-auto"
                  >
                    Update Password
                  </button>
                </div>
              </div>

              {/* Active Sessions List */}
              <div className="flex flex-col gap-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="font-label-md text-label-md text-primary font-semibold">
                    Active Hardware &amp; Web Sessions
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setSessions((prev) => prev.filter((s) => s.isCurrent));
                      triggerToast("Signed out of all auxiliary devices.");
                    }}
                    className="text-error font-body-md-medium text-body-md hover:underline text-[13px] flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">logout</span>
                    <span>Sign out of other devices</span>
                  </button>
                </div>

                <div className="flex flex-col gap-2">
                  {sessions.map((sess) => (
                    <div
                      key={sess.id}
                      className="p-3.5 rounded-xl bg-surface flex items-center justify-between border border-outline-variant/15"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-surface-container text-primary flex items-center justify-center">
                          <span className="material-symbols-outlined text-[20px]">
                            {sess.name.includes("iPhone") ? "smartphone" : "laptop_mac"}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-body-md-medium text-body-md-medium text-primary">{sess.name}</span>
                            {sess.isCurrent ? (
                              <span className="px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-900 font-caption text-caption font-semibold">
                                Current Session
                              </span>
                            ) : (
                              <span className="font-caption text-caption text-on-surface-variant font-medium">
                                Native Mobile Client
                              </span>
                            )}
                          </div>
                          <span className="font-caption text-caption text-on-surface-variant">{sess.loc}</span>
                        </div>
                      </div>
                      {sess.isCurrent ? (
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleRevokeSession(sess.id)}
                          title="Revoke access"
                          className="text-on-surface-variant hover:text-error transition-colors p-1"
                        >
                          <span className="material-symbols-outlined text-[18px]">close</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ================= SECTION 6: DATA, PRIVACY & DESTRUCTIVE ZONE ================= */}
            <section
              id="section-data"
              className="p-6 md:p-8 bg-surface-container-lowest rounded-2xl shadow-sm flex flex-col gap-6 scroll-mt-24 border border-outline-variant/15"
            >
              <div className="flex flex-col pb-4 border-b border-surface-container">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[22px]">database</span>
                  <h2 className="font-headline-sm text-headline-sm text-primary font-semibold">
                    Data Retention, Export &amp; Privacy
                  </h2>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
                  Manage GDPR/DPDP compliance archives, algorithmic telemetry, and workspace dissolution.
                </p>
              </div>

              {/* Export Data Box */}
              <div className="p-5 rounded-xl bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-outline-variant/15">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-surface-container text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-[20px]">archive</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-body-md-medium text-body-md-medium text-primary font-semibold">
                      Export All Managed Event Workspaces
                    </span>
                    <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
                      Download structured full-fidelity ZIP archive containing all 8 event budgets (CSV), guest seating charts (PDF), vendor contracts, and master run-of-show files.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    triggerToast("Archive bundle generation started. A secure download link will be emailed to you.")
                  }
                  className="h-10 px-4 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-primary font-body-md-medium text-body-md shadow-sm transition-colors flex items-center gap-2 flex-shrink-0 border border-outline-variant/15"
                >
                  <span className="material-symbols-outlined text-[18px]">file_download</span>
                  <span>Request Archive (.ZIP)</span>
                </button>
              </div>

              {/* AI Model Training Consent Toggle */}
              <div className="p-5 rounded-xl bg-surface flex items-start justify-between gap-4 border border-outline-variant/15">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-[20px]">model_training</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-body-md-medium text-body-md-medium text-primary font-semibold">
                      Anonymized Event Pattern Telemetry
                    </span>
                    <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
                      Contribute anonymized vendor budget breakdowns and timeline pacing data to train Planora's proprietary Luxury Hospitality LLM. Client names and identifiable personal details are strictly scrubbed under zero-data-retention guarantees.
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={telemetryConsent}
                    onChange={(e) => setTelemetryConsent(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-surface-container rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container"></div>
                </label>
              </div>

              {/* Danger Zone */}
              <div className="p-6 rounded-xl bg-error-container/40 flex flex-col gap-4 mt-2 border border-error-container">
                <div className="flex items-center gap-2 text-error">
                  <span className="material-symbols-outlined text-[20px]">warning</span>
                  <span className="font-headline-sm text-headline-sm font-semibold">Danger Zone</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex flex-col">
                    <span className="font-body-md-medium text-body-md-medium text-on-surface font-semibold">
                      Permanently Delete Master Planner Account
                    </span>
                    <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
                      Irrevocably erase {fullName}'s account, remove organization {organization}, and immediately terminate access to 8 active celebration dashboards and client RSVP portals.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="h-10 px-5 rounded-lg bg-error hover:bg-error/90 text-on-error font-body-md-medium text-body-md transition-colors flex items-center gap-2 flex-shrink-0 shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete_forever</span>
                    <span>Delete Account...</span>
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-50 bg-primary/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 shadow-2xl flex flex-col gap-4 border border-outline-variant/20">
              <div className="w-12 h-12 rounded-full bg-error-container text-error flex items-center justify-center">
                <span className="material-symbols-outlined text-[26px]">warning</span>
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="font-headline-sm text-headline-sm text-primary font-bold">Confirm Account Deletion</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  This will irreversibly delete your master account, disconnect 8 event portals, and delete 1,420 confirmed RSVP records.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-surface flex flex-col gap-1 text-[13px] text-on-surface-variant font-caption border border-outline-variant/15">
                <div className="flex items-center gap-1.5 text-error font-medium">
                  <span className="material-symbols-outlined text-[16px]">block</span>
                  <span>Active Contracts Cannot Be Reclaimed</span>
                </div>
                <span>
                  To confirm, please type <strong className="text-primary font-bold">DELETE-PLANORA</strong> below:
                </span>
              </div>
              <input
                type="text"
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                placeholder="Type DELETE-PLANORA"
                className="w-full h-10 px-3 rounded-lg bg-surface text-body-md font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-error border border-outline-variant/20"
              />
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="h-10 px-4 rounded-lg bg-surface hover:bg-surface-container text-on-surface font-body-md-medium text-body-md transition-colors border border-outline-variant/15"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handlePerformDelete}
                  className="h-10 px-5 rounded-lg bg-error hover:bg-error/90 text-on-error font-body-md-medium text-body-md transition-colors shadow-sm"
                >
                  Permanently Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
