-- Merge per-user tags that differ only by case before enforcing
-- case-insensitive uniqueness on nameNormalized.
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

-- Rebuild junction rows with duplicate tags remapped to the keeper id.
-- DISTINCT avoids unique-index collisions when a task already links to the
-- keeper and one or more case-variant duplicates.
CREATE TABLE "new__TagToTask" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "new__TagToTask_A_fkey" FOREIGN KEY ("A") REFERENCES "Tag" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "new__TagToTask_B_fkey" FOREIGN KEY ("B") REFERENCES "Task" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new__TagToTask" ("A", "B")
SELECT DISTINCT
  (
    SELECT keeper."id"
    FROM "Tag" AS keeper
    JOIN "Tag" AS original ON original."id" = link."A"
    WHERE keeper."userId" = original."userId"
      AND lower(keeper."name") = lower(original."name")
    ORDER BY keeper."id"
    LIMIT 1
  ),
  link."B"
FROM "_TagToTask" AS link;
DROP TABLE "_TagToTask";
ALTER TABLE "new__TagToTask" RENAME TO "_TagToTask";
CREATE UNIQUE INDEX "_TagToTask_AB_unique" ON "_TagToTask"("A", "B");
CREATE INDEX "_TagToTask_B_index" ON "_TagToTask"("B");

-- Drop the duplicate tags themselves.
DELETE FROM "Tag"
WHERE "id" IN (
  SELECT t."id"
  FROM "Tag" AS t
  WHERE EXISTS (
    SELECT 1
    FROM "Tag" AS o
    WHERE o."userId" = t."userId"
      AND lower(o."name") = lower(t."name")
      AND o."id" < t."id"
  )
);

-- RedefineTables
CREATE TABLE "new_Tag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "nameNormalized" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Tag_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Tag" ("id", "name", "nameNormalized", "color", "userId")
SELECT "id", "name", lower("name"), "color", "userId" FROM "Tag";
DROP TABLE "Tag";
ALTER TABLE "new_Tag" RENAME TO "Tag";
CREATE UNIQUE INDEX "Tag_userId_nameNormalized_key" ON "Tag"("userId", "nameNormalized");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
