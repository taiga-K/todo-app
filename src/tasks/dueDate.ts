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

export function toDueDate(date: Date | null | undefined): Date | null {
  if (!date) {
    return null;
  }
  return startOfDay(date);
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
