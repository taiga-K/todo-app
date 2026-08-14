import { useEffect, useRef, useState } from "react";
import { updateTask } from "wasp/client/operations";
import { Checkbox } from "../../components/ui/checkbox";
import { cn } from "../../lib/utils";
import { isOverdue, toDueDate } from "../dueDate";
import { isTaskPriority, type TaskPriority } from "../priority";
import { TaskWithTags } from "../queries";
import { DueDatePicker } from "./DueDatePicker";
import { LabelPicker } from "./LabelPicker";
import { PriorityPicker } from "./PriorityPicker";

interface TaskListItemProps {
  task: TaskWithTags;
  isSelected: boolean;
  onSelect: () => void;
}

function sameDueAt(a: Date | null, b: Date | null): boolean {
  if (a === null || b === null) {
    return a === b;
  }
  return a.getTime() === b.getTime();
}

function sameTagIds(a: string[], b: string[]): boolean {
  if (a.length !== b.length) {
    return false;
  }
  const left = new Set(a);
  return b.every((id) => left.has(id));
}

export function TaskListItem({
  task,
  isSelected,
  onSelect,
}: TaskListItemProps) {
  // undefined = no local override; null is a valid cleared due/priority.
  const [optimisticDueAt, setOptimisticDueAt] = useState<
    Date | null | undefined
  >(undefined);
  const [optimisticPriority, setOptimisticPriority] = useState<
    TaskPriority | null | undefined
  >(undefined);
  const [optimisticTagIds, setOptimisticTagIds] = useState<string[] | null>(
    null,
  );
  const dueCommitGenerationRef = useRef(0);
  const priorityCommitGenerationRef = useRef(0);
  const tagCommitGenerationRef = useRef(0);
  // Serialize same-property saves so an older in-flight updateTask cannot
  // overwrite a newer value after out-of-order completion.
  const dueSaveChainRef = useRef(Promise.resolve());
  const prioritySaveChainRef = useRef(Promise.resolve());
  const tagSaveChainRef = useRef(Promise.resolve());
  const displayedDescription = task.description;
  const serverPriority = isTaskPriority(task.priority) ? task.priority : null;
  const serverDueAt = toDueDate(task.dueAt);
  const serverTagIds = task.tags.map((tag) => tag.id);
  const displayedPriority =
    optimisticPriority !== undefined ? optimisticPriority : serverPriority;
  const displayedDueAt =
    optimisticDueAt !== undefined ? optimisticDueAt : serverDueAt;
  const displayedTagIds = optimisticTagIds ?? serverTagIds;

  useEffect(() => {
    if (optimisticDueAt === undefined) {
      return;
    }
    if (sameDueAt(toDueDate(task.dueAt), optimisticDueAt)) {
      setOptimisticDueAt(undefined);
    }
  }, [task.dueAt, optimisticDueAt]);

  useEffect(() => {
    if (optimisticPriority === undefined) {
      return;
    }
    const nextServerPriority = isTaskPriority(task.priority)
      ? task.priority
      : null;
    if (nextServerPriority === optimisticPriority) {
      setOptimisticPriority(undefined);
    }
  }, [task.priority, optimisticPriority]);

  useEffect(() => {
    if (optimisticTagIds === null) {
      return;
    }
    const nextServerTagIds = task.tags.map((tag) => tag.id);
    if (sameTagIds(nextServerTagIds, optimisticTagIds)) {
      setOptimisticTagIds(null);
    }
  }, [task.tags, optimisticTagIds]);

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

  async function updateDueAt(due: Date | null): Promise<void> {
    const dueAt = toDueDate(due);
    const generation = ++dueCommitGenerationRef.current;
    setOptimisticDueAt(dueAt);
    dueSaveChainRef.current = dueSaveChainRef.current.then(async () => {
      if (generation !== dueCommitGenerationRef.current) {
        return;
      }
      try {
        await updateTask({
          id: task.id,
          dueAt: dueAt ? dueAt.toISOString() : null,
        });
      } catch (err: unknown) {
        if (generation !== dueCommitGenerationRef.current) {
          return;
        }
        setOptimisticDueAt(undefined);
        window.alert(`期限の更新中にエラーが発生しました: ${String(err)}`);
      }
    });
    await dueSaveChainRef.current;
  }

  async function updatePriority(priority: TaskPriority | null): Promise<void> {
    const generation = ++priorityCommitGenerationRef.current;
    setOptimisticPriority(priority);
    prioritySaveChainRef.current = prioritySaveChainRef.current.then(
      async () => {
        if (generation !== priorityCommitGenerationRef.current) {
          return;
        }
        try {
          await updateTask({
            id: task.id,
            priority,
          });
        } catch (err: unknown) {
          if (generation !== priorityCommitGenerationRef.current) {
            return;
          }
          setOptimisticPriority(undefined);
          window.alert(
            `優先度の更新中にエラーが発生しました: ${String(err)}`,
          );
        }
      },
    );
    await prioritySaveChainRef.current;
  }

  async function updateTagIds(tagIds: string[]): Promise<void> {
    const generation = ++tagCommitGenerationRef.current;
    setOptimisticTagIds(tagIds);
    tagSaveChainRef.current = tagSaveChainRef.current.then(async () => {
      if (generation !== tagCommitGenerationRef.current) {
        return;
      }
      try {
        await updateTask({
          id: task.id,
          tagIds,
        });
      } catch (err: unknown) {
        if (generation !== tagCommitGenerationRef.current) {
          return;
        }
        setOptimisticTagIds(null);
        window.alert(`ラベルの更新中にエラーが発生しました: ${String(err)}`);
      }
    });
    await tagSaveChainRef.current;
  }

  const overdue = !task.isDone && isOverdue(displayedDueAt);

  return (
    <li
      className={cn(
        "border-b border-border/60 last:border-b-0",
        task.isDone && "opacity-70",
      )}
    >
      <div
        className={cn(
          "flex w-full items-start gap-phi-3 rounded-[4px] px-phi-2 py-phi-3 transition-colors duration-150 hover:bg-muted/40",
          isSelected && "bg-muted/50",
        )}
      >
        <Checkbox
          checked={task.isDone}
          onCheckedChange={(checked) => setTaskDone(checked === true)}
          aria-label={displayedDescription}
          className="mt-phi-1 cursor-pointer rounded-full after:inset-0"
        />
        <div className="flex min-w-0 flex-1 flex-col gap-phi-2">
          <button
            type="button"
            onClick={onSelect}
            aria-pressed={isSelected}
            className={cn(
              "min-w-0 w-full cursor-pointer rounded-[2px] text-left text-body focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none",
              task.isDone && "text-muted-foreground line-through",
            )}
          >
            {displayedDescription}
          </button>
          <div className="flex flex-wrap items-center gap-x-phi-4 gap-y-phi-2 text-caption leading-none text-muted-foreground [&_svg]:size-3.5 [&_svg]:shrink-0">
            <DueDatePicker
              value={displayedDueAt}
              onChange={(nextDue) => {
                void updateDueAt(nextDue);
              }}
              triggerClassName={overdue ? "text-red-500" : undefined}
            />
            <PriorityPicker
              value={displayedPriority}
              onChange={(nextPriority) => {
                void updatePriority(nextPriority);
              }}
            />
            <LabelPicker
              value={displayedTagIds}
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
