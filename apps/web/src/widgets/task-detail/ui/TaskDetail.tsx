import type { Task } from '@/entities/task';
import { MarkdownDescription } from '@/features/edit-task-description';

type TaskDetailProps = {
  task: Task | null;
  onDetailsChange: (details: string) => void;
};

export function TaskDetail({ task, onDetailsChange }: TaskDetailProps) {
  return (
    <section className="flex h-full min-w-0 flex-1 flex-col bg-white px-8 pt-10 pb-8">
      {task ? (
        <>
          <h2 className="shrink-0 text-[22px] font-semibold tracking-[-0.02em] text-[var(--ink)]">
            {task.title}
          </h2>
          <MarkdownDescription value={task.details} onChange={onDetailsChange} />
        </>
      ) : (
        <p className="text-[14px] text-[#8b8b96]">タスクを選択してください。</p>
      )}
    </section>
  );
}
