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
      className="p-2"
      classNames={{
        today: "rounded-full bg-foreground text-background",
      }}
    />
  );
}
