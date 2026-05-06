import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { StatusPill } from "@/components/status-pill";
import { FlowerImage } from "@/components/flower-image";
import { DeviceSwitcher } from "@/components/device-switcher";
import { FlowerDetails } from "@/components/flower-details";
import type { FlowerInfo, MetricStatus } from "@/lib/types";
import type { Device } from "@/lib/api";

interface FlowerCardProps {
  flower: FlowerInfo;
  devices: Device[];
  selectedDevice: Device;
  status?: MetricStatus;
}

export function FlowerCard({ flower, devices, selectedDevice, status = "nodata" }: FlowerCardProps) {
  return (
    <Card className="bg-card text-card-foreground rounded-2xl h-full">
      <CardContent className="flex items-start gap-3 sm:gap-6 p-4 sm:p-6 h-full">
        <div className="flex-shrink-0">
          <FlowerImage src={flower.imageUrl} alt={flower.name} deviceId={selectedDevice.deviceId} />
        </div>
        <div className="flex flex-col gap-4 flex-1 justify-between h-full">
          <div className="flex flex-col gap-4">
            <div>
              <Label className="text-sm font-black text-card-foreground mb-1 block">
                Flower pot
              </Label>
              <DeviceSwitcher devices={devices} selectedId={selectedDevice.deviceId} />
            </div>
            <FlowerDetails
              deviceId={selectedDevice.deviceId}
              defaultName={flower.name}
              defaultSpecies={flower.species}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-card-foreground/60 font-medium">Status</span>
            <StatusPill status={status} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
