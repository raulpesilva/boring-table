const DEBUG_OPTIONS = {
  enabled: false,
};

export function isDebugEnabled() {
  return DEBUG_OPTIONS.enabled;
}

export function enableDebug(value: boolean) {
  DEBUG_OPTIONS.enabled = value ?? true;
}
