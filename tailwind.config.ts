import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-ibm-plex-sans)", "sans-serif"],
        display: ["var(--font-space-grotesk)", "sans-serif"],
        mono: ["var(--font-ibm-plex-mono)", "monospace"],
      },
      colors: {
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        // Semantic Ticket Status Colors
        status: {
          new: {
            bg: "#E2E4E6",
            text: "#474B4E",
            darkBg: "#2B2E31",
            darkText: "#C4C8CC",
          },
          assigned: {
            bg: "#F5E8D3",
            text: "#8A520E",
            darkBg: "#382814",
            darkText: "#E3A23C",
          },
          progress: {
            bg: "#FCF0C8",
            text: "#946800",
            darkBg: "#3D2E0B",
            darkText: "#F5BF38",
          },
          waiting: {
            bg: "#EFE6EC",
            text: "#6E4967",
            darkBg: "#352131",
            darkText: "#D1AECB",
          },
          resolved: {
            bg: "#E4EDE6",
            text: "#3D6448",
            darkBg: "#1D2D21",
            darkText: "#96C4A2",
          },
          closed: {
            bg: "#E1E2DD",
            text: "#5C5E60",
            darkBg: "#2B2824",
            darkText: "#9E9A93",
          },
        },
      },
      borderRadius: {
        // Tailwind v3 custom sizes
        xs: "0.125rem",   // rounded-xs (2px)
        sm: "calc(var(--radius) - 4px)",  // ~2px
        md: "calc(var(--radius) - 2px)",  // ~4px
        lg: "var(--radius)",              // ~6px
      },
      boxShadow: {
        // Tailwind v3 custom shadows
        "2xs": "0 1px 2px 0 rgb(0 0 0 / 0.04)",
      },
    },
  },
  plugins: [],
};

export default config;
