/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#f8fafb",
        surface: "#f8fafb",
        "surface-bright": "#f8fafb",
        "surface-container": "#e8eff1",
        "surface-container-low": "#f0f4f6",
        "surface-container-lowest": "#ffffff",
        "surface-container-high": "#e1eaec",
        "surface-container-highest": "#d9e4e8",
        "surface-dim": "#cfdce0",
        "surface-variant": "#d9e4e8",
        primary: "#48626e",
        "primary-dim": "#3c5662",
        "primary-container": "#cbe7f5",
        "primary-fixed": "#cbe7f5",
        "primary-fixed-dim": "#bdd9e6",
        secondary: "#5d5f61",
        "secondary-dim": "#515355",
        "secondary-container": "#e1e2e4",
        "secondary-fixed": "#e1e2e4",
        "secondary-fixed-dim": "#d3d4d6",
        tertiary: "#4e6176",
        "tertiary-dim": "#425569",
        "tertiary-container": "#d1e4fe",
        "tertiary-fixed": "#d1e4fe",
        "tertiary-fixed-dim": "#c3d6ef",
        outline: "#727d80",
        "outline-variant": "#a9b4b7",
        error: "#9f403d",
        "error-dim": "#4e0309",
        "error-container": "#fe8983",
        "on-surface": "#2a3437",
        "on-surface-variant": "#566164",
        "on-primary": "#eff9ff",
        "on-primary-container": "#3c5561",
        "on-primary-fixed": "#29434e",
        "on-primary-fixed-variant": "#455f6b",
        "on-secondary": "#f8f9fb",
        "on-secondary-container": "#4f5254",
        "on-secondary-fixed": "#3d4041",
        "on-secondary-fixed-variant": "#595c5e",
        "on-tertiary": "#f7f9ff",
        "on-tertiary-container": "#415368",
        "on-tertiary-fixed": "#2f4155",
        "on-tertiary-fixed-variant": "#4b5d72"
      },
      fontFamily: {
        headline: ["var(--font-manrope)", "PingFang SC", "Microsoft YaHei", "sans-serif"],
        body: ["var(--font-manrope)", "PingFang SC", "Microsoft YaHei", "sans-serif"],
        label: ["var(--font-inter)", "PingFang SC", "Microsoft YaHei", "sans-serif"]
      },
      borderRadius: {
        DEFAULT: "1rem",
        lg: "2rem",
        xl: "3rem",
        full: "9999px"
      },
      boxShadow: {
        ambient: "0 10px 40px rgba(0, 0, 0, 0.03)",
        floating: "0 20px 60px rgba(0, 0, 0, 0.06)"
      }
    }
  },
  plugins: []
};

export default config;
