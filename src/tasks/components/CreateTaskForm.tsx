import { useEffect, useLayoutEffect, useRef } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { createTask } from "wasp/client/operations";
import { Input } from "../../components/ui/input";
import { shouldSyncDefaultDue, toDueDate } from "../dueDate";
import { TaskPriority } from "../priority";
import { DueDatePicker } from "./DueDatePicker";
import { LabelPicker } from "./LabelPicker";
import { PriorityPicker } from "./PriorityPicker";

interface CreateTaskFormValues {
  description: string;
  tagIds: string[];
  priority: TaskPriority | null;
  due: Date | null;
}

type CreateTaskFormProps = {
  defaultDue?: Date | null;
};

export function CreateTaskForm({ defaultDue = null }: CreateTaskFormProps) {
  const previousDefaultDueRef = useRef(defaultDue);
  const latestDefaultDueRef = useRef(defaultDue);

  const { handleSubmit, setValue, watch, control, reset, getValues, formState } =
    useForm<CreateTaskFormValues>({
      defaultValues: {
        description: "",
        tagIds: [],
        priority: null,
        due: defaultDue,
      },
    });

  useLayoutEffect(() => {
    latestDefaultDueRef.current = defaultDue;
  }, [defaultDue]);

  useEffect(() => {
    const previousDefaultDue = previousDefaultDueRef.current;
    previousDefaultDueRef.current = defaultDue;

    if (
      !shouldSyncDefaultDue(
        getValues("due"),
        previousDefaultDue,
        defaultDue,
        Boolean(formState.dirtyFields.due),
      )
    ) {
      return;
    }

    setValue("due", defaultDue, { shouldDirty: false });
  }, [defaultDue, formState.dirtyFields.due, getValues, setValue]);

  const onSubmit: SubmitHandler<CreateTaskFormValues> = async (data, event) => {
    event?.stopPropagation();

    try {
      const dueAt = toDueDate(data.due);
      await createTask({
        description: data.description.trim(),
        tagIds: data.tagIds,
        priority: data.priority,
        dueAt: dueAt ? dueAt.toISOString() : null,
      });
      reset({
        description: "",
        tagIds: [],
        priority: null,
        due: latestDefaultDueRef.current,
      });
    } catch (err: unknown) {
      window.alert(`タスクの作成中にエラーが発生しました: ${String(err)}`);
    }
  };

  const [tagIds, priority, due] = watch(["tagIds", "priority", "due"]);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex w-full flex-col gap-phi-2 border-b border-border/70 pb-phi-4"
      id="create-task"
    >
      <Controller
        name="description"
        control={control}
        rules={{
          required: { value: true, message: "タスク名を入力してください" },
          validate: (value) =>
            value.trim().length > 0 || "タスク名を入力してください",
        }}
        render={({ field, fieldState }) => (
          <div className="flex flex-col gap-phi-2">
            <Input
              placeholder="新しいタスク"
              aria-invalid={fieldState.error ? true : undefined}
              aria-label="タスク名"
              className="h-9 border-0 bg-transparent px-0 text-body shadow-none placeholder:text-muted-foreground/70 focus-visible:border-transparent focus-visible:ring-0"
              {...field}
            />
            {fieldState.error && (
              <span className="text-caption text-destructive" role="alert">
                {fieldState.error.message}
              </span>
            )}
          </div>
        )}
      />

      <div className="flex flex-wrap items-center gap-x-phi-4 gap-y-phi-2">
        <DueDatePicker
          value={due}
          onChange={(nextDue) => setValue("due", nextDue, { shouldDirty: true })}
        />
        <PriorityPicker
          value={priority}
          onChange={(nextPriority) =>
            setValue("priority", nextPriority, { shouldDirty: true })
          }
        />
        <LabelPicker
          value={tagIds}
          onChange={(nextTagIds) =>
            setValue("tagIds", nextTagIds, { shouldDirty: true })
          }
        />
        <button
          type="submit"
          className="ml-auto cursor-pointer rounded-[4px] px-phi-3 py-phi-2 text-button font-normal leading-none text-muted-foreground transition-colors duration-150 hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
        >
          追加
        </button>
      </div>
    </form>
  );
}
