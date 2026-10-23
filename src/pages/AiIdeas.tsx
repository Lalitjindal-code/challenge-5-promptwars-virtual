import { useState } from "react";
import AppLayout from "../components/layout/AppLayout";
import { useEventContext } from "../context/EventContext";

export default function AiIdeas() {
  const { activeEvent } = useEventContext();

  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const initialConcepts = [
    {
      id: "c-1",
      title: "Royal Amber Glow & Ivory Lotus Mandap",
      category: "Theme & Decor",
      desc: "Cascading brass diya chandeliers suspended under an ivory silk canopy with marigold garlands and scented water basins.",
      budgetEst: "₹3,50,000",
      colors: ["#D6A85F", "#17233B", "#FFFFFF", "#9075fa"],
      rating: "98% Match",
    },
    {
      id: "c-2",
      title: "Moonlit Lake Pichola Acoustic Lounge",
      category: "Entertainment",
      desc: "Low velvet seating ottomans with Moroccan brass lantern runners, candlelit mirror trays, and live Sufi santoor music.",
      budgetEst: "₹1,80,000",
      colors: ["#17233b", "#fecc80", "#273044"],
      rating: "94% Match",
    },
    {
      id: "c-3",
      title: "Artisanal Royal Mewari Degustation Bar",
      category: "Catering Concept",
      desc: "Live slow-cooked signature dal baati counters, organic floral iced mocktails served in etched earthen kulhads.",
      budgetEst: "₹4,20,000",
      colors: ["#7c5816", "#ffdeae", "#d8e2fc"],
      rating: "91% Match",
    },
  ];

  const [concepts, setConcepts] = useState(initialConcepts);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setConcepts((prev) => [
        {
          id: "c-" + Date.now(),
          title: prompt ? `Bespoke: ${prompt}` : "Bespoke Royal Sunset Panorama",
          category: "Custom AI Concept",
          desc: "Tailored spatial layout balancing open-air courtyard architecture with warm golden fairy light pergolas.",
          budgetEst: "₹2,75,000",
          colors: ["#D6A85F", "#17233B", "#7357DB"],
          rating: "99% Match",
        },
        ...prev,
      ]);
      setPrompt("");
    }, 800);
  };

  return (
    <AppLayout title="AI Ideas Studio" subtitle="Generate themes, aesthetic moodboards and tailored concepts.">
      {/* 1. Generator Hero Bar */}
      <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-outline-variant/15 flex flex-col gap-space-md">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary text-[24px]">psychology</span>
          <div>
            <h2 className="font-heading font-bold text-lg text-primary">AI Theme & Aesthetic Generator</h2>
            <p className="text-xs text-on-surface-variant">
              Calibrated for <strong>{activeEvent?.name || "Active Event"}</strong> • Budget: ₹{(activeEvent?.budget || 1500000).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 mt-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe an aesthetic, e.g. Candlelit Tuscan courtyard with ambient jazz & amber fairy lights..."
            className="flex-1 h-11 px-4 rounded-xl bg-surface-container-low border border-outline-variant/30 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="h-11 px-space-lg rounded-xl bg-primary text-on-primary text-xs font-bold flex items-center justify-center gap-2 hover:bg-primary-container shadow-md transition-all shrink-0"
          >
            <span className="material-symbols-outlined text-secondary-fixed text-[18px]">
              {isGenerating ? "sync" : "auto_awesome"}
            </span>
            <span>{isGenerating ? "Synthesizing..." : "Generate AI Concepts"}</span>
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-[11px] font-semibold text-on-surface-variant">Inspirations:</span>
          {[
            "✨ Floating Lotus Mandap",
            "✨ Candlelit Tuscan Courtyard",
            "✨ Modern Rajasthani Heritage",
            "✨ Velvet Twilight Cocktail Lounge"
          ].map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => setPrompt(chip.replace("✨ ", ""))}
              className="px-2.5 py-1 rounded-lg bg-surface-container-low hover:bg-surface-container text-xs text-on-surface font-medium transition-colors"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Generated Concepts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-lg">
        {concepts.map((concept) => (
          <div
            key={concept.id}
            className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-outline-variant/15 hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start gap-2 mb-2">
                <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-[10px] font-bold uppercase tracking-wider">
                  {concept.category}
                </span>
                <span className="text-xs font-bold text-secondary flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">verified</span>
                  {concept.rating}
                </span>
              </div>

              <h3 className="font-heading font-bold text-base text-primary mb-2">{concept.title}</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed mb-4">{concept.desc}</p>

              {/* Color Swatches */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] uppercase font-bold text-on-surface-variant">Palette:</span>
                <div className="flex gap-1.5">
                  {concept.colors.map((c, i) => (
                    <div key={i} className="w-5 h-5 rounded-full border border-black/10 shadow-sm" style={{ backgroundColor: c }}></div>
                  ))}
                </div>
              </div>

              <div className="bg-surface-container-low p-2.5 rounded-lg flex items-center justify-between text-xs">
                <span className="text-on-surface-variant">Projected Cost:</span>
                <span className="font-heading font-bold text-primary">{concept.budgetEst}</span>
              </div>
            </div>

            <div className="pt-space-md mt-space-md border-t border-outline-variant/10 flex items-center justify-between">
              <button
                type="button"
                className="h-8 px-3 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container"
              >
                Apply to Event
              </button>
              <button
                type="button"
                className="w-8 h-8 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container flex items-center justify-center"
                title="Bookmark"
              >
                <span className="material-symbols-outlined text-[18px]">bookmark</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </AppLayout>
  );
}
