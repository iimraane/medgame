export function isCampusDesktop(viewportWidth) {
  return viewportWidth >= 1024;
}

export function createPanelRequestGuard() {
  let version = 0;
  return {
    request: () => ++version,
    cancel: () => ++version,
    isCurrent: (requestVersion) => requestVersion === version,
  };
}

export function createRetryableLoadCache(loadAsset) {
  const loads = new Map();
  return {
    load(key) {
      if (!loads.has(key)) {
        const load = Promise.resolve().then(() => loadAsset(key));
        loads.set(key, load);
        load.catch(() => {
          if (loads.get(key) === load) loads.delete(key);
        });
      }
      return loads.get(key);
    },
  };
}
