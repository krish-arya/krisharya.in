"use client";

import { useEffect, useRef, useState } from "react";
import { person } from "@/content/data";
import { UNLOCK_KEY } from "@/lib/prepaint";

type Phase = "boot" | "lock" | "out" | "done";

/** Boot, then lock screen, once per session. The boot frame is in the server HTML so the desktop never flashes first. */
export function LockScreen() {
  const [phase, setPhase] = useState<Phase>("boot");
  const [now, setNow] = useState<Date | null>(null);
  const enter = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // when skipped, CSS already hides the boot frame; this just unmounts it
    const skip = document.documentElement.dataset.boot === "skip";
    const t = setTimeout(() => setPhase(skip ? "done" : "lock"), skip ? 0 : 1500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (phase !== "lock") return;
    const tick = () => setNow(new Date());
    tick();
    const t = setInterval(tick, 10_000);
    enter.current?.focus();
    return () => clearInterval(t);
  }, [phase]);

  const unlock = () => {
    if (phase !== "lock") return;
    try {
      sessionStorage.setItem(UNLOCK_KEY, "1");
    } catch {}
    setPhase("out");
    // reveal the desktop underneath while the lock screen fades
    document.documentElement.dataset.boot = "skip";
    setTimeout(() => setPhase("done"), 650);
  };

  if (phase === "done") return null;

  if (phase === "boot") {
    return (
      <div className="boot-screen" aria-hidden>
        <span className="boot-logo">KA</span>
        <span className="boot-bar">
          <span />
        </span>
      </div>
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Lock screen"
      className={`lock ${phase === "out" ? "is-out" : ""}`}
      onClick={unlock}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && unlock()}
    >
      <div className="lock-time">
        {now && (
          <>
            <p className="text-[18px] font-medium">{now.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })}</p>
            <p className="lock-clock">{now.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }).replace(/\s?[AP]M$/i, "")}</p>
          </>
        )}
      </div>

      <div className="lock-user">
        <div className="avatar !h-[76px] !w-[76px] !text-[26px]">KA</div>
        <p className="mt-3 text-[17px] font-semibold">{person.name}</p>
        <p className="text-[13px] text-white/75">{person.roles.join(" · ")}</p>
        <button ref={enter} onClick={unlock} className="lock-enter">
          Enter
          <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 8h10M9 4l4 4-4 4" />
          </svg>
        </button>
        <p className="mt-3 text-[12px] text-white/60">Click anywhere or press Enter</p>
      </div>
    </div>
  );
}
