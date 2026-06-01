import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "none",
            color: "#1c1917", // stone-900
            fontSize: "0.875rem",
            lineHeight: "1.75",
            a: {
              color: "#10b981",
              "&:hover": { color: "#059669" },
            },
            strong: { color: "#1c1917" },
            code: {
              color: "#1c1917",
              backgroundColor: "#f5f5f4",
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
              borderLeftColor: "#10b981",
              color: "#78716c",
              fontStyle: "normal",
            },
            h1: { color: "#1c1917", fontWeight: "700" },
            h2: { color: "#1c1917", fontWeight: "600" },
            h3: { color: "#1c1917", fontWeight: "600" },
            h4: { color: "#1c1917", fontWeight: "600" },
            hr: { borderColor: "#e7e5e4" },
            table: {
              fontSize: "0.8125rem",
            },
            th: {
              color: "#1c1917",
              fontWeight: "600",
            },
            img: {
              borderRadius: "0.5rem",
            },
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
export default config;
