import { describe, expect, it } from "vitest";
import {
  isDueToday,
  msUntilNextLocalMidnight,
  shouldSyncDefaultDue,
  startOfToday,
  toDueDate,
} from "./dueDate";

describe("isDueToday", () => {
  it("matches due dates against an explicit calendar day", () => {
    const yesterday = toDueDate("2026-08-11T12:00:00")!;
    const today = toDueDate("2026-08-12T08:00:00")!;

    expect(isDueToday(yesterday, today)).toBe(false);
    expect(isDueToday(today, today)).toBe(true);
    expect(isDueToday(today, yesterday)).toBe(false);
  });
});

describe("shouldSyncDefaultDue", () => {
  const dayA = toDueDate("2026-08-11")!;
  const dayB = toDueDate("2026-08-12")!;

  it("syncs when the default day changes and due is untouched", () => {
    expect(shouldSyncDefaultDue(dayA, dayA, dayB, false)).toBe(true);
  });

  it("keeps a manually customized due across the day boundary", () => {
    const custom = toDueDate("2026-08-20")!;
    expect(shouldSyncDefaultDue(custom, dayA, dayB, true)).toBe(false);
  });

  it("syncs a dirty due that still equals the previous default", () => {
    expect(shouldSyncDefaultDue(dayA, dayA, dayB, true)).toBe(true);
  });

  it("no-ops when the default day is unchanged", () => {
    expect(shouldSyncDefaultDue(dayA, dayA, dayA, false)).toBe(false);
  });
});

describe("startOfToday", () => {
  it("returns a local start-of-day date", () => {
    const today = startOfToday();
    expect(today.getHours()).toBe(0);
    expect(today.getMinutes()).toBe(0);
    expect(today.getSeconds()).toBe(0);
  });
});

describe("msUntilNextLocalMidnight", () => {
  it("is near zero just before midnight and near a full day just after", () => {
    const before = new Date(2026, 7, 12, 23, 59, 50);
    const after = new Date(2026, 7, 13, 0, 0, 10);
    expect(msUntilNextLocalMidnight(before)).toBeLessThan(15_000);
    expect(msUntilNextLocalMidnight(after)).toBeGreaterThan(86_000_000);
  });
});
