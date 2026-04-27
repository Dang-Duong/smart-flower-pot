import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { StatusPill } from "@/components/status-pill";
import type { FlowerInfo } from "@/lib/types";

interface FlowerCardProps {
  flower: FlowerInfo;
}

export function FlowerCard({ flower }: FlowerCardProps) {
  return (
    <Card className="bg-card text-card-foreground rounded-2xl h-full">
      <CardContent className="flex items-start gap-3 sm:gap-6 p-4 sm:p-6 h-full">
        <div className="flex-shrink-0">
          <Image
            src={flower.imageUrl}
            alt={flower.name}
            width={96}
            height={96}
            className="rounded-full object-cover w-16 h-16 sm:w-24 sm:h-24 ring-2 ring-[#F5A623]"
            unoptimized
          />
        </div>
        <div className="flex flex-col gap-4 flex-1 justify-between h-full">
          <div className="flex flex-col gap-4">
            <div>
              <Label className="text-sm font-black text-card-foreground mb-1 block">
                Flower name
              </Label>
              <Input
                readOnly
                defaultValue={flower.name}
                className="bg-white border-gray-300 text-black rounded-lg"
              />
            </div>
            <div>
              <Label className="text-sm font-black text-card-foreground mb-1 block">
                Species
              </Label>
              <Input
                readOnly
                defaultValue={flower.species}
                className="bg-white border-gray-300 text-black rounded-lg"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-card-foreground/60 font-medium">Status</span>
            <StatusPill status="ok" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
