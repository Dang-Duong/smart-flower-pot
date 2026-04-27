import { Card, CardContent } from "@/components/ui/card";
import { BellOff } from "lucide-react";

export function NotificationEmpty() {
  return (
    <Card className="bg-card text-card-foreground rounded-2xl min-h-[400px] flex items-center justify-center">
      <CardContent className="flex flex-col items-center gap-4 py-12">
        <BellOff className="w-12 h-12 text-card-foreground/30" />
        <p className="text-lg font-black text-card-foreground">All caught up</p>
        <p className="text-sm text-card-foreground/60 text-center max-w-xs">
          We'll let you know when your plant needs attention.
        </p>
      </CardContent>
    </Card>
  );
}
