"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } }


var _chunkTTNOYA6Ljs = require('./chunk-TTNOYA6L.js');


var _chunkRUL5H3VHjs = require('./chunk-RUL5H3VH.js');

// src/integrations/react-query/index.ts
async function detectReactQuery() {
  try {
    await Promise.resolve().then(() => _interopRequireWildcard(require(
      /* webpackIgnore: true */
      /* @vite-ignore */
      "@tanstack/react-query"
    )));
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
  _chunkRUL5H3VHjs.emitter.emit("store:update", {
    name,
    sizeKB: totalSizeKB,
    limitKB,
    keys,
    queries: queryInfos
  });
  if (totalSizeKB > limitKB * 0.8) {
    _chunkRUL5H3VHjs.emitter.emit("store:warning", { name, sizeKB: totalSizeKB, limitKB });
  }
}
function monitorQueryClient(client, name = "ReactQuery", limitKB = DEFAULT_LIMIT_KB) {
  const snapshots = [];
  const unsubCache = client.getQueryCache().subscribe(() => {
    buildSnapshot(name, client, limitKB, snapshots);
  });
  _chunkTTNOYA6Ljs.registerStore.call(void 0, name, {
    name,
    type: "cache",
    snapshots,
    unsub: unsubCache
  });
  buildSnapshot(name, client, limitKB, snapshots);
  _chunkRUL5H3VHjs.emitter.emit("integration:ready", { name: "react-query" });
  return () => _chunkTTNOYA6Ljs.unregisterStore.call(void 0, name);
}




exports.detectReactQuery = detectReactQuery; exports.monitorQueryClient = monitorQueryClient;
//# sourceMappingURL=chunk-HEHTJLSO.js.map