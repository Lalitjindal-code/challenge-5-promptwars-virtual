import { useState, useMemo } from "react";
import AppLayout from "../components/layout/AppLayout";
import { useEventContext } from "../context/EventContext";

interface ConceptItem {
  id: string;
  code: string;
  title: string;
  category: "Themes & Concepts" | "Decor & Ambience" | "Food & Menus" | "Activities & Show" | "Budget Hacks";
  badge?: string;
  badgeType?: "featured" | "value" | "standard";
  allocation: number;
  matchScore: number;
  image: string;
  alt: string;
  description: string;
  tags: string[];
  palette: { name: string; hex: string }[];
  deliverables: { icon: string; name: string; qty: string; checked: boolean }[];
  breakdown: { item: string; cost: number }[];
  saved: boolean;
}

const DEMO_CONCEPTS: ConceptItem[] = [
  {
    id: "concept-1",
    code: "#AI-902",
    title: "Royal Garden Evening",
    category: "Themes & Concepts",
    badge: "Featured Pick",
    badgeType: "featured",
    allocation: 35000,
    matchScore: 94,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD9cDF5vUUXP_IBZSUhr7aPe2JI6CaZWKxuLezD9Xp9BxSvjXJ1YXCLUgpHPMmv-9cCNoUMSSVSWYViQNYg5i0d1v_aN0jFqAAYEZJLb0C4Cv2P_nNWoJyW_PLQGrpfqyWsfDmF_L_kwFlsH5l_AZODgE_bhi0uPXgLw_Se4D1hZPu6wSvNBnaUHbQN0fKffxxWrY5J1eoQCCCel9fHGawU0lehojgEYP-FDxteCnFgz1pyKcoiAdbgDg",
    alt: "Outdoor wedding reception dinner setup in historic palace terrace in Udaipur at sunset",
    description: "Warm brass lantern pathways, ivory rajnigandha floral arches, layered foliage canopy, and antique low-cushion lounge seating.",
    tags: ["Heritage", "Outdoor", "Warm Amber", "High Impact"],
    palette: [
      { name: "Midnight", hex: "#020d24" },
      { name: "Gilded", hex: "#7c5816" },
      { name: "Lake Mist", hex: "#e8edff" },
      { name: "Slate", hex: "#3b4760" },
      { name: "Orchid", hex: "#260075" },
    ],
    deliverables: [
      { icon: "candle", name: "Brass Moroccan Floor Lanterns", qty: "40 units", checked: true },
      { icon: "local_florist", name: "Rajnigandha & Jasmine Arch", qty: "2 Main Arches", checked: true },
      { icon: "chair", name: "Low Diwan Lounge Seating", qty: "8 Ensembles", checked: false },
      { icon: "wb_twilight", name: "Fairy Canopy Lighting Grid", qty: "1,200 sq.ft", checked: false },
    ],
    breakdown: [
      { item: "Lighting & Rigging", cost: 18000 },
      { item: "Florals & Fragrance Station", cost: 11000 },
      { item: "Furniture & Diwan Rentals", cost: 6000 },
    ],
    saved: true,
  },
  {
    id: "concept-2",
    code: "#AI-408",
    title: "Modern Minimal Dinner",
    category: "Decor & Ambience",
    allocation: 22000,
    matchScore: 89,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAxvPSrf5c_80oC0yfbzSOHd_dsK0zZQ1jNoBGjEqbFI2z-L-muEehazjl2QKnYu3WS1_kKajbtaP9UcVMYLuwVVXMCtKgJ1ByzY8eesO0X1buXSvbiCEYNOh0AYjR0z7w0oUGP_pZvFOe3JZBxVcXk3dK6EeRFcInmpCGHs2ZRUwg8AwsYUMC9BQf93siWj8FxqLXiDRa1sG6o6zdl1KT2ycbfFho4UW2NTmMhO45RVBBAbJ2YguIjdQ",
    alt: "Intimate minimal luxury table setting with architectural brass candlesticks and flax linen",
    description: "Clean architectural tablescapes with sculpted brass candlesticks, taupe linen runners, and low floral clusters for unobstructed guest conversations.",
    tags: ["Minimal", "Sophisticated", "Budget-Savvy"],
    palette: [
      { name: "Ivory", hex: "#f9f9ff" },
      { name: "Raw Brass", hex: "#efbf73" },
      { name: "Taupe Linen", hex: "#c5c6ce" },
      { name: "Charcoal", hex: "#111b2e" },
    ],
    deliverables: [
      { icon: "table_restaurant", name: "Matte Linen Runners", qty: "14 Tables", checked: true },
      { icon: "candle", name: "Ribbed Glass Candlesticks", qty: "28 Sets", checked: false },
      { icon: "local_florist", name: "Micro Floral Vessels", qty: "42 Bud Vases", checked: true },
    ],
    breakdown: [
      { item: "Linens & Napery", cost: 9000 },
      { item: "Candleware & Glass", cost: 7500 },
      { item: "Organic Bud Florals", cost: 5500 },
    ],
    saved: true,
  },
  {
    id: "concept-3",
    code: "#AI-631",
    title: "Starlit Palace Canopy",
    category: "Decor & Ambience",
    allocation: 28000,
    matchScore: 91,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC3NPKsZBnzdxz0TIPVopESyM0iEFaFKWYmCmNEoYEx8Pyf4RDKkjqLwEwwq9I5bl2oueVmK_LCtovN0F71YHmDGZE6kL9qYsnrvqGflGHGPTGfUepZVo_qgy7vs1wzql5aK2-sV2NWEEFD3jxRlur6fHKmPF1IcT7pKT9Bv4vjoSxWPGTlV16U95WLvsBCg8SZziTxkexAtFJY5ABQuSxD6zRmdyUxieF2GdnD-x2-FNqeBjpF89Z12w",
    alt: "Magical night sky wedding reception courtyard with suspended micro-fairy lights",
    description: "Suspended micro-string matrix creating an artificial twilight galaxy over the dining perimeter with custom warm-toned filament dimming.",
    tags: ["Canopy Light", "Romantic", "Photo Magnet"],
    palette: [
      { name: "Midnight Navy", hex: "#0f003b" },
      { name: "Warm Gold", hex: "#ffdeae" },
      { name: "Silk White", hex: "#ffffff" },
      { name: "Shadow Blue", hex: "#273044" },
    ],
    deliverables: [
      { icon: "wb_twilight", name: "Micro-LED Suspended Net", qty: "1,500 sq.ft", checked: true },
      { icon: "draped", name: "Sheer Organza Floating Drapes", qty: "16 Panels", checked: false },
      { icon: "bolt", name: "DMX Wireless Dimmer Trusses", qty: "4 Towers", checked: true },
    ],
    breakdown: [
      { item: "Truss Rigging & Setup", cost: 14000 },
      { item: "Fairy Net Rental", cost: 9000 },
      { item: "Organza Drape Accents", cost: 5000 },
    ],
    saved: false,
  },
  {
    id: "concept-4",
    code: "#AI-119",
    title: "Artisanal Heritage Corner",
    category: "Activities & Show",
    badge: "Value Champion",
    badgeType: "value",
    allocation: 18000,
    matchScore: 86,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDB7EooLrQhMy6CMTIDNv8fAekW9UH2XFm2P2kuY_Van_HbmXK4d-vMk2XLwOPM4Jhxe_Cc-tBTn_djSHbQ-6dv4IG8rfBvoMZtnvpxbdT1aJfcRADpIEw50La_8JrMwN9-ENcMBGCzEcD-j25l7LMVNrtEMSkKG0rkmx9qp7pfr5HUXEW1ClMyC18fR29jUiJbK7hvDvCnSDFl20gsfLP5K1P3hz1uN9KQ_TdwvoIEuxyxWIe6kFLn1w",
    alt: "Traditional Indian artisan craft and live kulhad tea tasting station",
    description: "Interactive block printing demonstration, organic scent blending with local attar oils, and hot saffron kulhad chai carts.",
    tags: ["Interactive", "High Engagement", "Local Craft"],
    palette: [
      { name: "Terracotta", hex: "#7c5816" },
      { name: "Saffron", hex: "#efbf73" },
      { name: "Indigo", hex: "#17233b" },
      { name: "Sand", hex: "#d8e2fc" },
    ],
    deliverables: [
      { icon: "palette", name: "Live Artisan Block Print Cart", qty: "1 Artisan Booth", checked: true },
      { icon: "coffee", name: "Clay Kulhad Chai Station", qty: "200 Cups", checked: true },
      { icon: "spa", name: "Pure Scented Attar Bar", qty: "4 Scents", checked: false },
    ],
    breakdown: [
      { item: "Artisan Stipend & Materials", cost: 8500 },
      { item: "Chai Station & Ceramic Ware", cost: 5500 },
      { item: "Custom Attar Blends", cost: 4000 },
    ],
    saved: true,
  },
];

export default function AiIdeas() {
  const { activeEvent, isDemo } = useEventContext();

  const [promptText, setPromptText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("Themes & Concepts");
  const [sortBy, setSortBy] = useState<string>("Highest Feasibility");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeConceptId, setActiveConceptId] = useState<string>("concept-1");
  const [concepts, setConcepts] = useState<ConceptItem[]>(isDemo ? DEMO_CONCEPTS : []);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const activeConcept = useMemo(() => {
    return concepts.find((c) => c.id === activeConceptId) || concepts[0] || null;
  }, [concepts, activeConceptId]);

  const savedConcepts = useMemo(() => {
    return concepts.filter((c) => c.saved);
  }, [concepts]);

  const filteredConcepts = useMemo(() => {
    let list = [...concepts];
    if (selectedCategory && selectedCategory !== "All") {
      list = list.filter((c) => c.category === selectedCategory);
    }
    if (sortBy === "Cost (Low to High)") {
      list.sort((a, b) => a.allocation - b.allocation);
    } else if (sortBy === "Cost (High to Low)") {
      list.sort((a, b) => b.allocation - a.allocation);
    } else if (sortBy === "Most Popular" || sortBy === "Highest Feasibility") {
      list.sort((a, b) => b.matchScore - a.matchScore);
    }
    return list;
  }, [concepts, selectedCategory, sortBy]);

  const handleToggleSave = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setConcepts((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const newState = !c.saved;
          showToast(newState ? `Saved "${c.title}" to your idea board` : `Removed "${c.title}" from saved ideas`);
          return { ...c, saved: newState };
        }
        return c;
      })
    );
  };

  const handleToggleDeliverable = (conceptId: string, idx: number) => {
    setConcepts((prev) =>
      prev.map((c) => {
        if (c.id === conceptId) {
          const nextDeliverables = [...c.deliverables];
          nextDeliverables[idx] = {
            ...nextDeliverables[idx],
            checked: !nextDeliverables[idx].checked,
          };
          return { ...c, deliverables: nextDeliverables };
        }
        return c;
      })
    );
  };

  const handleGenerateIdeas = (customPrompt?: string) => {
    const textToUse = customPrompt || promptText;
    setIsGenerating(true);

    setTimeout(() => {
      setIsGenerating(false);
      const newConcept: ConceptItem = {
        id: `concept-${Date.now()}`,
        code: `#AI-${Math.floor(100 + Math.random() * 900)}`,
        title: textToUse ? textToUse.slice(0, 32) : "Lakeside Lantern Serenade",
        category: (selectedCategory as ConceptItem["category"]) || "Themes & Concepts",
        badge: "New AI Synthesis",
        badgeType: "featured",
        allocation: 32000,
        matchScore: 96,
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuD9cDF5vUUXP_IBZSUhr7aPe2JI6CaZWKxuLezD9Xp9BxSvjXJ1YXCLUgpHPMmv-9cCNoUMSSVSWYViQNYg5i0d1v_aN0jFqAAYEZJLb0C4Cv2P_nNWoJyW_PLQGrpfqyWsfDmF_L_kwFlsH5l_AZODgE_bhi0uPXgLw_Se4D1hZPu6wSvNBnaUHbQN0fKffxxWrY5J1eoQCCCel9fHGawU0lehojgEYP-FDxteCnFgz1pyKcoiAdbgDg",
        alt: "Generated Event Theme",
        description: textToUse || "Acoustic ambiance paired with handcrafted organic floral pergolas and delicate warm fairy light runners.",
        tags: ["AI Bespoke", "High Engagement", "Tailored"],
        palette: [
          { name: "Amber", hex: "#fecc80" },
          { name: "Obsidian", hex: "#17233b" },
          { name: "Blush", hex: "#f1f3ff" },
          { name: "Gold", hex: "#7c5816" },
        ],
        deliverables: [
          { icon: "candle", name: "Custom Brass Table Accent Torches", qty: "20 units", checked: false },
          { icon: "local_florist", name: "Layered Marigold & Jasmine Screen", qty: "1 Backdrop", checked: true },
          { icon: "music_note", name: "Acoustic Santoor Audio Setup", qty: "1 Set", checked: true },
        ],
        breakdown: [
          { item: "Decor Elements", cost: 16000 },
          { item: "Lighting & Accents", cost: 10000 },
          { item: "Floral Installations", cost: 6000 },
        ],
        saved: false,
      };

      setConcepts((prev) => [newConcept, ...prev]);
      setActiveConceptId(newConcept.id);
      showToast(`Synthesized new concept: "${newConcept.title}"`);
    }, 1200);
  };

  const handleAddToEventPlan = (title: string) => {
    showToast(`Added "${title}" directly to ${activeEvent?.name || "your active event plan"}!`);
  };

  return (
    <AppLayout
      title="AI Ideas Studio"
      subtitle="Turn your event vision into ideas worth remembering."
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-primary text-on-primary shadow-2xl animate-fade-in text-body-md border border-outline-variant/30">
          <span className="material-symbols-outlined text-secondary-fixed text-[20px]">check_circle</span>
          <span className="font-body-md-medium">{toastMessage}</span>
        </div>
      )}

      <div className="flex flex-col w-full pb-16">
        {/* Sub-header & Breadcrumb Navigation */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md mb-space-lg">
          <div className="flex items-center gap-space-sm text-body-md font-body-md text-on-surface-variant">
            <span className="font-label-md text-label-md tracking-wider uppercase text-on-surface-variant">AI IDEAS STUDIO</span>
            <span className="text-outline-variant font-label-md">/</span>
            <span className="font-body-md-medium text-body-md-medium text-primary">Concept Studio</span>
            <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
            <span className="font-caption text-caption text-secondary uppercase font-semibold">Active Session</span>
          </div>

          {/* Active Event Context Pill */}
          <div className="flex items-center gap-space-sm bg-surface-container-lowest px-4 py-2 rounded-xl shadow-sm border border-outline-variant/15">
            <div className="w-2.5 h-2.5 rounded-full bg-secondary-fixed-dim ring-4 ring-secondary-fixed/30"></div>
            <div className="flex items-center gap-2">
              <span className="font-headline-sm text-headline-sm text-primary text-[15px] leading-tight">
                {activeEvent?.name || "Aarav & Priya Wedding"}
              </span>
              <span className="font-body-md text-body-md text-on-surface-variant text-[13px] hidden sm:inline">
                • {activeEvent?.guestsCount || 180} Guests • ₹{(activeEvent?.budget || 150000).toLocaleString()} Budget • {activeEvent?.location || "Udaipur"}
              </span>
            </div>
            <button
              onClick={() => showToast("Event context configuration locked to active budget.")}
              className="ml-2 px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-label-sm text-label-sm transition-colors flex items-center gap-1"
              type="button"
            >
              <span className="material-symbols-outlined text-[15px]">tune</span>
              <span>Edit Context</span>
            </button>
          </div>
        </div>

        {/* Hero Prompt Composer Area & Event Context Bento */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg mb-space-xl">
          {/* Prompt Composer Module */}
          <div className="lg:col-span-8 bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-outline-variant/15 flex flex-col justify-between relative overflow-hidden">
            {/* AI Glow Accent */}
            <div className="absolute -top-24 -right-24 w-60 h-60 bg-tertiary-fixed/40 rounded-full blur-3xl pointer-events-none"></div>
            <div>
              <div className="flex items-center justify-between mb-space-sm">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-caption text-caption uppercase tracking-wider font-semibold">
                  <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                  <span>Your Creative Event Copilot</span>
                </div>
                <div className="flex items-center gap-space-xs text-on-surface-variant font-caption text-caption bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-0.5 rounded-full">
                  <span className="material-symbols-outlined text-[14px] text-amber-700">info</span>
                  <span>Curated Concept Simulation (Secure Backend Required for Live LLM)</span>
                </div>
              </div>
              <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight mb-2">
                Let’s imagine something extraordinary.
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mb-space-md">
                Brainstorm bespoke themes, decor schematics, culinary menus, entertainment, and budget-saving design synergies tailored to your venue and guest profile.
              </p>

              {/* Prompt Textarea */}
              <div className="relative rounded-xl bg-surface-container-low p-space-sm transition-all focus-within:bg-surface-container-lowest focus-within:shadow-md border border-outline-variant/20">
                <textarea
                  id="ai-prompt-input"
                  rows={3}
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  onKeyDown={(e) => {
                    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                      handleGenerateIdeas();
                    }
                  }}
                  className="w-full bg-transparent border-0 resize-none font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant focus:outline-none p-space-xs"
                  placeholder="Describe the event you have in mind... (e.g., A sunset rooftop wedding sangeet with warm fairy lights, marigold garlands, antique brass samovars, and acoustic Sufi fusion)"
                />
                <div className="flex flex-wrap items-center justify-between gap-space-sm pt-2">
                  <div className="flex items-center gap-space-xs">
                    <span className="font-caption text-caption text-on-surface-variant uppercase tracking-wider pl-1">Preset Sparks:</span>
                    <div className="flex flex-wrap gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          const text = "Royal garden sunset celebration with ivory rajnigandha, warm lanterns, and heritage sitar acoustic";
                          setPromptText(text);
                        }}
                        className="px-2 py-1 rounded-lg bg-surface-container-lowest hover:bg-surface-container-high text-on-surface-variant hover:text-primary font-label-sm text-label-sm transition-colors shadow-sm"
                      >
                        ✨ Royal Garden
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const text = "Understated Tuscan courtyard with low olive runners and soft amber candlesticks";
                          setPromptText(text);
                        }}
                        className="px-2 py-1 rounded-lg bg-surface-container-lowest hover:bg-surface-container-high text-on-surface-variant hover:text-primary font-label-sm text-label-sm transition-colors shadow-sm"
                      >
                        ✨ Candlelit Tuscan
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const text = "Modern Rajasthani fusion with artisanal kulhad counters and organic floral arches";
                          setPromptText(text);
                        }}
                        className="px-2 py-1 rounded-lg bg-surface-container-lowest hover:bg-surface-container-high text-on-surface-variant hover:text-primary font-label-sm text-label-sm transition-colors shadow-sm"
                      >
                        ✨ Modern Heritage
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-space-sm">
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-surface-container text-on-surface font-label-sm text-label-sm">
                      <span className="material-symbols-outlined text-[15px] text-tertiary">palette</span>
                      <span>Heritage Luxury</span>
                    </div>
                    <button
                      type="button"
                      disabled={isGenerating}
                      onClick={() => handleGenerateIdeas()}
                      className="px-space-md py-2.5 rounded-lg bg-primary-container text-on-primary font-label-md text-label-md flex items-center gap-2 hover:bg-primary active:translate-y-0.5 transition-all shadow-md disabled:opacity-50"
                    >
                      <span className={`material-symbols-outlined text-[17px] text-secondary-fixed ${isGenerating ? "animate-spin" : ""}`}>
                        {isGenerating ? "progress_activity" : "auto_awesome"}
                      </span>
                      <span>{isGenerating ? "Synthesizing..." : "Generate Ideas"}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-space-md mt-space-sm flex items-center justify-between text-on-surface-variant font-caption text-caption border-t border-outline-variant/10">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-secondary">verified</span>
                Calibrated against {activeEvent?.name || "Aarav & Priya"}’s ₹1,50,000 decor &amp; ambiance budget.
              </span>
              <span className="hidden sm:inline">
                Press <kbd className="px-1.5 py-0.5 rounded bg-surface-container font-mono text-[10px]">Cmd + Enter</kbd> to generate
              </span>
            </div>
          </div>

          {/* Active Constraints Card */}
          <div className="lg:col-span-4 bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-outline-variant/15 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-space-md">
                <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">Event Constraints</span>
                <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-caption text-caption font-semibold">Locked Context</span>
              </div>
              <div className="space-y-space-md">
                <div className="flex items-start gap-space-sm">
                  <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary mt-0.5">
                    <span className="material-symbols-outlined text-[18px]">celebration</span>
                  </div>
                  <div>
                    <div className="font-body-md-medium text-body-md-medium text-primary">Heritage Sangeet &amp; Reception</div>
                    <div className="font-caption text-caption text-on-surface-variant">Formal evening gathering with sit-down dinner</div>
                  </div>
                </div>

                <div className="flex items-start gap-space-sm">
                  <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-secondary mt-0.5">
                    <span className="material-symbols-outlined text-[18px]">location_on</span>
                  </div>
                  <div>
                    <div className="font-body-md-medium text-body-md-medium text-primary">Lake Pichola Palace Terraces</div>
                    <div className="font-caption text-caption text-on-surface-variant">Udaipur, Rajasthan • Open-air courtyard</div>
                  </div>
                </div>

                <div className="flex items-start gap-space-sm">
                  <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-tertiary mt-0.5">
                    <span className="material-symbols-outlined text-[18px]">payments</span>
                  </div>
                  <div className="w-full">
                    <div className="flex items-center justify-between">
                      <span className="font-body-md-medium text-body-md-medium text-primary">₹1,50,000 Total Decor Cap</span>
                      <span className="font-caption text-caption text-secondary font-semibold">₹1,15,000 Unallocated</span>
                    </div>
                    {/* Structural track */}
                    <div className="w-full h-2 rounded-full bg-surface-container mt-1.5 overflow-hidden flex">
                      <div className="bg-primary-container h-full" style={{ width: "23%" }}></div>
                      <div className="bg-secondary-fixed-dim h-full" style={{ width: "15%" }}></div>
                      <div className="bg-surface-variant h-full flex-1"></div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-space-sm">
                  <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-on-surface-variant mt-0.5">
                    <span className="material-symbols-outlined text-[18px]">group</span>
                  </div>
                  <div>
                    <div className="font-body-md-medium text-body-md-medium text-primary">180 Guests (14 VIP Tables)</div>
                    <div className="font-caption text-caption text-on-surface-variant">Requires 20ft central stage + walkway</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-space-md mt-space-sm">
              <button
                onClick={() => showToast("Venue constraints synchronizing with Udaipur catalog...")}
                className="w-full py-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-label-md text-label-md flex items-center justify-center gap-1.5 transition-colors"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">edit_note</span>
                <span>Refine Venue Constraints</span>
              </button>
            </div>
          </div>
        </div>

        {/* Generation Status Bar */}
        <div className="bg-surface-container-low px-space-lg py-3 rounded-xl mb-space-lg flex flex-wrap items-center justify-between gap-space-sm shadow-sm border border-outline-variant/15">
          <div className="flex items-center gap-space-sm font-body-md text-body-md">
            <div className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></div>
            <span className="font-body-md-medium text-body-md-medium text-primary">Generation Complete</span>
            <span className="text-on-surface-variant">
              • {concepts.length} concepts synthesized in 1.4s matching Lake Pichola parameters
            </span>
          </div>
          <div className="flex items-center gap-space-sm">
            <button
              onClick={() => {
                showToast("Re-rolling concepts with tighter budget parameters...");
                handleGenerateIdeas("Tighter budget compact courtyard with warm brass accents");
              }}
              className="text-on-surface-variant hover:text-primary font-label-sm text-label-sm flex items-center gap-1 transition-colors"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">refresh</span>
              <span>Re-roll with tighter budget</span>
            </button>
            <span className="text-outline-variant font-label-sm">|</span>
            <button
              onClick={() => showToast("Applied Planora smart savings: All concepts optimized for under ₹1.2L!")}
              className="text-tertiary hover:text-on-tertiary-fixed-variant font-label-sm text-label-sm flex items-center gap-1 font-semibold transition-colors"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">auto_fix_high</span>
              <span>Optimize All for ₹1.2L</span>
            </button>
          </div>
        </div>

        {/* Category Filter Strip & Sort */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md mb-space-lg">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { label: "Themes & Concepts", count: 12, icon: "deck" },
              { label: "Decor & Ambience", count: 18, icon: "lightbulb" },
              { label: "Food & Menus", count: 8, icon: "restaurant" },
              { label: "Activities & Show", count: 6, icon: "theater_comedy" },
              { label: "Budget Hacks", count: 5, icon: "savings" },
            ].map((cat) => {
              const isActive = selectedCategory === cat.label;
              return (
                <button
                  key={cat.label}
                  type="button"
                  onClick={() => setSelectedCategory(cat.label)}
                  className={`px-space-md py-2 rounded-xl font-label-md text-label-md whitespace-nowrap flex items-center gap-2 transition-all shadow-sm ${
                    isActive
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container-lowest hover:bg-surface-container text-on-surface-variant hover:text-primary border border-outline-variant/15"
                  }`}
                >
                  <span className={`material-symbols-outlined text-[17px] ${isActive ? "text-secondary-fixed" : ""}`}>
                    {cat.icon}
                  </span>
                  <span>
                    {cat.label} ({cat.count})
                  </span>
                </button>
              );
            })}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-space-sm self-end md:self-auto">
            <div className="flex items-center bg-surface-container-lowest p-1 rounded-lg shadow-sm border border-outline-variant/15">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-md ${viewMode === "grid" ? "bg-surface-container text-primary" : "text-on-surface-variant hover:text-primary"}`}
                title="Grid View"
              >
                <span className="material-symbols-outlined text-[18px]">grid_view</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-md ${viewMode === "list" ? "bg-surface-container text-primary" : "text-on-surface-variant hover:text-primary"}`}
                title="List View"
              >
                <span className="material-symbols-outlined text-[18px]">view_list</span>
              </button>
            </div>

            <div className="relative flex items-center">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-9 pl-3 pr-8 rounded-lg bg-surface-container-lowest text-label-sm font-label-sm text-primary appearance-none focus:outline-none shadow-sm cursor-pointer border border-outline-variant/15"
              >
                <option>Highest Feasibility</option>
                <option>Cost (Low to High)</option>
                <option>Cost (High to Low)</option>
                <option>Most Popular</option>
              </select>
              <span className="material-symbols-outlined absolute right-2 text-on-surface-variant text-[16px] pointer-events-none">
                expand_more
              </span>
            </div>
          </div>
        </div>

        {/* Main Content Grid with Side Drawer (Split Studio Layout) */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-start">
          {/* Gallery Grid (Left 7 Cols on XL, full width on smaller) */}
          <div className={`xl:col-span-7 ${viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-space-lg" : "flex flex-col gap-space-md"}`}>
            {filteredConcepts.map((item) => {
              const isSelected = activeConcept?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setActiveConceptId(item.id)}
                  className={`bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group cursor-pointer border ${
                    isSelected ? "ring-2 ring-primary border-primary shadow-md" : "border-outline-variant/15"
                  }`}
                >
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.alt}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent"></div>

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      {item.badge && (
                        <span
                          className={`px-2.5 py-1 rounded-full font-caption text-caption font-semibold uppercase tracking-wider shadow-sm ${
                            item.badgeType === "featured"
                              ? "bg-secondary text-on-secondary"
                              : item.badgeType === "value"
                              ? "bg-secondary-fixed text-on-secondary-fixed"
                              : "bg-tertiary-fixed text-on-tertiary-fixed"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-full bg-surface-container-lowest/90 backdrop-blur text-primary font-caption text-caption font-medium">
                        {item.category}
                      </span>
                    </div>

                    {/* Bookmark Button */}
                    <button
                      type="button"
                      onClick={(e) => handleToggleSave(item.id, e)}
                      title={item.saved ? "Saved" : "Bookmark"}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-surface-container-lowest/90 hover:bg-surface-container-lowest text-on-surface-variant hover:text-error flex items-center justify-center transition-transform active:scale-90 shadow-sm"
                    >
                      <span
                        className={`material-symbols-outlined text-[18px] ${item.saved ? "text-error" : ""}`}
                        style={{ fontVariationSettings: item.saved ? "'FILL' 1" : "'FILL' 0" }}
                      >
                        favorite
                      </span>
                    </button>

                    {/* Bottom Metadata overlay */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-on-primary">
                      <div>
                        <span className="font-caption text-caption text-secondary-fixed uppercase tracking-wider">
                          Estimated Allocation
                        </span>
                        <div className="font-headline-sm text-headline-sm leading-none">
                          ₹{item.allocation.toLocaleString()}
                        </div>
                      </div>
                      <div className="px-2 py-1 rounded-lg bg-surface-container-lowest/90 text-primary font-label-sm text-label-sm flex items-center gap-1 backdrop-blur shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        <span>{item.matchScore}% Match</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-space-md flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-title-md text-title-md text-primary">{item.title}</h3>
                        <span className="font-caption text-caption text-on-surface-variant">ID: {item.code}</span>
                      </div>
                      <p className="font-body-md text-body-md text-on-surface-variant mb-space-sm line-clamp-2">
                        {item.description}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mb-space-md">
                        {item.tags.map((t) => (
                          <span key={t} className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-space-xs">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveConceptId(item.id);
                        }}
                        className={`flex-1 py-2 rounded-lg font-label-md text-label-md flex items-center justify-center gap-1.5 transition-all ${
                          isSelected
                            ? "bg-primary text-on-primary"
                            : "bg-surface-container hover:bg-surface-container-high text-primary"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px]">visibility</span>
                        <span>{isSelected ? "Inspecting" : "Inspect Concept"}</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToEventPlan(item.title);
                        }}
                        title="Quick Add"
                        className="py-2 px-3 rounded-lg bg-primary-container text-on-primary font-label-md text-label-md flex items-center gap-1 hover:bg-primary transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">add_circle</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Inspector Side Panel / Drawer (Right 5 Cols on XL) */}
          {activeConcept && (
            <div className="xl:col-span-5 bg-surface-container-lowest rounded-xl p-space-lg shadow-md sticky top-24 border border-outline-variant/15">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-space-md mb-space-md border-b border-outline-variant/15">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-caption text-caption font-semibold uppercase tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                    <span>Inspecting Concept</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-800 font-caption text-caption font-medium">
                    {activeConcept.matchScore}% AI Match
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleToggleSave(activeConcept.id)}
                    className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
                    title={activeConcept.saved ? "Saved" : "Bookmark"}
                  >
                    <span
                      className={`material-symbols-outlined text-[20px] ${activeConcept.saved ? "text-error" : ""}`}
                      style={{ fontVariationSettings: activeConcept.saved ? "'FILL' 1" : "'FILL' 0" }}
                    >
                      favorite
                    </span>
                  </button>
                </div>
              </div>

              {/* Preview Image Card */}
              <div className="relative h-44 rounded-xl overflow-hidden mb-space-md shadow-sm">
                <img
                  src={activeConcept.image}
                  alt={activeConcept.alt}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-transparent to-transparent"></div>
                <div className="absolute bottom-3 left-3 text-on-primary">
                  <h2 className="font-headline-sm text-headline-sm leading-tight">{activeConcept.title}</h2>
                  <p className="font-caption text-caption text-secondary-fixed">
                    Lake Pichola Terrace Adaptation • Concept {activeConcept.code}
                  </p>
                </div>
              </div>

              {/* Concept Overview Narrative */}
              <div className="mb-space-md">
                <span className="font-label-md text-label-md text-primary block mb-1">Architectural Concept</span>
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  Capitalizes on Udaipur’s dusk atmosphere. Replaces heavy metal trusses with organic wooden pergolas wrapped in ivory rajnigandha garlands and ambient 2200K filament lanterns, cutting setup labor while amplifying heritage romance.
                </p>
              </div>

              {/* Color Palette Harmony */}
              <div className="mb-space-md p-space-sm rounded-xl bg-surface-container-low border border-outline-variant/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-label-sm text-label-sm text-primary uppercase tracking-wider font-semibold">
                    Recommended Palette
                  </span>
                  <span className="font-caption text-caption text-on-surface-variant">
                    {activeConcept.palette.length} Harmonized Tones
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {activeConcept.palette.map((p) => (
                    <div key={p.name} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full h-7 rounded-lg shadow-sm" style={{ backgroundColor: p.hex }}></div>
                      <span className="font-caption text-caption text-[10px] text-on-surface-variant truncate">
                        {p.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Decor & Material Inventory (Checklist) */}
              <div className="mb-space-md">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-label-md text-label-md text-primary">Key Decor Deliverables</span>
                  <span className="font-caption text-caption text-secondary font-semibold">
                    {activeConcept.deliverables.filter((d) => d.checked).length} of {activeConcept.deliverables.length} Completed
                  </span>
                </div>
                <div className="space-y-1.5">
                  {activeConcept.deliverables.map((del, idx) => (
                    <div
                      key={del.name}
                      onClick={() => handleToggleDeliverable(activeConcept.id, idx)}
                      className="flex items-center justify-between p-2 rounded-lg bg-surface-container-lowest hover:bg-surface-container-low transition-colors shadow-sm cursor-pointer border border-outline-variant/10"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`material-symbols-outlined text-[18px] ${
                            del.checked ? "text-primary font-bold" : "text-outline-variant"
                          }`}
                        >
                          {del.checked ? "check_box" : "check_box_outline_blank"}
                        </span>
                        <span className={`font-body-md text-body-md ${del.checked ? "line-through text-on-surface-variant" : "text-primary"}`}>
                          {del.name}
                        </span>
                      </div>
                      <span className="font-caption text-caption text-on-surface-variant">{del.qty}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Budget Breakdown Card */}
              <div className="p-space-md rounded-xl bg-surface-container mb-space-md border border-outline-variant/15">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-label-md text-label-md text-primary">Cost Allocation Breakdown</span>
                  <span className="px-2 py-0.5 rounded bg-surface-container-lowest text-secondary font-label-sm text-label-sm font-semibold">
                    Saved ₹12k vs standard
                  </span>
                </div>
                <div className="space-y-1 font-body-md text-body-md text-on-surface-variant">
                  {activeConcept.breakdown.map((row) => (
                    <div key={row.item} className="flex justify-between">
                      <span>{row.item}</span>
                      <span className="text-primary font-body-md-medium">₹{row.cost.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="h-[1px] bg-outline-variant/30 my-1.5"></div>
                  <div className="flex justify-between items-center text-primary font-headline-sm text-headline-sm">
                    <span className="text-[16px]">Total Estimated Decor</span>
                    <span>₹{activeConcept.allocation.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Action Button Group */}
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => handleAddToEventPlan(activeConcept.title)}
                  className="w-full py-3 rounded-lg bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md flex items-center justify-center gap-2 active:translate-y-0.5 transition-all shadow-md"
                >
                  <span className="material-symbols-outlined text-[18px] text-secondary-fixed">bookmark_add</span>
                  <span>Add to Event Execution Plan</span>
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      showToast(`Generating aesthetic variations for "${activeConcept.title}"...`);
                      handleGenerateIdeas(`Variation on ${activeConcept.title} with enhanced lighting`);
                    }}
                    className="flex-1 py-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-tertiary font-label-md text-label-md flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">auto_fix_high</span>
                    <span>Generate Variations</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => showToast(`Exporting high-res design deck for ${activeConcept.title}...`)}
                    title="Export PDF"
                    className="py-2.5 px-3 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-label-md text-label-md flex items-center gap-1 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">download</span>
                    <span className="hidden sm:inline">Export Deck</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Drawer: Saved Ideas Collection */}
        <div className="mt-space-xl p-space-lg rounded-xl bg-surface-container-lowest shadow-sm border border-outline-variant/15">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm mb-space-md">
            <div className="flex items-center gap-space-sm">
              <div className="w-7 h-7 rounded-lg bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed">
                <span className="material-symbols-outlined text-[16px]">collections_bookmark</span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-primary">
                Saved Ideas Collection ({savedConcepts.length} Saved)
              </h3>
              <span className="font-caption text-caption text-on-surface-variant hidden md:inline">
                • {activeEvent?.name || "Aarav & Priya Wedding"} Board
              </span>
            </div>
            <button
              onClick={() => showToast("Opening full moodboard and canvas...")}
              className="text-tertiary hover:underline font-label-md text-label-md flex items-center gap-1 self-start sm:self-auto"
              type="button"
            >
              <span>View Full Moodboard</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>

          {savedConcepts.length === 0 ? (
            <div className="p-8 text-center bg-surface-container-low rounded-xl">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant/40 mb-2">favorite_border</span>
              <p className="text-body-md text-on-surface-variant">No saved concepts yet. Click the heart icon on any concept card to save it here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-space-md">
              {savedConcepts.map((saved) => (
                <div
                  key={saved.id}
                  onClick={() => setActiveConceptId(saved.id)}
                  className="flex items-center gap-space-sm p-2 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer group border border-outline-variant/10"
                >
                  <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0">
                    <img
                      src={saved.image}
                      alt={saved.alt}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-caption text-caption text-secondary font-semibold uppercase">
                      {saved.badge || saved.category}
                    </span>
                    <div className="font-body-md-medium text-body-md-medium text-primary truncate">
                      {saved.title}
                    </div>
                    <span className="font-caption text-caption text-on-surface-variant">
                      ₹{saved.allocation.toLocaleString()} • {saved.matchScore}% Match
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-primary text-[18px] mr-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    chevron_right
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
