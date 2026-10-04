"use client";

import { useEffect } from "react";
import type { ProjectId } from "@/content/data";
import { leafKey } from "@/lib/graph";
import { system, type Zone } from "@/lib/store";

/**
 * Reports what's under the middle of the viewport: the zone (for the camera)
 * and the project (for focus). A user scroll releases any terminal focus.
 */
export function ZoneTracker() {
  useEffect(() => {
    const band = { rootMargin: "-45% 0px -54% 0px" };

    const zones = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) system.set({ zone: (e.target as HTMLElement).dataset.zone as Zone });
    }, band);
    document.querySelectorAll<HTMLElement>("[data-zone]").forEach((el) => zones.observe(el));

    const inView = new Set<string>();
    const projectsIO = new IntersectionObserver((entries) => {
      for (const e of entries) {
        const id = (e.target as HTMLElement).dataset.project!;
        if (e.isIntersecting) inView.add(id);
        else inView.delete(id);
      }
      const now = ([...inView][0] as ProjectId) ?? null;
      const s = system.get();
      // a different project has settled in view after the focus jump finished: hand control back to scroll
      const stale = s.focus && now && leafKey(now) !== s.focus && Date.now() - s.focusAt > 1500;
      system.set(stale ? { inView: now, focus: null } : { inView: now });
    }, band);
    document.querySelectorAll<HTMLElement>("[data-project]").forEach((el) => projectsIO.observe(el));

    const release = () => system.get().focus && system.set({ focus: null });
    const onKey = (e: KeyboardEvent) => ["PageDown", "PageUp", "ArrowDown", "ArrowUp", " ", "Home", "End"].includes(e.key) && (e.target as HTMLElement).tagName !== "INPUT" && release();
    window.addEventListener("wheel", release, { passive: true });
    window.addEventListener("touchmove", release, { passive: true });
    window.addEventListener("keydown", onKey);

    return () => {
      zones.disconnect();
      projectsIO.disconnect();
      window.removeEventListener("wheel", release);
      window.removeEventListener("touchmove", release);
      window.removeEventListener("keydown", onKey);
    };
  }, []);
  return null;
}
