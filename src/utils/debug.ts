const DEBUG_OPTIONS = {
  enabled: false,
};

export function isDebugEnabled() {
  return DEBUG_OPTIONS.enabled;
}

export function enableDebug(value: boolean) {
  DEBUG_OPTIONS.enabled = value ?? true;
}

export const memo = (fn: Function, deps?: any[]) => {
  const cache = new Map();
  return (...args: any[]) => {
    const key = JSON.stringify([args, deps]);
    if (cache.has(key)) return cache.get(key);
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};
