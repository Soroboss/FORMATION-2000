/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /** Learnoon Blue — confiance / tech (#2563EB) */
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          950: "#172554",
        },
        /** Growth Green — progression / succès (#22C55E) */
        progress: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
        },
        /** Success Orange — énergie / badges (#F59E0B) */
        action: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
        },
        /** Neutres charte */
        ink: {
          DEFAULT: "#111827",
          muted: "#6b7280",
        },
        canvas: {
          DEFAULT: "#f8fafc",
          card: "#ffffff",
          border: "#e5e7eb",
          track: "#e5e7eb",
        },
        danger: {
          DEFAULT: "#ef4444",
          50: "#fef2f2",
          700: "#b91c1c",
        },
        info: {
          DEFAULT: "#0ea5e9",
          50: "#f0f9ff",
          700: "#0369a1",
        },
      },
      borderRadius: {
        brand: "14px",
        card: "16px",
        soft: "12px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(17, 24, 39, 0.04), 0 4px 12px rgba(17, 24, 39, 0.04)",
        soft: "0 1px 3px rgba(17, 24, 39, 0.06)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-poppins)", "system-ui", "sans-serif"],
      },
      transitionTimingFunction: {
        brand: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};
