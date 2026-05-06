"use client";

import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Device } from "@/lib/api";

interface DeviceSwitcherProps {
  devices: Device[];
  selectedId: string;
  basePath?: string;
}

export function DeviceSwitcher({ devices, selectedId, basePath = "/dashboard" }: DeviceSwitcherProps) {
  const router = useRouter();

  function handleChange(deviceId: string) {
    router.push(`${basePath}?device=${encodeURIComponent(deviceId)}`);
  }

  return (
    <Select value={selectedId} onValueChange={handleChange}>
      <SelectTrigger className="bg-white border-gray-300 text-black rounded-lg">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {devices.map((d) => (
          <SelectItem key={d.deviceId} value={d.deviceId}>
            {d.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
