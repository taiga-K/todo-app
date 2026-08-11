import { cn } from "../../lib/utils";
import { TaskPriority, priorityMeta } from "../priority";

interface PriorityIconProps {
  priority?: TaskPriority | null;
  className?: string;
}

export function PriorityIcon({ priority, className }: PriorityIconProps) {
  const bars = priority ? priorityMeta[priority].bars : 0;
  const colorClass = priority
    ? priorityMeta[priority].colorClass
    : "text-muted-foreground";

  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
      className={cn("size-3.5", colorClass, className)}
    >
      <rect
        x="2"
        y="10"
        width="3"
        height="4"
        rx="0.75"
        className={cn(bars >= 1 ? "opacity-100" : "opacity-25")}
      />
      <rect
        x="6.5"
        y="6"
        width="3"
        height="8"
        rx="0.75"
        className={cn(bars >= 2 ? "opacity-100" : "opacity-25")}
      />
      <rect
        x="11"
        y="2"
        width="3"
        height="12"
        rx="0.75"
        className={cn(bars >= 3 ? "opacity-100" : "opacity-25")}
      />
    </svg>
  );
}
