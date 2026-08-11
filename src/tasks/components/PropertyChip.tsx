import { ComponentProps } from "react";
import { cn } from "../../lib/utils";

type PropertyChipProps = ComponentProps<"button"> & {
  active?: boolean;
};

/**
 * Notion-like compact property trigger.
 * Visual size stays small; min hit area keeps taps usable.
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
        "inline-flex min-h-8 min-w-8 cursor-pointer items-center gap-1 rounded-[4px] px-1.5 py-1 text-[12px] leading-none font-medium transition-colors duration-150",
        "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
        "focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none",
        "[&_svg]:size-3.5 [&_svg]:shrink-0",
        active && "bg-muted/50 text-foreground",
        className,
      )}
      {...props}
    />
  );
}
