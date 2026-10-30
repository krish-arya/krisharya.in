/**
 * Runs before first paint (inlined by layout.tsx). Plain module, no "use client":
 * a server component can only import real values from here.
 */
export const PREFS_KEY = "ka.prefs";
export const UNLOCK_KEY = "ka.unlocked";
export const DEFAULT_WALL = "ember";

/** Mirrors apply() in lib/prefs.ts: resolved theme, wallpaper and accent on <html>, so there's no flash. */
const prefs = `try{var p=JSON.parse(localStorage.getItem('${PREFS_KEY}')||'{}'),d=document.documentElement,a=p.appearance||'auto';d.dataset.theme=a==='auto'?(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):a;d.dataset.wall=p.wallpaper||'${DEFAULT_WALL}';if(p.accent)d.style.setProperty('--accent',p.accent)}catch(e){document.documentElement.dataset.theme='light'}`;

/** Deep links, reduced motion and visitors who already unlocked this session skip the boot and lock screens. */
const boot = `try{if(location.hash.length>1||sessionStorage.getItem('${UNLOCK_KEY}')||matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.dataset.boot='skip'}catch(e){}`;

export const PREPAINT = prefs + boot;
