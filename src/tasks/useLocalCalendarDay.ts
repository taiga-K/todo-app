import { useEffect, useState } from "react";
import { msUntilNextLocalMidnight, startOfToday } from "./dueDate";

/** Re-renders when the local calendar day changes (midnight / focus / visibility). */
export function useLocalCalendarDay(): Date {
  const [day, setDay] = useState(() => startOfToday());

  useEffect(() => {
    let timeoutId = 0;

    function refresh() {
      const next = startOfToday();
      setDay((prev) => (prev.getTime() === next.getTime() ? prev : next));
    }

    function scheduleNextBoundary() {
      window.clearTimeout(timeoutId);
      // Small buffer so we land safely after the local day rolls over.
      const delay = msUntilNextLocalMidnight() + 50;
      timeoutId = window.setTimeout(() => {
        refresh();
        scheduleNextBoundary();
      }, delay);
    }

    function onResume() {
      refresh();
      scheduleNextBoundary();
    }

    refresh();
    scheduleNextBoundary();
    window.addEventListener("focus", onResume);
    document.addEventListener("visibilitychange", onResume);

    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener("focus", onResume);
      document.removeEventListener("visibilitychange", onResume);
    };
  }, []);

  return day;
}
