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
const DEFAULT_PANEL_HEIGHT = 480;
const MIN_PANEL_WIDTH = 260;
const MIN_PANEL_HEIGHT = 220;
const MAX_HEAP_HISTORY = 60;

/* ------------------ CHARTS (CSS / SVG) ------------------ */

interface ChartSeries {
  data: number[];
  strokeColor: string;
  gradientColor: string;
  gradientId: string;
}

function SparklineChart({
  series,
  width = 200,
  height = 64,
}: {
  series: ChartSeries[];
  width?: number;
  height?: number;
}) {
  const hasData = series.some((s) => s.data.length >= 2);
  if (!hasData) {
    return (
      <div
        style={{ width, height }}
        className="rounded bg-slate-800/50 flex items-center justify-center"
      >
        <span className="text-[9px] text-slate-600">collecting…</span>
      </div>
    );
  }

  const pad = 4;

  // Normalize each series independently to the chart height
  const renderedSeries = series
    .filter((s) => s.data.length >= 2)
    .map((s) => {
      const min = Math.min(...s.data);
      const max = Math.max(...s.data);
      const range = max - min || 1;
      const pts = s.data.map((v, i) => {
        const x = (i / (s.data.length - 1)) * width;
        const y = height - pad - ((v - min) / range) * (height - pad * 2);
        return [x, y] as [number, number];
      });
      return { ...s, pts };
    });

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ overflow: "visible", display: "block" }}
    >
      <defs>
        {renderedSeries.map((s) => (
          <linearGradient key={s.gradientId} id={s.gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={s.gradientColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor={s.gradientColor} stopOpacity="0.0" />
          </linearGradient>
        ))}
      </defs>

      {renderedSeries.map((s) => {
        const fillPoly = [
          `0,${height}`,
          ...s.pts.map(([x, y]) => `${x},${y}`),
          `${width},${height}`,
        ].join(" ");
        const polyline = s.pts.map(([x, y]) => `${x},${y}`).join(" ");
        const last = s.pts[s.pts.length - 1];
        return (
          <g key={s.gradientId}>
            <polygon points={fillPoly} fill={`url(#${s.gradientId})`} />
            <polyline
              points={polyline}
              fill="none"
              stroke={s.strokeColor}
              strokeWidth="1.5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <circle cx={last[0]} cy={last[1]} r="2.5" fill={s.strokeColor} />
          </g>
        );
      })}
    </svg>
  );
}

function CircularGauge({
  pct,
  label,
  size = 72,
}: {
  pct: number;
  label: string;
  size?: number;
}) {
  const clamped = Math.min(Math.max(pct, 0), 100);
  const color =
    clamped > 90 ? "#f87171" : clamped > 70 ? "#facc15" : "#06b6d4";
  const trackColor = "#1e293b";
  const inner = Math.round(size * 0.72);

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          background: `conic-gradient(${color} 0% ${clamped}%, ${trackColor} ${clamped}% 100%)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: inner,
            height: inner,
            borderRadius: "50%",
            background: "#0f172a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color,
              fontFamily: "monospace",
            }}
          >
            {clamped.toFixed(1)}%
          </span>
        </div>
      </div>
      <span className="text-[9px] text-slate-400 text-center leading-tight">
        {label}
      </span>
    </div>
  );
}

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
      className={`w-1.5 h-1.5 rounded-full ${className ?? ""} ${
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

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      style={{
        transform: open ? "rotate(0deg)" : "rotate(-90deg)",
        transition: "transform 0.15s ease",
      }}
    >
      <polyline
        points="1,3 5,7 9,3"
        fill="none"
        stroke="#94a3b8"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Collapsible({
  title,
  open,
  onToggle,
  children,
}: {
  title: React.ReactNode;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div>
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-1.5 px-2 py-1.5 hover:bg-slate-800/60 transition-colors text-left"
      >
        <ChevronIcon open={open} />
        {title}
      </button>
      {open && children}
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
      <div className="flex items-center justify-between text-[10px]">
        <div className="flex min-w-0 flex-1 items-center gap-1.5 truncate">
          <Dot level={level} colorOverride={dotColor} />
          <span className={`truncate ${nameColor}`}>{name}</span>
        </div>
        <span
          className={`tabular-nums pl-2 ${level === "ok" ? nameColor : text}`}
        >
          {formatKB(sizeKB)}
          {limitKB > 0 && (
            <span className="text-slate-500">/{formatKB(limitKB)}</span>
          )}
        </span>
      </div>

      {extra ? (
        <div className="mt-1 flex flex-wrap items-center justify-end gap-2 text-[9px]">
          {extra}
        </div>
      ) : null}

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
  open,
  onToggle,
}: {
  title: string;
  items: StoreInfo[];
  render: (item: StoreInfo) => React.ReactNode;
  open: boolean;
  onToggle: () => void;
}) {
  if (!items.length) return null;

  return (
    <Collapsible
      open={open}
      onToggle={onToggle}
      title={
        <span className="text-[11px] text-slate-300 font-semibold uppercase tracking-wide">
          {title}{" "}
          <span className="text-slate-500 font-normal">({items.length})</span>
        </span>
      }
    >
      <div className="space-y-0.5 pb-1">{items.map(render)}</div>
    </Collapsible>
  );
}

/* ------------------ ROW SPECIALIZATIONS ------------------ */

function StoreRow({ store, accent = "green" }: { store: StoreInfo; accent?: Accent }) {
  const consumers = store.consumers ?? [];
  const level = getStatus(store.sizeKB, store.limitKB);
  const { text, bar } = getColor(level);
  const accentColors = ACCENT_COLORS[accent];
  const nameColor = level === "ok" ? accentColors.text : text;
  const barColor = level === "ok" ? accentColors.bar : bar;
  const dotColor = level === "ok" ? accentColors.dot : undefined;

  return (
    <div className="px-2 py-1 rounded hover:bg-gray-800 transition-colors">
      <div className="flex items-center justify-between text-[10px]">
        <div className="flex min-w-0 flex-1 items-center gap-1.5 truncate">
          <Dot level={level} colorOverride={dotColor} />
          <span className={`truncate ${nameColor}`}>{store.name}</span>
        </div>
        <span className={`tabular-nums pl-2 ${level === "ok" ? nameColor : text}`}>
          {formatKB(store.sizeKB)}
          {store.limitKB > 0 && (
            <span className="text-slate-500">/{formatKB(store.limitKB)}</span>
          )}
        </span>
      </div>

      {store.renders ? (
        <div className="mt-1 flex flex-wrap items-center justify-end gap-2 text-[9px]">
          <span className="text-cyan-400">
            {store.renders} {store.renders === 1 ? "render" : "renders"}
          </span>
        </div>
      ) : null}

      <div className="mt-1">
        <ProgressBar
          value={store.sizeKB}
          max={store.limitKB}
          level={level}
          barColor={barColor}
        />
      </div>

      {consumers.length > 0 && (
        <div className="mt-1.5 space-y-0.5">
          {consumers.map((consumer) => (
            <div
              key={consumer.component}
              className="flex items-center justify-between text-[9px] px-1"
            >
              <span className="text-slate-400 truncate">
                – {consumer.component}
              </span>
              <span className="tabular-nums text-cyan-500 pl-2 shrink-0">
                {consumer.renders}×
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
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
      <div className="flex items-center justify-between text-[10px]">
        <div className="flex min-w-0 flex-1 items-center gap-1.5 truncate">
          <Dot level={level} colorOverride={dotColor} />
          <span className={`truncate ${nameColor}`}>{store.name}</span>
        </div>
        <span className={`tabular-nums pl-2 ${nameColor}`}>
          {formatKB(store.sizeKB)}
          {store.renders ? (
            <span className="text-slate-500 ml-1">
              {store.renders} {store.renders === 1 ? "render" : "renders"}
            </span>
          ) : null}
        </span>
      </div>

      {store.consumerRenders ? (
        <div className="mt-0.5 text-[9px] text-violet-400">
          {store.consumerRenders} consumer{" "}
          {store.consumerRenders === 1 ? "render" : "renders"}
        </div>
      ) : null}

      <div className="mt-1">
        <ProgressBar
          value={store.sizeKB}
          max={store.limitKB}
          level={level}
          barColor={barColor}
        />
      </div>

      {consumers.length > 0 ? (
        <div className="mt-1.5 space-y-0.5">
          {consumers.map((consumer) => (
            <div
              key={consumer.component}
              className="flex items-center justify-between text-[9px] px-1"
            >
              <span className="text-slate-400 truncate">
                – {consumer.component}
              </span>
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
  const storesRef = useRef<StoreInfo[]>([]);
  const [heap, setHeap] = useState<HeapInfo | null>(null);
  const [heapHistory, setHeapHistory] = useState<number[]>([]);
  const [statesHistory, setStatesHistory] = useState<number[]>([]);
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
  const [memoryOpen, setMemoryOpen] = useState(true);
  const [statesOpen, setStatesOpen] = useState(true);
  const [zustandOpen, setZustandOpen] = useState(true);
  const [contextOpen, setContextOpen] = useState(true);
  const [cacheOpen, setCacheOpen] = useState(true);

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

    storesRef.current = initial;
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

          const next = [
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
          storesRef.current = next;
          return next;
        });
      }
    );

    const heapInterval = setInterval(() => {
      if (isHeapAvailable()) {
        const snap = getHeapSnapshot();
        if (snap) {
          setHeap(snap);
          setHeapHistory((prev) =>
            [...prev, snap.usedMB].slice(-MAX_HEAP_HISTORY)
          );
        }
      }
      const totalStatesKB = storesRef.current.reduce((sum, s) => sum + s.sizeKB, 0);
      if (storesRef.current.length > 0) {
        setStatesHistory((prev) =>
          [...prev, totalStatesKB].slice(-MAX_HEAP_HISTORY)
        );
      }
    }, heapPollMs);

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

  const heapPct = heap ? (heap.usedMB / heap.limitMB) * 100 : 0;

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4 z-[9999] flex items-center gap-1.5 rounded-full bg-gray-900 px-2 py-1 text-sm text-emerald-400 border border-gray-700"
      >
        <Dot level="ok" className="w-2 h-2" />
        StateVitals
      </button>
    );
  }

  return (
    <div
      ref={panelRef}
      className="fixed z-[9999] flex flex-col bg-slate-900 border border-slate-700/80 rounded-lg shadow-2xl font-mono text-gray-100 overflow-hidden"
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
      {/* ── Header ── */}
      <div
        className="flex items-center justify-between px-3 py-2 bg-slate-800 border-b border-slate-700/80 shrink-0"
        style={{ cursor: dragging ? "grabbing" : "move" }}
        onMouseDown={onHeaderMouseDown}
      >
        <div className="flex items-center gap-2">
          {/* Hamburger */}
          <svg width="14" height="12" viewBox="0 0 14 12" fill="none">
            {[0, 4, 8].map((y) => (
              <line
                key={y}
                x1="0"
                y1={y + 1}
                x2="14"
                y2={y + 1}
                stroke="#94a3b8"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            ))}
          </svg>
          <span className="text-[13px] font-semibold text-slate-100">
            StateVitals Monitor
          </span>
        </div>
        <div className="flex items-center gap-1" onMouseDown={(e) => e.stopPropagation()}>
          <button
            onClick={() => setIsOpen(false)}
            className="w-5 h-5 flex items-center justify-center rounded text-slate-500 hover:text-slate-300 hover:bg-slate-700 text-base leading-none"
            title="Minimize"
          >
            –
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="w-5 h-5 flex items-center justify-center rounded text-slate-500 hover:text-red-400 hover:bg-slate-700 text-base leading-none"
            title="Close"
          >
            ×
          </button>
        </div>
      </div>

      {/* ── Conflict warnings ── */}
      {conflicts.length > 0 && (
        <div className="border-b border-yellow-500/30 bg-yellow-500/10 px-2.5 py-1.5 space-y-1 shrink-0">
          {conflicts.map((c) => (
            <div key={c.name} className="flex items-start gap-1.5">
              <span className="text-yellow-400 mt-px flex-shrink-0">⚠</span>
              <span className="text-yellow-300 text-[8px] leading-snug">
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

      {/* ── Scrollable body ── */}
      <div className="flex-1 min-h-0 overflow-y-auto">

        {/* Memory section */}
        {(heap || statesHistory.length > 0) && (
          <Collapsible
            open={memoryOpen}
            onToggle={() => setMemoryOpen((v) => !v)}
            title={
              <span className="text-[11px] text-slate-300 font-semibold uppercase tracking-wide">
                Memory
              </span>
            }
          >
            <div className="px-2 pb-2">
              {/* Stat row */}
              <div className="flex items-center gap-3 mb-2 text-[10px]">
                {heap && (
                  <>
                    <span className="text-slate-400">
                      Total:{" "}
                      <span className="text-emerald-400 font-semibold">
                        {heap.totalMB.toFixed(0)}MB
                      </span>
                    </span>
                    <span className="flex items-center gap-1 text-slate-400">
                      <span className="inline-block w-2 h-0.5 rounded" style={{ background: "#22d3ee" }} />
                      Heap:{" "}
                      <span className="text-cyan-400 font-semibold">
                        {heap.usedMB.toFixed(0)}MB
                      </span>
                    </span>
                  </>
                )}
                {statesHistory.length > 0 && (
                  <span className="flex items-center gap-1 text-slate-400">
                    <span className="inline-block w-2 h-0.5 rounded" style={{ background: "#34d399" }} />
                    States:{" "}
                    <span className="text-emerald-400 font-semibold">
                      {formatKB(statesHistory[statesHistory.length - 1] ?? 0)}
                    </span>
                  </span>
                )}
              </div>

              {/* Chart + gauge row */}
              <div
                className="flex items-center gap-2 rounded-md overflow-hidden"
                style={{ background: "rgba(15,23,42,0.7)", padding: "8px" }}
              >
                {/* Sparkline stretches */}
                <div className="flex-1 min-w-0">
                  <SparklineChart
                    series={[
                      ...(heapHistory.length >= 2 ? [{
                        data: heapHistory,
                        strokeColor: "#22d3ee",
                        gradientColor: "#06b6d4",
                        gradientId: "svGradHeap",
                      }] : []),
                      ...(statesHistory.length >= 2 ? [{
                        data: statesHistory,
                        strokeColor: "#34d399",
                        gradientColor: "#10b981",
                        gradientId: "svGradStates",
                      }] : []),
                    ]}
                    width={panelSize.width - 140}
                    height={64}
                  />
                </div>

                {/* Circular gauge */}
                {heap && <CircularGauge pct={heapPct} label="Heap Usage" size={72} />}
              </div>
            </div>
          </Collapsible>
        )}

        {/* Divider between memory and states */}
        {(heap || statesHistory.length > 0) && stores.length > 0 && (
          <div className="border-t border-slate-800 mx-2" />
        )}

        {/* Active States */}
        {stores.length > 0 && (
          <Collapsible
            open={statesOpen}
            onToggle={() => setStatesOpen((v) => !v)}
            title={
              <span className="text-[11px] text-slate-300 font-semibold uppercase tracking-wide">
                Active States
              </span>
            }
          >
            <div className="space-y-2 pb-2">
              {zustand.length > 0 && (
                <Section
                  title="Zustand"
                  items={zustand}
                  render={(s) => (
                    <StoreRow key={s.name} store={s} accent="green" />
                  )}
                  open={zustandOpen}
                  onToggle={() => setZustandOpen((v) => !v)}
                />
              )}
              {context.length > 0 && (
                <Section
                  title="React Context"
                  items={context}
                  render={(s) => <ContextRow key={s.name} store={s} />}
                  open={contextOpen}
                  onToggle={() => setContextOpen((v) => !v)}
                />
              )}
              {cache.length > 0 && (
                <Section
                  title="Cache"
                  items={cache}
                  render={(s) => <CacheRow key={s.name} store={s} />}
                  open={cacheOpen}
                  onToggle={() => setCacheOpen((v) => !v)}
                />
              )}
            </div>
          </Collapsible>
        )}

      </div>

      {/* ── Footer total ── */}
      {(stores.length > 0 || heap) && (
        <div className="px-3 py-1.5 border-t border-slate-700 bg-slate-800/60 shrink-0">
          <div className="flex items-center justify-between text-[10px]">
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

      {/* ── Resize handle ── */}
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
