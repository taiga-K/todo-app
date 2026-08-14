import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { XIcon } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Separator } from "../../components/ui/separator";
import { cn } from "../../lib/utils";
import { TaskWithTags } from "../queries";
import { useTaskTextSave } from "../useTaskTextSave";
import {
  NotesMarkdownEditor,
  type NotesMarkdownEditorHandle,
} from "./NotesMarkdownEditor";

export interface TaskDetailPanelHandle {
  flush: () => Promise<void>;
}

interface TaskDetailPanelProps {
  task: Pick<TaskWithTags, "id" | "description" | "notes" | "isDone">;
  onClose: () => void;
}

function normalizeTitle(value: string): string {
  return value.trim();
}

export const TaskDetailPanel = forwardRef<
  TaskDetailPanelHandle,
  TaskDetailPanelProps
>(function TaskDetailPanel({ task, onClose }, ref) {
  const notesRef = useRef<NotesMarkdownEditorHandle>(null);
  const onCloseRef = useRef(onClose);
  const titleSaveRef = useRef<() => Promise<void>>(async () => {});
  onCloseRef.current = onClose;

  const title = useTaskTextSave({
    taskId: task.id,
    field: "description",
    serverValue: task.description,
    normalize: normalizeTitle,
    allowEmpty: false,
    errorMessage: "タスク名の更新中にエラーが発生しました",
  });
  titleSaveRef.current = title.save;

  async function flush(): Promise<void> {
    await titleSaveRef.current();
    await notesRef.current?.flush();
  }

  useImperativeHandle(ref, () => ({ flush }), []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape" || event.defaultPrevented) {
        return;
      }
      void (async () => {
        await flush();
        onCloseRef.current();
      })();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task.id]);

  return (
    <aside
      className="flex h-full min-h-0 w-full flex-col border-l border-border/60 bg-background"
      aria-label="タスク詳細"
    >
      <div className="flex items-start justify-between gap-phi-3 px-phi-5 py-phi-4">
        <p className="text-caption text-muted-foreground">詳細</p>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => {
            void (async () => {
              await flush();
              onClose();
            })();
          }}
          aria-label="詳細パネルを閉じる"
        >
          <XIcon />
        </Button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-phi-5 overflow-y-auto px-phi-5 pb-phi-6">
        <Input
          value={title.draft}
          onChange={(event) => title.setDraft(event.target.value)}
          onBlur={() => {
            void title.save();
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              event.currentTarget.blur();
            }
          }}
          aria-label="タスク名"
          className={cn(
            "h-auto rounded-none border-0 bg-transparent px-0 py-0 text-h3 font-medium shadow-none focus-visible:border-transparent focus-visible:ring-0",
            task.isDone && "text-muted-foreground line-through",
          )}
        />

        <Separator className="bg-border/70" />

        <NotesMarkdownEditor
          key={task.id}
          ref={notesRef}
          taskId={task.id}
          initialValue={task.notes}
        />
      </div>
    </aside>
  );
});
