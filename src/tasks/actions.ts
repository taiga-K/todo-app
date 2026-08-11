import { type Tag, type Task } from "wasp/entities";
import { HttpError } from "wasp/server";
import {
  DeleteCompletedTasks,
  type CreateTask,
  type UpdateTask,
} from "wasp/server/operations";
import { isTaskPriority, type TaskPriority } from "./priority";

type AuthenticatedTaskContext = {
  user?: { id: string } | null;
  entities: {
    Task: {
      findFirst: (args: {
        where: { id: Task["id"]; userId: string };
      }) => Promise<Task | null>;
    };
  };
};

async function requireOwnedTask(
  context: AuthenticatedTaskContext,
  id: Task["id"],
): Promise<Task> {
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

  return task;
}

function requireNonEmptyDescription(description: string): string {
  const trimmed = description.trim();
  if (!trimmed) {
    throw new HttpError(400, "タスク名を入力してください");
  }
  return trimmed;
}

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

  const normalizedDescription = requireNonEmptyDescription(description);
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
      description: normalizedDescription,
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

type UpdateTaskArgs = {
  id: Task["id"];
  isDone?: boolean;
  description?: string;
  priority?: string | null;
  dueAt?: string | null;
  tagIds?: Tag["id"][];
};

export const updateTask: UpdateTask<UpdateTaskArgs, Task> = async (
  { id, isDone, description, priority, dueAt, tagIds },
  context,
) => {
  const task = await requireOwnedTask(context, id);

  const data: {
    isDone?: boolean;
    description?: string;
    priority?: TaskPriority | null;
    dueAt?: Date | null;
    tags?: { set: { id: Tag["id"] }[] };
  } = {};

  if (isDone !== undefined) {
    data.isDone = isDone;
  }
  if (description !== undefined) {
    data.description = requireNonEmptyDescription(description);
  }
  if (priority !== undefined) {
    if (priority == null || priority === "") {
      data.priority = null;
    } else if (!isTaskPriority(priority)) {
      throw new HttpError(400, "優先度が正しくありません");
    } else {
      data.priority = priority;
    }
  }
  if (dueAt !== undefined) {
    if (dueAt == null || dueAt === "") {
      data.dueAt = null;
    } else {
      const parsed = new Date(dueAt);
      if (Number.isNaN(parsed.getTime())) {
        throw new HttpError(400, "期限が正しくありません");
      }
      data.dueAt = parsed;
    }
  }
  if (tagIds !== undefined) {
    if (!context.user) {
      throw new HttpError(401);
    }
    const uniqueTagIds = [...new Set(tagIds)];
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
    data.tags = {
      set: uniqueTagIds.map((tagId) => ({ id: tagId })),
    };
  }

  if (
    data.isDone === undefined &&
    data.description === undefined &&
    data.priority === undefined &&
    data.dueAt === undefined &&
    data.tags === undefined
  ) {
    throw new HttpError(400, "更新内容がありません");
  }

  return context.entities.Task.update({
    where: {
      id: task.id,
    },
    data,
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
