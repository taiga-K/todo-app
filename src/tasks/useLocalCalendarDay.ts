import { useEffect, useState } from "react";
import { msUntilNextLocalMidnight, startOfToday } from "./dueDate";

export type LocalCalendarDayEnvironment = {
  now: () => Date;
  setTimeout: (callback: () => void, delay: number) => number;
  clearTimeout: (timeoutId: number) => void;
  addFocusListener: (listener: () => void) => void;
  removeFocusListener: (listener: () => void) => void;
  addVisibilityListener: (listener: () => void) => void;
  removeVisibilityListener: (listener: () => void) => void;
};

function createBrowserEnvironment(): LocalCalendarDayEnvironment {
  return {
    now: () => new Date(),
    setTimeout: (callback, delay) => window.setTimeout(callback, delay),
    clearTimeout: (timeoutId) => window.clearTimeout(timeoutId),
    addFocusListener: (listener) => window.addEventListener("focus", listener),
    removeFocusListener: (listener) =>
      window.removeEventListener("focus", listener),
    addVisibilityListener: (listener) =>
      document.addEventListener("visibilitychange", listener),
    removeVisibilityListener: (listener) =>
      document.removeEventListener("visibilitychange", listener),
  };
}

export function subscribeToLocalCalendarDayChanges(
  refresh: () => void,
  environment = createBrowserEnvironment(),
): () => void {
  let timeoutId: number | null = null;

  function scheduleNextBoundary() {
    // Small buffer so we land safely after the local day rolls over.
    const delay = msUntilNextLocalMidnight(environment.now()) + 50;
    timeoutId = environment.setTimeout(() => {
      timeoutId = null;
      refresh();
      scheduleNextBoundary();
    }, delay);
  }

  function refreshAndReschedule() {
    if (timeoutId !== null) {
      environment.clearTimeout(timeoutId);
    }
    refresh();
    scheduleNextBoundary();
  }

  refreshAndReschedule();
  environment.addFocusListener(refreshAndReschedule);
  environment.addVisibilityListener(refreshAndReschedule);

  return () => {
    if (timeoutId !== null) {
      environment.clearTimeout(timeoutId);
    }
    environment.removeFocusListener(refreshAndReschedule);
    environment.removeVisibilityListener(refreshAndReschedule);
  };
}

/** Re-renders when the local calendar day changes (midnight / focus / visibility). */
export function useLocalCalendarDay(): Date {
  const [day, setDay] = useState(() => startOfToday());

  useEffect(() => {
    function refresh() {
      const next = startOfToday();
      setDay((prev) => (prev.getTime() === next.getTime() ? prev : next));
    }

    return subscribeToLocalCalendarDayChanges(refresh);
  }, []);

  return day;
}
