import { useEffect } from "react";

export const useAutoLock = (onLock: () => void, idleMs: number) => {
  useEffect(() => {
    let timeout = window.setTimeout(onLock, idleMs);

    const reset = () => {
      window.clearTimeout(timeout);
      timeout = window.setTimeout(onLock, idleMs);
    };

    ["mousemove", "keydown", "click", "touchstart"].forEach((event) =>
      window.addEventListener(event, reset),
    );

    return () => {
      window.clearTimeout(timeout);
      ["mousemove", "keydown", "click", "touchstart"].forEach((event) =>
        window.removeEventListener(event, reset),
      );
    };
  }, [idleMs, onLock]);
};
