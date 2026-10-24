import { useState, type FormEvent } from "react";
import AppLayout from "../components/layout/AppLayout";
import { useEventContext } from "../context/EventContext";
import type { DetailedVendor } from "../types";



export default function Vendors() {
  const { isDemo, events, activeEvent, vendors, addVendor } = useEventContext();
  const vendorList = vendors;

  // Selected vendor for inspection in right drawer
  const [selectedVendorId, setSelectedVendorId] = useState<string>(() => {
    return vendors[0]?.id || "";
  });

  // Filters & State
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [eventFilter, setEventFilter] = useState("");
  const [sortBy, setSortBy] = useState("Recommended");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newVendorName, setNewVendorName] = useState("");
  const [newVendorCategory, setNewVendorCategory] = useState<DetailedVendor["category"]>("Venue");
  const [newContactName, setNewContactName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newPrice, setNewPrice] = useState<number>(50000);
  const [newEvent, setNewEvent] = useState(activeEvent?.name || "Aarav & Priya Wedding");
  const [newStatus, setNewStatus] = useState<DetailedVendor["status"]>("Shortlisted");
  const [newNotes, setNewNotes] = useState("");

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Inspecting Vendor
  const inspectedVendor = vendorList.find((v) => v.id === selectedVendorId) || vendorList[0];

  // Filtering
  const filteredVendors = vendorList.filter((v) => {
    if (activeCategory !== "All" && !v.category.toLowerCase().includes(activeCategory.toLowerCase())) return false;
    if (statusFilter !== "All") {
      if (statusFilter === "Booked" && !v.status.includes("Booked")) return false;
      if (statusFilter === "Shortlisted" && v.status !== "Shortlisted") return false;
      if (statusFilter === "Pending" && !v.status.includes("Pending")) return false;
    }
    if (eventFilter && !v.event.toLowerCase().includes(eventFilter.toLowerCase())) return false;
    if (
      searchQuery &&
      !v.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !v.category.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !v.location.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  // Sorting
  const sortedVendors = [...filteredVendors].sort((a, b) => {
    if (sortBy === "Rating: High to Low") return b.rating - a.rating;
    if (sortBy === "Price: Low to High") return a.cost - b.cost;
    if (sortBy === "Price: High to Low") return b.cost - a.cost;
    return 0;
  });

  // KPI Calculations
  const totalVendors = vendorList.length || (isDemo ? 24 : 0);
  const shortlistedCount = vendorList.filter((v) => v.status === "Shortlisted").length;
  const bookedCount = vendorList.filter((v) => v.status.includes("Booked")).length;
  const pendingPayments = vendorList.reduce((acc, v) => acc + (v.cost - (v.paidAmount || 0)), 0);

  // Add Vendor Handler
  const handleSaveVendor = async (e: FormEvent) => {
    e.preventDefault();
    if (!newVendorName.trim()) {
      showToast("Please provide vendor name");
      return;
    }

    const createdData: Omit<DetailedVendor, "id" | "eventId"> = {
      name: newVendorName.trim(),
      category: newVendorCategory,
      location: newCity || "Udaipur, Rajasthan",
      rating: 4.8,
      reviewCount: 1,
      event: activeEvent?.name || newEvent,
      tags: [newVendorCategory, "Vetted"],
      cost: newPrice,
      paidAmount: 0,
      status: newStatus,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuD84hI89HU0-gXS60ebF2HVREdmPyBHchcdjM1k9DXHGlfRBYTfzZjyk0kIRU2dr1Ulw_vsdmLuIe-jHgv6QGwjTrISspxdk63yiC4GMLR8VpELARydhrDU17JV7uOITyc5eZoyu62n2edC0dw_vIHoKYVWclq8NJIRaYgf2K457AhdGS1duppQBL-M1KIm2o5ATVMESQX_2-W7gtZf1kfMKLz3Yhc4H9yKo8g1YIvK9XvhqtDJV_Lb_g",
      contactName: newContactName || "Partner Representative",
      contactRole: "Lead Coordinator",
      contactPhone: newPhone || "+91 98000 00000",
      contactEmail: newEmail || "contact@vendor.example",
      inclusions: ["Service consultation", "Setup & teardown", "Onsite coordination"],
      advisoryText: "Added to vendor directory. Review quotes and contract milestones.",
      notes: newNotes || "Added via Planora Vendor Directory."
    };

    await addVendor(createdData);
    setIsAddModalOpen(false);
    setNewVendorName("");
    setNewContactName("");
    setNewPhone("");
    setNewEmail("");
    showToast(`Vendor ${createdData.name} added successfully!`);
  };

  return (
    <AppLayout title="Vendors" subtitle="Find, compare and manage the people who bring your events to life.">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-24 right-8 z-50 flex items-center gap-2 px-4 py-3 bg-primary text-on-primary rounded-xl shadow-xl border border-outline-variant/20 animate-fade-in text-sm font-medium">
          <span className="material-symbols-outlined text-[20px] text-secondary-fixed">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Content Action Bar / Breadcrumb Navigation */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md mb-space-lg">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="font-caption text-caption uppercase tracking-wider text-on-surface-variant font-bold">Event Concierge</span>
            <span className="text-on-surface-variant/40">/</span>
            <span className="font-label-md text-label-md text-primary font-semibold">Vendor Directory</span>
          </div>
          <div className="flex items-center gap-space-sm mt-1">
            <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">Vendors & Partners</h1>
            <div className="relative inline-block text-left">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high text-on-surface font-label-md text-label-md hover:bg-surface-container-highest transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-secondary"></span>
                <span>{activeEvent ? activeEvent.name : isDemo ? "All Events (3 Active)" : "All Celebrations"}</span>
                <span className="material-symbols-outlined text-[16px] text-on-surface-variant">expand_more</span>
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-space-sm self-start lg:self-auto">
          <button
            type="button"
            onClick={() => showToast("Exported vendor directory to CSV / PDF")}
            className="h-10 px-4 rounded-lg bg-surface-container-lowest text-on-surface font-label-md text-label-md flex items-center gap-2 hover:bg-surface-container transition-all shadow-sm border border-outline-variant/10"
          >
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">file_download</span>
            <span>Export Directory</span>
          </button>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="h-10 px-5 rounded-lg bg-primary text-on-primary font-label-md text-label-md flex items-center gap-2 hover:bg-primary-container active:translate-y-0.5 transition-all shadow-md"
          >
            <span className="material-symbols-outlined text-secondary-fixed text-[18px]">add</span>
            <span>Add Vendor</span>
          </button>
        </div>
      </div>

      {/* Key Metrics Row (4 Compact Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md mb-space-lg">
        {/* Card 1: Total Vendors */}
        <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow border border-outline-variant/10">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="font-label-md text-label-md text-on-surface-variant font-medium">Total Vendors</span>
              <span className="font-headline-xl text-headline-xl text-primary mt-1 font-bold">{totalVendors}</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[22px]">storefront</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-surface-container">
            <span className="inline-flex items-center text-secondary text-caption font-caption font-bold">
              <span className="material-symbols-outlined text-[14px] mr-0.5">trending_up</span>+3
            </span>
            <span className="font-caption text-caption text-on-surface-variant">across 8 categories this month</span>
          </div>
        </div>

        {/* Card 2: Shortlisted */}
        <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between group hover:shadow-md transition-shadow border border-outline-variant/10">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="font-label-md text-label-md text-on-surface-variant font-medium">Shortlisted</span>
              <span className="font-headline-xl text-headline-xl text-primary mt-1 font-bold">{shortlistedCount}</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed">
              <span className="material-symbols-outlined text-[22px]">star</span>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-surface-container">
            <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-caption text-caption font-semibold">
              Under Evaluation
            </span>
            <span className="font-caption text-caption text-on-surface-variant">3 pending quotes</span>
          </div>
        </div>

        {/* Card 3: Booked & Signed */}
        <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between group hover:shadow-md transition-shadow border border-outline-variant/10">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="font-label-md text-label-md text-on-surface-variant font-medium">Booked & Confirmed</span>
              <span className="font-headline-xl text-headline-xl text-primary mt-1 font-bold">{bookedCount}</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[22px]">verified</span>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-surface-container">
            <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-primary font-caption text-caption font-semibold">
              100% Retained
            </span>
            <span className="font-caption text-caption text-on-surface-variant">Contracts signed</span>
          </div>
        </div>

        {/* Card 4: Pending Payments */}
        <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between group hover:shadow-md transition-shadow border border-outline-variant/10">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="font-label-md text-label-md text-on-surface-variant font-medium">Pending Payments</span>
              <span className="font-headline-xl text-headline-xl text-primary mt-1 font-bold">
                ₹{pendingPayments.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-error-container flex items-center justify-center text-on-error-container">
              <span className="material-symbols-outlined text-[22px]">receipt_long</span>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-surface-container">
            <span className="px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-caption text-caption font-bold">
              3 Invoices
            </span>
            <span className="font-caption text-caption text-on-surface-variant">Due within 14 days</span>
          </div>
        </div>
      </div>

      {/* Search, Filtering, and Category Hub */}
      <div className="flex flex-col space-y-space-md p-space-md bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/10 mb-space-lg">
        {/* Search & Control Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-space-sm items-center">
          {/* Search Input */}
          <div className="md:col-span-5 relative flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[18px]">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search vendors by name, service or tag..."
              className="w-full h-10 pl-10 pr-12 rounded-lg bg-surface text-body-md font-body-md text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary-container transition-all border border-outline-variant/20"
            />
            <span className="absolute right-3 px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant text-[10px] font-caption font-bold tracking-widest">
              ⌘K
            </span>
          </div>

          {/* Event Selector */}
          <div className="md:col-span-2">
            <select
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-surface text-body-md font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container border border-outline-variant/20"
            >
              <option value="">All Events (3)</option>
              <option value="Aarav & Priya Wedding">Aarav & Priya Wedding</option>
              <option value="TechFest 2026">TechFest 2026</option>
              <option value="Birthday Celebration">Birthday Celebration</option>
            </select>
          </div>

          {/* Booking Status Filter */}
          <div className="md:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-surface text-body-md font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container border border-outline-variant/20"
            >
              <option value="All">All Statuses</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Booked">Booked</option>
              <option value="Pending">Pending Contract</option>
            </select>
          </div>

          {/* Sort Filter */}
          <div className="md:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-surface text-body-md font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container border border-outline-variant/20"
            >
              <option value="Recommended">Sort: Recommended</option>
              <option value="Rating: High to Low">Rating: High to Low</option>
              <option value="Price: Low to High">Price: Low to High</option>
              <option value="Price: High to Low">Price: High to Low</option>
            </select>
          </div>

          {/* View Switcher */}
          <div className="md:col-span-1 flex items-center justify-end gap-1">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded transition-all ${
                viewMode === "grid" ? "bg-primary text-on-primary shadow-xs" : "text-on-surface-variant hover:bg-surface"
              }`}
              title="Grid View"
            >
              <span className="material-symbols-outlined text-[18px]">grid_view</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`p-2 rounded transition-all ${
                viewMode === "list" ? "bg-primary text-on-primary shadow-xs" : "text-on-surface-variant hover:bg-surface"
              }`}
              title="List View"
            >
              <span className="material-symbols-outlined text-[18px]">view_list</span>
            </button>
          </div>
        </div>

        {/* Category Pill Strip (Horizontal Scrollable) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar text-nowrap">
          {[
            { id: "All", name: "All Vendors", count: totalVendors, icon: "" },
            { id: "Venue", name: "Venues", count: 4, icon: "castle" },
            { id: "Catering", name: "Catering", count: 5, icon: "restaurant" },
            { id: "Photography", name: "Photography", count: 3, icon: "photo_camera" },
            { id: "Decoration", name: "Decoration", count: 4, icon: "local_florist" },
            { id: "Music", name: "Music & DJ", count: 3, icon: "music_note" },
            { id: "Logistics", name: "Logistics & AV", count: 2, icon: "speaker" },
            { id: "Styling", name: "Makeup & Styling", count: 2, icon: "brush" },
            { id: "Other", name: "Other Services", count: 1, icon: "work" }
          ].map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-full font-label-md text-label-md flex items-center gap-1.5 transition-all ${
                  isActive
                    ? "bg-primary text-on-primary shadow-xs"
                    : "bg-surface hover:bg-surface-container text-on-surface"
                }`}
              >
                {cat.icon && <span className="material-symbols-outlined text-[16px] text-on-surface-variant">{cat.icon}</span>}
                <span>{cat.name}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[11px] font-caption ${
                    isActive ? "bg-surface/20 text-on-primary" : "bg-surface-container-high text-on-surface-variant"
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Split: Directory Cards Grid (65%) + Inspection Drawer (35%) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-start pb-16">
        {/* LEFT VENDOR CARDS (7 of 12 cols = ~60-65%) */}
        <div className="xl:col-span-7 flex flex-col space-y-space-md">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="font-title-md text-title-md text-primary font-bold">Showing All Vendors</span>
              <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-caption text-caption">
                {sortedVendors.length} Verified Cards
              </span>
            </div>
            <span className="font-caption text-caption text-on-surface-variant">Last updated: Today, 11:20 AM</span>
          </div>

          {/* Cards Grid */}
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-space-md" : "flex flex-col gap-space-sm"}>
            {sortedVendors.length === 0 ? (
              <div className="col-span-2 py-16 text-center text-on-surface-variant bg-surface-container-lowest rounded-xl border border-outline-variant/10">
                <span className="material-symbols-outlined text-[36px] text-on-surface-variant/40 block mb-2">storefront</span>
                <p className="font-body-md-medium text-body-md text-primary">No vendors found in this category</p>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(true)}
                  className="mt-3 px-4 py-2 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container"
                >
                  + Add Vendor Now
                </button>
              </div>
            ) : (
              sortedVendors.map((vendor) => {
                const isSelected = selectedVendorId === vendor.id;
                return (
                  <div
                    key={vendor.id}
                    onClick={() => setSelectedVendorId(vendor.id)}
                    className={`rounded-xl bg-surface-container-lowest p-space-md shadow-sm transition-all flex flex-col justify-between cursor-pointer border ${
                      isSelected
                        ? "ring-2 ring-primary border-primary shadow-md"
                        : "border-outline-variant/10 hover:shadow-md hover:border-primary/20"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full bg-primary text-secondary-fixed font-caption text-caption uppercase tracking-wider font-bold">
                        Inspecting
                      </div>
                    )}

                    <div className="flex flex-col space-y-3">
                      <div className="relative h-40 rounded-lg overflow-hidden bg-surface-container">
                        <img className="w-full h-full object-cover" src={vendor.image} alt={vendor.name} />
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-surface-container-lowest/90 backdrop-blur-sm text-primary font-caption text-caption font-semibold flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px] text-secondary">verified</span>
                          Verified Partner
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            showToast(`Saved ${vendor.name} to favorites`);
                          }}
                          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-surface-container-lowest/90 backdrop-blur-sm flex items-center justify-center text-secondary hover:scale-110 transition-transform"
                        >
                          <span className="material-symbols-outlined text-[18px]">favorite</span>
                        </button>
                      </div>

                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-caption text-caption uppercase text-on-surface-variant font-semibold tracking-wider">
                            {vendor.category} • {vendor.location.split(",")[0]}
                          </span>
                          <div className="flex items-center gap-1 text-secondary font-label-sm text-label-sm font-bold">
                            <span className="material-symbols-outlined text-[16px]">star</span>
                            {vendor.rating} <span className="text-on-surface-variant font-normal">({vendor.reviewCount})</span>
                          </div>
                        </div>
                        <h3 className="font-headline-sm text-headline-sm text-primary font-bold mt-0.5">{vendor.name}</h3>
                        <p className="font-caption text-caption text-on-surface-variant mt-0.5">{vendor.event}</p>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {vendor.tags.map((t, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-caption text-caption">
                            {t}
                          </span>
                        ))}
                      </div>

                      <div className="pt-2 bg-surface-container-lowest flex items-center justify-between border-t border-surface-container">
                        <div className="flex flex-col">
                          <span className="font-caption text-caption text-on-surface-variant">Estimated Total</span>
                          <span className="font-title-md text-title-md text-primary font-bold">₹{vendor.cost.toLocaleString("en-IN")}</span>
                        </div>
                        <span
                          className={`px-2.5 py-1 rounded-full font-caption text-caption font-semibold ${
                            vendor.status.includes("Booked")
                              ? "bg-surface-container text-primary"
                              : "bg-secondary-fixed text-on-secondary-fixed"
                          }`}
                        >
                          {vendor.status}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 flex items-center gap-2 border-t border-surface-container">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedVendorId(vendor.id);
                        }}
                        className={`flex-1 h-9 rounded-lg font-label-md text-label-md flex items-center justify-center gap-1 transition-all ${
                          isSelected
                            ? "bg-primary text-on-primary"
                            : "bg-surface text-on-surface hover:bg-surface-container"
                        }`}
                      >
                        <span>View Details</span>
                        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          showToast(`Options menu for ${vendor.name}`);
                        }}
                        className="w-9 h-9 rounded-lg bg-surface flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
                      >
                        <span className="material-symbols-outlined text-[18px]">more_vert</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination / Loading state */}
          <div className="flex items-center justify-between p-space-md rounded-xl bg-surface-container-lowest shadow-xs text-on-surface-variant border border-outline-variant/10">
            <span className="font-caption text-caption font-medium">Showing {sortedVendors.length} of {totalVendors} verified partners</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled
                className="px-3 py-1 rounded bg-surface font-label-sm text-label-sm text-on-surface-variant hover:bg-surface-container transition-colors disabled:opacity-50"
              >
                Previous
              </button>
              <span className="font-label-sm text-label-sm text-primary font-bold">Page 1 of 1</span>
              <button
                type="button"
                className="px-3 py-1 rounded bg-surface font-label-sm text-label-sm text-primary hover:bg-surface-container transition-colors font-semibold"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT INSPECTION DOCKED DRAWER (5 of 12 cols = ~35-40%) */}
        {inspectedVendor && (
          <div className="xl:col-span-5 flex flex-col space-y-space-md sticky top-24">
            <div className="rounded-xl bg-surface-container-lowest shadow-md p-space-lg flex flex-col space-y-space-md border border-outline-variant/10">
              {/* Inspection Header */}
              <div className="flex items-start justify-between pb-space-sm border-b border-surface-container">
                <div className="flex items-center gap-space-sm">
                  <div className="w-14 h-14 rounded-lg bg-surface-container overflow-hidden shrink-0">
                    <img className="w-full h-full object-cover" src={inspectedVendor.image} alt={inspectedVendor.name} />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-caption text-caption font-bold">
                        Preferred Vendor
                      </span>
                      <span className="font-caption text-caption text-on-surface-variant">ID: #{inspectedVendor.id}</span>
                    </div>
                    <h2 className="font-headline-sm text-headline-sm text-primary font-bold mt-1">{inspectedVendor.name}</h2>
                    <span className="font-caption text-caption text-on-surface-variant flex items-center gap-1 mt-0.5">
                      <span className="material-symbols-outlined text-[14px]">location_on</span>
                      {inspectedVendor.location}
                    </span>
                  </div>
                </div>
              </div>

              {/* Rating & Association Badge Strip */}
              <div className="grid grid-cols-2 gap-space-sm p-space-sm rounded-lg bg-surface border border-outline-variant/10">
                <div className="flex flex-col">
                  <span className="font-caption text-caption text-on-surface-variant">Rating score</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="font-title-md text-title-md text-primary font-bold">{inspectedVendor.rating}</span>
                    <div className="flex text-secondary text-[16px]">
                      <span className="material-symbols-outlined text-[16px]">star</span>
                      <span className="material-symbols-outlined text-[16px]">star</span>
                      <span className="material-symbols-outlined text-[16px]">star</span>
                      <span className="material-symbols-outlined text-[16px]">star</span>
                      <span className="material-symbols-outlined text-[16px]">star_half</span>
                    </div>
                  </div>
                  <span className="font-caption text-caption text-on-surface-variant">{inspectedVendor.reviewCount} reviews</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-caption text-caption text-on-surface-variant">Associated Event</span>
                  <span className="font-body-md-medium text-body-md-medium text-primary mt-0.5 truncate">{inspectedVendor.event}</span>
                  <span className="font-caption text-caption text-secondary font-bold">Dec 15, 2026 (Day 2 of 3)</span>
                </div>
              </div>

              {/* Booking & Financial Progress Gauge */}
              <div className="p-space-sm rounded-lg bg-surface-container-low flex flex-col space-y-2 border border-outline-variant/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px] text-primary">check_circle</span>
                    <span className="font-label-md text-label-md text-primary font-bold">
                      {inspectedVendor.status.includes("Booked") ? "Contract Booked & Sealed" : "Quote Under Review"}
                    </span>
                  </div>
                  <span className="font-caption text-caption text-on-surface-variant">Signed 18 Oct 2026</span>
                </div>

                <div className="flex items-center justify-between text-caption font-caption mt-1">
                  <span className="text-on-surface-variant">
                    Paid: <strong className="text-primary">₹{(inspectedVendor.paidAmount || 0).toLocaleString("en-IN")}</strong> (Advance)
                  </span>
                  <span className="text-on-surface-variant">
                    Total: <strong className="text-primary">₹{inspectedVendor.cost.toLocaleString("en-IN")}</strong>
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden flex">
                  <div
                    className="h-full bg-primary"
                    style={{
                      width: `${Math.round(((inspectedVendor.paidAmount || 0) / (inspectedVendor.cost || 1)) * 100)}%`
                    }}
                  ></div>
                  <div
                    className="h-full bg-secondary-fixed"
                    style={{
                      width: `${100 - Math.round(((inspectedVendor.paidAmount || 0) / (inspectedVendor.cost || 1)) * 100)}%`
                    }}
                  ></div>
                </div>

                <div className="flex justify-between items-center text-[10px] text-on-surface-variant font-caption">
                  <span>Remaining balance: ₹{(inspectedVendor.cost - (inspectedVendor.paidAmount || 0)).toLocaleString("en-IN")}</span>
                  <span className="text-error font-semibold">Final due: 01 Dec 2026</span>
                </div>
              </div>

              {/* Primary Point of Contact */}
              <div className="flex flex-col space-y-1.5">
                <span className="font-caption text-caption uppercase text-on-surface-variant font-bold tracking-wider">
                  Primary Point of Contact
                </span>
                <div className="p-space-sm rounded-lg bg-surface flex items-center justify-between border border-outline-variant/10">
                  <div className="flex items-center gap-space-sm">
                    <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-title-md text-title-md">
                      <span className="font-label-md text-label-md text-secondary-fixed">
                        {inspectedVendor.contactName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-body-md-medium text-body-md-medium text-primary">{inspectedVendor.contactName}</span>
                      <span className="font-caption text-caption text-on-surface-variant">
                        {inspectedVendor.contactRole} • {inspectedVendor.contactPhone}
                      </span>
                    </div>
                  </div>
                  <a
                    href={`mailto:${inspectedVendor.contactEmail}`}
                    className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary transition-colors"
                    title="Email Contact"
                  >
                    <span className="material-symbols-outlined text-[18px]">mail</span>
                  </a>
                </div>
              </div>

              {/* Agreed Inclusions & Spaces */}
              <div className="flex flex-col space-y-2">
                <span className="font-caption text-caption uppercase text-on-surface-variant font-bold tracking-wider">
                  Agreed Inclusions & Spaces
                </span>
                <div className="space-y-1.5 text-body-md text-body-md text-on-surface">
                  {inspectedVendor.inclusions.map((inc, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-primary">check</span>
                      <span>{inc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Planora Copilot Advisory Card */}
              <div className="p-space-sm rounded-xl bg-tertiary-fixed text-on-tertiary-fixed flex flex-col space-y-1.5 relative overflow-hidden border border-outline-variant/10">
                <div className="flex items-center gap-1.5 font-label-md text-label-md font-bold">
                  <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                  <span>Planora Copilot Advisory</span>
                </div>
                <p className="font-body-md text-body-md text-on-tertiary-fixed">{inspectedVendor.advisoryText}</p>
              </div>

              {/* Internal Notes */}
              <div className="flex flex-col space-y-1">
                <span className="font-caption text-caption uppercase text-on-surface-variant font-bold tracking-wider">
                  Internal Planner Notes
                </span>
                <div className="p-3 rounded-lg bg-surface font-body-md text-body-md text-on-surface-variant border border-outline-variant/10">
                  {inspectedVendor.notes}
                </div>
              </div>

              {/* Bottom Action Bar for Inspection */}
              <div className="pt-space-sm flex items-center gap-space-sm border-t border-surface-container">
                <button
                  type="button"
                  onClick={() => showToast(`Calling ${inspectedVendor.contactName} at ${inspectedVendor.contactPhone}...`)}
                  className="flex-1 h-10 px-3 rounded-lg bg-surface hover:bg-surface-container text-on-surface font-label-md text-label-md flex items-center justify-center gap-1.5 transition-colors border border-outline-variant/10"
                >
                  <span className="material-symbols-outlined text-[18px]">phone</span>
                  <span>Contact Vendor</span>
                </button>
                <button
                  type="button"
                  onClick={() => showToast(`Opening signed contract file for ${inspectedVendor.name}`)}
                  className="flex-1 h-10 px-3 rounded-lg bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <span className="material-symbols-outlined text-[18px] text-secondary-fixed">assignment</span>
                  <span>Manage Contract</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add New Vendor Modal Dialog */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-container-lowest rounded-xl shadow-xl w-full max-w-2xl max-h-[92vh] overflow-y-auto p-space-xl flex flex-col space-y-space-lg relative border border-outline-variant/20">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-2 border-b border-surface-container">
              <div className="flex flex-col">
                <h3 className="font-headline-md text-headline-md text-primary font-bold">Add New Vendor</h3>
                <span className="font-body-md text-body-md text-on-surface-variant">
                  Add supplier or service provider details to your master event directory.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center text-on-surface-variant hover:bg-surface-container"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveVendor} className="space-y-space-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                <div className="flex flex-col gap-1">
                  <label className="font-label-md text-label-md text-primary font-semibold">Vendor / Business Name *</label>
                  <input
                    type="text"
                    required
                    value={newVendorName}
                    onChange={(e) => setNewVendorName(e.target.value)}
                    placeholder="e.g. Maharana Imperial Lights"
                    className="h-11 px-3 rounded-lg bg-surface text-body-md font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container border border-outline-variant/20"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-label-md text-label-md text-primary font-semibold">Service Category *</label>
                  <select
                    value={newVendorCategory}
                    onChange={(e) => setNewVendorCategory(e.target.value as DetailedVendor["category"])}
                    className="h-11 px-3 rounded-lg bg-surface text-body-md font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container border border-outline-variant/20"
                  >
                    <option value="Venue">Venue</option>
                    <option value="Catering">Catering</option>
                    <option value="Photography">Photography & Videography</option>
                    <option value="Decoration">Decoration & Florals</option>
                    <option value="Music & DJ">Music & Entertainment</option>
                    <option value="Logistics & AV">Logistics & Sound/AV</option>
                    <option value="Makeup & Styling">Hair, Makeup & Styling</option>
                    <option value="Other Services">Other Services</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                <div className="flex flex-col gap-1">
                  <label className="font-label-md text-label-md text-primary font-semibold">Primary Contact Name</label>
                  <input
                    type="text"
                    value={newContactName}
                    onChange={(e) => setNewContactName(e.target.value)}
                    placeholder="e.g. Vikramaditya Rathore"
                    className="h-11 px-3 rounded-lg bg-surface text-body-md font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container border border-outline-variant/20"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-label-md text-label-md text-primary font-semibold">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+91 98000 00000"
                    className="h-11 px-3 rounded-lg bg-surface text-body-md font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container border border-outline-variant/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                <div className="flex flex-col gap-1">
                  <label className="font-label-md text-label-md text-primary font-semibold">Email Address</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="contact@vendorbusiness.com"
                    className="h-11 px-3 rounded-lg bg-surface text-body-md font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container border border-outline-variant/20"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-label-md text-label-md text-primary font-semibold">City / Location</label>
                  <input
                    type="text"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    placeholder="e.g. Udaipur, Rajasthan"
                    className="h-11 px-3 rounded-lg bg-surface text-body-md font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container border border-outline-variant/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
                <div className="flex flex-col gap-1">
                  <label className="font-label-md text-label-md text-primary font-semibold">Estimated Price (₹)</label>
                  <input
                    type="number"
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="h-11 px-3 rounded-lg bg-surface text-body-md font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container border border-outline-variant/20"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-label-md text-label-md text-primary font-semibold">Associated Event</label>
                  <select
                    value={newEvent}
                    onChange={(e) => setNewEvent(e.target.value)}
                    className="h-11 px-3 rounded-lg bg-surface text-body-md font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container border border-outline-variant/20"
                  >
                    {events.length > 0 ? (
                      events.map((evt: { id: string; name: string }) => (
                        <option key={evt.id} value={evt.name}>
                          {evt.name}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="Aarav & Priya Wedding">Aarav & Priya Wedding</option>
                        <option value="TechFest 2026">TechFest 2026</option>
                        <option value="Birthday Celebration">Birthday Celebration</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-label-md text-label-md text-primary font-semibold">Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as DetailedVendor["status"])}
                    className="h-11 px-3 rounded-lg bg-surface text-body-md font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container border border-outline-variant/20"
                  >
                    <option value="Shortlisted">Shortlisted</option>
                    <option value="Booked">Booked</option>
                    <option value="Pending Contract">Pending Contract</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-label-md text-label-md text-primary font-semibold">Internal Notes & Scope Details</label>
                <textarea
                  rows={3}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Key deliverables, pricing notes, referral source or tasting schedule..."
                  className="p-3 rounded-lg bg-surface text-body-md font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container border border-outline-variant/20"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-space-sm pt-space-sm border-t border-surface-container">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="h-10 px-4 rounded-lg bg-surface hover:bg-surface-container text-on-surface font-label-md text-label-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 px-6 rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container transition-all shadow-xs"
                >
                  Save Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
