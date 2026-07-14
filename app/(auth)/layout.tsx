import Link from "next/link";
import { getAppName } from "@/lib/utils";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const appName = getAppName();

  return (
    <div className="flex min-h-screen flex-col">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10">
        <Link
          href="/"
          className="mb-8 text-center font-display text-2xl font-semibold text-brand-900"
        >
          {appName}
        </Link>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
