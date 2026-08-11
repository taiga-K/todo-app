import { CheckIcon, SearchIcon, TagIcon } from "lucide-react";
import { useMemo, useState } from "react";
import type { Tag } from "wasp/entities";
import { createTag, getTags, useQuery } from "wasp/client/operations";
import { Input } from "../../components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover";
import { generateBrightColor } from "../../tags/components/colors";
import { TagLabel } from "../../tags/components/TagLabel";
import { cn } from "../../lib/utils";
import { PropertyChip } from "./PropertyChip";

interface LabelPickerProps {
  value: string[];
  onChange: (tagIds: string[]) => void;
}

export function LabelPicker({ value, onChange }: LabelPickerProps) {
  const { data: queriedTags = [] } = useQuery(getTags);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  // Keep freshly created tags until getTags refetch includes them.
  const [createdTags, setCreatedTags] = useState<Tag[]>([]);

  const tags = useMemo(() => {
    const byId = new Map<string, Tag>();
    for (const tag of queriedTags) {
      byId.set(tag.id, tag);
    }
    for (const tag of createdTags) {
      byId.set(tag.id, tag);
    }
    return [...byId.values()];
  }, [queriedTags, createdTags]);

  const selectedTags = useMemo(
    () =>
      value
        .map((id) => tags.find((tag) => tag.id === id))
        .filter((tag): tag is Tag => tag !== undefined),
    [tags, value],
  );

  const filteredTags = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return tags;
    }
    return tags.filter((tag) => tag.name.toLowerCase().includes(normalized));
  }, [query, tags]);

  const canCreate =
    query.trim().length > 0 &&
    !tags.some(
      (tag) => tag.name.toLowerCase() === query.trim().toLowerCase(),
    );

  function toggleTag(tagId: string) {
    if (value.includes(tagId)) {
      onChange(value.filter((id) => id !== tagId));
    } else {
      onChange([...value, tagId]);
    }
  }

  async function handleCreate() {
    const name = query.trim();
    if (!name || isCreating) {
      return;
    }

    setIsCreating(true);
    try {
      const tag = await createTag({
        name,
        color: generateBrightColor(),
      });
      setCreatedTags((prev) => [...prev, tag]);
      onChange([...value, tag.id]);
      setQuery("");
    } catch (err: unknown) {
      window.alert(`ラベルの作成中にエラーが発生しました: ${String(err)}`);
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) {
          setQuery("");
        }
      }}
    >
      <PopoverTrigger
        render={
          <PropertyChip
            active={selectedTags.length > 0}
            aria-label="ラベルを設定"
          />
        }
      >
        <TagIcon />
        {selectedTags.length > 0 ? (
          <span className="max-w-24 truncate">
            {selectedTags.map((tag) => tag.name).join("、")}
          </span>
        ) : null}
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-64 gap-1.5 rounded-lg border border-border/80 p-1.5 shadow-sm"
      >
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="ラベルを検索または作成"
            className="h-8 rounded-[4px] border-0 bg-muted/50 pl-7 text-xs shadow-none focus-visible:ring-1"
            autoFocus
          />
        </div>

        <ul className="flex max-h-52 flex-col gap-0.5 overflow-y-auto">
          {filteredTags.map((tag) => {
            const selected = value.includes(tag.id);
            return (
              <li key={tag.id}>
                <button
                  type="button"
                  className={cn(
                    "flex min-h-8 w-full cursor-pointer items-center gap-2 rounded-[4px] px-2 py-1 text-left transition-colors duration-150 hover:bg-muted/70",
                    selected && "bg-muted/60",
                  )}
                  onClick={() => toggleTag(tag.id)}
                >
                  <TagLabel
                    tag={tag}
                    isActive={true}
                    size="tiny"
                    showColorCircle
                  />
                  {selected ? (
                    <CheckIcon className="ml-auto size-3 text-muted-foreground" />
                  ) : null}
                </button>
              </li>
            );
          })}

          {canCreate ? (
            <li>
              <button
                type="button"
                disabled={isCreating}
                className="flex min-h-8 w-full cursor-pointer items-center gap-2 rounded-[4px] px-2 py-1 text-left text-xs transition-colors duration-150 hover:bg-muted/70 disabled:opacity-50"
                onClick={handleCreate}
              >
                <span className="text-muted-foreground">作成</span>
                <span className="font-medium">「{query.trim()}」</span>
              </button>
            </li>
          ) : null}

          {filteredTags.length === 0 && !canCreate ? (
            <li className="px-2 py-2 text-xs text-muted-foreground">
              ラベルが見つかりません。
            </li>
          ) : null}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
