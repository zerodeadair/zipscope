/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Inter", "ui-sans-serif", "system-ui"],
      },
      colors: {
        void: "#050816",
        panel: "rgba(11, 18, 38, 0.72)",
        cyanx: "#21d4fd",
        violetx: "#a855f7",
        mintx: "#5eead4",
      },
      boxShadow: {
        glow: "0 0 32px rgba(33, 212, 253, 0.22)",
        violet: "0 0 34px rgba(168, 85, 247, 0.18)",
      },
    },
  },
  plugins: [],
};
