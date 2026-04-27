"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";

export function HistoryCalendar() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      className="rounded-xl bg-[#2a2a2a] text-white p-3"
      classNames={{
        months: "flex flex-col",
        month: "space-y-2",
        caption: "flex justify-center relative items-center px-2",
        caption_label: "text-sm font-semibold text-white",
        nav: "flex items-center",
        nav_button: "h-6 w-6 bg-transparent text-white hover:bg-white/10 rounded",
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse",
        head_row: "flex",
        head_cell: "text-gray-400 w-8 text-xs font-normal text-center",
        row: "flex w-full mt-1",
        cell: "h-8 w-8 text-center text-xs p-0",
        day: "h-8 w-8 p-0 font-normal text-gray-200 hover:bg-white/10 rounded-full",
        day_selected: "bg-[#6366F1] text-white hover:bg-[#6366F1] rounded-full font-bold",
        day_today: "ring-2 ring-[#F5A623] text-white rounded-full",
        day_outside: "text-gray-500/40",
        day_disabled: "text-gray-600",
      }}
    />
  );
}
