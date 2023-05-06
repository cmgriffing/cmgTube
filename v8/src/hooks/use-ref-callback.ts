import React, { useCallback, useRef, MutableRefObject } from "react";

export function useRefCallback<T>(
  setup?: (node: T) => void,
  cleanup?: (current: T) => void
): [MutableRefObject<T | null>, (node: T) => void] {
  const ref = useRef<T | null>(null);
  const setRef = useCallback((node: T) => {
    if (ref.current) {
      if (cleanup) {
        cleanup(ref.current);
      }
    }

    if (node) {
      if (setup) {
        setup(node);
      }
    }

    // Save a reference to the node
    ref.current = node;
  }, []);

  return [ref, setRef];
}
