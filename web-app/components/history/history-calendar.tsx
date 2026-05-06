"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { getDefaultClassNames } from "react-day-picker";

interface HistoryCalendarProps {
  activeDates?: string[]; // YYYY-MM-DD strings
}

export function HistoryCalendar({ activeDates = [] }: HistoryCalendarProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const defaults = getDefaultClassNames();

  const activeDateSet = useMemo(() => new Set(activeDates), [activeDates]);

  return (
    <div className="flex flex-col gap-3 w-full">
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        className="p-0 w-full"
        classNames={{
          root: cn("w-full", defaults.root),
          months: cn("w-full relative flex flex-col gap-4", defaults.months),
          month: cn("w-full flex flex-col gap-4", defaults.month),
          day: "relative h-11 p-0 text-center select-none flex-1",
          today: "",
          selected: "",
        }}
        components={{
          DayButton: ({ day, modifiers, children, ...props }) => {
            const key = [
              day.date.getFullYear(),
              String(day.date.getMonth() + 1).padStart(2, "0"),
              String(day.date.getDate()).padStart(2, "0"),
            ].join("-");
            const hasData = activeDateSet.has(key);

            return (
              <button
                {...props}
                className={cn(
                  "relative w-full h-full flex items-center justify-center rounded-lg text-sm font-medium transition-colors",
                  modifiers.selected && "bg-primary text-primary-foreground",
                  modifiers.today && !modifiers.selected && "bg-gray-200 font-bold",
                  !modifiers.selected && !modifiers.today && "hover:bg-gray-100",
                  modifiers.outside && "text-gray-300 hover:bg-transparent",
                )}
              >
                {children}
                {hasData && (
                  <span
                    className={cn(
                      "absolute bottom-1 left-1/2 -translate-x-1/2 size-1 rounded-full",
                      modifiers.selected ? "bg-white/80" : "bg-amber-500",
                    )}
                  />
                )}
              </button>
            );
          },
        }}
      />
      {activeDates.length > 0 && (
        <p className="text-center text-[11px] text-gray-400 pb-1">
          <span className="inline-block size-1.5 rounded-full bg-amber-500 mr-1.5 align-middle" />
          days with readings
        </p>
      )}
    </div>
  );
}
