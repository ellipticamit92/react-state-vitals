import React, { useEffect, useState } from "react";
import "./styles.css";
import { emitter } from "../core/emitter";
import { getRegistry } from "../core/registry";
import { getHeapSnapshot, isHeapAvailable } from "../core/memory";
import type { QueryInfo } from "../core/registry";
import {
  getStatus,
  getColor,
  formatKB,
  ACCENT_COLORS,
  HEAP_POLL_MS,
} from "./constants";
import type { Accent, StatusLevel } from "./constants";

/* ------------------ TYPES ------------------ */

interface StoreInfo {
  name: string;
  type: "zustand" | "context" | "cache";
  sizeKB: number;
  limitKB: number;
  keys: string[];
  renders?: number;
  queries?: QueryInfo[];
}

interface HeapInfo {
  usedMB: number;
  totalMB: number;
  limitMB: number;
}

/* ------------------ UI PRIMITIVES ------------------ */

function Dot({
  level,
  colorOverride,
}: {
  level: StatusLevel;
  colorOverride?: string;
}) {
  const { dot } = getColor(level);
  return (
    <span className={`w-1.5 h-1.5 rounded-full ${colorOverride ?? dot}`} />
  );
}

function ProgressBar({
  value,
  max,
  level,
  barColor,
}: {
  value: number;
  max: number;
  level: StatusLevel;
  barColor?: string;
}) {
  const pct = Math.min((value / max) * 100, 100);
  const color = barColor ?? getColor(level).bar;

  return (
    <div className="h-1 w-full bg-gray-700 rounded overflow-hidden">
      <div
        className={`h-full ${color} transition-all duration-500`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function Row({
  name,
  sizeKB,
  limitKB,
  extra,
  accent = "green",
}: {
  name: string;
  sizeKB: number;
  limitKB: number;
  extra?: React.ReactNode;
  accent?: Accent;
}) {
  const level = getStatus(sizeKB, limitKB);
  const { text, bar } = getColor(level);

  const accentColors = ACCENT_COLORS[accent ?? "green"];
  const nameColor = level === "ok" ? accentColors.text : text;
  const barColor = level === "ok" ? accentColors.bar : bar;
  const dotColor = level === "ok" ? accentColors.dot : undefined;

  return (
    <div className="px-2 py-1 rounded hover:bg-gray-800 transition-colors">
      {/* Top row */}
      <div className="flex items-center justify-between text-[10px]">
        <div className="flex items-center gap-1.5 truncate">
          <Dot level={level} colorOverride={dotColor} />
          <span className={`truncate ${nameColor}`}>{name}</span>
        </div>

        <div
          className={`flex items-center gap-2 ${
            level === "ok" ? nameColor : text
          }`}
        >
          {extra}
          <span className="tabular-nums">{formatKB(sizeKB)}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-1">
        <ProgressBar
          value={sizeKB}
          max={limitKB}
          level={level}
          barColor={barColor}
        />
      </div>
    </div>
  );
}

function Section({
  title,
  items,
  render,
}: {
  title: string;
  items: StoreInfo[];
  render: (item: StoreInfo) => React.ReactNode;
}) {
  if (!items.length) return null;

  return (
    <div className="space-y-1">
      <div className="text-[9px] text-slate-400 uppercase px-2">
        {title} ({items.length})
      </div>
      {items.map(render)}
    </div>
  );
}

/* ------------------ ROW SPECIALIZATIONS ------------------ */

function StoreRow({ store, accent }: { store: StoreInfo; accent?: Accent }) {
  return (
    <Row
      name={store.name}
      sizeKB={store.sizeKB}
      limitKB={store.limitKB}
      accent={accent}
      extra={
        store.renders ? (
          <span className="text-cyan-400">
            {store.renders} {store.renders === 1 ? "render" : "renders"}
          </span>
        ) : null
      }
    />
  );
}

function CacheRow({ store }: { store: StoreInfo }) {
  const queries = store.queries ?? [];
  const fetching = queries.filter((q) => q.fetchStatus === "fetching").length;
  const errors = queries.filter((q) => q.status === "error").length;

  return (
    <Row
      name={store.name}
      sizeKB={store.sizeKB}
      limitKB={store.limitKB}
      extra={
        <>
          {fetching > 0 && <span className="text-blue-400">F</span>}
          {errors > 0 && <span className="text-red-400">E</span>}
          <span className="text-gray-400">{queries.length}q</span>
        </>
      }
    />
  );
}

/* ------------------ MAIN PANEL ------------------ */

export function Panel() {
  const [isOpen, setIsOpen] = useState(true);
  const [stores, setStores] = useState<StoreInfo[]>([]);
  const [heap, setHeap] = useState<HeapInfo | null>(null);
  const [conflicts, setConflicts] = useState<
    { name: string; message: string }[]
  >([]);

  useEffect(() => {
    const reg = getRegistry();
    const initial: StoreInfo[] = [];

    reg.forEach((entry, name) => {
      const last = entry.snapshots[entry.snapshots.length - 1];
      if (last) {
        initial.push({
          name,
          type: entry.type,
          sizeKB: last.sizeKB,
          limitKB: last.limitKB,
          keys: last.keys,
          renders: last.renders,
          queries: last.queries,
        });
      }
    });

    setStores(initial);

    const unsubStore = emitter.on(
      "store:update",
      ({ name, sizeKB, limitKB, keys, renders, queries }) => {
        setStores((prev) => {
          const existing = prev.find((s) => s.name === name);
          const type =
            existing?.type ?? getRegistry().get(name)?.type ?? "zustand";

          return [
            ...prev.filter((s) => s.name !== name),
            { name, type, sizeKB, limitKB, keys, renders, queries },
          ];
        });
      }
    );

    let heapInterval: ReturnType<typeof setInterval> | null = null;
    if (isHeapAvailable()) {
      heapInterval = setInterval(() => {
        const snap = getHeapSnapshot();
        if (snap) setHeap(snap);
      }, HEAP_POLL_MS);
    }

    const unsubConflict = emitter.on("panel:conflict", ({ name, message }) => {
      setConflicts((prev) =>
        prev.some((c) => c.name === name) ? prev : [...prev, { name, message }]
      );
    });

    return () => {
      unsubConflict();
      unsubStore();
      if (heapInterval) clearInterval(heapInterval);
    };
  }, []);

  const zustand = stores.filter((s) => s.type === "zustand");
  const context = stores.filter((s) => s.type === "context");
  const cache = stores.filter((s) => s.type === "cache");

  const totalKB =
    stores.reduce((sum, s) => sum + s.sizeKB, 0) +
    (heap ? heap.usedMB * 1024 : 0);
  const totalLimitKB =
    stores.reduce((sum, s) => sum + s.limitKB, 0) +
    (heap ? heap.limitMB * 1024 : 0);
  const totalLevel = getStatus(totalKB, totalLimitKB);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4 z-[9999] flex items-center gap-1.5 rounded-full bg-gray-900 px-2 py-1 text-[10px] text-emerald-400 border border-gray-700"
      >
        <Dot level="ok" />
        StateVitals
      </button>
    );
  }

  return (
    <div className="fixed bottom-3 right-3 z-[9999] w-60 bg-slate-900 border border-slate-700 rounded shadow-xl text-[10px] font-mono text-gray-100">
      {/* Header */}
      <div className="flex justify-between items-center px-2 py-1.5 bg-slate-800 border-b border-slate-700">
        <div>
          <span className="flex items-center gap-1 text-green-400 font-semibold">
            <Dot level="ok" />
            StateVitals
          </span>
          <div className="text-[7px] text-slate-400">Live Memory Monitor</div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-slate-500 hover:text-slate-300"
        >
          ×
        </button>
      </div>

      {/* Conflict warnings */}
      {conflicts.length > 0 && (
        <div className="border-b border-yellow-500/30 bg-yellow-500/10 px-2.5 py-1.5 space-y-1">
          {conflicts.map((c) => (
            <div key={c.name} className="flex items-start gap-1.5">
              <span className="text-yellow-400 mt-px flex-shrink-0">⚠</span>
              <span className="text-yellow-300 text-[9px] leading-snug">
                {c.message}
              </span>
              <button
                onClick={() =>
                  setConflicts((prev) => prev.filter((x) => x.name !== c.name))
                }
                className="ml-auto text-yellow-600 hover:text-yellow-400 flex-shrink-0 leading-none"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Heap */}
      {heap && (
        <div className="px-2 py-2 border-b border-slate-800">
          <div className="flex items-center justify-between text-[9px] mb-1">
            <span className="text-slate-400 uppercase">Heap</span>
            <div className="flex items-center gap-1">
              <span className="text-emerald-400">
                {heap.usedMB.toFixed(1)} MB
              </span>
              <span className="text-slate-600">/ {heap.limitMB} MB</span>
            </div>
          </div>
          <ProgressBar
            value={heap.usedMB}
            max={heap.limitMB}
            level={getStatus(heap.usedMB, heap.limitMB)}
            barColor="bg-gradient-to-r from-amber-400 to-yellow-300"
          />
        </div>
      )}

      {/* Sections */}
      <div className="py-1 space-y-2 max-h-[60vh] overflow-y-auto">
        <Section
          title="Zustand"
          items={zustand}
          render={(s) => <StoreRow key={s.name} store={s} accent="green" />}
        />
        <Section
          title="Context"
          items={context}
          render={(s) => <StoreRow key={s.name} store={s} accent="blue" />}
        />
        <Section
          title="Cache"
          items={cache}
          render={(s) => <CacheRow key={s.name} store={s} />}
        />
      </div>

      {/* Footer — Total */}
      {(stores.length > 0 || heap) && (
        <div className="px-2 py-1 border-t border-slate-700 bg-slate-800/60">
          <div className="flex items-center justify-between text-[10px] mb-1">
            <span className="text-slate-400">Total Size</span>
            <span
              className={`tabular-nums font-semibold ${
                getColor(totalLevel).text
              }`}
            >
              {formatKB(totalKB)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
