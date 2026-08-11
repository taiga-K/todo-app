import { Trash2Icon } from "lucide-react";
import {
  deleteCompletedTasks,
  getTasks,
  useQuery,
} from "wasp/client/operations";
import { Button } from "../../shared/components/Button";
import { TaskListItem } from "./TaskListItem";

export function TaskList() {
  const { data: tasks, isLoading, isSuccess } = useQuery(getTasks);

  if (isLoading) {
    return (
      <p className="px-1 py-6 text-sm text-muted-foreground">読み込み中...</p>
    );
  }

  if (!isSuccess) {
    return (
      <p className="px-1 py-6 text-sm text-destructive">
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
      <p className="px-1 py-8 text-sm text-muted-foreground">
        まだタスクがありません。上から追加してください。
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <ul className="flex flex-col">
        {tasks.map((task) => (
          <TaskListItem task={task} key={task.id} />
        ))}
      </ul>
      <div className="mt-4 flex items-center justify-between gap-4 px-1">
        <div className="text-sm text-muted-foreground">
          <span>{tasks.length} 件</span>
          <span className="mx-2">·</span>
          <span>{completedTasks.length} 件完了</span>
        </div>
        {completedTasks.length > 0 && (
          <Button
            className="flex items-center gap-2"
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
