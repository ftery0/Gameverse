import type { Config } from "tailwindcss";
import {stylePreset} from "@gameverse/style";

const config: Config = {
  presets: [stylePreset], 
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
