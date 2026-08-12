import {
  addDays,
  format,
  isToday,
  isTomorrow,
  isYesterday,
  nextMonday,
  startOfDay,
} from "date-fns";
import { ja } from "date-fns/locale";

export function startOfToday(): Date {
  return startOfDay(new Date());
}

export function tomorrow(): Date {
  return addDays(startOfToday(), 1);
}

export function nextWeek(): Date {
  return startOfDay(nextMonday(new Date()));
}

export function toDueDate(
  date: Date | string | null | undefined,
): Date | null {
  if (!date) {
    return null;
  }
  const value = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(value.getTime())) {
    return null;
  }
  return startOfDay(value);
}

export function formatDueLabel(
  dueAt: Date | string | null | undefined,
): string | null {
  if (!dueAt) {
    return null;
  }

  const value = typeof dueAt === "string" ? new Date(dueAt) : dueAt;
  if (Number.isNaN(value.getTime())) {
    return null;
  }

  if (isToday(value)) {
    return "Today";
  }
  if (isTomorrow(value)) {
    return "Tomorrow";
  }
  if (isYesterday(value)) {
    return "Yesterday";
  }

  return format(value, "M月d日", { locale: ja });
}

export function isOverdue(dueAt: Date | string | null | undefined): boolean {
  if (!dueAt) {
    return false;
  }

  const value = typeof dueAt === "string" ? new Date(dueAt) : dueAt;
  if (Number.isNaN(value.getTime())) {
    return false;
  }

  return startOfDay(value).getTime() < startOfToday().getTime();
}

export function isDueToday(
  dueAt: Date | string | null | undefined,
  asOf: Date = startOfToday(),
): boolean {
  const due = toDueDate(dueAt);
  const day = toDueDate(asOf);
  return due != null && day != null && due.getTime() === day.getTime();
}

export function sameDueDate(
  left: Date | string | null | undefined,
  right: Date | string | null | undefined,
): boolean {
  const a = toDueDate(left);
  const b = toDueDate(right);
  if (a == null || b == null) {
    return a == null && b == null;
  }
  return a.getTime() === b.getTime();
}

/** Sync default due across a calendar-day change only when the user has not customized it. */
export function shouldSyncDefaultDue(
  currentDue: Date | null,
  previousDefaultDue: Date | null,
  nextDefaultDue: Date | null,
  dueDirty: boolean,
): boolean {
  if (sameDueDate(previousDefaultDue, nextDefaultDue)) {
    return false;
  }
  if (!dueDirty) {
    return true;
  }
  return sameDueDate(currentDue, previousDefaultDue);
}
