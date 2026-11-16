import { charter, radii, shadow, space } from "@/theme/tokens";

export type ThemeName = "val-aubrelle";

export type Theme = {
  name: ThemeName;
  label: string;
  cssVariables: Record<string, string>;
};

function valAubrelleTheme(): Theme {
  return {
    name: "val-aubrelle",
    label: "Val d'Aubrelle",
    cssVariables: {
      "--color-primary": charter.primary,
      "--color-primary-strong": charter.primaryStrong,
      "--color-text": charter.text,
      "--color-text-muted": charter.textMuted,
      "--color-surface": charter.surface,
      "--color-surface-alt": charter.surfaceAlt,
      "--color-accent": charter.accent,
      "--color-on-primary": charter.onPrimary,
      "--color-info": charter.info,
      "--color-success": charter.success,
      "--color-warning": charter.warning,
      "--color-danger": charter.danger,
      "--color-border": charter.border,
      "--data-seq-1": charter.dataSeq[0],
      "--data-seq-2": charter.dataSeq[1],
      "--data-seq-3": charter.dataSeq[2],
      "--data-seq-4": charter.dataSeq[3],
      "--data-seq-5": charter.dataSeq[4],
      "--radius": radii.md,
      "--radius-sm": radii.sm,
      "--radius-lg": radii.lg,
      "--space-1": space[1],
      "--space-2": space[2],
      "--space-3": space[3],
      "--space-4": space[4],
      "--space-6": space[6],
      "--space-8": space[8],
      "--shadow-sm": shadow.sm,
      "--background": charter.surface,
      "--foreground": charter.text,
      "--card": charter.surface,
      "--card-foreground": charter.text,
      "--popover": charter.surface,
      "--popover-foreground": charter.text,
      "--primary": charter.primary,
      "--primary-foreground": charter.onPrimary,
      "--secondary": charter.surfaceAlt,
      "--secondary-foreground": charter.text,
      "--muted": charter.surfaceAlt,
      "--muted-foreground": charter.textMuted,
      "--accent": charter.surfaceAlt,
      "--accent-foreground": charter.text,
      "--destructive": charter.danger,
      "--border": charter.border,
      "--input": charter.border,
      "--ring": charter.primaryStrong,
      "--chart-1": charter.dataSeq[0],
      "--chart-2": charter.dataSeq[1],
      "--chart-3": charter.dataSeq[2],
      "--chart-4": charter.dataSeq[3],
      "--chart-5": charter.dataSeq[4],
      "--sidebar": charter.surfaceAlt,
      "--sidebar-foreground": charter.text,
      "--sidebar-primary": charter.primary,
      "--sidebar-primary-foreground": charter.onPrimary,
      "--sidebar-accent": charter.surface,
      "--sidebar-accent-foreground": charter.text,
      "--sidebar-border": charter.border,
      "--sidebar-ring": charter.primaryStrong,
    },
  };
}

export const themes = {
  "val-aubrelle": valAubrelleTheme(),
} satisfies Record<ThemeName, Theme>;

export const ACTIVE_THEME: ThemeName = "val-aubrelle";

export function getActiveTheme() {
  return themes[ACTIVE_THEME];
}

export const textContrastPairs = [
  ["texte sur blanc", charter.text, charter.surface],
  ["texte sur brume", charter.text, charter.surfaceAlt],
  ["texte secondaire sur blanc", charter.textMuted, charter.surface],
  ["texte secondaire sur brume", charter.textMuted, charter.surfaceAlt],
  ["blanc sur vert Aubrelle", charter.onPrimary, charter.primary],
  ["blanc sur vert forêt", charter.onPrimary, charter.primaryStrong],
  ["information sur blanc", charter.info, charter.surface],
  ["information sur brume", charter.info, charter.surfaceAlt],
  ["succès sur blanc", charter.success, charter.surface],
  ["succès sur brume", charter.success, charter.surfaceAlt],
  ["avertissement sur blanc", charter.warning, charter.surface],
  ["avertissement sur brume", charter.warning, charter.surfaceAlt],
  ["erreur sur blanc", charter.danger, charter.surface],
  ["erreur sur brume", charter.danger, charter.surfaceAlt],
] as const;
