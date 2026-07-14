import { cn } from "@/lib/utils";

export function Alert({
  children,
  variant = "info",
  className,
}: {
  children: React.ReactNode;
  variant?: "info" | "error" | "success" | "warning";
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        "rounded-soft border px-3 py-2 text-sm",
        variant === "error" && "border-danger/30 bg-danger-50 text-danger-700",
        variant === "success" && "border-progress-200 bg-progress-50 text-progress-700",
        variant === "warning" && "border-action-200 bg-action-50 text-action-800",
        variant === "info" && "border-info/30 bg-info-50 text-info-700",
        className,
      )}
    >
      {children}
    </div>
  );
}
