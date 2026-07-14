import { BrandLogo } from "@/components/brand/logo";

/** Parcours auth (connexion / inscription) — logo officiel Learnoon Academy. */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-8 sm:py-10">
        <div className="mb-6 flex justify-center sm:mb-8">
          <BrandLogo variant="full" className="w-[200px] sm:w-[240px]" />
        </div>
        <div className="ui-card p-6 sm:p-8">{children}</div>
      </div>
    </div>
  );
}
