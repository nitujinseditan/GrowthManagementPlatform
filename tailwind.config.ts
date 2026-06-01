import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      transitionDuration: {
        fast: "var(--duration-fast)",
        normal: "var(--duration-normal)",
        slow: "var(--duration-slow)",
      },
      keyframes: {
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          from: { opacity: "0", transform: "translateX(16px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "slide-in-left": {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(0)" },
        },
        "breathe-glow": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(16,185,129,0.15)" },
          "50%": { boxShadow: "0 0 0 4px rgba(16,185,129,0.08)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "typing-dot": {
          "0%, 60%, 100%": { transform: "translateY(0)", opacity: "0.3" },
          "30%": { transform: "translateY(-6px)", opacity: "1" },
        },
        "ink-spread": {
          from: { backgroundColor: "transparent" },
          to: { backgroundColor: "hsl(var(--accent))" },
        },
        "success-pop": {
          "0%": { transform: "scale(0.5)", opacity: "0" },
          "70%": { transform: "scale(1.1)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "toast-in": {
          from: { opacity: "0", transform: "translateX(100%)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95) translateY(-4px)" },
          to: { opacity: "1", transform: "scale(1) translateY(0)" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.4s ease-out both",
        "slide-in-right": "slide-in-right 0.3s ease-out both",
        "slide-in-left": "slide-in-left 0.3s ease-out both",
        "breathe-glow": "breathe-glow 2s ease-in-out infinite",
        shimmer: "shimmer 1.5s infinite",
        "typing-dot": "typing-dot 1.4s infinite ease-in-out both",
        "success-pop": "success-pop 0.4s ease-out both",
        "toast-in": "toast-in 0.3s ease-out both",
        "scale-in": "scale-in 0.2s ease-out both",
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "none",
            color: "hsl(var(--foreground))",
            fontSize: "0.875rem",
            lineHeight: "1.75",
            a: {
              color: "hsl(var(--primary))",
              "&:hover": { color: "hsl(var(--primary) / 0.8)" },
            },
            strong: { color: "hsl(var(--foreground))" },
            code: {
              color: "hsl(var(--foreground))",
              backgroundColor: "hsl(var(--muted))",
              padding: "0.2em 0.4em",
              borderRadius: "0.25rem",
              fontWeight: "400",
              fontSize: "0.8125rem",
            },
            "code::before": { content: "none" },
            "code::after": { content: "none" },
            pre: {
              backgroundColor: "#1e293b",
              color: "#e2e8f0",
              borderRadius: "0.75rem",
              padding: "1rem",
            },
            blockquote: {
              borderLeftColor: "hsl(var(--primary))",
              color: "hsl(var(--muted-foreground))",
              fontStyle: "normal",
            },
            h1: { color: "hsl(var(--foreground))", fontWeight: "700" },
            h2: { color: "hsl(var(--foreground))", fontWeight: "600" },
            h3: { color: "hsl(var(--foreground))", fontWeight: "600" },
            h4: { color: "hsl(var(--foreground))", fontWeight: "600" },
            hr: { borderColor: "hsl(var(--border))" },
            table: { fontSize: "0.8125rem" },
            th: { color: "hsl(var(--foreground))", fontWeight: "600" },
            img: { borderRadius: "0.5rem" },
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
export default config;
