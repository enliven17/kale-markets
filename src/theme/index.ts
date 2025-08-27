import { colors } from "@/theme/colors";

export const theme = {
  colors,
  borderRadius: "12px",
  spacing: (factor: number) => `${factor * 8}px`,
  fontFamily: "'Inter', sans-serif"
};

export type ThemeType = typeof theme; 