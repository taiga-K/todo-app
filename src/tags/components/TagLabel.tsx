import { Badge } from "../../components/ui/badge";
import { cn } from "../../lib/utils";
import { Tag } from "wasp/entities";

type TagLabelSize = "md" | "sm" | "tiny";

interface TagLabelProps {
  tag: Pick<Tag, "id" | "color" | "name">;
  isActive: boolean;
  size?: TagLabelSize;
  showColorCircle?: boolean;
}

export function TagLabel({
  tag,
  isActive,
  size = "md",
  showColorCircle = false,
}: TagLabelProps) {
  return (
    <Badge
      variant={isActive ? "secondary" : "outline"}
      className={cn(
        "font-mono font-semibold border-2",
        sizeStyles[size],
      )}
      style={{
        backgroundColor: isActive ? tag.color : "transparent",
        borderColor: isActive ? tag.color : undefined,
      }}
    >
      {tag.name}
      {showColorCircle && (
        <span
          className={cn(
            "rounded-full border border-border bg-background",
            colorCircleSizeStyles[size],
          )}
          style={{
            backgroundColor: isActive ? undefined : tag.color,
          }}
        />
      )}
    </Badge>
  );
}

const sizeStyles: Record<TagLabelSize, string> = {
  md: "h-7 px-3 text-sm",
  sm: "h-6 px-2.5 text-xs",
  tiny: "h-5 px-2 text-xs",
};

const colorCircleSizeStyles: Record<TagLabelSize, string> = {
  md: "size-3",
  sm: "size-2",
  tiny: "size-1.5",
};
