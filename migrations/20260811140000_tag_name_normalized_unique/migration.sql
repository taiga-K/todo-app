-- Merge per-user tags that differ only by case before enforcing
-- case-insensitive uniqueness on nameNormalized.
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

-- Point task links from duplicate tags to the kept tag (lowest id per group).
UPDATE "_TagToTask"
SET "A" = (
  SELECT keeper.id
  FROM "Tag" AS duplicate
  JOIN "Tag" AS keeper
    ON keeper."userId" = duplicate."userId"
   AND lower(keeper."name") = lower(duplicate."name")
  WHERE duplicate."id" = "_TagToTask"."A"
  ORDER BY keeper."id"
  LIMIT 1
)
WHERE "A" IN (
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

-- Collapse any duplicate junction rows created by the remapping.
DELETE FROM "_TagToTask"
WHERE "rowid" NOT IN (
  SELECT MIN("rowid") FROM "_TagToTask" GROUP BY "A", "B"
);

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
