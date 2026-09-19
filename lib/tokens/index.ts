/**
 * Typed Design Tokens for Kampung Smart Farming
 * Mirrors values defined in styles/tokens.css
 */

export const colors = {
  ink: {
    950: "#1C211E",
    900: "#252A27",
    800: "#343A36",
    700: "#4A514C",
    600: "#636B65",
    500: "#7E8780",
    400: "#A0A8A1",
    300: "#C6CCC7",
    200: "#DCE1DD",
    100: "#EEF1EE",
  },
  earth: {
    700: "#7A4D35",
    600: "#986145",
    500: "#B97855",
    400: "#CD9475",
    300: "#E4B9A0",
    200: "#F0D6C7",
    100: "#F7EAE2",
  },
  green: {
    800: "#254A3A",
    700: "#32614B",
    600: "#43775B",
    500: "#5C8D70",
    400: "#7EA28B",
    300: "#A9C0B1",
    200: "#D5E2D9",
    100: "#EAF2EC",
  },
  paper: {
    0: "#FFFFFF",
    50: "#FCFCFA",
    100: "#F7F7F3",
    150: "#F1F1EA",
  },
  state: {
    success: {
      bg: "#EAF4EC",
      fg: "#275D35",
      border: "#C2DEC8",
    },
    warning: {
      bg: "#FFF3DC",
      fg: "#805A14",
      border: "#F3DBA7",
    },
    danger: {
      bg: "#FCEBEA",
      fg: "#8B2F2B",
      border: "#F2C2BF",
    },
    info: {
      bg: "#EAF1F6",
      fg: "#315A73",
      border: "#BCD1E1",
    },
  },
} as const;

export const spacing = {
  1: "0.25rem", // 4px
  2: "0.5rem", // 8px
  3: "0.75rem", // 12px
  4: "1rem", // 16px
  5: "1.25rem", // 20px
  6: "1.5rem", // 24px
  8: "2rem", // 32px
  10: "2.5rem", // 40px
  12: "3rem", // 48px
  16: "4rem", // 64px
  20: "5rem", // 80px
  24: "6rem", // 96px
  30: "7.5rem", // 120px
  40: "10rem", // 160px
} as const;

export const radius = {
  sm: "8px",
  md: "12px",
  lg: "16px",
  xl: "24px",
  full: "9999px",
} as const;

export const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
} as const;

export const brand = {
  name: "KAMPUNG SETARA SMART FARMING",
  tagline: "Dari Limbah, Tumbuh Manfaat.",
  statement: "SAMPAH KALIAN SANGAT BERARTI BAGI KAMI",
} as const;
