export function throttle<Args extends unknown[]>(
  fn: (...args: Args) => void,
  intervalMs: number,
): (...args: Args) => void {
  let lastCallTime = 0;
  let trailingTimeoutId: ReturnType<typeof setTimeout> | null = null;
  let trailingArgs: Args | null = null;

  return (...args: Args) => {
    const now = Date.now();
    const elapsed = now - lastCallTime;

    if (elapsed >= intervalMs) {
      lastCallTime = now;
      fn(...args);
      return;
    }

    trailingArgs = args;
    if (trailingTimeoutId !== null) return;
    trailingTimeoutId = setTimeout(() => {
      lastCallTime = Date.now();
      trailingTimeoutId = null;
      if (trailingArgs) fn(...trailingArgs);
      trailingArgs = null;
    }, intervalMs - elapsed);
  };
}

export const classes = (...classnames: (string | null | false)[]) => classnames.filter(Boolean).join(" ");