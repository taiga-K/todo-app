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

  const nameNormalized = name.toLowerCase();

  try {
    return await context.entities.Tag.create({
      data: {
        name,
        nameNormalized,
        color: tag.color,
        user: {
          connect: {
            id: context.user.id,
          },
        },
      },
    });
  } catch (err: unknown) {
    // Unique constraint on (userId, nameNormalized) — including concurrent creates.
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: unknown }).code === "P2002"
    ) {
      throw new HttpError(409, "同じ名前のラベルが既に存在します。");
    }
    throw err;
  }
};
