"use client";

import { launch } from "./registry";

const folder = (
  <svg viewBox="0 0 100 80" width="64" height="52">
    <path d="M4 12a6 6 0 0 1 6-6h26l8 8h46a6 6 0 0 1 6 6v50a6 6 0 0 1-6 6H10a6 6 0 0 1-6-6z" fill="#3d8bfd" />
    <path d="M4 26a6 6 0 0 1 6-6h80a6 6 0 0 1 6 6v44a6 6 0 0 1-6 6H10a6 6 0 0 1-6-6z" fill="#74b9ff" />
    <path d="M4 26a6 6 0 0 1 6-6h80a6 6 0 0 1 6 6v6H4z" fill="#9ccfff" />
  </svg>
);

const file = (ext: string, lines: boolean) => (
  <svg viewBox="0 0 80 100" width="44" height="56">
    <path d="M8 4h44l20 20v68a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4z" fill="#fff" />
    <path d="M52 4v16a4 4 0 0 0 4 4h16" fill="#e5e5ea" />
    {lines ? (
      <path d="M16 40h44M16 50h44M16 60h30" stroke="#c7c7cc" strokeWidth="3" strokeLinecap="round" />
    ) : (
      <>
        <circle cx="40" cy="44" r="10" fill="#c7c7cc" />
        <path d="M22 70a18 14 0 0 1 36 0z" fill="#c7c7cc" />
      </>
    )}
    <text x="40" y="88" textAnchor="middle" fontSize="11" fontWeight="700" fill="#8e8e93" fontFamily="system-ui">
      {ext}
    </text>
  </svg>
);

const ITEMS = [
  { name: "Projects", art: folder, open: "projects" },
  { name: "Research", art: folder, open: "papers" },
  { name: "whoami.txt", art: file("TXT", true), open: "about" },
  { name: "contact.vcf", art: file("VCF", false), open: "mail" },
];

/** A few things left on the desktop, like anyone's Mac. */
export function DesktopIcons() {
  return (
    <ul className="desk-icons" aria-label="Desktop">
      {ITEMS.map((it) => (
        <li key={it.name}>
          <button onClick={() => launch(it.open)} className="desk-icon">
            <span className="flex h-[60px] items-end justify-center">{it.art}</span>
            <span className="desk-label">{it.name}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
