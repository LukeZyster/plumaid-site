/**
 * Single source of truth for business details and page copy.
 * Edit this file to change text across the whole site.
 */
export const site = {
  name: "PlumAid",
  fullName: "PlumAid Plumbing Solutions",
  tagline: "Fast • Reliable • Professional",
  description:
    "PlumAid Plumbing Solutions: PIRB registered plumber serving Wellington, Paarl & surrounds. Leaks, geysers, pipe repairs and installations. Book online in minutes.",
  phoneDisplay: "082 866 3988",
  phoneTel: "+27828663988",
  whatsapp: "27828663988",
  email: "plumaidwlt@gmail.com",
  areas: ["Wellington", "Paarl", "Surrounding areas"],
  areaLine: "Wellington • Paarl & Surrounds",
  pirb: true,
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
};

export const whatsappLink = (text = "Hi PlumAid, I need a plumber.") =>
  `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`;

export const serviceCards = [
  {
    key: "repairs",
    title: "Plumbing Maintenance & Repairs",
    blurb: "Leaks, dripping taps, faulty valves and general repairs.",
    slug: "maintenance-repairs",
  },
  {
    key: "geyser",
    title: "Geysers & Water Systems",
    blurb: "Geyser-related plumbing and water supply problems.",
    slug: "geysers-water-systems",
  },
  {
    key: "pipe",
    title: "Pipe Repairs & Replacements",
    blurb: "Copper piping, fittings and general installations.",
    slug: "pipe-repairs-replacements",
  },
  {
    key: "home",
    title: "Residential & Small Commercial",
    blurb: "Quality workmanship you can trust, at home or at your business.",
    slug: "general-assessment",
  },
] as const;

export const nav = [
  { href: "/", label: "Home" },
  { href: "/appointments#book", label: "Book a plumber" },
  { href: "/reviews", label: "Reviews" },
  { href: "/history", label: "Our Story" },
  { href: "/mission", label: "Mission" },
];
