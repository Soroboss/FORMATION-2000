import {
  Briefcase,
  Camera,
  Clapperboard,
  Code2,
  FileSpreadsheet,
  Globe,
  GraduationCap,
  Megaphone,
  Palette,
  Sparkles,
  Wallet,
  type LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  sparkles: Sparkles,
  globe: Globe,
  megaphone: Megaphone,
  code: Code2,
  palette: Palette,
  briefcase: Briefcase,
  graduation: GraduationCap,
  clapperboard: Clapperboard,
  "file-spreadsheet": FileSpreadsheet,
  camera: Camera,
  wallet: Wallet,
};

/** Emojis d’affichage (catalogue public) par slug. */
export const CATEGORY_EMOJI: Record<string, string> = {
  "intelligence-artificielle": "🤖",
  "entrepreneuriat-business": "💼",
  "marketing-digital": "📈",
  "developpement-web": "💻",
  "creation-de-sites": "💻",
  "design-graphique": "🎨",
  "creation-contenu-video": "🎬",
  bureautique: "📊",
  "photographie-video": "📷",
  "finance-comptabilite": "💰",
  "developpement-personnel": "🌍",
};

/** Mappe le champ `icon` DB (ou le slug) vers une icône Lucide. */
export function resolveCategoryIcon(iconOrSlug: string | null | undefined): LucideIcon {
  if (iconOrSlug && ICON_MAP[iconOrSlug]) {
    return ICON_MAP[iconOrSlug];
  }
  const slug = (iconOrSlug ?? "").toLowerCase();
  if (slug.includes("ia") || slug.includes("artificielle") || slug.includes("ai")) {
    return Sparkles;
  }
  if (slug.includes("personnel")) {
    return GraduationCap;
  }
  if (slug.includes("web") || slug.includes("site") || slug.includes("dev")) {
    return Code2;
  }
  if (slug.includes("market")) {
    return Megaphone;
  }
  if (slug.includes("design") || slug.includes("graph")) {
    return Palette;
  }
  if (slug.includes("business") || slug.includes("entrepr")) {
    return Briefcase;
  }
  if (slug.includes("photo") || slug.includes("camera")) {
    return Camera;
  }
  if (slug.includes("video") || slug.includes("contenu") || slug.includes("crea")) {
    return Clapperboard;
  }
  if (slug.includes("bureau") || slug.includes("excel") || slug.includes("word")) {
    return FileSpreadsheet;
  }
  if (slug.includes("finance") || slug.includes("compta")) {
    return Wallet;
  }
  return GraduationCap;
}

export function resolveCategoryEmoji(slug: string | null | undefined): string | null {
  if (!slug) return null;
  return CATEGORY_EMOJI[slug] ?? null;
}
