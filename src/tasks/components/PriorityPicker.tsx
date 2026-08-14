import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover";
import { cn } from "../../lib/utils";
import {
  TASK_PRIORITIES,
  TaskPriority,
  priorityMeta,
} from "../priority";
import { PriorityIcon } from "./PriorityIcon";
import { PropertyChip } from "./PropertyChip";

interface PriorityPickerProps {
  value: TaskPriority | null;
  onChange: (priority: TaskPriority | null) => void;
}

export function PriorityPicker({ value, onChange }: PriorityPickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <PropertyChip active={Boolean(value)} aria-label="優先度を設定" />
        }
      >
        <PriorityIcon priority={value} className="size-3.5" />
        {value ? <span>{priorityMeta[value].label}</span> : null}
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-44 gap-0.5 rounded-lg border border-border/80 p-1 shadow-sm"
      >
        {TASK_PRIORITIES.map((priority) => {
          const meta = priorityMeta[priority];
          const selected = value === priority;

          return (
            <button
              key={priority}
              type="button"
              className={cn(
                "flex min-h-8 w-full cursor-pointer items-center gap-2 rounded-[4px] px-2 py-1 text-left text-caption transition-colors duration-150 hover:bg-muted/70",
                selected && "bg-muted/60",
              )}
              onClick={() => {
                onChange(selected ? null : priority);
                setOpen(false);
              }}
            >
              <PriorityIcon priority={priority} className="size-3.5" />
              <span className="flex-1">{meta.label}</span>
            </button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}
