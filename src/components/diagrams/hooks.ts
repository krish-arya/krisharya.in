"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import type { ProjectId } from "@/content/data";
import { useSystem } from "@/lib/store";

export function useReducedMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduce(m.matches);
    on();
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, []);
  return reduce;
}

/** Fires `cb` the first time the element is mostly on screen. */
export function useFirstView(ref: RefObject<Element | null>, cb: () => void) {
  const fired = useRef(false);
  const cbRef = useRef(cb);
  useEffect(() => {
    cbRef.current = cb;
  });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !fired.current) {
          fired.current = true;
          cbRef.current();
          io.disconnect();
        }
      },
      { threshold: 0.55 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);
}

/** Whether the element is on screen at all; used to pause continuous animation. */
export function useOnScreen(ref: RefObject<Element | null>) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOn(e.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);
  return on;
}

/** Calls `cb` whenever the terminal (or a link) asks this project to run. */
export function useRunSignal(id: ProjectId, cb: () => void) {
  const n = useSystem((s) => s.runs[id] ?? 0);
  const cbRef = useRef(cb);
  useEffect(() => {
    cbRef.current = cb;
  });
  useEffect(() => {
    if (n > 0) cbRef.current();
  }, [n]);
}

/** Drives a 0→1 progress value for a fixed duration; restarts when `key` changes. */
export function useTween(key: unknown, ms: number, enabled = true) {
  const [p, setP] = useState(1);
  useEffect(() => {
    if (!enabled) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const v = Math.min((t - t0) / ms, 1);
      setP(v);
      if (v < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [key, ms, enabled]);
  return enabled ? p : 1;
}
