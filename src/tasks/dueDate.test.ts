import { describe, expect, it } from "vitest";
import {
  isDueToday,
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
