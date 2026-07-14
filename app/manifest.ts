import type { MetadataRoute } from "next";
import { getAppName } from "@/lib/utils";

export default function manifest(): MetadataRoute.Manifest {
  const name = getAppName();

  return {
    name,
    short_name: "Learnoon",
    description:
      "Formations par abonnement — 2 000 FCFA / 30 jours. Apprends aujourd’hui. Réussis demain.",
    start_url: "/",
    display: "standalone",
    background_color: "#F8FAFC",
    theme_color: "#2563EB",
    lang: "fr",
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/brand/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
