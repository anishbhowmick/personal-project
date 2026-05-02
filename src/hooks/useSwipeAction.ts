import { useEffect, useState } from "react";

export const useSwipeAction = (onLeftSwipe: () => void) => {
  const [startX, setStartX] = useState<number | null>(null);

  useEffect(() => {
    const onTouchStart = (event: TouchEvent) => setStartX(event.touches[0]?.clientX ?? null);
    const onTouchEnd = (event: TouchEvent) => {
      const endX = event.changedTouches[0]?.clientX;
      if (startX !== null && endX !== undefined && startX - endX > 80) {
        onLeftSwipe();
      }
      setStartX(null);
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [onLeftSwipe, startX]);
};
