import { type Tag, type Task } from "wasp/entities";
import { HttpError } from "wasp/server";
import {
  DeleteCompletedTasks,
  type CreateTask,
  type UpdateTaskStatus,
} from "wasp/server/operations";
import { isTaskPriority, type TaskPriority } from "./priority";

type CreateTaskArgs = Pick<Task, "description"> & {
  tagIds?: Tag["id"][];
  priority?: string | null;
  dueAt?: string | null;
};

export const createTask: CreateTask<CreateTaskArgs, Task> = async (
  { description, tagIds = [], priority, dueAt },
  context,
) => {
  if (!context.user) {
    throw new HttpError(401);
  }

  const uniqueTagIds = [...new Set(tagIds)];

  let normalizedPriority: TaskPriority | null = null;
  if (priority != null && priority !== "") {
    if (!isTaskPriority(priority)) {
      throw new HttpError(400, "優先度が正しくありません");
    }
    normalizedPriority = priority;
  }

  let normalizedDueAt: Date | null = null;
  if (dueAt != null && dueAt !== "") {
    const parsed = new Date(dueAt);
    if (Number.isNaN(parsed.getTime())) {
      throw new HttpError(400, "期限が正しくありません");
    }
    normalizedDueAt = parsed;
  }

  if (uniqueTagIds.length > 0) {
    const ownedTags = await context.entities.Tag.findMany({
      where: {
        id: { in: uniqueTagIds },
        userId: context.user.id,
      },
      select: { id: true },
    });
    if (ownedTags.length !== uniqueTagIds.length) {
      throw new HttpError(400, "無効なラベルが含まれています");
    }
  }

  return context.entities.Task.create({
    data: {
      description,
      isDone: false,
      priority: normalizedPriority,
      dueAt: normalizedDueAt,
      user: {
        connect: {
          id: context.user.id,
        },
      },
      tags: {
        connect: uniqueTagIds.map((tagId) => ({
          id: tagId,
        })),
      },
    },
  });
};

type UpdateTaskStatusArgs = Pick<Task, "id" | "isDone">;

export const updateTaskStatus: UpdateTaskStatus<UpdateTaskStatusArgs> = async (
  { id, isDone },
  context,
) => {
  if (!context.user) {
    throw new HttpError(401);
  }

  const task = await context.entities.Task.findFirst({
    where: {
      id,
      userId: context.user.id,
    },
  });
  if (!task) {
    throw new HttpError(404, "タスクが見つかりません");
  }

  return context.entities.Task.update({
    where: {
      id: task.id,
    },
    data: { isDone },
  });
};

export const deleteCompletedTasks: DeleteCompletedTasks = async (
  _args,
  context,
) => {
  if (!context.user) {
    throw new HttpError(401);
  }

  return context.entities.Task.deleteMany({
    where: {
      userId: context.user.id,
      isDone: true,
    },
  });
};
