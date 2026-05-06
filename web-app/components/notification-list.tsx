import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, AlertTriangle } from "lucide-react";
import type { Notification } from "@/lib/types";

interface NotificationListProps {
  items: Notification[];
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function NotificationList({ items }: NotificationListProps) {
  return (
    <Card className="bg-card text-card-foreground rounded-2xl overflow-hidden">
      <div className="flex flex-col divide-y divide-gray-100">
        {items.map((item) => {
          const isError = item.message.toLowerCase().includes("too") || item.message.toLowerCase().includes("very");
          return (
            <div key={item.id} className="flex items-start gap-3 px-5 py-4">
              {isError ? (
                <AlertCircle className="w-4 h-4 text-[#F5A623] shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              )}
              <CardContent className="p-0 flex-1">
                <p className="text-sm font-medium text-card-foreground leading-snug">{item.message}</p>
                <p className="text-xs text-card-foreground/50 mt-0.5">{relativeTime(item.timestamp)}</p>
              </CardContent>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
