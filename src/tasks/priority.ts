export const TASK_PRIORITIES = ["HIGH", "MEDIUM", "LOW"] as const;

export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export function isTaskPriority(value: unknown): value is TaskPriority {
  return (
    typeof value === "string" &&
    (TASK_PRIORITIES as readonly string[]).includes(value)
  );
}

export const priorityMeta: Record<
  TaskPriority,
  { label: string; colorClass: string; bars: number }
> = {
  HIGH: {
    label: "High",
    colorClass: "text-red-500",
    bars: 3,
  },
  MEDIUM: {
    label: "Medium",
    colorClass: "text-violet-500",
    bars: 2,
  },
  LOW: {
    label: "Low",
    colorClass: "text-sky-500",
    bars: 1,
  },
};
