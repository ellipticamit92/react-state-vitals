"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } }// src/core/registry.ts
var registry = /* @__PURE__ */ new Map();
function registerStore(name, entry) {
  if (registry.has(name) && process.env.NODE_ENV !== "production") {
    const message = `"${name}" is monitored by both patchContext() and useContextMonitor(). Pick one to avoid duplicate updates.`;
    Promise.resolve().then(() => _interopRequireWildcard(require("./emitter-WKBCF67P.js"))).then(({ emitter }) => {
      emitter.emit("panel:conflict", { name, message });
    });
  }
  registry.set(name, entry);
}
function unregisterStore(name) {
  var _a;
  (_a = registry.get(name)) == null ? void 0 : _a.unsub();
  registry.delete(name);
}
function getRegistry() {
  return registry;
}
function clearRegistry() {
  registry.forEach((entry) => entry.unsub());
  registry.clear();
}






exports.registerStore = registerStore; exports.unregisterStore = unregisterStore; exports.getRegistry = getRegistry; exports.clearRegistry = clearRegistry;
//# sourceMappingURL=chunk-TTNOYA6L.js.map