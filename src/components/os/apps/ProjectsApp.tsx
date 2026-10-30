"use client";

import { useState } from "react";
import { projects, worlds, type WorldId } from "@/content/data";
import { Icon } from "../Icon";
import { launch, projectIcon } from "../registry";
import { SideHead, SideItem, Split } from "../ui";

/** Finder: every project is a document; click to open it in its own window. */
export function ProjectsApp() {
  const [where, setWhere] = useState<WorldId | "all">("all");
  const [view, setView] = useState<"grid" | "list">("grid");
  const shown = where === "all" ? projects : projects.filter((p) => p.world === where);
  const here = worlds.find((w) => w.id === where);

  return (
    <Split
      side={
        <nav className="flex gap-1 p-2 md:block md:space-y-px">
          <SideHead>Favorites</SideHead>
          <SideItem on={where === "all"} onClick={() => setWhere("all")} aside={projects.length}>
            All Projects
          </SideItem>
          <SideHead>Worlds</SideHead>
          {worlds.map((w) => (
            <SideItem key={w.id} on={where === w.id} onClick={() => setWhere(w.id)} aside={projects.filter((p) => p.world === w.id).length}>
              {w.name}
            </SideItem>
          ))}
        </nav>
      }
    >
      <div className="flex items-center justify-between gap-4 px-5 pt-4 pb-2">
        <div className="min-w-0">
          <h2 className="text-[15px] font-semibold">{here?.name ?? "All Projects"}</h2>
          <p className="truncate text-[12px] text-[var(--fg-3)]">{here?.theme ?? "Products, production systems, research"}</p>
        </div>
        <div className="segmented shrink-0" role="group" aria-label="View">
          <button aria-pressed={view === "grid"} onClick={() => setView("grid")}>
            Icons
          </button>
          <button aria-pressed={view === "list"} onClick={() => setView("list")}>
            List
          </button>
        </div>
      </div>

      {view === "grid" ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(124px,1fr))] gap-x-2 gap-y-5 p-5">
          {shown.map((p) => (
            <button key={p.id} onClick={() => launch(`project:${p.id}`)} className="file group">
              <Icon spec={projectIcon(p.id)} size={60} />
              <span className="mt-2 line-clamp-2 rounded px-1.5 text-center text-[12px] leading-tight group-hover:bg-[var(--hover)]">{p.title}</span>
              <span className="text-[11px] text-[var(--fg-3)]">{p.code}</span>
            </button>
          ))}
        </div>
      ) : (
        <table className="mx-3 mb-4 w-[calc(100%-24px)] text-left text-[13px]">
          <thead className="text-[11px] text-[var(--fg-3)]">
            <tr>
              <th className="px-2 py-1.5 font-medium">Name</th>
              <th className="hidden px-2 py-1.5 font-medium sm:table-cell">Kind</th>
              <th className="hidden px-2 py-1.5 font-medium md:table-cell">Where</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((p) => (
              <tr key={p.id} onClick={() => launch(`project:${p.id}`)} className="row cursor-pointer">
                <td className="px-2 py-1.5">
                  {/* the row click is a mouse convenience; the button is what keyboards reach */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      launch(`project:${p.id}`);
                    }}
                    className="flex items-center gap-2 text-left"
                  >
                    <Icon spec={projectIcon(p.id)} size={20} />
                    {p.title}
                  </button>
                </td>
                <td className="hidden px-2 py-1.5 text-[var(--fg-3)] capitalize sm:table-cell">{p.world}</td>
                <td className="hidden px-2 py-1.5 text-[var(--fg-3)] md:table-cell">{p.meta[0]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Split>
  );
}
