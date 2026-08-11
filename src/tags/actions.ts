import { Tag } from "wasp/entities";
import { HttpError } from "wasp/server";
import { CreateTag } from "wasp/server/operations";

type CreateTagArgs = Pick<Tag, "name" | "color">;

export const createTag: CreateTag<CreateTagArgs, Tag> = async (tag, context) => {
  if (!context.user) {
    throw new HttpError(401);
  }

  const name = tag.name.trim();
  if (!name) {
    throw new HttpError(400, "ラベル名を入力してください。");
  }

  const existingTags = await context.entities.Tag.findMany({
    where: { user: { id: context.user.id } },
    select: { name: true },
  });
  const normalizedName = name.toLowerCase();
  if (existingTags.some((existing) => existing.name.toLowerCase() === normalizedName)) {
    throw new HttpError(409, "同じ名前のラベルが既に存在します。");
  }

  return context.entities.Tag.create({
    data: {
      name,
      color: tag.color,
      user: {
        connect: {
          id: context.user.id,
        },
      },
    },
  });
};
