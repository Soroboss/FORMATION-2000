import { cn } from "@/lib/utils";

export function Alert({
  children,
  variant = "info",
  className,
}: {
  children: React.ReactNode;
  variant?: "info" | "error" | "success";
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        "rounded-lg border px-3 py-2 text-sm",
        variant === "error" && "border-red-200 bg-red-50 text-red-800",
        variant === "success" && "border-emerald-200 bg-emerald-50 text-emerald-800",
        variant === "info" && "border-brand-200 bg-brand-50 text-brand-900",
        className,
      )}
    >
      {children}
    </div>
  );
}
