import { useEffect, useState } from "react";
import { startOfToday } from "./dueDate";

/** Re-renders when the local calendar day changes (midnight / focus / visibility). */
export function useLocalCalendarDay(): Date {
  const [day, setDay] = useState(() => startOfToday());

  useEffect(() => {
    function refresh() {
      const next = startOfToday();
      setDay((prev) => (prev.getTime() === next.getTime() ? prev : next));
    }

    const intervalId = window.setInterval(refresh, 60_000);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);

  return day;
}
