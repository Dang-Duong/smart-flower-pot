"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RangeDropdownProps {
  defaultValue?: string;
  options?: { label: string; value: string }[];
  onValueChange?: (value: string) => void;
}

const DEFAULT_OPTIONS = [
  { label: "Day", value: "day" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
];

export function RangeDropdown({
  defaultValue = "weekly",
  options = DEFAULT_OPTIONS,
  onValueChange,
}: RangeDropdownProps) {
  return (
    <Select defaultValue={defaultValue} onValueChange={onValueChange}>
      <SelectTrigger className="w-28 text-xs bg-card border-gray-400 text-card-foreground">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="bg-card text-card-foreground border-gray-400">
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value} className="text-xs">
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
