import { useState, type FormEvent } from "react";
import AppLayout from "../components/layout/AppLayout";

export default function Settings() {
  const [name, setName] = useState("Alex Morgan");
  const [email, setEmail] = useState("alex@planora.ai");
  const [phone, setPhone] = useState("+91 98200 12345");
  const [role, setRole] = useState("Lead Luxury Event Producer");
  const [saved, setSaved] = useState(false);

  const [emailAlerts, setEmailAlerts] = useState(true);
  const [whatsappRsvp, setWhatsappRsvp] = useState(true);
  const [budgetWarnings, setBudgetWarnings] = useState(true);

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <AppLayout title="Settings & Profile" subtitle="Manage your studio configuration, notifications and workspace.">
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        {/* Left Settings Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-space-md">
          <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-outline-variant/15 flex flex-col gap-3">
            <div className="flex items-center gap-3 pb-2 border-b border-outline-variant/10">
              <div className="w-12 h-12 rounded-full bg-primary text-secondary-fixed flex items-center justify-center font-bold text-base shadow-sm">
                AM
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-heading font-bold text-sm text-primary truncate">{name}</span>
                <span className="text-xs text-on-surface-variant truncate">{email}</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-surface-container-low flex flex-col gap-1 border border-outline-variant/10 text-xs">
              <div className="flex justify-between items-center font-bold text-primary">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-secondary">workspace_premium</span>
                  Pro Planner Tier
                </span>
                <span className="text-[10px] uppercase text-secondary">Active</span>
              </div>
              <span className="text-[11px] text-on-surface-variant mt-1">Unlimited AI Studio prompts & 50 Events</span>
            </div>
          </div>
        </div>

        {/* Right Settings Form Sections */}
        <div className="lg:col-span-8 flex flex-col gap-space-lg">
          {/* Section 1: Profile */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-outline-variant/15 flex flex-col gap-4">
            <div className="flex items-center gap-2 pb-2 border-b border-outline-variant/10">
              <span className="material-symbols-outlined text-primary text-[22px]">badge</span>
              <h2 className="font-heading font-bold text-base text-primary">Personal & Studio Profile</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-on-surface uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-surface-container-low border border-outline-variant/20 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-surface-container-low border border-outline-variant/20 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface uppercase mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-surface-container-low border border-outline-variant/20 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface uppercase mb-1">Role / Designation</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-surface-container-low border border-outline-variant/20 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Notifications */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-outline-variant/15 flex flex-col gap-4">
            <div className="flex items-center gap-2 pb-2 border-b border-outline-variant/10">
              <span className="material-symbols-outlined text-primary text-[22px]">notifications</span>
              <h2 className="font-heading font-bold text-base text-primary">Notification Governance</h2>
            </div>

            <div className="flex flex-col divide-y divide-surface-container/60">
              <div className="py-3 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-on-surface block">Critical Task Deadlines</span>
                  <span className="text-[11px] text-on-surface-variant">Send email reminders 48 hours prior to milestone expiry.</span>
                </div>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="w-4 h-4 rounded accent-primary cursor-pointer"
                />
              </div>

              <div className="py-3 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-on-surface block">Instant RSVP Alerts</span>
                  <span className="text-[11px] text-on-surface-variant">Real-time pings when guests accept or decline online invitations.</span>
                </div>
                <input
                  type="checkbox"
                  checked={whatsappRsvp}
                  onChange={(e) => setWhatsappRsvp(e.target.checked)}
                  className="w-4 h-4 rounded accent-primary cursor-pointer"
                />
              </div>

              <div className="py-3 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-on-surface block">Budget Ceiling Warnings</span>
                  <span className="text-[11px] text-on-surface-variant">Alert when category spending exceeds 85% of allocated estimate.</span>
                </div>
                <input
                  type="checkbox"
                  checked={budgetWarnings}
                  onChange={(e) => setBudgetWarnings(e.target.checked)}
                  className="w-4 h-4 rounded accent-primary cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Save Action */}
          <div className="flex items-center justify-between">
            {saved ? (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                Preferences saved successfully!
              </span>
            ) : (
              <span></span>
            )}

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary-container shadow-sm transition-all"
            >
              Save Changes
            </button>
          </div>
        </div>
      </form>
    </AppLayout>
  );
}
