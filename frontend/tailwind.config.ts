import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      maxWidth: {
        container: "100%",
      },
      colors: {
        // TelArena Premium Design Tokens
        bg: {
          primary: "#09090B",
          secondary: "#0D0D10",
          card: "#111217",
          elevated: "#16171D",
        },
        accent: {
          red: "#EF2D56",
          "red-glow": "rgba(239, 45, 86, 0.25)",
          "red-dark": "#C1203F",
          cyan: "#00D4FF",
          "cyan-glow": "rgba(0, 212, 255, 0.2)",
        },
        text: {
          primary: "#FFFFFF",
          secondary: "#A1A1AA",
          muted: "#6B6B76",
        },
        status: {
          live: "#EF4444",
          upcoming: "#00D4FF",
          verified: "#22C55E",
          pending: "#FACC15",
          rejected: "#EF4444",
          success: "#22C55E",
          warning: "#FACC15",
          error: "#EF4444",
        },
        rank: {
          gold: "#FACC15",
          silver: "#C0C0C0",
          bronze: "#CD7F32",
        },
        line: "rgba(255,255,255,0.08)",
      },
      fontFamily: {
        display: ["var(--font-space-grotesk)", "Space Grotesk", "sans-serif"],
        heading: ["var(--font-space-grotesk)", "Space Grotesk", "sans-serif"],
        grotesk: ["var(--font-space-grotesk)", "Space Grotesk", "sans-serif"],
        body: ["var(--font-inter)", "Inter", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "JetBrains Mono", "monospace"],
      },
      fontSize: {
        "display-xl": ["5rem", { lineHeight: "1", letterSpacing: "0.05em" }],
        "display-lg": ["3.75rem", { lineHeight: "1", letterSpacing: "0.04em" }],
        "display-md": ["2.5rem", { lineHeight: "1.1", letterSpacing: "0.03em" }],
      },
      boxShadow: {
        "glow-red": "0 8px 24px rgba(239, 45, 86, 0.18)",
        "glow-red-sm": "0 4px 14px rgba(239, 45, 86, 0.16)",
        "glow-cyan": "0 8px 24px rgba(0, 212, 255, 0.16)",
        "glow-cyan-sm": "0 4px 14px rgba(0, 212, 255, 0.14)",
        "card": "0 1px 2px rgba(0, 0, 0, 0.4), 0 8px 24px rgba(0, 0, 0, 0.24)",
        "card-hover": "0 4px 8px rgba(0, 0, 0, 0.4), 0 16px 40px rgba(0, 0, 0, 0.32)",
      },
      animation: {
        "glow-pulse": "glowPulse 2s ease-in-out infinite",
        "slide-in": "slideIn 0.3s ease-out",
        "fade-in": "fadeIn 0.2s ease-out",
        "count-up": "countUp 0.5s ease-out",
        "scan-line": "scanLine 3s linear infinite",
        "flicker": "flicker 4s ease-in-out infinite",
      },
      keyframes: {
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(227, 28, 61, 0.4)" },
          "50%": { boxShadow: "0 0 40px rgba(227, 28, 61, 0.8)" },
        },
        slideIn: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        countUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        scanLine: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(200%)" },
        },
        flicker: {
          "0%, 95%, 100%": { opacity: "1" },
          "96%, 98%": { opacity: "0.8" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "hero-gradient": "linear-gradient(135deg, #0A0A0F 0%, #1a0a12 50%, #0A0A0F 100%)",
        "card-gradient": "linear-gradient(145deg, #16161E 0%, #1C1C26 100%)",
        "red-gradient": "linear-gradient(135deg, #E31C3D 0%, #B01530 100%)",
        "cyan-gradient": "linear-gradient(135deg, #00D9FF 0%, #00A3C4 100%)",
      },
      clipPath: {
        "angular": "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))",
        "angular-sm": "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
      },
    },
  },
  plugins: [],
};
export default config;
