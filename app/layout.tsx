import type { Metadata } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { getAppName } from "@/lib/utils";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const appName = getAppName();

export const metadata: Metadata = {
  title: {
    default: `${appName} — Formations par abonnement`,
    template: `%s · ${appName}`,
  },
  description:
    "Plateforme de formation accessible à 2 000 FCFA pour 30 jours. Parcours structurés, exercices et suivi de progression.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body className={`${dmSans.variable} ${fraunces.variable} antialiased`}>
        <a
          href="#contenu-principal"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-brand-900 focus:shadow"
        >
          Aller au contenu
        </a>
        <div id="contenu-principal">{children}</div>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
