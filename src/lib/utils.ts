import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      // Custom @theme font sizes must be registered so they don't collide
      // with text-* color utilities (e.g. text-muted-foreground).
      "font-size": [
        {
          text: ["caption", "button", "body", "h1", "h2", "h3"],
        },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
