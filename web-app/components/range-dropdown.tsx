"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface RangeDropdownProps {
  defaultValue?: string;
  options?: { label: string; value: string }[];
  onValueChange?: (value: string) => void;
}

const DEFAULT_OPTIONS = [
  { label: "Day", value: "day" },
  { label: "Week", value: "weekly" },
  { label: "Month", value: "monthly" },
];

export function RangeDropdown({
  defaultValue = "weekly",
  options = DEFAULT_OPTIONS,
  onValueChange,
}: RangeDropdownProps) {
  const [value, setValue] = useState(defaultValue);

  function handleSelect(next: string) {
    setValue(next);
    onValueChange?.(next);
  }

  return (
    <div
      role="tablist"
      className="inline-flex items-center rounded-full bg-gray-100 p-0.5 border border-gray-200"
    >
      {options.map((opt) => {
        const isActive = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => handleSelect(opt.value)}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-semibold transition-all duration-150 cursor-pointer",
              isActive
                ? "bg-[#F5A623] text-black shadow-sm scale-[1.02]"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-200"
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
