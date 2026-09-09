// The entire public site is rendered from this object.
// The admin CMS edits a copy of it in localStorage; nothing else is hard-coded.
// Bump CONTENT_VERSION when the shape changes so old saved copies are re-seeded.

export const CONTENT_VERSION = 5;

export const FONT_PRESETS = {
  modern: { label: "Modern — DM Sans / Manrope", body: '"DM Sans", system-ui, Arial, sans-serif', head: '"Manrope", system-ui, sans-serif' },
  neutral: { label: "Neutral — Inter", body: '"Inter", system-ui, Arial, sans-serif', head: '"Inter", system-ui, sans-serif' },
  system: { label: "System UI", body: 'system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif', head: 'system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif' },
};

export const DEFAULT_CONTENT = {
  version: CONTENT_VERSION,

  theme: {
    fontPreset: "modern",
    navy: "#123c70",
    red: "#e62f37",
    ink: "#192b45",
    muted: "#6c7b8e",
    line: "#e4eaf1",
    soft: "#f5f8fb",
    pageBg: "#ffffff",
    heroTint: "#f4f8fc",
    bandBg: "#123c70",
    bandInk: "#ffffff",
    footerBg: "#0e2d54",
    footerInk: "#aebfd3",
    radius: 2,
  },

  identity: {
    name: "K2V ENTERPRISE",
    logoText: "K2V",
    logoImage: "",
    sub: "INDUSTRIAL & OFFICE SUPPLY",
    topBarLeft: "Welcome to K2V ENTERPRISE",
    topBarRight: "Your one-stop solution for industrial materials, equipment, office furniture & stationery",
  },

  nav: {
    cta: { label: "Request a quote", href: "#contact" },
    items: [
      { id: "n1", label: "Home", href: "#/", show: true },
      { id: "n2", label: "About", href: "#about", show: true },
      { id: "n3", label: "Products", href: "#/products", show: true },
      { id: "n4", label: "Services", href: "#services", show: true },
      { id: "n5", label: "Contact", href: "#contact", show: true },
    ],
  },

  hero: {
    eyebrow: "Industrial materials · Office supply · Kulim & Penang",
    title: "Everything the floor and the office",
    titleEm: "run on.",
    body: "K2V ENTERPRISE supplies packaging materials, industrial tapes, safety and cleanroom wear, office furniture and stationery to manufacturers, schools and offices across Kulim and Penang — one supplier, one purchase order.",
    primary: { label: "Browse products", href: "#/products" },
    secondary: { label: "About K2V", href: "#about" },
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1000&q=85",
    badgeValue: "9",
    badgeText: "supply lines, one account",
  },

  trust: {
    items: [
      { id: "t1", value: "9", label: "Supply categories" },
      { id: "t2", value: "2", label: "States served — Kulim & Penang" },
      { id: "t3", value: "1", label: "Consolidated invoice" },
      { id: "t4", value: "Gov + Private", label: "Sectors supplied" },
    ],
  },

  about: {
    eyebrow: "About K2V ENTERPRISE",
    title: "One supplier for the whole floor — and the office",
    paragraphs: [
      "K2V ENTERPRISE offers a wide range of products, mainly for industrial materials supply — production materials, equipment, furniture and stationery. Headquartered in Kulim, we serve customers across Kulim and Penang, supplying educational institutions and industrial companies in both the private and government sectors.",
      "Our vision: to deliver outstanding service and premium products to our customers with the best quality.",
      "Our mission: we pledge to satisfy our customers with our products and services, and to work together with our business partners, suppliers and others to our common advantage.",
    ],
    image: "https://images.unsplash.com/photo-1565610222536-ef125c59da2e?auto=format&fit=crop&w=900&q=85",
    cta: { label: "Talk to us", href: "#contact" },
  },

  supply: {
    eyebrow: "What we supply",
    title: "Nine supply lines, one account",
    link: { label: "See full catalogue", href: "#/products" },
    featuredCount: 4,
  },

  services: {
    eyebrow: "How we work",
    title: "Supply is the product. These come with it.",
    intro: "We consolidate a list spread across several suppliers into one point of contact, one delivery and one invoice.",
    items: [
      { id: "s1", num: "01", title: "Consolidated procurement", body: "One purchase order across all nine categories, on a single delivery schedule." },
      { id: "s2", num: "02", title: "Cut-to-size packaging", body: "Bubble wrap, PE foam and film cut to your carton or pallet size to cut waste." },
      { id: "s3", num: "03", title: "Stock holding", body: "Fast-moving consumables held locally so a Friday shortage does not stop a Monday shipment." },
      { id: "s4", num: "04", title: "Spec matching", body: "Send the item you are replacing; we return an equivalent with the data sheet." },
    ],
  },

  sectors: {
    eyebrow: "Who we supply",
    title: "Trusted across sectors",
    items: ["MANUFACTURING", "ELECTRONICS", "SCHOOLS", "GOVERNMENT", "OFFICES"],
  },

  contact: {
    eyebrow: "Contact",
    title: "Send us your list. We will price it.",
    body: "Email a bill of materials, a photo of the packaging you are replacing, or just a part number.",
    email: "k2venterprise@gmail.com",
    phone: "To be confirmed by client",
    address: "Kulim, Kedah — serving Kulim & Penang (full address to be confirmed)",
    regNo: "Company registration no. to be confirmed",
    hours: "Mon–Fri 9:00–18:00 · Sat 9:00–13:00",
    cta: { label: "Email K2V ENTERPRISE", href: "mailto:k2venterprise@gmail.com" },
  },

  catalogue: {
    eyebrow: "What we supply",
    title: "Product catalogue",
    intro: "Browse our supply lines and contact K2V ENTERPRISE for specifications, pack sizes, lead times and wholesale pricing.",
    cta: { label: "Make an enquiry", href: "#contact" },
  },

  footer: {
    blurb: "Industrial materials, packaging, safety equipment, office furniture and stationery — sourced, stocked and delivered across Kulim and Penang.",
    columns: [
      { id: "f1", heading: "Quick links", links: [
        { id: "fl1", label: "About us", href: "#about" },
        { id: "fl2", label: "Products", href: "#/products" },
        { id: "fl3", label: "Services", href: "#services" },
        { id: "fl4", label: "Contact", href: "#contact" },
      ] },
      { id: "f2", heading: "Contact", links: [
        { id: "fl5", label: "k2venterprise@gmail.com", href: "mailto:k2venterprise@gmail.com" },
        { id: "fl6", label: "Request a quote", href: "#contact" },
      ] },
    ],
    legal: "© 2026 K2V ENTERPRISE",
    note: "All rights reserved",
  },

  categories: [
    { id: "c1", name: "Bubble Wrap", slug: "bubble-wrap", blurb: "Single and double layer protective wrap in sheet and roll form.", image: "", published: true },
    { id: "c2", name: "Stretch Film", slug: "stretch-film", blurb: "Hand and machine grade pallet wrap, clear and black.", image: "", published: true },
    { id: "c3", name: "Industrial Tapes", slug: "industrial-tapes", blurb: "Kapton polyimide and green PET masking tape for high-temperature work.", image: "", published: true },
    { id: "c4", name: "Safety Equipment", slug: "safety-equipment", blurb: "PPE, safety footwear, gloves and anti-static cleanroom wear.", image: "", published: true },
    { id: "c5", name: "PE Foam", slug: "pe-foam", blurb: "Closed-cell foam sheet, roll and profile for surface protection.", image: "", published: true },
    { id: "c6", name: "White Board", slug: "white-board", blurb: "Aluminium-framed magnetic whiteboards with pen tray and mounting kit.", image: "", published: true },
    { id: "c7", name: "Office Furniture", slug: "office-furniture", blurb: "Workstations, seating, storage and meeting tables.", image: "", published: true },
    { id: "c8", name: "Office Stationery", slug: "office-stationery", blurb: "Paper, filing, writing and everyday desk supplies.", image: "", published: true },
    { id: "c9", name: "Hand Wash & Soap", slug: "hand-wash-soap", blurb: "Anti-bacterial hand soap, sanitiser, dispensers and washroom consumables.", image: "", published: true },
  ],

  products: [
    { id: "p1", name: "Bubble Wrap Roll 1000mm", sku: "K2V-BW-1000", categoryId: "c1", summary: "Single-layer 10mm bubble, 1000mm x 100m clear roll for general packing.", image: "", published: true },
    { id: "p2", name: "Double Layer Bubble Wrap 500mm", sku: "K2V-BW-500D", categoryId: "c1", summary: "Two-ply wrap for heavier or sharp-edged items, 500mm x 100m.", image: "", published: true },
    { id: "p3", name: "Hand Stretch Film 500mm", sku: "K2V-SF-500", categoryId: "c2", summary: "23 micron clear pallet wrap, 500mm x 2.0kg net, hand grade.", image: "", published: true },
    { id: "p4", name: "Machine Stretch Film 17mic", sku: "K2V-SF-MC17", categoryId: "c2", summary: "17 micron machine grade film for automatic pallet wrappers.", image: "", published: true },
    { id: "p5", name: "Kapton Polyimide Tape 25mm", sku: "K2V-KT-025", categoryId: "c3", summary: "Amber polyimide tape with silicone adhesive for reflow and wave solder masking.", image: "", published: true },
    { id: "p6", name: "Green PET Masking Tape 18mm", sku: "K2V-KT-GP18", categoryId: "c3", summary: "Polyester masking tape for powder coating and plating line masking.", image: "", published: true },
    { id: "p7", name: "Safety Shoe — Steel Toe", sku: "K2V-SE-SB4", categoryId: "c4", summary: "Low-cut steel toe cap safety shoe, oil resistant sole, sizes 5–12.", image: "", published: true },
    { id: "p8", name: "Nitrile Gloves — Powder Free", sku: "K2V-SE-GLN", categoryId: "c4", summary: "Blue nitrile examination gloves, 100 pieces per box.", image: "", published: true },
    { id: "p9", name: "Cleanroom Jumpsuit", sku: "K2V-SE-JS1", categoryId: "c4", summary: "Anti-static polyester jumpsuit with hood, reusable, for controlled areas.", image: "", published: true },
    { id: "p10", name: "PE Foam Sheet 2mm", sku: "K2V-PF-2MM", categoryId: "c5", summary: "Closed-cell foam sheet for scratch-sensitive surfaces.", image: "", published: true },
    { id: "p11", name: "Magnetic White Board 4' x 3'", sku: "K2V-OF-WB12", categoryId: "c6", summary: "Aluminium frame magnetic whiteboard with pen tray, wall mounted.", image: "", published: true },
    { id: "p12", name: "Office Workstation Desk", sku: "K2V-OF-DSK1", categoryId: "c7", summary: "1200mm melamine desk with metal leg frame and cable tray.", image: "", published: true },
    { id: "p13", name: "A4 Copier Paper 80gsm", sku: "K2V-OS-A4C", categoryId: "c8", summary: "80gsm multipurpose A4, 500 sheets per ream, 5 reams per box.", image: "", published: true },
    { id: "p14", name: "Hand Wash Refill 5L", sku: "K2V-HY-HW5", categoryId: "c9", summary: "Anti-bacterial liquid hand soap, 5 litre refill container.", image: "", published: true },
  ],
};
