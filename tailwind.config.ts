import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
  content: ["./src/**/*.tsx"],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", ...fontFamily.serif],
        body: ["var(--font-body)", ...fontFamily.sans],
      },
      colors: {
        bg: "var(--color-bg)",
        surface: "var(--color-surface)",
        ink: "var(--color-ink)",
        muted: "var(--color-muted)",
        accent: "var(--color-accent)",
        "accent-ink": "var(--color-accent-ink)",
        line: "var(--color-line)",
      },
      borderRadius: {
        theme: "var(--radius)",
      },
    },
  },
  plugins: [],
} satisfies Config;
