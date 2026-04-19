// src/core/registry.ts
var registry = /* @__PURE__ */ new Map();
function registerStore(name, entry) {
  if (registry.has(name) && process.env.NODE_ENV !== "production") {
    const message = `"${name}" is monitored by both patchContext() and useContextMonitor(). Pick one to avoid duplicate updates.`;
    import("./emitter-SHOPBORE.mjs").then(({ emitter }) => {
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

export {
  registerStore,
  unregisterStore,
  getRegistry,
  clearRegistry
};
//# sourceMappingURL=chunk-2XICOHHQ.mjs.map