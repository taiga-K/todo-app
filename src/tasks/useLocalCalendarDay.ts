import { addDays, startOfDay } from "date-fns";
import { useEffect, useState } from "react";
import { startOfToday } from "./dueDate";

function msUntilNextLocalMidnight(now = new Date()): number {
  const nextMidnight = startOfDay(addDays(now, 1));
  return Math.max(nextMidnight.getTime() - now.getTime(), 0);
}

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
      // Small buffer so we land safely after the local day rolls over.
      const delay = msUntilNextLocalMidnight() + 50;
      timeoutId = window.setTimeout(() => {
        refresh();
        scheduleNextBoundary();
      }, delay);
    }

    scheduleNextBoundary();
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);

    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);

  return day;
}
