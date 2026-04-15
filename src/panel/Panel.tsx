import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import "./styles.css";
import { emitter } from "../core/emitter";
import { getRegistry } from "../core/registry";
import { getHeapSnapshot, isHeapAvailable } from "../core/memory";
import type { ContextConsumerRender, QueryInfo } from "../core/registry";
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
  consumerRenders?: number;
  consumers?: ContextConsumerRender[];
  queries?: QueryInfo[];
}

interface HeapInfo {
  usedMB: number;
  totalMB: number;
  limitMB: number;
}

interface PanelSize {
  width: number;
  height: number;
}

const DEFAULT_PANEL_WIDTH = 360;
const DEFAULT_PANEL_HEIGHT = 380;
const MIN_PANEL_WIDTH = 260;
const MIN_PANEL_HEIGHT = 220;

/* ------------------ UI PRIMITIVES ------------------ */

function Dot({
  level,
  colorOverride,
  className,
}: {
  level: StatusLevel;
  colorOverride?: string;
  className?: string;
}) {
  const { dot } = getColor(level);
  return (
    <span
      className={`w-1.5 h-1.5 rounded-full ${className} ${
        colorOverride ?? dot
      }`}
    />
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
        <div className="flex min-w-0 flex-1 items-center gap-1.5 truncate">
          <Dot level={level} colorOverride={dotColor} />
          <span className={`truncate ${nameColor}`}>{name}</span>
        </div>

        <span
          className={`tabular-nums pl-2 ${level === "ok" ? nameColor : text}`}
        >
          {formatKB(sizeKB)}
        </span>
      </div>

      {extra ? (
        <div className="mt-1 flex flex-wrap items-center justify-end gap-2 text-[9px]">
          {extra}
        </div>
      ) : null}

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
      <div className="text-[12px] text-slate-400 uppercase px-2">
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

function ContextRow({ store }: { store: StoreInfo }) {
  const consumers = store.consumers ?? [];
  const level = getStatus(store.sizeKB, store.limitKB);
  const accentColors = ACCENT_COLORS["blue"];
  const nameColor = level === "ok" ? accentColors.text : getColor(level).text;
  const barColor = level === "ok" ? accentColors.bar : getColor(level).bar;
  const dotColor = level === "ok" ? accentColors.dot : undefined;

  return (
    <div className="px-2 py-1 rounded hover:bg-gray-800 transition-colors">
      {/* Name + size */}
      <div className="flex items-center justify-between text-[10px]">
        <div className="flex min-w-0 flex-1 items-center gap-1.5 truncate">
          <Dot level={level} colorOverride={dotColor} />
          <span className={`truncate ${nameColor}`}>{store.name}</span>
        </div>
        <span className={`tabular-nums pl-2 ${nameColor}`}>
          {formatKB(store.sizeKB)}
        </span>
      </div>

      {/* Provider renders + total consumer renders */}
      {(store.renders || store.consumerRenders) ? (
        <div className="mt-1 flex items-center gap-2 text-[9px]">
          {store.renders ? (
            <span className="text-violet-400">
              {store.renders} {store.renders === 1 ? "render" : "renders"}
            </span>
          ) : null}
          {store.consumerRenders ? (
            <span className="text-cyan-400">
              {store.consumerRenders} consumer {store.consumerRenders === 1 ? "render" : "renders"}
            </span>
          ) : null}
        </div>
      ) : null}

      {/* Progress bar */}
      <div className="mt-1">
        <ProgressBar
          value={store.sizeKB}
          max={store.limitKB}
          level={level}
          barColor={barColor}
        />
      </div>

      {/* All consumer components */}
      {consumers.length > 0 ? (
        <div className="mt-1.5 space-y-0.5">
          {consumers.map((consumer) => (
            <div
              key={consumer.component}
              className="flex items-center justify-between text-[9px] px-1"
            >
              <span className="text-slate-300 truncate">{consumer.component}</span>
              <span className="tabular-nums text-cyan-500 pl-2 shrink-0">
                {consumer.renders}×
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
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
      accent="purple"
      extra={
        <>
          {fetching > 0 && (
            <span className="text-blue-400">{fetching} fetching</span>
          )}
          {errors > 0 && <span className="text-red-400">{errors} err</span>}
          <span className="text-gray-400">{queries.length} queries</span>
        </>
      }
    />
  );
}

/* ------------------ MAIN PANEL ------------------ */

interface PanelProps {
  heapPollMs?: number;
}

export function Panel({ heapPollMs = HEAP_POLL_MS }: PanelProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [stores, setStores] = useState<StoreInfo[]>([]);
  const [heap, setHeap] = useState<HeapInfo | null>(null);
  const [conflicts, setConflicts] = useState<
    { name: string; message: string }[]
  >([]);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [panelSize, setPanelSize] = useState<PanelSize>({
    width: DEFAULT_PANEL_WIDTH,
    height: DEFAULT_PANEL_HEIGHT,
  });
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);
  const resizeRef = useRef<{
    startX: number;
    startY: number;
    origWidth: number;
    origHeight: number;
  } | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (panelRef.current && pos === null) {
      const h = panelRef.current.offsetHeight;
      const w = panelRef.current.offsetWidth;
      setPos({
        x: window.innerWidth - w - 15,
        y: window.innerHeight - h - 20,
      });
    }
  });

  const snapToNearestCorner = (x: number, y: number) => {
    const panel = panelRef.current;
    const pw = panel ? panel.offsetWidth : 288;
    const ph = panel ? panel.offsetHeight : 300;
    const margin = 12;
    const snapX =
      x + pw / 2 < window.innerWidth / 2
        ? margin
        : window.innerWidth - pw - margin;
    const snapY =
      y + ph / 2 < window.innerHeight / 2
        ? margin
        : window.innerHeight - ph - margin;
    setPos({ x: snapX, y: snapY });
  };

  const onHeaderMouseDown = (e: React.MouseEvent) => {
    if (!pos) return;
    e.preventDefault();
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: pos.x,
      origY: pos.y,
    };
    setDragging(true);

    let lastX = pos.x;
    let lastY = pos.y;

    const onMouseMove = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      lastX = Math.max(
        0,
        Math.min(
          dragRef.current.origX + ev.clientX - dragRef.current.startX,
          window.innerWidth - panelSize.width
        )
      );
      lastY = Math.max(
        0,
        Math.min(
          dragRef.current.origY + ev.clientY - dragRef.current.startY,
          window.innerHeight - 40
        )
      );
      setPos({ x: lastX, y: lastY });
    };

    const onMouseUp = () => {
      dragRef.current = null;
      setDragging(false);
      snapToNearestCorner(lastX, lastY);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  const onResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    resizeRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origWidth: panelSize.width,
      origHeight: panelSize.height,
    };
    setResizing(true);

    const onMouseMove = (ev: MouseEvent) => {
      if (!resizeRef.current || !pos) return;
      const maxWidth = Math.max(MIN_PANEL_WIDTH, window.innerWidth - pos.x - 8);
      const maxHeight = Math.max(
        MIN_PANEL_HEIGHT,
        window.innerHeight - pos.y - 8
      );
      const nextWidth = Math.min(
        maxWidth,
        Math.max(
          MIN_PANEL_WIDTH,
          resizeRef.current.origWidth + (ev.clientX - resizeRef.current.startX)
        )
      );
      const nextHeight = Math.min(
        maxHeight,
        Math.max(
          MIN_PANEL_HEIGHT,
          resizeRef.current.origHeight + (ev.clientY - resizeRef.current.startY)
        )
      );

      setPanelSize({ width: nextWidth, height: nextHeight });
    };

    const onMouseUp = () => {
      resizeRef.current = null;
      setResizing(false);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

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
          consumerRenders: last.consumerRenders,
          consumers: last.consumers,
          queries: last.queries,
        });
      }
    });

    setStores(initial);

    const unsubStore = emitter.on(
      "store:update",
      ({
        name,
        sizeKB,
        limitKB,
        keys,
        renders,
        consumerRenders,
        consumers,
        queries,
      }) => {
        setStores((prev) => {
          const existing = prev.find((s) => s.name === name);
          const type =
            existing?.type ?? getRegistry().get(name)?.type ?? "zustand";

          return [
            ...prev.filter((s) => s.name !== name),
            {
              name,
              type,
              sizeKB,
              limitKB,
              keys,
              renders,
              consumerRenders: consumerRenders ?? existing?.consumerRenders,
              consumers: consumers ?? existing?.consumers,
              queries,
            },
          ];
        });
      }
    );

    let heapInterval: ReturnType<typeof setInterval> | null = null;
    if (isHeapAvailable()) {
      heapInterval = setInterval(() => {
        const snap = getHeapSnapshot();
        if (snap) setHeap(snap);
      }, heapPollMs);
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
  }, [heapPollMs]);

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
        className="fixed top-4 right-4 z-[9999] flex items-center gap-1.5 rounded-full bg-gray-900 px-2 py-1 text-xl text-emerald-400 border border-gray-700"
      >
        <Dot level="ok" className="w-2 h-2" />
        StateVitals
      </button>
    );
  }

  return (
    <div
      ref={panelRef}
      className="fixed right-3 z-[9999] flex flex-col bg-slate-900 border border-slate-700 rounded shadow-xl font-mono text-gray-100"
      style={{
        left: pos?.x ?? 0,
        top: pos?.y ?? 0,
        width: panelSize.width,
        height: panelSize.height,
        visibility: pos ? "visible" : "hidden",
        transition:
          dragging || resizing ? "none" : "left 0.2s ease, top 0.2s ease",
      }}
    >
      {/* Header */}
      <div
        className="flex justify-between items-center px-2 py-1.5 bg-slate-800 border-b border-slate-700"
        style={{ cursor: dragging ? "grabbing" : "move" }}
        onMouseDown={onHeaderMouseDown}
      >
        <div>
          <span className="flex items-center gap-1 text-green-400 font-semibold text-lg">
            <Dot level="ok" />
            StateVitals
          </span>
          <div className="text-[12px] text-slate-400">Live Memory Monitor</div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          onMouseDown={(e) => e.stopPropagation()}
          className="text-slate-500 hover:text-slate-300 text-2xl"
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
                className="ml-auto text-base text-yellow-600 hover:text-yellow-400 flex-shrink-0 leading-none"
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
          <div className="flex items-center justify-between text-[12px] mb-1">
            <span className="text-slate-400 uppercase">Heap</span>
            <div className="flex items-center gap-1">
              <span className="text-emerald-400">
                {heap.usedMB.toFixed(1)} MB
              </span>
              <span className="text-slate-400">/ {heap.limitMB} MB</span>
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
      <div className="py-1 space-y-2 flex-1 min-h-0 overflow-y-auto">
        <Section
          title="Zustand"
          items={zustand}
          render={(s) => <StoreRow key={s.name} store={s} accent="green" />}
        />
        <Section
          title="Context"
          items={context}
          render={(s) => <ContextRow key={s.name} store={s} />}
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

      <button
        type="button"
        aria-label="Resize panel"
        onMouseDown={onResizeMouseDown}
        className="absolute bottom-0 right-0 h-4 w-4 cursor-se-resize bg-transparent"
      >
        <span className="absolute bottom-1 right-1 h-2 w-2 border-r border-b border-slate-500" />
      </button>
    </div>
  );
}
