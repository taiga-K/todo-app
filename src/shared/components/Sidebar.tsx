import { CalendarDaysIcon, InboxIcon, LogOutIcon } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useLocation } from "react-router";
import { logout } from "wasp/client/auth";
import { Link, routes } from "wasp/client/router";
import { cn } from "../../lib/utils";
import { useSidebarWidth } from "../hooks/useSidebarWidth";

const navItems: {
  to: typeof routes.TasksRoute.to | typeof routes.TodayRoute.to;
  label: string;
  icon: LucideIcon;
}[] = [
  { to: routes.TasksRoute.to, label: "Tasks", icon: InboxIcon },
  { to: routes.TodayRoute.to, label: "Today", icon: CalendarDaysIcon },
];

export function Sidebar() {
  const { pathname } = useLocation();
  const {
    width,
    isResizing,
    minWidth,
    maxWidth,
    onResizePointerDown,
    onResizeKeyDown,
  } = useSidebarWidth();

  return (
    <aside
      className="relative sticky top-0 flex h-screen shrink-0 flex-col border-r border-border/60 bg-sidebar text-sidebar-foreground"
      style={{ width }}
    >
      <nav
        className="flex min-h-0 flex-1 flex-col px-phi-3 pt-[calc(2rem/var(--phi))]"
        aria-label="メイン"
      >
        <ul className="flex flex-col gap-px">
          {navItems.map(({ to, label, icon: Icon }) => {
            const isActive = pathname === to;
            return (
              <li key={to}>
                <Link
                  to={to}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "group flex h-8 w-full items-center gap-phi-3 rounded-md px-phi-3 text-button transition-colors duration-100",
                    isActive
                      ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                      : "font-normal text-muted-foreground hover:bg-sidebar-accent/80 hover:text-sidebar-foreground",
                  )}
                >
                  <Icon
                    className={cn(
                      "size-4 shrink-0 stroke-[1.75]",
                      isActive
                        ? "text-sidebar-foreground"
                        : "text-muted-foreground/80 group-hover:text-sidebar-foreground/80",
                    )}
                    aria-hidden
                  />
                  <span className="truncate">{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="px-phi-3 pb-phi-4 pt-phi-3">
        <button
          type="button"
          onClick={logout}
          className="group flex h-8 w-full items-center gap-phi-3 rounded-md px-phi-3 text-button font-normal text-muted-foreground transition-colors duration-100 hover:bg-sidebar-accent/80 hover:text-sidebar-foreground"
        >
          <LogOutIcon
            className="size-4 shrink-0 stroke-[1.75] text-muted-foreground/70 group-hover:text-sidebar-foreground/80"
            aria-hidden
          />
          <span className="truncate">ログアウト</span>
        </button>
      </div>

      <div
        role="separator"
        aria-orientation="vertical"
        aria-valuemin={minWidth}
        aria-valuemax={maxWidth}
        aria-valuenow={width}
        aria-label="パネル幅を変更"
        title="ドラッグしてサイズを変更"
        tabIndex={0}
        onPointerDown={onResizePointerDown}
        onKeyDown={onResizeKeyDown}
        className={cn(
          "absolute inset-y-0 -right-1 z-20 w-2 cursor-col-resize touch-none",
          "after:absolute after:inset-y-0 after:right-1 after:w-px after:bg-transparent after:transition-colors",
          "hover:after:bg-foreground/20 focus-visible:outline-none focus-visible:after:bg-foreground/30",
          isResizing && "after:bg-foreground/30",
        )}
      />
    </aside>
  );
}
