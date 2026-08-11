import { CalendarIcon } from "lucide-react";
import { updateTaskStatus } from "wasp/client/operations";
import { Checkbox } from "../../components/ui/checkbox";
import { cn } from "../../lib/utils";
import { TagLabel } from "../../tags/components/TagLabel";
import { formatDueLabel, isOverdue } from "../dueDate";
import { isTaskPriority } from "../priority";
import { TaskWithTags } from "../queries";
import { PriorityIcon } from "./PriorityIcon";

interface TaskListItemProps {
  task: TaskWithTags;
}

export function TaskListItem({ task }: TaskListItemProps) {
  async function setTaskDone(isDone: boolean): Promise<void> {
    try {
      await updateTaskStatus({
        id: task.id,
        isDone,
      });
    } catch (err: unknown) {
      window.alert(`タスクの更新中にエラーが発生しました: ${String(err)}`);
    }
  }

  const priority = isTaskPriority(task.priority) ? task.priority : null;
  const dueLabel = formatDueLabel(task.dueAt);
  const overdue = !task.isDone && isOverdue(task.dueAt);

  return (
    <li className="border-b border-border/60 last:border-b-0">
      <label
        className={cn(
          "flex w-full cursor-pointer items-start gap-2.5 rounded-[4px] px-1 py-2 transition-colors duration-150 hover:bg-muted/40",
          task.isDone && "opacity-70",
        )}
      >
        <Checkbox
          checked={task.isDone}
          onCheckedChange={(checked) => setTaskDone(checked === true)}
          className="mt-0.5 rounded-full"
        />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex min-w-0 items-start gap-1.5">
            {priority ? (
              <PriorityIcon priority={priority} className="mt-0.5 shrink-0" />
            ) : null}
            <p
              className={cn(
                "min-w-0 flex-1 text-[15px] leading-snug",
                task.isDone && "text-muted-foreground line-through",
              )}
            >
              {task.description}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {dueLabel ? (
              <span
                className={cn(
                  "inline-flex items-center gap-1 text-[11px]",
                  overdue ? "text-red-500" : "text-muted-foreground",
                )}
              >
                <CalendarIcon className="size-3" />
                {dueLabel}
              </span>
            ) : null}
            {task.tags.length > 0 && (
              <ul className="flex flex-wrap gap-1">
                {task.tags.map((tag) => (
                  <li key={tag.id}>
                    <TagLabel tag={tag} isActive={true} size="tiny" />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </label>
    </li>
  );
}
