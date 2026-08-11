import { ComponentProps } from "react";
import { cn } from "../../lib/utils";

type PropertyChipProps = ComponentProps<"button"> & {
  active?: boolean;
};

/**
 * Notion-like compact property trigger.
 * Caption-sized label; min hit area keeps taps usable.
 */
export function PropertyChip({
  className,
  active = false,
  type = "button",
  ...props
}: PropertyChipProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex min-h-8 min-w-8 cursor-pointer items-center gap-phi-1 rounded-[4px] px-phi-2 py-phi-2 text-caption font-normal leading-none transition-colors duration-150",
        "text-muted-foreground hover:bg-muted/50 hover:text-muted-foreground",
        "focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none",
        "[&_svg]:size-3.5 [&_svg]:shrink-0",
        active && "bg-muted/30",
        className,
      )}
      {...props}
    />
  );
}
