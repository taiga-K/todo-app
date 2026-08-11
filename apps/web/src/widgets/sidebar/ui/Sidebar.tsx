import type { ReactNode } from 'react';
import { CalendarRange, Folder, List } from 'lucide-react';

type PrimaryItem = {
  id: 'today' | 'week' | 'lists';
  label: string;
  icon: 'today' | 'week' | 'lists';
  count?: number;
  enabled: boolean;
};

type ProjectItem = {
  id: 'desu';
  label: string;
  glyph: string;
  enabled: boolean;
};

const PRIMARY_ITEMS: PrimaryItem[] = [
  { id: 'today', label: 'Today', icon: 'today', enabled: true },
  { id: 'week', label: 'Week', icon: 'week', count: 11, enabled: false },
  { id: 'lists', label: 'Lists', icon: 'lists', enabled: false },
];

const PROJECT_ITEMS: ProjectItem[] = [
  { id: 'desu', label: 'desu', glyph: '🌱', enabled: false },
];

function PrimaryIcon({ name }: { name: PrimaryItem['icon'] }) {
  const color = 'var(--brand)';
  if (name === 'today') {
    return (
      <span
        className="relative flex size-[22px] items-center justify-center rounded-[5px]"
        style={{ background: 'var(--brand)' }}
      >
        <span className="absolute inset-[5px] grid grid-cols-3 content-center gap-[2px]">
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} className="size-[2.5px] rounded-full bg-white/95" />
          ))}
        </span>
      </span>
    );
  }
  if (name === 'week') {
    return <CalendarRange className="size-[22px]" strokeWidth={1.75} style={{ color }} />;
  }
  return (
    <span
      className="flex size-[22px] items-center justify-center rounded-full border-[1.75px]"
      style={{ borderColor: color, color }}
    >
      <List className="size-[12px]" strokeWidth={2.25} />
    </span>
  );
}

function NavRow({
  active,
  onClick,
  children,
  label,
  disabled,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-current={active ? 'page' : undefined}
      aria-label={label}
      title={disabled ? 'Coming soon' : undefined}
      className={[
        'relative flex w-full items-center gap-3 rounded-[10px] py-[9px] pr-3 pl-3 text-left transition-colors duration-150',
        active ? 'bg-[var(--nav-active)] text-[var(--ink)]' : 'text-[var(--ink)] hover:bg-[var(--nav-hover)]',
        disabled ? 'cursor-not-allowed opacity-55 hover:bg-transparent' : '',
      ].join(' ')}
    >
      {children}
      {active ? (
        <span
          aria-hidden
          className="absolute top-1/2 right-0 h-[22px] w-[2.5px] -translate-y-1/2 rounded-full"
          style={{ background: 'var(--brand)' }}
        />
      ) : null}
    </button>
  );
}

type SidebarProps = {
  todayCount: number;
};

export function Sidebar({ todayCount }: SidebarProps) {
  return (
    <aside
      className="flex h-full w-[280px] shrink-0 flex-col bg-[var(--panel)] px-3 pt-14 pb-4"
      aria-label="Navigation"
    >
      <nav className="flex flex-1 flex-col" aria-label="Views">
        <div className="flex flex-col gap-[2px]">
          {PRIMARY_ITEMS.map((item) => {
            const active = item.id === 'today';
            const count = item.id === 'today' ? todayCount : item.count;
            return (
              <NavRow
                key={item.id}
                active={active}
                label={item.label}
                disabled={!item.enabled}
                onClick={() => {
                  // Today only for this milestone
                }}
              >
                <PrimaryIcon name={item.icon} />
                <span className="min-w-0 flex-1 truncate text-[15px] font-medium tracking-[-0.01em]">
                  {item.label}
                </span>
                {typeof count === 'number' ? (
                  <span className="flex size-[22px] shrink-0 items-center justify-center rounded-full bg-[var(--badge)] text-[11px] font-semibold text-[var(--ink-soft)] tabular-nums">
                    {count}
                  </span>
                ) : null}
              </NavRow>
            );
          })}
        </div>

        <div className="mt-6">
          <div className="mb-1 flex items-center gap-2 px-3 py-1.5">
            <Folder className="size-3.5 text-[var(--ink-muted)]" strokeWidth={2} />
            <span className="text-[13px] font-medium text-[var(--ink-muted)]">Project</span>
          </div>
          <div className="flex flex-col gap-[2px]">
            {PROJECT_ITEMS.map((item) => (
              <NavRow
                key={item.id}
                active={false}
                label={item.label}
                disabled={!item.enabled}
                onClick={() => {
                  // Project views are out of scope for Today milestone
                }}
              >
                <span className="flex size-[22px] shrink-0 items-center justify-center text-[16px] leading-none">
                  {item.glyph}
                </span>
                <span className="min-w-0 flex-1 truncate text-[15px] font-medium tracking-[-0.01em]">
                  {item.label}
                </span>
              </NavRow>
            ))}
          </div>
        </div>
      </nav>
    </aside>
  );
}
