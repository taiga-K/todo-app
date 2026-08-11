import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { format, isSameDay } from "date-fns";
import { ja } from "date-fns/locale";
import { Calendar } from "../../components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover";
import { cn } from "../../lib/utils";
import {
  formatDueLabel,
  nextWeek,
  startOfToday,
  toDueDate,
  tomorrow,
} from "../dueDate";
import { PropertyChip } from "./PropertyChip";

const WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"] as const;
const ACCENT = "#FF5A42";

interface DueDatePickerProps {
  value: Date | null;
  onChange: (value: Date | null) => void;
}

export function DueDatePicker({ value, onChange }: DueDatePickerProps) {
  const [open, setOpen] = useState(false);
  const label = formatDueLabel(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <PropertyChip active={Boolean(label)} aria-label="期限を設定" />
        }
      >
        <CalendarIcon />
        {label ? <span className="max-w-28 truncate">{label}</span> : null}
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={8}
        className="w-[268px] gap-0 overflow-hidden rounded-2xl border-0 bg-[#F3F4F9] p-0 text-[13px] text-foreground shadow-[0_12px_40px_rgba(15,23,42,0.12)] ring-1 ring-black/5"
      >
        <div className="flex flex-col gap-0.5 border-b border-black/5 px-2 pt-2 pb-1.5">
          <QuickOption
            label="Today"
            accent
            active={value != null && isSameDay(value, startOfToday())}
            onClick={() => onChange(startOfToday())}
          />
          <QuickOption
            label="Tomorrow"
            active={value != null && isSameDay(value, tomorrow())}
            onClick={() => onChange(tomorrow())}
          />
          <QuickOption
            label="Next week"
            active={value != null && isSameDay(value, nextWeek())}
            onClick={() => onChange(nextWeek())}
          />
        </div>

        <div className="px-2 pt-2 pb-2">
          <Calendar
            mode="single"
            locale={ja}
            selected={value ?? undefined}
            onSelect={(date) => {
              // Single-select mode toggles the selected day to undefined;
              // only the explicit クリア control should clear the due date.
              if (date == null) {
                return;
              }
              onChange(toDueDate(date));
            }}
            labels={{
              labelPrevious: () => "前の月",
              labelNext: () => "次の月",
            }}
            formatters={{
              formatCaption: (date) =>
                format(date, "yyyy年 M月", { locale: ja }),
              formatWeekdayName: (date) => WEEKDAY_LABELS[date.getDay()],
            }}
            className={cn(
              "w-full rounded-xl bg-[#E8EAF2] p-2.5 shadow-none",
              "[--cell-size:--spacing(8)]",
              "[--calendar-day-selected:#FF5A42]",
              "[--calendar-day-selected-fg:#ffffff]",
            )}
            classNames={{
              root: "w-full",
              months: "relative flex w-full flex-col gap-2",
              month: "flex w-full flex-col gap-2",
              month_caption:
                "flex h-8 w-full items-center justify-start px-1 pr-16",
              caption_label: "text-[13px] font-medium text-foreground",
              nav: "absolute inset-x-0 top-0 flex items-center justify-end gap-0.5 px-0.5",
              button_previous:
                "size-7 rounded-md border-0 bg-transparent p-0 text-muted-foreground shadow-none hover:bg-black/5 hover:text-foreground",
              button_next:
                "size-7 rounded-md border-0 bg-transparent p-0 text-muted-foreground shadow-none hover:bg-black/5 hover:text-foreground",
              weekdays: "flex w-full",
              weekday:
                "flex-1 text-[11px] font-normal text-muted-foreground/80",
              week: "mt-1 flex w-full",
              day: "group/day relative aspect-square h-full w-full p-0 text-center",
              today: "rounded-full bg-transparent font-semibold text-foreground",
              outside: "text-muted-foreground/40",
            }}
          />
        </div>

        {value ? (
          <div className="flex justify-end border-t border-black/5 px-3 py-2">
            <button
              type="button"
              className="cursor-pointer text-[12px] text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => {
                onChange(null);
                setOpen(false);
              }}
            >
              クリア
            </button>
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}

function QuickOption({
  label,
  accent = false,
  active,
  onClick,
}: {
  label: string;
  accent?: boolean;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex min-h-9 w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-[13px] transition-colors duration-150",
        active ? "bg-black/[0.06] font-medium" : "hover:bg-black/[0.04]",
      )}
    >
      <CalendarIcon
        className={cn(
          "size-3.5 shrink-0",
          !accent && "text-muted-foreground",
        )}
        style={accent ? { color: ACCENT } : undefined}
        strokeWidth={1.75}
      />
      <span>{label}</span>
    </button>
  );
}
