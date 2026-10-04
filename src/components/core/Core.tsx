"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const CoreScene = dynamic(() => import("./CoreScene"), { ssr: false });

function webglOK() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * The 3D core is desktop-only and never required: phones, reduced motion and
 * missing WebGL all get the static system map in the hero instead.
 */
export function Core() {
  const [mode, setMode] = useState<"pending" | "3d" | "map">("pending");

  useEffect(() => {
    const ok =
      window.innerWidth >= 720 &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
      webglOK();
    const m = ok ? "3d" : "map";
    document.documentElement.dataset.core = m;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- capability probe needs the DOM
    setMode(m);
  }, []);

  return mode === "3d" ? <CoreScene /> : null;
}
