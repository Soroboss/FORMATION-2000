import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { getAppName, getAppUrl } from "@/lib/utils";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-inter",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const appName = getAppName();
const appUrl = getAppUrl();
const description =
  "Learnoon Academy — Apprends aujourd’hui. Réussis demain. Formations accessibles à 2 000 FCFA pour 30 jours.";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: `${appName} — Formations par abonnement`,
    template: `%s · ${appName}`,
  },
  description,
  keywords: [
    "Learnoon Academy",
    "Learnoon",
    "formation",
    "abonnement",
    "Côte d'Ivoire",
    "apprentissage en ligne",
    "2000 FCFA",
  ],
  authors: [{ name: appName }],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: appUrl,
    siteName: appName,
    title: `${appName} — Formations par abonnement`,
    description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${appName} — Formations par abonnement`,
    description,
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [{ url: "/brand/logo-mark.png", type: "image/png" }],
    apple: [{ url: "/brand/logo-mark.png" }],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body className={`${inter.variable} ${poppins.variable} antialiased`}>
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
