import { useEffect } from "react";
import { FONT_PRESETS } from "./content/defaults.js";

const VARS = {
  navy: "--navy",
  red: "--red",
  ink: "--ink",
  muted: "--muted",
  line: "--line",
  soft: "--soft",
  pageBg: "--page-bg",
  heroTint: "--hero-tint",
  bandBg: "--band-bg",
  bandInk: "--band-ink",
  footerBg: "--footer-bg",
  footerInk: "--footer-ink",
};

export function applyTheme(theme, target) {
  const root = target || document.documentElement;
  if (!theme) return;
  for (const [key, cssVar] of Object.entries(VARS)) {
    if (theme[key]) root.style.setProperty(cssVar, theme[key]);
  }
  root.style.setProperty("--radius", `${theme.radius ?? 2}px`);
  const font = FONT_PRESETS[theme.fontPreset] || FONT_PRESETS.modern;
  root.style.setProperty("--font-body", font.body);
  root.style.setProperty("--font-head", font.head);
}

export function useTheme(theme) {
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);
}
