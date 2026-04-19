import {
  registerStore,
  unregisterStore
} from "./chunk-2XICOHHQ.mjs";
import {
  emitter
} from "./chunk-BOILOT55.mjs";

// src/integrations/react-query/index.ts
async function detectReactQuery() {
  try {
    await import(
      /* webpackIgnore: true */
      /* @vite-ignore */
      "@tanstack/react-query"
    );
    return true;
  } catch (e) {
    return false;
  }
}
var DEFAULT_LIMIT_KB = 1024;
function measureKB(value) {
  try {
    return new Blob([JSON.stringify(value)]).size / 1024;
  } catch (e) {
    return 0;
  }
}
function serializeKey(queryKey) {
  try {
    return JSON.stringify(queryKey);
  } catch (e) {
    return String(queryKey);
  }
}
function buildSnapshot(name, client, limitKB, snapshots) {
  const queries = client.getQueryCache().getAll();
  const queryInfos = queries.map((q) => {
    var _a, _b;
    const sizeKB = measureKB(q.state.data);
    const rawStatus = q.state.status;
    const status = rawStatus === "success" ? "success" : rawStatus === "error" ? "error" : "pending";
    const rawFetch = (_a = q.state.fetchStatus) != null ? _a : "idle";
    const fetchStatus = rawFetch === "fetching" ? "fetching" : rawFetch === "paused" ? "paused" : "idle";
    return {
      key: serializeKey(q.queryKey),
      sizeKB,
      status,
      fetchStatus,
      isStale: q.isStale(),
      observers: q.observers.length,
      updatedAt: (_b = q.state.dataUpdatedAt) != null ? _b : Date.now()
    };
  });
  const totalSizeKB = queryInfos.reduce((sum, q) => sum + q.sizeKB, 0);
  const keys = queryInfos.map((q) => q.key);
  const snapshot = {
    name,
    sizeKB: totalSizeKB,
    limitKB,
    keys,
    updatedAt: Date.now(),
    queries: queryInfos
  };
  snapshots.push(snapshot);
  emitter.emit("store:update", {
    name,
    sizeKB: totalSizeKB,
    limitKB,
    keys,
    queries: queryInfos
  });
  if (totalSizeKB > limitKB * 0.8) {
    emitter.emit("store:warning", { name, sizeKB: totalSizeKB, limitKB });
  }
}
function monitorQueryClient(client, name = "ReactQuery", limitKB = DEFAULT_LIMIT_KB) {
  const snapshots = [];
  const unsubCache = client.getQueryCache().subscribe(() => {
    buildSnapshot(name, client, limitKB, snapshots);
  });
  registerStore(name, {
    name,
    type: "cache",
    snapshots,
    unsub: unsubCache
  });
  buildSnapshot(name, client, limitKB, snapshots);
  emitter.emit("integration:ready", { name: "react-query" });
  return () => unregisterStore(name);
}

export {
  detectReactQuery,
  monitorQueryClient
};
//# sourceMappingURL=chunk-BPCINUOV.mjs.map