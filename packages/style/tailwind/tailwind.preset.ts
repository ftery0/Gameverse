import type { Config } from "tailwindcss";

export const stylePreset: Partial<Config> = {
  theme: {
    extend: {
      colors: {
        primaryNormal: "#3A62F9",
        primaryAlternative: "rgba(58, 98, 249, 0.65)",
        primaryAssistive: "rgba(58, 98, 249, 0.20)",
        
      },
    },
  },
  plugins: [],
};


