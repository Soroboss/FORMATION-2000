import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-brand text-sm font-semibold transition duration-200 ease-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        /** Fond #2563EB · hover #1D4ED8 · texte blanc */
        primary:
          "bg-brand-600 text-white hover:bg-brand-700 focus-visible:outline-brand-600",
        secondary:
          "border-2 border-brand-600 bg-transparent text-brand-600 hover:bg-brand-50 focus-visible:outline-brand-600",
        outline:
          "border-2 border-brand-600 bg-transparent text-brand-600 hover:bg-brand-50 focus-visible:outline-brand-600",
        ghost: "text-brand-700 hover:bg-brand-50 focus-visible:outline-brand-600",
        /** Orange — promotions / accent ponctuel */
        accent:
          "bg-action-500 text-white hover:bg-action-600 focus-visible:outline-action-500",
      },
      size: {
        sm: "h-9 px-3",
        md: "h-11 px-5",
        lg: "h-12 px-6 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  ),
);
Button.displayName = "Button";
