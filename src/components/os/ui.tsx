"use client";

import type { ReactNode } from "react";
import type { Block } from "@/content/data";

export function Split({ side, children }: { side: ReactNode; children: ReactNode }) {
  return (
    <div className="flex h-full min-h-0 flex-col md:flex-row">
      <aside className="mac-sidebar shrink-0 overflow-x-auto md:w-[208px] md:overflow-y-auto">{side}</aside>
      <div className="min-h-0 min-w-0 flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}

export function SideHead({ children }: { children: ReactNode }) {
  return <p className="hidden px-3 pt-4 pb-1 text-[11px] font-semibold text-[var(--fg-3)] md:block">{children}</p>;
}

export function SideItem({ on, onClick, children, aside }: { on: boolean; onClick: () => void; children: ReactNode; aside?: ReactNode }) {
  return (
    <button onClick={onClick} aria-current={on || undefined} className={`side-item ${on ? "is-on" : ""}`}>
      <span className="min-w-0 truncate">{children}</span>
      {aside != null && <span className="ml-auto pl-2 text-[11px] tabular-nums opacity-60">{aside}</span>}
    </button>
  );
}

export function Segmented<T extends string | number>({ value, options, onChange }: { value: T; options: { v: T; l: string }[]; onChange: (v: T) => void }) {
  return (
    <div role="tablist" className="segmented">
      {options.map((o) => (
        <button key={o.v} role="tab" aria-selected={value === o.v} onClick={() => onChange(o.v)}>
          {o.l}
        </button>
      ))}
    </div>
  );
}

export function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <div className="space-y-3 text-[15px] leading-relaxed text-[var(--fg-2)]">
      {blocks.map((b, i) =>
        typeof b === "string" ? (
          <p key={i}>{b}</p>
        ) : (
          <ul key={i} className="space-y-1.5">
            {b.list.map((x) => (
              <li key={x} className="flex gap-2.5">
                <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-[var(--fg-3)]" />
                {x}
              </li>
            ))}
          </ul>
        ),
      )}
    </div>
  );
}

export function Stats({ items }: { items: { value: string; label: string; onClick?: () => void }[] }) {
  if (!items.length) return null;
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {items.map((m) => {
        const body = (
          <>
            <span className="block text-[22px] font-semibold tracking-tight text-[var(--fg)]">{m.value}</span>
            <span className="mt-0.5 block text-[12px] leading-snug text-[var(--fg-3)]">{m.label}</span>
          </>
        );
        return m.onClick ? (
          <button key={m.label} onClick={m.onClick} className="stat text-left hover:bg-[var(--hover)]">
            {body}
          </button>
        ) : (
          <div key={m.label} className="stat">
            {body}
          </div>
        );
      })}
    </div>
  );
}

export function Tag({ children }: { children: ReactNode }) {
  return <span className="tag">{children}</span>;
}

export function Section({ title, children, className = "" }: { title: string; children: ReactNode; className?: string }) {
  return (
    <section className={`mt-8 ${className}`}>
      <h3 className="mb-3 text-[13px] font-semibold text-[var(--fg-3)]">{title}</h3>
      {children}
    </section>
  );
}
