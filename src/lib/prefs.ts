"use client";

import { useSyncExternalStore } from "react";
import { DEFAULT_WALL, PREFS_KEY } from "./prepaint";

/**
 * System Settings. Everything is applied as attributes on <html> so CSS does the work:
 * data-theme (resolved light|dark), data-wall (wallpaper id), --accent.
 * The same logic runs before paint (lib/prepaint.ts), so there's no flash.
 */
export type Appearance = "auto" | "light" | "dark";

export interface Prefs {
  wallpaper: string;
  appearance: Appearance;
  accent: string;
}

export const WALLPAPERS: { id: string; name: string; colors: string[] }[] = [
  { id: "ember", name: "Ember", colors: ["#ff8a4c", "#ff3d6e", "#ffb340", "#b14bff"] },
  { id: "lagoon", name: "Lagoon", colors: ["#2a6bff", "#00d4c8", "#7b5cff", "#7ee8fa"] },
  { id: "bloom", name: "Bloom", colors: ["#ff7ac6", "#8f5bff", "#ffc2e2", "#5b8cff"] },
  { id: "meadow", name: "Meadow", colors: ["#2fb57a", "#c4f06a", "#138f8a", "#f9e45b"] },
  { id: "graphite", name: "Graphite", colors: ["#3a3a40", "#6b6b78", "#1c1c21", "#8e8e99"] },
];

export const ACCENTS: { name: string; color: string }[] = [
  { name: "Blue", color: "#007aff" },
  { name: "Purple", color: "#a550a7" },
  { name: "Pink", color: "#f74f9e" },
  { name: "Orange", color: "#f7821b" },
  { name: "Green", color: "#62ba46" },
  { name: "Graphite", color: "#8c8c8c" },
];

const DEFAULT: Prefs = { wallpaper: DEFAULT_WALL, appearance: "auto", accent: "#007aff" };

let prefs: Prefs = DEFAULT;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded) return;
  loaded = true;
  try {
    prefs = { ...DEFAULT, ...JSON.parse(localStorage.getItem(PREFS_KEY) || "{}") };
  } catch {}
  // follow the system while in auto
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => prefs.appearance === "auto" && apply());
}

function apply() {
  const d = document.documentElement;
  const dark = prefs.appearance === "dark" || (prefs.appearance === "auto" && matchMedia("(prefers-color-scheme: dark)").matches);
  d.dataset.theme = dark ? "dark" : "light";
  d.dataset.wall = prefs.wallpaper;
  d.style.setProperty("--accent", prefs.accent);
}

export function setPrefs(patch: Partial<Prefs>) {
  load();
  prefs = { ...prefs, ...patch };
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {}
  apply();
  listeners.forEach((l) => l());
}

export function usePrefs(): Prefs {
  return useSyncExternalStore(
    (l) => {
      load();
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => (load(), prefs),
    () => DEFAULT,
  );
}
