"use client";

import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { allNodes, edges, leafKey, nodeByKey, pathTo, zoneTarget } from "@/lib/graph";
import { goTo, system, useSystem, type SystemState } from "@/lib/store";

const PAPER = new THREE.Color("#ece7dd");
const DIM = new THREE.Color("#5b5850");
const SIGNAL = new THREE.Color("#ff5a1f");
const PASS = new THREE.Color("#a9c2a6");

/** Which node the scene is about right now. Terminal focus beats scroll position. */
export function activeKey(s: SystemState): string | null {
  if (s.focus) return s.focus;
  if (s.inView) return leafKey(s.inView);
  return zoneTarget[s.zone];
}

const hubClick: Record<string, string> = {
  research: "research",
  models: "loop",
  rag: "rag",
  agents: "easydarshan",
  voice: "voice",
  systems: "engineer",
  products: "build",
  evaluation: "eval",
  workflow: "integrate",
};

// ───────────────────────────────────────── camera
function Rig({ wide }: { wide: boolean }) {
  const { camera } = useThree();
  const target = useRef(new THREE.Vector3(0, 0.6, 0));
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame((_, dt) => {
    const s = system.get();
    const key = activeKey(s);
    const node = key ? nodeByKey[key] : null;
    const leaf = node?.kind === "leaf";

    // overview: whole system, pushed right in the hero so the type has the left half
    const want = node ? new THREE.Vector3(...node.pos) : new THREE.Vector3(wide && s.zone === "hero" ? -6 : 0, 0.5, 0);
    const dist = node ? (leaf ? 11 : 14) : wide && s.zone === "hero" ? 31 : 25;

    const k = 1 - Math.exp(-dt * 2.2);
    target.current.lerp(want, k);
    const px = pointer.current.x * (node ? 0.9 : 1.6);
    const py = -pointer.current.y * (node ? 0.5 : 0.9);
    const desired = new THREE.Vector3(target.current.x + 1.2 + px, target.current.y + 0.9 + py, target.current.z + dist);
    camera.position.lerp(desired, k);
    camera.lookAt(target.current);
  });
  return null;
}

// ───────────────────────────────────────── nodes
function Node({ k, lit, active, born }: { k: string; lit: boolean; active: boolean; born: number }) {
  const n = nodeByKey[k];
  const ref = useRef<THREE.Group>(null);
  const edgeMat = useRef<THREE.LineBasicMaterial>(null);
  const hub = n.kind === "hub";
  const geo = useMemo(() => (hub ? new THREE.BoxGeometry(1.15, 0.28, 0.28) : new THREE.BoxGeometry(0.24, 0.24, 0.24)), [hub]);
  const outline = useMemo(() => new THREE.EdgesGeometry(geo), [geo]);
  const t0 = useRef<number | null>(null);

  useFrame((state) => {
    if (!ref.current) return;
    if (t0.current === null) t0.current = state.clock.elapsedTime;
    // boot: nodes come online in dependency order (top of the system first)
    const p = THREE.MathUtils.clamp((state.clock.elapsedTime - t0.current - born) / 0.35, 0, 1);
    const e = 1 - Math.pow(1 - p, 3);
    ref.current.scale.setScalar(Math.max(e, 0.0001));
    if (edgeMat.current) {
      const want = active ? SIGNAL : lit ? PAPER : DIM;
      edgeMat.current.color.lerp(want, 0.12);
    }
  });

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (n.project) {
      system.focusOn(k);
      goTo(n.project, true);
      window.setTimeout(() => system.run(n.project!), 650);
    } else {
      goTo(hubClick[n.id] ?? "top");
    }
  };

  return (
    <group ref={ref} position={n.pos}>
      <mesh
        geometry={geo}
        onClick={onClick}
        onPointerOver={(e) => (e.stopPropagation(), (document.body.style.cursor = "pointer"))}
        onPointerOut={() => (document.body.style.cursor = "")}
      >
        <meshStandardMaterial
          color={active ? "#3a2318" : "#2a2925"}
          roughness={0.85}
          metalness={0.15}
          emissive={active ? "#ff5a1f" : "#000000"}
          emissiveIntensity={active ? 0.18 : 0}
        />
      </mesh>
      <lineSegments geometry={outline}>
        <lineBasicMaterial ref={edgeMat} color={DIM} transparent opacity={0.9} />
      </lineSegments>
    </group>
  );
}

// ───────────────────────────────────────── edges + packets
const PER_EDGE = 2;

function Wiring({ litEdges, reduce }: { litEdges: Set<string>; reduce: boolean }) {
  const lineGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos: number[] = [];
    for (const e of edges) {
      pos.push(...nodeByKey[e.from].pos, ...nodeByKey[e.to].pos);
    }
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("color", new THREE.Float32BufferAttribute(new Array(edges.length * 6).fill(0.3), 3));
    return g;
  }, []);

  useEffect(() => {
    const col = lineGeo.getAttribute("color") as THREE.BufferAttribute;
    edges.forEach((e, i) => {
      const lit = litEdges.has(`${e.from}>${e.to}`);
      const c = lit ? SIGNAL : e.feedback ? PASS.clone().multiplyScalar(0.55) : DIM.clone().multiplyScalar(0.75);
      col.setXYZ(i * 2, c.r, c.g, c.b);
      col.setXYZ(i * 2 + 1, c.r, c.g, c.b);
    });
    col.needsUpdate = true;
  }, [litEdges, lineGeo]);

  const inst = useRef<THREE.InstancedMesh>(null);
  const count = edges.length * PER_EDGE;
  const phases = useMemo(() => Array.from({ length: count }, (_, i) => (i % PER_EDGE) / PER_EDGE + ((i * 0.6180339) % 1) * 0.3), [count]);
  const tmp = useMemo(() => new THREE.Object3D(), []);
  const a = useMemo(() => new THREE.Vector3(), []);
  const b = useMemo(() => new THREE.Vector3(), []);

  useFrame((state) => {
    const m = inst.current;
    if (!m) return;
    const t = state.clock.elapsedTime;
    edges.forEach((e, ei) => {
      const lit = litEdges.has(`${e.from}>${e.to}`);
      const speed = lit ? 0.55 : 0.09;
      a.set(...nodeByKey[e.from].pos);
      b.set(...nodeByKey[e.to].pos);
      for (let j = 0; j < PER_EDGE; j++) {
        const i = ei * PER_EDGE + j;
        const u = reduce ? 0.5 : (phases[i] + t * speed) % 1;
        tmp.position.lerpVectors(a, b, u);
        // ambient packets on leaf spurs stay hidden; only the backbone carries idle traffic
        const show = lit || (!e.to.startsWith("p:") && !reduce);
        tmp.scale.setScalar(show ? (lit ? 1 : 0.7) : 0);
        tmp.updateMatrix();
        m.setMatrixAt(i, tmp.matrix);
        m.setColorAt(i, lit ? SIGNAL : e.feedback ? PASS : PAPER);
      }
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  });

  return (
    <>
      <lineSegments geometry={lineGeo}>
        <lineBasicMaterial vertexColors transparent opacity={0.85} />
      </lineSegments>
      <instancedMesh ref={inst} args={[undefined, undefined, count]}>
        <boxGeometry args={[0.07, 0.07, 0.07]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
    </>
  );
}

// ───────────────────────────────────────── labels (DOM, projected each frame)
/** DOM label elements, keyed by node; written to directly each frame. */
const labelEls = new Map<string, HTMLDivElement>();

function LabelProjector() {
  const { camera, size } = useThree();
  const v = useMemo(() => new THREE.Vector3(), []);
  useFrame(() => {
    for (const n of allNodes) {
      const el = labelEls.get(n.key);
      if (!el) continue;
      v.set(n.pos[0], n.pos[1] + (n.kind === "hub" ? 0.32 : 0.26), n.pos[2]).project(camera);
      const x = (v.x * 0.5 + 0.5) * size.width;
      const y = (-v.y * 0.5 + 0.5) * size.height;
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -100%)`;
      el.style.visibility = v.z < 1 ? "visible" : "hidden";
    }
  });
  return null;
}

export default function CoreScene() {
  const zone = useSystem((s) => s.zone);
  const key = useSystem(activeKey);
  const reduce = useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, []);
  const wide = useMemo(() => typeof window !== "undefined" && window.innerWidth >= 1100, []);

  const lit = useMemo(() => (key ? pathTo(key) : new Set<string>()), [key]);
  const litNodes = useMemo(() => {
    const s = new Set<string>();
    lit.forEach((e) => e.split(">").forEach((n) => s.add(n)));
    return s;
  }, [lit]);

  // born order: by height, so the system comes online top-down
  const born = useMemo(() => {
    const ys = [...allNodes].sort((a, b) => b.pos[1] - a.pos[1]).map((n) => n.key);
    return Object.fromEntries(ys.map((k, i) => [k, reduce ? 0 : 0.15 + i * 0.045]));
  }, [reduce]);

  const hero = zone === "hero";

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-700"
      style={{ opacity: hero ? 1 : zone === "rest" ? 0.12 : 0.2 }}
      aria-hidden
    >
      <Canvas
        dpr={[1, 1.75]}
        camera={{ fov: 30, position: [0, 1, 26], near: 0.1, far: 80 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ pointerEvents: hero ? "auto" : "none" }}
        frameloop={reduce ? "demand" : "always"}
      >
        <fog attach="fog" args={["#0c0c0b", 18, 42]} />
        <ambientLight intensity={0.18} />
        <directionalLight position={[-5, 8, 6]} intensity={2.2} color="#ffe8cc" />
        <directionalLight position={[6, -3, -4]} intensity={0.3} color="#9fb5c8" />
        <Rig wide={wide} />
        <Wiring litEdges={lit} reduce={reduce} />
        {allNodes.map((n) => (
          <Node key={n.key} k={n.key} lit={litNodes.has(n.key)} active={n.key === key} born={born[n.key]} />
        ))}
        <LabelProjector />
      </Canvas>

      <div className="absolute inset-0 overflow-hidden">
        {allNodes.map((n) => {
          const on = n.key === key;
          const lt = litNodes.has(n.key);
          return (
            <div
              key={n.key}
              ref={(el) => {
                if (el) labelEls.set(n.key, el);
                else labelEls.delete(n.key);
              }}
              className={`absolute left-0 top-0 whitespace-nowrap font-mono uppercase transition-colors duration-300 ${
                n.kind === "hub" ? "text-[11px] tracking-[0.14em]" : "text-[10px] tracking-[0.08em]"
              } ${on ? "text-signal" : lt ? "text-paper" : n.kind === "hub" ? "text-paper-2" : "text-paper-3"}`}
              style={{ visibility: "hidden" }}
            >
              {n.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}
