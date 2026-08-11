import { updateTaskStatus } from "wasp/client/operations";
import { Checkbox } from "../../components/ui/checkbox";
import { cn } from "../../lib/utils";
import type { Task } from "wasp/entities";
import type { Tag } from "wasp/entities";

type TaskWithTags = Task & { tags: Tag[] };

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
        <p
          className={cn(
            "min-w-0 flex-1 text-[15px] leading-snug",
            task.isDone && "text-muted-foreground line-through",
          )}
        >
          {task.description}
        </p>
      </label>
    </li>
  );
}
