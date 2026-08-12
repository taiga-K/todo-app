import { Trash2Icon } from "lucide-react";
import { deleteCompletedTasks } from "wasp/client/operations";
import { Button } from "../../shared/components/Button";
import { TaskWithTags } from "../queries";
import { TaskListItem } from "./TaskListItem";

interface TaskListProps {
  tasks: TaskWithTags[] | undefined;
  isLoading: boolean;
  isSuccess: boolean;
  selectedTaskId: string | null;
  onSelectTask: (taskId: string) => void;
}

export function TaskList({
  tasks,
  isLoading,
  isSuccess,
  selectedTaskId,
  onSelectTask,
}: TaskListProps) {
  if (isLoading) {
    return (
      <p className="px-phi-2 py-phi-5 text-body text-muted-foreground">
        読み込み中...
      </p>
    );
  }

  if (!isSuccess || tasks === undefined) {
    return (
      <p className="px-phi-2 py-phi-5 text-body text-destructive">
        タスクの読み込みに失敗しました。
      </p>
    );
  }

  const completedTasks = tasks.filter((task) => task.isDone);

  async function handleDeleteCompletedTasks() {
    try {
      await deleteCompletedTasks();
    } catch (err: unknown) {
      window.alert(`完了タスクの削除中にエラーが発生しました: ${String(err)}`);
    }
  }

  if (tasks.length === 0) {
    return (
      <p className="px-phi-2 py-phi-6 text-body text-muted-foreground">
        まだタスクがありません。上から追加してください。
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-phi-2">
      <ul className="flex flex-col">
        {tasks.map((task) => (
          <TaskListItem
            task={task}
            key={task.id}
            isSelected={task.id === selectedTaskId}
            onSelect={() => onSelectTask(task.id)}
          />
        ))}
      </ul>
      <div className="mt-phi-4 flex items-center justify-between gap-phi-4 px-phi-2">
        <div className="text-caption text-muted-foreground">
          <span>{tasks.length} 件</span>
          <span className="mx-phi-3">·</span>
          <span>{completedTasks.length} 件完了</span>
        </div>
        {completedTasks.length > 0 && (
          <Button
            className="flex items-center gap-phi-3"
            size="sm"
            variant="ghost"
            onClick={handleDeleteCompletedTasks}
          >
            <Trash2Icon data-icon="inline-start" />
            完了をクリア
          </Button>
        )}
      </div>
    </div>
  );
}
