import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { createTask } from "wasp/client/operations";
import { Input } from "../../components/ui/input";

interface CreateTaskFormValues {
  description: string;
}

export function CreateTaskForm() {
  const { handleSubmit, control, reset } = useForm<CreateTaskFormValues>({
    defaultValues: {
      description: "",
    },
  });

  const onSubmit: SubmitHandler<CreateTaskFormValues> = async (data, event) => {
    event?.stopPropagation();

    try {
      await createTask({
        description: data.description,
      });
      reset();
    } catch (err: unknown) {
      window.alert(`タスクの作成中にエラーが発生しました: ${String(err)}`);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex w-full flex-col gap-1 border-b border-border/70 pb-4"
      id="create-task"
    >
      <Controller
        name="description"
        control={control}
        rules={{
          required: { value: true, message: "タスク名を入力してください" },
        }}
        render={({ field, fieldState }) => (
          <div className="flex flex-col gap-1">
            <Input
              placeholder="新しいタスク"
              aria-invalid={fieldState.error ? true : undefined}
              aria-label="タスク名"
              className="h-9 border-0 bg-transparent px-0 text-[15px] shadow-none placeholder:text-muted-foreground/70 focus-visible:border-transparent focus-visible:ring-0"
              {...field}
            />
            {fieldState.error && (
              <span className="text-xs text-destructive" role="alert">
                {fieldState.error.message}
              </span>
            )}
          </div>
        )}
      />

      <div className="flex justify-end">
        <button
          type="submit"
          className="cursor-pointer rounded-[4px] px-2 py-1 text-xs font-medium text-muted-foreground transition-colors duration-150 hover:bg-muted/70 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
        >
          追加
        </button>
      </div>
    </form>
  );
}
