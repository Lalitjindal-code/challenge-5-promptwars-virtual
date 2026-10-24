import type { ConceptItem } from "../types";

export const DEMO_CONCEPTS: ConceptItem[] = [
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
    timelineSuggestions: [
      "Order custom brass floor lanterns 6 weeks prior to secure rental inventory",
      "Confirm fresh rajnigandha stem procurement with local flower mandi 3 days prior",
      "Conduct electrical load testing for the 1,200 sq.ft fairy canopy 24h prior"
    ],
    vendorRecommendations: [
      "Heritage Lighting Specialist experienced in open-terrace voltage regulation",
      "Traditional Florist guild skilled in fragrant marigold and rajnigandha netting"
    ],
    guestExperienceNotes: "Guests step through an aromatic floral walkway illuminated by warm lanterns, setting an intimate heritage mood before entering the courtyard.",
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
    timelineSuggestions: [
      "Reserve pure flax taupe linen runners 4 weeks prior",
      "Review candlestick height against guest eye-level at sample table tasting 2 weeks prior"
    ],
    vendorRecommendations: [
      "Specialty Linen & Tableware Rental atelier",
      "Modern Botanical florist specializing in minimalist single-stem arrangements"
    ],
    guestExperienceNotes: "Uncluttered tablescapes allow seamless sightlines across tables, fostering intimate discussions over curated candlelight.",
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
    timelineSuggestions: [
      "Rig structural truss towers 24h in advance of guest arrival",
      "Program wireless DMX dimming presets for dusk, dinner, and late-night transitions"
    ],
    vendorRecommendations: [
      "Certified Rigging and Event Production engineering firm",
      "Stage lighting designer proficient in DMX ambient programming"
    ],
    guestExperienceNotes: "A magical twilight canopy above gives guests the sensation of open-air dining under a canopy of stars.",
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
    timelineSuggestions: [
      "Select and book certified traditional block-print craft master 3 weeks prior",
      "Source handmade terracotta kulhad mugs from local pottery collective 2 weeks prior"
    ],
    vendorRecommendations: [
      "Local Artisan Guild / Heritage crafts coordinator",
      "Artisanal Tea and Refreshment Sommelier"
    ],
    guestExperienceNotes: "Guests can hand-print their own keepsake silk scarves and savor saffron kulhad chai, leaving with personalized memorabilia.",
    saved: true,
  },
];
