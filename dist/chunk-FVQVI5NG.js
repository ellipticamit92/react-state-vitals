"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } }


var _chunkTTNOYA6Ljs = require('./chunk-TTNOYA6L.js');


var _chunkRUL5H3VHjs = require('./chunk-RUL5H3VH.js');

// src/integrations/zustand/create.ts
var _zustand = require('zustand');

// src/integrations/zustand/name-context.ts
var pending = null;
function setNameContext(name) {
  pending = name;
}
function takeNameContext() {
  const n = pending;
  pending = null;
  return n;
}

// src/integrations/zustand/create.ts
var DEFAULT_LIMIT_KB = 50;
var storeCount = 0;
function measureKB(state) {
  try {
    return new Blob([JSON.stringify(state)]).size / 1024;
  } catch (e) {
    return 0;
  }
}
function keysOf(state) {
  return state !== null && typeof state === "object" ? Object.keys(state) : [];
}
function create(nameOrInitializer, limitKB = DEFAULT_LIMIT_KB) {
  var _a;
  if (typeof nameOrInitializer === "string") {
    const name2 = nameOrInitializer;
    return (initializer) => buildStore(name2, initializer, limitKB);
  }
  if (nameOrInitializer === void 0) {
    return (initializer) => {
      var _a2;
      const name2 = (_a2 = takeNameContext()) != null ? _a2 : `store${++storeCount}`;
      return buildStore(name2, initializer, limitKB);
    };
  }
  const name = (_a = takeNameContext()) != null ? _a : `store${++storeCount}`;
  return buildStore(name, nameOrInitializer, limitKB);
}
function buildStore(name, initializer, limitKB) {
  const snapshots = [];
  let renderCount = 0;
  const store = _zustand.create.call(void 0, initializer);
  const unsub = store.subscribe((state) => {
    const sizeKB = measureKB(state);
    const keys = keysOf(state);
    snapshots.push({ name, sizeKB, limitKB, keys, updatedAt: Date.now(), renders: renderCount });
    _chunkRUL5H3VHjs.emitter.emit("store:update", { name, sizeKB, limitKB, keys, renders: renderCount });
    if (sizeKB > limitKB * 0.8) {
      _chunkRUL5H3VHjs.emitter.emit("store:warning", { name, sizeKB, limitKB });
    }
  });
  const _subscribe = store.subscribe.bind(store);
  store.subscribe = (listener) => {
    const wrapped = (...args) => {
      renderCount += 1;
      const last = snapshots[snapshots.length - 1];
      if (last) {
        last.renders = renderCount;
        _chunkRUL5H3VHjs.emitter.emit("store:update", {
          name,
          sizeKB: last.sizeKB,
          limitKB,
          keys: last.keys,
          renders: renderCount
        });
      }
      return listener(...args);
    };
    return _subscribe(wrapped);
  };
  _chunkTTNOYA6Ljs.registerStore.call(void 0, name, { name, type: "zustand", snapshots, unsub });
  const initial = store.getState();
  const initSizeKB = measureKB(initial);
  const initKeys = keysOf(initial);
  snapshots.push({ name, sizeKB: initSizeKB, limitKB, keys: initKeys, updatedAt: Date.now(), renders: 0 });
  _chunkRUL5H3VHjs.emitter.emit("store:update", { name, sizeKB: initSizeKB, limitKB, keys: initKeys, renders: 0 });
  return store;
}

// src/integrations/zustand/middleware.ts



var _middleware = require('zustand/middleware');
function devtools(initializer, options) {
  if (options == null ? void 0 : options.name) setNameContext(options.name);
  return _middleware.devtools.call(void 0, initializer, options);
}
function persist(initializer, options) {
  setNameContext(options.name);
  return _middleware.persist.call(void 0, initializer, options);
}

// src/integrations/zustand/monitor.ts
var DEFAULT_LIMIT_KB2 = 50;
function measureKB2(state) {
  try {
    return new Blob([JSON.stringify(state)]).size / 1024;
  } catch (e) {
    return 0;
  }
}
function keysOf2(state) {
  return state !== null && typeof state === "object" ? Object.keys(state) : [];
}
function inferComponentNameFromStack() {
  var _a;
  const fallback = "AnonymousComponent";
  const stack = new Error().stack;
  if (!stack) return fallback;
  const lines = stack.split("\n");
  const ignored = /* @__PURE__ */ new Set([
    "monitorStore",
    "inferComponentNameFromStack",
    "patchedSubscribe"
  ]);
  const ignoredFragments = [
    "node_modules",
    "react-dom",
    "scheduler",
    "__webpack",
    "next/dist"
  ];
  for (const line of lines) {
    if (ignoredFragments.some((f) => line.includes(f))) continue;
    const match = line.match(/at\s+([A-Za-z0-9_$\.]+)/);
    if (!match) continue;
    const raw = match[1];
    const fnName = raw.includes(".") ? (_a = raw.split(".").pop()) != null ? _a : raw : raw;
    if (!fnName || fnName.startsWith("use")) continue;
    if (ignored.has(fnName)) continue;
    if (!/^[A-Z]/.test(fnName)) continue;
    if (fnName === "renderWithHooks" || fnName === "beginWork" || fnName === "commitRoot") continue;
    return fnName;
  }
  return fallback;
}
function monitorStore(name, store, limitKB = DEFAULT_LIMIT_KB2) {
  const snapshots = [];
  let renderCount = 0;
  const componentRenders = /* @__PURE__ */ new Map();
  function getConsumers() {
    return Array.from(componentRenders.entries()).map(([component, renders]) => ({ component, renders })).sort((a, b) => b.renders - a.renders);
  }
  const unsub = store.subscribe((state) => {
    const sizeKB = measureKB2(state);
    const keys = keysOf2(state);
    const consumers = getConsumers();
    const consumerRenders = consumers.reduce((sum, c) => sum + c.renders, 0);
    snapshots.push({ name, sizeKB, limitKB, keys, updatedAt: Date.now(), renders: renderCount, consumerRenders, consumers });
    _chunkRUL5H3VHjs.emitter.emit("store:update", { name, sizeKB, limitKB, keys, renders: renderCount, consumerRenders, consumers });
    if (sizeKB > limitKB * 0.8) {
      _chunkRUL5H3VHjs.emitter.emit("store:warning", { name, sizeKB, limitKB });
    }
  });
  const _subscribe = store.subscribe.bind(store);
  store.subscribe = function patchedSubscribe(listener) {
    const componentName = inferComponentNameFromStack();
    const wrapped = (...args) => {
      var _a;
      renderCount += 1;
      componentRenders.set(componentName, ((_a = componentRenders.get(componentName)) != null ? _a : 0) + 1);
      const last = snapshots[snapshots.length - 1];
      if (last) {
        last.renders = renderCount;
        const consumers = getConsumers();
        const consumerRenders = consumers.reduce((sum, c) => sum + c.renders, 0);
        last.consumers = consumers;
        last.consumerRenders = consumerRenders;
        _chunkRUL5H3VHjs.emitter.emit("store:update", {
          name,
          sizeKB: last.sizeKB,
          limitKB,
          keys: last.keys,
          renders: renderCount,
          consumerRenders,
          consumers
        });
      }
      return listener(...args);
    };
    return _subscribe(wrapped);
  };
  _chunkTTNOYA6Ljs.registerStore.call(void 0, name, { name, type: "zustand", snapshots, unsub });
  const initial = store.getState();
  const initSizeKB = measureKB2(initial);
  const initKeys = keysOf2(initial);
  snapshots.push({ name, sizeKB: initSizeKB, limitKB, keys: initKeys, updatedAt: Date.now(), renders: 0 });
  _chunkRUL5H3VHjs.emitter.emit("store:update", { name, sizeKB: initSizeKB, limitKB, keys: initKeys, renders: 0 });
  return store;
}
function unmonitorStore(name) {
  _chunkTTNOYA6Ljs.unregisterStore.call(void 0, name);
}

// src/integrations/zustand/index.ts
var zustandAvailable = false;
async function detectZustand() {
  try {
    await Promise.resolve().then(() => _interopRequireWildcard(require("zustand")));
    zustandAvailable = true;
    return true;
  } catch (e) {
    return false;
  }
}
function isZustandAvailable() {
  return zustandAvailable;
}









exports.create = create; exports.devtools = devtools; exports.persist = persist; exports.monitorStore = monitorStore; exports.unmonitorStore = unmonitorStore; exports.detectZustand = detectZustand; exports.isZustandAvailable = isZustandAvailable;
//# sourceMappingURL=chunk-FVQVI5NG.js.map