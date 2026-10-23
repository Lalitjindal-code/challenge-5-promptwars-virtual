import { useState } from "react";
import AppLayout from "../components/layout/AppLayout";
import { useEventContext } from "../context/EventContext";

export default function Vendors() {
  const { vendors } = useEventContext();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");

  const filteredVendors = vendors.filter((v) => {
    if (selectedCategory !== "All" && !v.service.toLowerCase().includes(selectedCategory.toLowerCase())) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return v.name.toLowerCase().includes(q) || v.service.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <AppLayout title="Vendors Directory" subtitle="Curate, evaluate and contract vetted event service partners.">
      {/* 1. 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-outline-variant/15 flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold text-on-surface-variant uppercase">Network Roster</span>
            <div className="font-heading text-2xl font-bold text-primary mt-1">{vendors.length}</div>
            <span className="text-[11px] text-on-surface-variant mt-1.5 block">Vetted partners</span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[20px]">storefront</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-outline-variant/15 flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold text-on-surface-variant uppercase">Booked & Confirmed</span>
            <div className="font-heading text-2xl font-bold text-primary mt-1">
              {vendors.filter((v) => v.status === "Booked").length}
            </div>
            <span className="text-[11px] text-secondary font-bold mt-1.5 block">Contracts locked</span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined text-[20px]">verified</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-outline-variant/15 flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold text-on-surface-variant uppercase">Shortlisted</span>
            <div className="font-heading text-2xl font-bold text-secondary mt-1">
              {vendors.filter((v) => v.status !== "Booked").length}
            </div>
            <span className="text-[11px] text-on-surface-variant mt-1.5 block">Under evaluation</span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-secondary-container/40 flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined text-[20px]">star</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-outline-variant/15 flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold text-on-surface-variant uppercase">Total Commitment</span>
            <div className="font-heading text-2xl font-bold text-primary mt-1">
              ₹{(vendors.reduce((acc, v) => acc + v.cost, 0) / 100000).toFixed(1)}L
            </div>
            <span className="text-[11px] text-on-surface-variant mt-1.5 block">Signed quotes</span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[20px]">receipt_long</span>
          </div>
        </div>
      </div>

      {/* 2. Search & Category Filter */}
      <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-outline-variant/15 flex flex-col sm:flex-row items-center justify-between gap-space-md">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto">
          {["All", "Venue", "Catering", "Decor", "Photography", "Music"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? "bg-primary text-on-primary shadow-sm"
                  : "bg-surface-container-low text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search vendor name, service..."
            className="w-full h-9 pl-9 pr-3 rounded-lg bg-surface-container-low border border-outline-variant/20 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* 3. Vendor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-lg">
        {filteredVendors.map((v) => (
          <div
            key={v.id}
            className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-outline-variant/15 hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start gap-2 mb-2">
                <div>
                  <h3 className="font-heading font-bold text-base text-primary">{v.name}</h3>
                  <span className="text-xs text-on-surface-variant block mt-0.5">{v.service}</span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    v.status === "Booked"
                      ? "bg-surface-container text-primary"
                      : "bg-secondary-fixed text-on-secondary-fixed"
                  }`}
                >
                  {v.status}
                </span>
              </div>

              <div className="flex items-center gap-1 text-secondary mt-2">
                <span className="material-symbols-outlined text-[16px]">star</span>
                <span className="text-xs font-bold">{v.rating} Rating</span>
                <span className="text-[11px] text-on-surface-variant ml-1">(Vetted & Insured)</span>
              </div>

              <div className="bg-surface-container-low p-2.5 rounded-lg mt-3 flex items-center justify-between text-xs">
                <span className="text-on-surface-variant">Contract Quote:</span>
                <span className="font-heading font-bold text-primary">₹{v.cost.toLocaleString()}</span>
              </div>

              <div className="text-xs text-on-surface-variant mt-2 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px]">call</span>
                <span>{v.contact}</span>
              </div>
            </div>

            <div className="pt-space-md mt-space-md border-t border-outline-variant/10 flex items-center justify-between">
              <button
                type="button"
                className="h-8 px-3 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container"
              >
                View Contract
              </button>
              <button
                type="button"
                className="w-8 h-8 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[18px]">chat</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </AppLayout>
  );
}
