import { useEffect, useRef, useState } from "react";
import { updateTask } from "wasp/client/operations";
import { Checkbox } from "../../components/ui/checkbox";
import { Input } from "../../components/ui/input";
import { cn } from "../../lib/utils";
import { isOverdue, toDueDate } from "../dueDate";
import { isTaskPriority, type TaskPriority } from "../priority";
import { TaskWithTags } from "../queries";
import { DueDatePicker } from "./DueDatePicker";
import { LabelPicker } from "./LabelPicker";
import { PriorityPicker } from "./PriorityPicker";

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
  const displayedDescription = optimisticDescription ?? task.description;

  useEffect(() => {
    // Only drop optimism when the cache has caught up to this value.
    // Clearing on any server change would let a stale earlier refetch wipe a
    // newer in-flight optimistic title.
    if (
      optimisticDescription !== null &&
      task.description === optimisticDescription
    ) {
      setOptimisticDescription(null);
    }
  }, [task.description, optimisticDescription]);

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

  async function updateDueAt(due: Date | null): Promise<void> {
    try {
      const dueAt = toDueDate(due);
      await updateTask({
        id: task.id,
        dueAt: dueAt ? dueAt.toISOString() : null,
      });
    } catch (err: unknown) {
      window.alert(`期限の更新中にエラーが発生しました: ${String(err)}`);
    }
  }

  async function updatePriority(priority: TaskPriority | null): Promise<void> {
    try {
      await updateTask({
        id: task.id,
        priority,
      });
    } catch (err: unknown) {
      window.alert(`優先度の更新中にエラーが発生しました: ${String(err)}`);
    }
  }

  async function updateTagIds(tagIds: string[]): Promise<void> {
    try {
      await updateTask({
        id: task.id,
        tagIds,
      });
    } catch (err: unknown) {
      window.alert(`ラベルの更新中にエラーが発生しました: ${String(err)}`);
    }
  }

  const priority = isTaskPriority(task.priority) ? task.priority : null;
  const due = toDueDate(task.dueAt);
  const overdue = !task.isDone && isOverdue(task.dueAt);
  const tagIds = task.tags.map((tag) => tag.id);

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
          <div className="flex flex-wrap items-center gap-x-phi-4 gap-y-phi-2 text-caption leading-none text-muted-foreground [&_svg]:size-3.5 [&_svg]:shrink-0">
            <DueDatePicker
              value={due}
              onChange={(nextDue) => {
                void updateDueAt(nextDue);
              }}
              triggerClassName={overdue ? "text-red-500" : undefined}
            />
            <PriorityPicker
              value={priority}
              onChange={(nextPriority) => {
                void updatePriority(nextPriority);
              }}
            />
            <LabelPicker
              value={tagIds}
              onChange={(nextTagIds) => {
                void updateTagIds(nextTagIds);
              }}
            />
          </div>
        </div>
      </div>
    </li>
  );
}
