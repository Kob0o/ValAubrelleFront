/**
 * Couleurs imposées par la charte graphique 2026 de la
 * Communauté d'agglomération du Val d'Aubrelle.
 * Le vert prairie est décoratif : il ne sert jamais de couleur de texte.
 * Les couleurs d'état sont provisoires, à faire valider par le service Communication.
 */
export const charter = {
  primary: "#2E7D5B",
  primaryStrong: "#1F5C42",
  text: "#24302B",
  textMuted: "#5D6B64",
  surface: "#FFFFFF",
  surfaceAlt: "#F1F6F2",
  accent: "#8CC63F",
  onPrimary: "#FFFFFF",
  info: "#0B4F8A",
  success: "#0F5C5C",
  warning: "#6B4A00",
  danger: "#7A1E2C",
  border: "#D5E0D8",
  dataSeq: ["#E3EFE7", "#B7D2C2", "#7EAB93", "#3E7560", "#1F5C42"],
} as const;

export const radii = {
  sm: "0.25rem",
  md: "0.5rem",
  lg: "0.75rem",
} as const;

export const space = {
  1: "0.25rem",
  2: "0.5rem",
  3: "0.75rem",
  4: "1rem",
  6: "1.5rem",
  8: "2rem",
} as const;

export const shadow = {
  sm: "0 1px 2px rgb(36 48 43 / 0.08)",
} as const;
