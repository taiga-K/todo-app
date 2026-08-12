import { startOfDay } from "date-fns";
import { describe, expect, it } from "vitest";
import {
  subscribeToLocalCalendarDayChanges,
  type LocalCalendarDayEnvironment,
} from "./useLocalCalendarDay";

function createTestEnvironment(initialNow: Date) {
  let now = initialNow;
  let nextTimeoutId = 1;
  let focusListener: (() => void) | null = null;
  let visibilityListener: (() => void) | null = null;
  const timers = new Map<number, () => void>();
  const clearedTimeoutIds: number[] = [];

  const environment: LocalCalendarDayEnvironment = {
    now: () => now,
    setTimeout: (callback) => {
      const timeoutId = nextTimeoutId++;
      timers.set(timeoutId, callback);
      return timeoutId;
    },
    clearTimeout: (timeoutId) => {
      clearedTimeoutIds.push(timeoutId);
      timers.delete(timeoutId);
    },
    addFocusListener: (listener) => {
      focusListener = listener;
    },
    removeFocusListener: (listener) => {
      if (focusListener === listener) {
        focusListener = null;
      }
    },
    addVisibilityListener: (listener) => {
      visibilityListener = listener;
    },
    removeVisibilityListener: (listener) => {
      if (visibilityListener === listener) {
        visibilityListener = null;
      }
    },
  };

  return {
    environment,
    timers,
    clearedTimeoutIds,
    setNow: (nextNow: Date) => {
      now = nextNow;
    },
    runNextTimer: () => {
      const entry = timers.entries().next().value;
      if (!entry) {
        throw new Error("Expected a scheduled timer.");
      }
      const [timeoutId, callback] = entry;
      timers.delete(timeoutId);
      callback();
    },
    focus: () => focusListener?.(),
    visibilityChange: () => visibilityListener?.(),
    hasFocusListener: () => focusListener !== null,
    hasVisibilityListener: () => visibilityListener !== null,
  };
}

describe("subscribeToLocalCalendarDayChanges", () => {
  it("revalidates a day initialized before midnight and keeps recurring", () => {
    let day = startOfDay(new Date(2026, 7, 11, 23, 59, 59));
    const testEnvironment = createTestEnvironment(
      new Date(2026, 7, 12, 0, 0, 0, 10),
    );
    const refresh = () => {
      day = startOfDay(testEnvironment.environment.now());
    };

    const unsubscribe = subscribeToLocalCalendarDayChanges(
      refresh,
      testEnvironment.environment,
    );

    expect(day.getDate()).toBe(12);
    expect(testEnvironment.timers.size).toBe(1);

    testEnvironment.setNow(new Date(2026, 7, 13, 0, 0, 0, 10));
    testEnvironment.runNextTimer();

    expect(day.getDate()).toBe(13);
    expect(testEnvironment.timers.size).toBe(1);

    unsubscribe();
    expect(testEnvironment.timers.size).toBe(0);
  });

  it("refreshes and re-arms the boundary timer after focus or visibility", () => {
    let refreshCount = 0;
    const testEnvironment = createTestEnvironment(
      new Date(2026, 7, 12, 12, 0),
    );
    const unsubscribe = subscribeToLocalCalendarDayChanges(
      () => {
        refreshCount += 1;
      },
      testEnvironment.environment,
    );
    const initialTimeoutId = [...testEnvironment.timers.keys()][0];

    testEnvironment.focus();

    expect(refreshCount).toBe(2);
    expect(testEnvironment.clearedTimeoutIds).toContain(initialTimeoutId);
    expect(testEnvironment.timers.size).toBe(1);

    const focusedTimeoutId = [...testEnvironment.timers.keys()][0];
    testEnvironment.visibilityChange();

    expect(refreshCount).toBe(3);
    expect(testEnvironment.clearedTimeoutIds).toContain(focusedTimeoutId);
    expect(testEnvironment.timers.size).toBe(1);

    unsubscribe();
    expect(testEnvironment.hasFocusListener()).toBe(false);
    expect(testEnvironment.hasVisibilityListener()).toBe(false);
  });
});
