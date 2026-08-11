import { CalendarIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { updateTask } from "wasp/client/operations";
import { Checkbox } from "../../components/ui/checkbox";
import { Input } from "../../components/ui/input";
import { cn } from "../../lib/utils";
import { TagLabel } from "../../tags/components/TagLabel";
import { formatDueLabel, isOverdue } from "../dueDate";
import { isTaskPriority, priorityMeta } from "../priority";
import { TaskWithTags } from "../queries";
import { PriorityIcon } from "./PriorityIcon";

interface TaskListItemProps {
  task: TaskWithTags;
}

export function TaskListItem({ task }: TaskListItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(task.description);
  // Keep the committed title visible until getTasks refreshes the cache.
  const [optimisticDescription, setOptimisticDescription] = useState<
    string | null
  >(null);
  const skipCommitRef = useRef(false);
  const commitGenerationRef = useRef(0);
  const serverDescriptionRef = useRef(task.description);
  const displayedDescription = optimisticDescription ?? task.description;

  useEffect(() => {
    // Any server description change means the cache caught up (or diverged);
    // drop optimism so we never mask a different persisted value.
    if (serverDescriptionRef.current !== task.description) {
      serverDescriptionRef.current = task.description;
      setOptimisticDescription(null);
    }
  }, [task.description]);

  useEffect(() => {
    if (!isEditing) {
      setDraft(displayedDescription);
    }
  }, [displayedDescription, isEditing]);

  async function setTaskDone(isDone: boolean): Promise<void> {
    try {
      await updateTask({
        id: task.id,
        isDone,
      });
    } catch (err: unknown) {
      window.alert(`タスクの更新中にエラーが発生しました: ${String(err)}`);
    }
  }

  async function commitDescription(): Promise<void> {
    if (skipCommitRef.current) {
      skipCommitRef.current = false;
      setDraft(displayedDescription);
      setIsEditing(false);
      return;
    }

    const next = draft.trim();
    if (!next || next === displayedDescription) {
      setDraft(displayedDescription);
      setIsEditing(false);
      return;
    }

    // Exit edit mode before awaiting so later keystrokes are not overwritten
    // by a stale in-flight save of the blur-time value. Show the new title
    // immediately while the tasks query cache catches up.
    const generation = ++commitGenerationRef.current;
    setOptimisticDescription(next);
    setIsEditing(false);
    try {
      await updateTask({
        id: task.id,
        description: next,
      });
    } catch (err: unknown) {
      if (generation !== commitGenerationRef.current) {
        return;
      }
      setOptimisticDescription(null);
      setDraft(next);
      setIsEditing(true);
      window.alert(`タスク名の更新中にエラーが発生しました: ${String(err)}`);
    }
  }

  const priority = isTaskPriority(task.priority) ? task.priority : null;
  const dueLabel = formatDueLabel(task.dueAt);
  const overdue = !task.isDone && isOverdue(task.dueAt);

  return (
    <li className="border-b border-border/60 last:border-b-0">
      <div
        className={cn(
          "flex w-full items-start gap-phi-3 rounded-[4px] px-phi-2 py-phi-3 transition-colors duration-150 hover:bg-muted/40",
          task.isDone && "opacity-70",
        )}
      >
        <Checkbox
          checked={task.isDone}
          onCheckedChange={(checked) => setTaskDone(checked === true)}
          aria-label={displayedDescription}
          className="mt-phi-1 cursor-pointer rounded-full after:inset-0"
        />
        <div className="flex min-w-0 flex-1 flex-col gap-phi-2">
          {isEditing ? (
            <Input
              autoFocus
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onBlur={() => {
                void commitDescription();
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  event.currentTarget.blur();
                }
                if (event.key === "Escape") {
                  event.preventDefault();
                  skipCommitRef.current = true;
                  event.currentTarget.blur();
                }
              }}
              aria-label="タスク名"
              className="h-auto min-w-0 w-full rounded-none border-0 bg-transparent px-0 py-0 text-body shadow-none focus-visible:border-transparent focus-visible:ring-0"
            />
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className={cn(
                "min-w-0 w-full cursor-text rounded-[2px] text-left text-body focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none",
                task.isDone && "text-muted-foreground line-through",
              )}
            >
              {displayedDescription}
            </button>
          )}
          {(priority || dueLabel || task.tags.length > 0) && (
            <div className="flex flex-wrap items-center gap-x-phi-4 gap-y-phi-2 text-caption leading-none text-muted-foreground [&_svg]:size-3.5 [&_svg]:shrink-0">
              {dueLabel ? (
                <span
                  className={cn(
                    "inline-flex items-center gap-phi-1",
                    overdue && "text-red-500",
                  )}
                >
                  <CalendarIcon />
                  {dueLabel}
                </span>
              ) : null}
              {priority ? (
                <span className="inline-flex items-center gap-phi-1">
                  <PriorityIcon priority={priority} className="size-3.5" />
                  {priorityMeta[priority].label}
                </span>
              ) : null}
              {task.tags.map((tag) => (
                <TagLabel key={tag.id} tag={tag} />
              ))}
            </div>
          )}
        </div>
      </div>
    </li>
  );
}
