import type { ReactNode } from "react";

export interface IconSpec {
  tint: [string, string];
  glyph: ReactNode;
  /** Dark glyph on a light tile. */
  ink?: boolean;
  /** tile: rounded square (apps) · doc: a sheet of paper (project documents). */
  shape?: "tile" | "doc";
}

/** A macOS-style icon. Glyphs are sized in em, and the icon's font-size is its pixel size. */
export function Icon({ spec, size = 56, className = "" }: { spec: IconSpec; size?: number; className?: string }) {
  if (spec.shape === "doc") {
    return (
      <span aria-hidden className={`doc-icon ${className}`} style={{ width: size, height: size, fontSize: size, "--a": spec.tint[0], "--b": spec.tint[1] } as React.CSSProperties}>
        <span className="doc-paper">{spec.glyph}</span>
      </span>
    );
  }
  return (
    <span
      aria-hidden
      className={`app-icon ${spec.ink ? "text-[#1d1d1f]" : "text-white"} ${className}`}
      style={{ width: size, height: size, fontSize: size, background: `linear-gradient(160deg, ${spec.tint[0]}, ${spec.tint[1]})` }}
    >
      {spec.glyph}
    </span>
  );
}

/** Full-bleed artwork on a 100×100 grid. */
const art = (d: ReactNode) => (
  <svg viewBox="0 0 100 100" width="100%" height="100%" className="absolute inset-0">
    {d}
  </svg>
);

/** Skill tiles are elements: atomic number, symbol. */
export const element = (n: number, abbr: string) => (
  <>
    <span className="el-n">{n}</span>
    <span className="el-sym">{abbr}</span>
  </>
);

/** Project documents: a coloured band with the code, the initials set large. */
export const docFace = (code: string, initials: string) => (
  <>
    <span className="doc-band">{code}</span>
    <span className="doc-mark">{initials}</span>
  </>
);

const DOTS = ["#a78bfa", "#5eead4", "#f9a8d4", "#7dd3fc", "#fdba74", "#cbd5e1", "#fde047", "#86efac", "#fca5a5"];

export const glyphs = {
  folder: art(
    <>
      <path d="M18 34a5 5 0 0 1 5-5h17l6 6h31a5 5 0 0 1 5 5v31a5 5 0 0 1-5 5H23a5 5 0 0 1-5-5z" fill="rgba(255,255,255,.55)" />
      <path d="M18 43a5 5 0 0 1 5-5h54a5 5 0 0 1 5 5v28a5 5 0 0 1-5 5H23a5 5 0 0 1-5-5z" fill="#fff" />
      <path d="M38 55h24" stroke="#5aa6ff" strokeWidth="3" strokeLinecap="round" />
    </>,
  ),
  grid: art(DOTS.map((c, i) => <circle key={c} cx={30 + (i % 3) * 20} cy={30 + Math.floor(i / 3) * 20} r={7} fill={c} />)),
  briefcase: art(
    <>
      <path d="M39 33v-4a4 4 0 0 1 4-4h14a4 4 0 0 1 4 4v4" fill="none" stroke="#fff" strokeWidth="5" />
      <rect x="20" y="33" width="60" height="42" rx="7" fill="#fff" />
      <path d="M20 50h60" stroke="#e59a12" strokeWidth="3" />
      <rect x="45" y="46" width="10" height="9" rx="2" fill="#e59a12" />
    </>,
  ),
  paper: art(
    <>
      <rect x="30" y="20" width="44" height="58" rx="4" fill="rgba(255,255,255,.5)" transform="rotate(8 52 49)" />
      <rect x="26" y="22" width="44" height="58" rx="4" fill="#fff" />
      <path d="M33 34h30M33 42h30M33 50h22M33 62h30M33 70h18" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" opacity=".75" />
    </>,
  ),
  note: art(
    <>
      <rect width="100" height="100" fill="#fff" />
      <rect width="100" height="30" fill="#ffd426" />
      <path d="M0 30h100" stroke="#e6b800" strokeWidth="1.5" strokeDasharray="2 3" />
      <path d="M14 48h72M14 62h72M14 76h72" stroke="#d1d1d6" strokeWidth="2" />
    </>,
  ),
  terminal: art(
    <>
      <rect x="14" y="18" width="72" height="64" rx="7" fill="#1c1c1e" stroke="rgba(255,255,255,.18)" strokeWidth="1.5" />
      <circle cx="23" cy="26" r="2.2" fill="#ff5f57" />
      <circle cx="30" cy="26" r="2.2" fill="#febc2e" />
      <circle cx="37" cy="26" r="2.2" fill="#28c840" />
      <path d="M26 44l11 8-11 8" fill="none" stroke="#39d353" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M44 62h18" stroke="#e5e5e5" strokeWidth="4.5" strokeLinecap="round" />
    </>,
  ),
  mail: art(
    <>
      <rect x="17" y="28" width="66" height="46" rx="6" fill="#fff" />
      <path d="M19 31l31 23 31-23" fill="none" stroke="#2b7bff" strokeWidth="3.5" strokeLinejoin="round" />
    </>,
  ),
  gear: art(
    <>
      <circle cx="50" cy="50" r="27" fill="none" stroke="#e5e5ea" strokeWidth="11" strokeDasharray="7.4 6.7" />
      <circle cx="50" cy="50" r="22" fill="#d1d1d6" />
      <circle cx="50" cy="50" r="13" fill="#3a3a3c" />
      <circle cx="50" cy="50" r="6" fill="#8e8e93" />
    </>,
  ),
  code: art(<path d="M40 34L24 50l16 16M60 34l16 16-16 16" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />),
  monogram: (
    <>
      {art(<circle cx="50" cy="50" r="33" fill="none" stroke="rgba(255,255,255,.22)" strokeWidth="2" />)}
      <span className="icon-mark relative">KA</span>
    </>
  ),
  in: <span className="icon-mark lowercase">in</span>,
};
