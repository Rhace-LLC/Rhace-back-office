import { useCallback, useLayoutEffect, useRef } from "react";

/**
 * Returns a function with a permanently stable identity that always invokes
 * the latest `fn` (the "latest ref" / effect-event pattern).
 *
 * Use it for data fetchers that are called from effects: the fetcher can read
 * current state and props, and listing it in an effect's dependency array
 * will not cause the effect to re-run on every render.
 */
export function useStableCallback<A extends unknown[], R>(
  fn: (...args: A) => R
): (...args: A) => R {
  const ref = useRef(fn);

  useLayoutEffect(() => {
    ref.current = fn;
  });

  return useCallback((...args: A) => ref.current(...args), []);
}
