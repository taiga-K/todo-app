import { describe, expect, it, vi } from "vitest";
import { updateTask } from "./actions";

describe("updateTask notes validation", () => {
  it.each([null, 42])("rejects non-string notes: %s", async (notes) => {
    const update = vi.fn();
    const context = {
      user: { id: "user-1" },
      entities: {
        Task: {
          findFirst: vi.fn().mockResolvedValue({ id: "task-1" }),
          update,
        },
      },
    };

    await expect(
      updateTask(
        { id: "task-1", notes: notes as string },
        context as Parameters<typeof updateTask>[1],
      ),
    ).rejects.toMatchObject({
      statusCode: 400,
      message: "ノートが正しくありません",
    });
    expect(update).not.toHaveBeenCalled();
  });
});
