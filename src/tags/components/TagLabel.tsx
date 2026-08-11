import { TagIcon } from "lucide-react";
import { Tag } from "wasp/entities";
import { cn } from "../../lib/utils";

interface TagLabelProps {
  tag: Pick<Tag, "id" | "name">;
  className?: string;
}

export function TagLabel({ tag, className }: TagLabelProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-phi-1 text-caption leading-none text-muted-foreground",
        className,
      )}
    >
      <TagIcon aria-hidden="true" className="size-3.5 shrink-0" />
      <span className="truncate">{tag.name}</span>
    </span>
  );
}
