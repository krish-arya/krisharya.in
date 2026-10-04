"use client";

import type { ReactNode } from "react";
import { leafKey } from "@/lib/graph";
import { goTo, system } from "@/lib/store";
import { projectById, type ProjectId } from "@/content/data";

/**
 * In-page link that scrolls instead of jumping. If the target is a project,
 * it also focuses the core and runs that project's loop once.
 */
export function GoButton({ to, children, className, as }: { to: string; children: ReactNode; className?: string; as?: "div" }) {
  const go = () => {
    const project = to in projectById;
    if (project) {
      system.focusOn(leafKey(to));
      window.setTimeout(() => system.run(to as ProjectId), 650);
    }
    goTo(to, project);
  };
  if (as === "div")
    return (
      <div role="link" tabIndex={0} onClick={go} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), go())} className={`cursor-pointer ${className ?? ""}`}>
        {children}
      </div>
    );
  return (
    <a href={`#${to}`} onClick={(e) => (e.preventDefault(), go())} className={className}>
      {children}
    </a>
  );
}
