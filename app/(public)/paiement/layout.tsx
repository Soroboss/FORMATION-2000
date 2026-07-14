import { BrandLogo } from "@/components/brand/logo";

/** Parcours paiement — logo officiel Learnoon Academy au-dessus du contenu. */
export default function PaiementLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-canvas">
      <div className="mx-auto flex max-w-lg flex-col items-center px-4 pt-8 sm:px-6 sm:pt-10">
        <BrandLogo variant="full" className="mb-6 w-[180px] sm:mb-8 sm:w-[220px]" />
      </div>
      {children}
    </div>
  );
}
