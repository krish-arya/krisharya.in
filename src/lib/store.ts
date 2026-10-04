"use client";

import { useSyncExternalStore } from "react";
import type { ProjectId, WorldId } from "@/content/data";

export type Zone = "hero" | WorldId | "rest";
export type Depth = 1 | 2 | 3 | 4;

export interface SystemState {
  /** Which part of the page the reader is in; drives the camera. */
  zone: Zone;
  /** Project currently centred in the viewport. */
  inView: ProjectId | null;
  /** Node the terminal or a click explicitly focused. Overrides inView until the reader scrolls away. */
  focus: string | null;
  /** When focus was set; scroll-based release waits for the scroll it triggered to settle. */
  focusAt: number;
  /** Global disclosure level. */
  depth: Depth;
  /** Bumped per project to ask its diagram to run a cycle. */
  runs: Partial<Record<ProjectId, number>>;
  /** Terminal sheet open (mobile) / expanded (desktop). */
  terminalOpen: boolean;
}

let state: SystemState = {
  zone: "hero",
  inView: null,
  focus: null,
  focusAt: 0,
  depth: 2,
  runs: {},
  terminalOpen: false,
};

const listeners = new Set<() => void>();

export const system = {
  get: () => state,
  set(patch: Partial<SystemState> | ((s: SystemState) => Partial<SystemState>)) {
    const next = typeof patch === "function" ? patch(state) : patch;
    state = { ...state, ...next };
    listeners.forEach((l) => l());
  },
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  focusOn(key: string) {
    system.set({ focus: key, focusAt: Date.now() });
  },
  run(id: ProjectId) {
    system.set((s) => ({ runs: { ...s.runs, [id]: (s.runs[id] ?? 0) + 1 } }));
  },
};

export function useSystem<T>(select: (s: SystemState) => T): T {
  return useSyncExternalStore(
    system.subscribe,
    () => select(state),
    () => select(state),
  );
}

/** Scrolls to an element id, respecting reduced motion. */
export function goTo(id: string, keepFocus = false) {
  const el = document.getElementById(id);
  if (!el) return;
  if (!keepFocus && state.focus) system.set({ focus: null });
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  history.replaceState(null, "", `#${id}`);
}
