"use client";

import { useSyncExternalStore } from "react";

/**
 * Window manager. A window is addressed by a key:
 *   "projects" · "about" · … for apps,
 *   "project:<id>" for a project document, "skill:<slug>" for a skill app.
 */
export interface Win {
  key: string;
  z: number;
  min: boolean;
  max: boolean;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface OsState {
  wins: Win[];
  launchpad: boolean;
  spotlight: boolean;
}

export const MENU_H = 28;
export const DOCK_H = 84;

let state: OsState = { wins: [], launchpad: false, spotlight: false };
let top = 10;
const listeners = new Set<() => void>();

function set(patch: Partial<OsState> | ((s: OsState) => Partial<OsState>)) {
  state = { ...state, ...(typeof patch === "function" ? patch(state) : patch) };
  listeners.forEach((l) => l());
}

/** The window that has focus: highest z among visible windows. */
export function focused(s: OsState = state) {
  return s.wins.filter((w) => !w.min).sort((a, b) => b.z - a.z)[0] ?? null;
}

function syncHash() {
  const f = focused();
  const h = f ? `#${f.key.replace(":", "/")}` : " ";
  if (location.hash !== h.trim()) history.replaceState(null, "", h === " " ? location.pathname : h);
}

export const os = {
  get: () => state,
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },

  open(key: string, size: [number, number]) {
    const hit = state.wins.find((w) => w.key === key);
    if (hit) {
      set((s) => ({ wins: s.wins.map((w) => (w.key === key ? { ...w, min: false, z: ++top } : w)), launchpad: false, spotlight: false }));
    } else {
      const vw = window.innerWidth;
      const vh = window.innerHeight - MENU_H - DOCK_H;
      const w = Math.min(size[0], vw - 32);
      const h = Math.min(size[1], vh - 24);
      // cascade new windows so they never stack exactly
      const n = state.wins.filter((x) => !x.min).length % 6;
      const x = Math.max(16, Math.round((vw - w) / 2) + n * 28 - 70);
      const y = Math.max(12, Math.round((vh - h) / 2.4) + n * 24);
      set((s) => ({
        wins: [...s.wins, { key, z: ++top, min: false, max: vw < 720, x, y, w, h }],
        launchpad: false,
        spotlight: false,
      }));
    }
    syncHash();
  },
  close(key: string) {
    set((s) => ({ wins: s.wins.filter((w) => w.key !== key) }));
    syncHash();
  },
  focus(key: string) {
    if (focused()?.key === key) return;
    set((s) => ({ wins: s.wins.map((w) => (w.key === key ? { ...w, z: ++top } : w)) }));
    syncHash();
  },
  minimize(key: string) {
    set((s) => ({ wins: s.wins.map((w) => (w.key === key ? { ...w, min: true } : w)) }));
    syncHash();
  },
  toggleMax(key: string) {
    set((s) => ({ wins: s.wins.map((w) => (w.key === key ? { ...w, max: !w.max, z: ++top } : w)) }));
  },
  move(key: string, patch: Partial<Pick<Win, "x" | "y" | "w" | "h">>) {
    set((s) => ({ wins: s.wins.map((w) => (w.key === key ? { ...w, ...patch } : w)) }));
  },
  launchpad(on = !state.launchpad) {
    set({ launchpad: on, spotlight: false });
  },
  spotlight(on = !state.spotlight) {
    set({ spotlight: on, launchpad: false });
  },
};

export function useOs<T>(select: (s: OsState) => T): T {
  return useSyncExternalStore(
    os.subscribe,
    () => select(state),
    () => select(state),
  );
}
