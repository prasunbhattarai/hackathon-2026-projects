import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./features/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: {
          base: "var(--bg-base)",
          surface: "var(--bg-surface)",
          elevated: "var(--bg-elevated)",
          subtle: "var(--bg-subtle)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          glow: "var(--accent-glow)",
        },
        severity: {
          critical: "var(--sev-critical)",
          high: "var(--sev-high)",
          medium: "var(--sev-medium)",
          low: "var(--sev-low)",
          none: "var(--sev-none)",
        },
        border: {
          DEFAULT: "var(--border)",
          strong: "var(--border-strong)",
        },
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
        },
      },
      fontFamily: {
        display: ['"DM Serif Display"', "serif"],
        sans: ['"IBM Plex Sans"', "sans-serif"],
        condensed: ['"IBM Plex Sans Condensed"', "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
      borderRadius: {
        sm: "2px",
        DEFAULT: "4px",
        md: "6px",
        lg: "8px",
      },
      boxShadow: {
        glow: "0 0 0 1px var(--border), 0 8px 24px var(--accent-glow)",
        "glow-sm": "0 0 0 1px var(--border), 0 4px 12px var(--accent-glow)",
        "glow-lg": "0 0 0 1px var(--border-strong), 0 14px 32px var(--accent-glow)",
      },
    },
  },
  plugins: [],
};

export default config;
