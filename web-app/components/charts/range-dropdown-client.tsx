"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { RangeDropdown } from "@/components/range-dropdown";

interface RangeDropdownClientProps {
  paramKey: string;
  defaultValue: string;
}

export function RangeDropdownClient({ paramKey, defaultValue }: RangeDropdownClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentValue = searchParams.get(paramKey) ?? defaultValue;

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(paramKey, value);
    router.push(`?${params.toString()}`);
  }

  return (
    <RangeDropdown
      key={currentValue}
      defaultValue={currentValue}
      onValueChange={handleChange}
    />
  );
}
