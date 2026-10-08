import { useEffect, useRef, useState } from "react";

/**
 * Walk a module-namespace object that may be nested under one or more
 * `.default` levels (different bundlers wrap ESM exports differently) and
 * return the first `mount` function found. Returns null if none exists.
 */
function findMount(mod, depth = 0) {
  if (!mod || typeof mod !== "object" || depth > 5) return null;
  if (typeof mod.mount === "function") return mod.mount;
  if (mod.default) return findMount(mod.default, depth + 1);
  return null;
}

/** Compact type/keys signature of each nesting level, for error reports. */
function shapeOf(mod) {
  const parts = [];
  let cur = mod;
  for (let d = 0; d < 4 && cur && typeof cur === "object"; d++) {
    parts.push(`L${d}{${Object.keys(cur).join("|")}:${typeof cur.mount}}`);
    cur = cur.default;
  }
  return parts.join(" > ");
}

/**
 * Hook for NON-React micro-frontends (Vue, Angular) served over Module
 * Federation. Their public contract is not a component but a mount
 * function:  mount(el) -> unmount().  Each framework owns its own DOM
 * island inside the shell — React never renders inside it.
 *
 * `loader` MUST be a literal dynamic import (e.g. () => import("account/mount"))
 * so webpack can statically wire the remote.
 */
export default function useMountRemote(loader) {
  const ref = useRef(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unmount;
    let cancelled = false;
    loader()
      .then((mod) => {
        if (cancelled || !ref.current) return;
        // Different bundlers wrap exposed modules differently. The Vue
        // remote exposes `mount` directly; the Angular federation wrapper
        // nests it under .default (possibly several levels). Walk the chain.
        const mountFn = findMount(mod);
        if (typeof mountFn !== "function") {
          setError(
            new Error(
              `remote contract violated: no mount() export found. Shape: ${shapeOf(mod)}`
            )
          );
          setLoading(false);
          return;
        }
        unmount = mountFn(ref.current);
        setLoading(false);
      })
      .catch((err) => {
        console.error("[shell] failed to load remote:", err);
        setError(err);
        setLoading(false);
      });
    return () => {
      cancelled = true;
      if (unmount) unmount();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { ref, error, loading };
}
