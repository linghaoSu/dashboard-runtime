export type RefreshHandle = {
  stop: () => void;
};

export function startIntervalRefresh(
  callback: () => void,
  intervalMs: number
): RefreshHandle {
  const id = window.setInterval(callback, intervalMs);

  return {
    stop() {
      window.clearInterval(id);
    }
  };
}

export function createAbortController(): AbortController {
  return new AbortController();
}
